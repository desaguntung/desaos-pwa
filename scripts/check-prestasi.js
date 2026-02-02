
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://btilxibhwkbfohsfzaps.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDg0NSwiZXhwIjoyMDg0Mjc2ODQ1fQ.FtbybPNhMxF2YA-w08Ruyk75Xz6J0y-QRojY5QpnwCQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function checkPrestasi() {
  console.log("Checking prestasi_desa table...");
  
  const { data, error } = await supabase.from('prestasi_desa').select('count', { count: 'exact', head: true });
  
  if (error) {
    console.log("Table 'prestasi_desa' access error:", error.message);
    if (error.code === '42P01') { 
       console.log("Table does not exist.");
    }
  } else {
    console.log("'prestasi_desa' table exists!");
  }
}

checkPrestasi();
