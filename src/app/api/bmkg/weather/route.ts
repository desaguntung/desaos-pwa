import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure logic runs on every request

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // Default to Jakarta Pusat (Gambir) if not specified
  // adm4 code for Gambir: 31.71.01.1002
  const adm4 = searchParams.get('adm4') || '31.71.01.1002';
  
  try {
    // Use the new official BMKG JSON API
    const response = await fetch(`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4}`, {
        next: { revalidate: 3600 }, // Cache for 1 hour
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch data from BMKG');
    }

    const data = await response.json();
    
    // Validate structure
    if (!data.data || !data.data[0] || !data.data[0].cuaca) {
        throw new Error('Invalid data structure from BMKG API');
    }

    const location = data.lokasi;
    const forecasts = data.data[0].cuaca.flat(); // Flatten the array of arrays
    
    if (!forecasts.length) {
        return NextResponse.json({ error: 'No forecast data found' }, { status: 404 });
    }

    // Find closest forecast to now
    const now = new Date().getTime();
    const findClosest = (items: any[]) => {
        return items.reduce((prev, curr) => {
            const prevTime = new Date(prev.datetime).getTime();
            const currTime = new Date(curr.datetime).getTime();
            return (Math.abs(currTime - now) < Math.abs(prevTime - now) ? curr : prev);
        });
    };

    const currentForecast = findClosest(forecasts);
    
    // Format response to match what the frontend expects
    // Frontend expects:
    // { 
    //   location: string,
    //   current: { temp: { value: string }, humidity: { value: string }, wind: { value: string }, weatherDesc: string, ... } 
    // }

    return NextResponse.json({ 
        location: `${location.kotkab}, ${location.provinsi}`,
        province: location.provinsi,
        current: {
            temp: { value: currentForecast.t },
            humidity: { value: currentForecast.hu },
            wind: { value: currentForecast.ws }, // Assuming raw value (likely m/s or km/h)
            weatherDesc: currentForecast.weather_desc,
            weatherCode: currentForecast.weather, // 0, 1, 2, 3, 60, etc.
            timestamp: currentForecast.datetime
        },
        forecast: forecasts.slice(0, 8).map((f: any) => ({
            datetime: f.datetime,
            temp: f.t,
            weather: f.weather_desc
        }))
    });
    
  } catch (error) {
    console.error("BMKG API Error:", error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}
