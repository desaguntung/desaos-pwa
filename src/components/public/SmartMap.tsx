"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, Map as MapIcon, Loader2 } from "lucide-react";
import Script from "next/script";

interface SmartMapProps {
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  fallbackContent?: React.ReactNode;
}

export default function SmartMap({ 
  desa, 
  kecamatan, 
  kabupaten, 
  provinsi,
  fallbackContent 
}: SmartMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasData, setHasData] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Check if leaflet is loaded
    if (typeof window !== "undefined" && (window as any).L) {
      setLeafletLoaded(true);
    }
  }, []);

  // Sanitize village name (remove "Desa" prefix if present to avoid double "Desa Desa")
  const cleanDesa = desa.replace(/^desa\s+/i, "");

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Map already initialized

    const initMap = async () => {
      try {
        const L = (window as any).L;
        
        // Helper to fetch data
        const searchLocation = async (q: string, featureType: 'polygon' | 'point' = 'polygon') => {
          try {
            const params = new URLSearchParams({
              q: q,
              format: 'json',
              limit: '1',
              polygon_geojson: '1'
            });
            
            const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
            const data = await res.json();
            return data && data.length > 0 ? data[0] : null;
          } catch (e) {
            console.error("Fetch error:", e);
            return null;
          }
        };

        // Strategy:
        // 1. Exact Boundary (Polygon)
        // 2. Village Point (Node) -> Render as Circle
        // 3. District Context (Polygon) + Village Point

        let place = await searchLocation(`Desa ${cleanDesa}, Kecamatan ${kecamatan}, ${kabupaten}`);
        let isPoint = false;

        // If specific boundary not found, try finding just the village point
        if (!place || !place.geojson || (place.geojson.type !== 'Polygon' && place.geojson.type !== 'MultiPolygon')) {
           console.log("Boundary not found, looking for village center point...");
           // Try variations for point search
           const pointQueries = [
             `Kantor Desa ${cleanDesa}, ${kabupaten}`,
             `Balai Desa ${cleanDesa}, ${kabupaten}`,
             `Desa ${cleanDesa}, ${kabupaten}`, // This often returns a node
             `${cleanDesa}, ${kecamatan}, ${kabupaten}`
           ];

           for (const q of pointQueries) {
             place = await searchLocation(q);
             if (place) {
               isPoint = true;
               break;
             }
           }
        }

        // If still nothing, try just District/Kecamatan to at least show something relevant
        if (!place) {
           console.log("Village point not found, falling back to District...");
           place = await searchLocation(`Kecamatan ${kecamatan}, ${kabupaten}`);
        }

        if (!place) {
          console.log("No location found even after retries.");
          setIsLoading(false);
          setHasData(false);
          return;
        }

        const geojson = place.geojson;
        const lat = parseFloat(place.lat);
        const lon = parseFloat(place.lon);

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          scrollWheelZoom: false
        }).setView([lat, lon], 13);
        
        mapInstanceRef.current = map;
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add "Clean" Tiles (CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(map);

        // Logic to render data
        if (geojson && (geojson.type === 'Polygon' || geojson.type === 'MultiPolygon')) {
          // Case A: We have a boundary (Village or District)
          L.geoJSON(geojson, {
            style: {
              color: "#3b82f6",
              weight: 2,
              opacity: 0.8,
              fillColor: "#3b82f6",
              fillOpacity: 0.1
            }
          }).addTo(map);
          
          const bounds = L.geoJSON(geojson).getBounds();
          map.fitBounds(bounds, { padding: [50, 50] });

        } else if (isPoint || (geojson && geojson.type === 'Point')) {
          // Case B: We only have a Point (Village Center)
          // Draw a nice circle to represent the "Area"
          const circle = L.circle([lat, lon], {
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            radius: 1500, // 1.5km radius estimation for a village
            weight: 2,
            dashArray: '5, 10' // Dashed line to indicate "estimated"
          }).addTo(map);

          // Add a marker at the center
          const customIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></div>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          L.marker([lat, lon], { icon: customIcon }).addTo(map)
            .bindPopup(`<div class="text-sm font-medium">Lokasi: ${place.display_name.split(',')[0]}</div><div class="text-xs text-gray-500">Estimasi Area (Radius 1.5km)</div>`)
            .openPopup();

          map.fitBounds(circle.getBounds());
        } else {
          // Fallback generic marker
          L.marker([lat, lon]).addTo(map);
          map.setView([lat, lon], 14);
        }

        setHasData(true);
        setIsLoading(false);

      } catch (err) {
        console.error("SmartMap Error:", err);
        setIsLoading(false);
        setHasData(false);
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [leafletLoaded, desa, kecamatan, kabupaten]);

  return (
    <>
      <link 
        rel="stylesheet" 
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <Script 
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={() => setLeafletLoaded(true)}
      />

      <div className="w-full h-full relative min-h-[500px] bg-zinc-50 rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-50/80 backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-zinc-500 font-medium animate-pulse">Mencari data wilayah...</p>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div 
          ref={mapContainerRef} 
          className={`w-full h-full min-h-[500px] z-10 transition-opacity duration-700 ${hasData ? 'opacity-100' : 'opacity-0 absolute'}`} 
        />

        {/* Fallback Content (Manual Map) */}
        {!isLoading && !hasData && (
          <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center">
            {fallbackContent || (
               <div className="text-center p-12">
                 <MapIcon className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                 <p className="text-zinc-500">Peta digital otomatis tidak tersedia.</p>
               </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
