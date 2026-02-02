
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for reliability in this specific environment context
const supabaseUrl = "https://btilxibhwkbfohsfzaps.supabase.co";
// Using Service Role Key to ensure we can check everything
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDg0NSwiZXhwIjoyMDg0Mjc2ODQ1fQ.FtbybPNhMxF2YA-w08Ruyk75Xz6J0y-QRojY5QpnwCQ";

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function runMigration() {
  console.log("Checking if 'categories' table exists...");
  
  const { data, error } = await supabase.from('categories').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.log("Table 'categories' access error:", error.message);
    if (error.code === '42P01') { 
       console.log("Table definitely does not exist. Please run the SQL manually.");
    }
  } else {
    console.log("'categories' table exists!");
    
    const defaults = [
      { name: 'Berita Desa', slug: 'berita-desa' },
      { name: 'Pengumuman', slug: 'pengumuman' },
      { name: 'Kesehatan', slug: 'kesehatan' },
      { name: 'Pembangunan', slug: 'pembangunan' },
      { name: 'Kegiatan', slug: 'kegiatan' },
      { name: 'Pemerintahan', slug: 'pemerintahan' },
      { name: 'Ekonomi', slug: 'ekonomi' }
    ];

    console.log("Ensuring default categories exist...");
    
    const { data: existing } = await supabase.from('categories').select('name');
    const existingNames = existing ? existing.map(c => c.name) : [];
    
    for (const cat of defaults) {
      if (!existingNames.includes(cat.name)) {
        console.log(`Inserting ${cat.name}...`);
        const { error: insertError } = await supabase.from('categories').insert(cat);
        if (insertError) console.error(`Failed to insert ${cat.name}:`, insertError.message);
      }
    }
    
    console.log("Categories check/update complete.");
  }
}

runMigration();
