
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://btilxibhwkbfohsfzaps.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMDg0NSwiZXhwIjoyMDg0Mjc2ODQ1fQ.FtbybPNhMxF2YA-w08Ruyk75Xz6J0y-QRojY5QpnwCQ";

const supabase = createClient(supabaseUrl, serviceKey);

async function checkBucket() {
  console.log("Checking storage buckets...");
  
  const { data: buckets, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error("Error listing buckets:", error);
    return;
  }
  
  console.log("Buckets found:", buckets.map(b => b.name));
  
  const targetBucket = 'public';
  const bucketExists = buckets.some(b => b.name === targetBucket);
  
  if (bucketExists) {
      console.log(`Bucket '${targetBucket}' exists.`);
      // Try to list files in it
      const { data: files, error: listError } = await supabase.storage.from(targetBucket).list();
      if (listError) {
          console.error(`Error listing files in '${targetBucket}':`, listError);
      } else {
          console.log(`Successfully listed files in '${targetBucket}'. Count: ${files.length}`);
      }
  } else {
      console.error(`Bucket '${targetBucket}' DOES NOT exist!`);
      // Try to create it if it doesn't exist (since we have service role)
      console.log(`Attempting to create bucket '${targetBucket}'...`);
      const { data, error: createError } = await supabase.storage.createBucket(targetBucket, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
      });
      
      if (createError) {
          console.error("Failed to create bucket:", createError);
      } else {
          console.log("Bucket created successfully!");
      }
  }
}

checkBucket();
