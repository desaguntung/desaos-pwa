
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for reliability in this specific environment context
const supabaseUrl = "https://btilxibhwkbfohsfzaps.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDg0NSwiZXhwIjoyMDg0Mjc2ODQ1fQ.FtbybPNhMxF2YA-w08Ruyk75Xz6J0y-QRojY5QpnwCQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function checkIdentitas() {
  console.log("Checking identitas_desa table...");
  
  const { data, error } = await supabase.from('identitas_desa').select('*');
  
  if (error) {
    console.error("Error fetching identitas_desa:", error);
  } else {
    console.log(`Found ${data.length} rows.`);
    if (data.length > 0) {
      console.log("Row 1 sample:", {
        id: data[0].id,
        nama_desa: data[0].nama_desa,
        kode_desa: data[0].kode_desa,
        sejarah: data[0].sejarah ? (data[0].sejarah.substring(0, 20) + "...") : "NULL",
        visi: data[0].visi ? "PRESENT" : "NULL",
        misi: data[0].misi ? "PRESENT" : "NULL"
      });
    }
  }
}

checkIdentitas();
