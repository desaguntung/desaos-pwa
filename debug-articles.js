const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://btilxibhwkbfohsfzaps.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0aWx4aWJod2tiZm9oc2Z6YXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDA4NDUsImV4cCI6MjA4NDI3Njg0NX0.QeuS7L9M98FL8_d-INJU__duXHTDqq0OOKabHZQ0Lrc";

async function debugArticles() {
  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Checking articles table...");
  const { data, error, count } = await supabase
    .from("articles")
    .select("*", { count: "exact" })
    .limit(1);

  if (error) {
    console.error("Error fetching articles:", error);
  } else {
    console.log("Found", count, "articles.");
    if (data && data.length > 0) {
      console.log("First article sample:", JSON.stringify(data[0], null, 2));
    } else {
      console.log("No articles found in table.");
    }
  }

  // Check categories
  const { data: categories, error: catError } = await supabase
    .from("articles")
    .select("category")
    .not("category", "is", null);
    
  if (catError) {
      console.error("Error fetching categories:", catError);
  } else {
      const uniqueCats = [...new Set(categories.map(c => c.category))];
      console.log("Categories found:", uniqueCats);
  }
}

debugArticles();
