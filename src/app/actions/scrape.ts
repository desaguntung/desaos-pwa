"use server";

import * as cheerio from "cheerio";

export interface ScrapedContent {
  url: string;
  title: string;
  content: string;
  images: string[];
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "Referer": "https://www.google.com/",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      next: { revalidate: 0 } // Disable cache for fresh results
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, and other unnecessary elements
    $("script").remove();
    $("style").remove();
    // Don't remove header/nav/footer immediately as they might contain the logo or hero image in some weird layouts
    // $("nav").remove();
    // $("footer").remove();
    // $("header").remove();
    $(".ads").remove();
    $(".sidebar").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();
    
    // Extract images with better filtering and lazy loading support
    const images: string[] = [];
    const seenImages = new Set<string>();

    // Helper to process image URL
    const processImage = (src: string | undefined) => {
      if (!src) return;
      
      // Clean up
      src = src.trim();

      // Resolve URL to absolute using standard URL API
      try {
        src = new URL(src, url).href;
      } catch (e) {
        // Invalid URL
        return;
      }

      const lowerSrc = src.toLowerCase();
      const unwantedKeywords = ["icon", "logo", "avatar", "profile", "banner", "ad", "pixel", "tracker", "button", "social", "whatsapp", "facebook", "twitter"];
      
      // Strict filter for very small generic keywords, but lenient for potential content
      if (unwantedKeywords.some(k => lowerSrc.includes(k))) return;
      
      // Relaxed filter: Allow URLs without extension or with query params
      const isLikelyImage = lowerSrc.includes("/image") || lowerSrc.includes("/img") || lowerSrc.includes("/photo") || lowerSrc.includes("/upload") || lowerSrc.includes("cdn") || lowerSrc.includes("media");
      
      // Filter out obvious non-images
      if (lowerSrc.match(/\.(js|css|html)$/) && !isLikelyImage) return;

      if (!seenImages.has(src)) {
        seenImages.add(src);
        images.push(src);
      }
    };

    // 0. Super Priority: Open Graph Image (The main thumbnail)
    const ogImage = $('meta[property="og:image"]').attr("content") || 
                    $('meta[name="twitter:image"]').attr("content") ||
                    $('link[rel="image_src"]').attr("href");
                    
    if (ogImage) {
      processImage(ogImage);
    }

    // 0.1 High Priority: Look for "galeri" or "slider" images (Specific for gov.id sites)
    $(".gallery-item img, .slider-item img, .carousel-item img, .swiper-slide img, .slick-slide img, .owl-item img, .item img").each((_, el) => {
       const src = $(el).attr("src") || $(el).attr("data-src");
       processImage(src);
    });

    // 0.2 Lightbox/Anchor-based Images: Check <a> tags that link to images (Common in government galleries)
    $("a[href]").each((_, el) => {
       const href = $(el).attr("href");
       // Check if the link itself points to an image file
       if (href && href.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
         processImage(href);
       }
    });

    // 0.3 Picture Tags (Source/WebP)
    $("picture source").each((_, el) => {
       const srcset = $(el).attr("srcset");
       if (srcset) {
         const src = srcset.split(",")[0].split(" ")[0]; // Get first URL from srcset
         processImage(src);
       }
    });

    // 1. Aggressive Image Collection: Get ALL images from the page
    $("img").each((_, el) => {
       const $img = $(el);
       // Try all common attributes for image source
       const src = $img.attr("src") || 
                   $img.attr("data-src") || 
                   $img.attr("data-original") || 
                   $img.attr("data-url") ||
                   $img.attr("srcset")?.split(" ")[0]; // Take first URL from srcset
       processImage(src);
    });

    // 2. Background Images: Check elements with inline styles having background-image
    $("[style*='background-image']").each((_, el) => {
       const style = $(el).attr("style") || "";
       const match = style.match(/url\(['"]?(.*?)['"]?\)/);
       if (match && match[1]) {
         processImage(match[1]);
       }
    });

    // 3. FALLBACK: Regex Search in Raw HTML (For images inside Scripts/JSON/Next.js State)
    // Always run this to catch images hidden in JSON/JS (common in SPAs/Vue/Next.js)
    // Updated to handle escaped slashes (https:\/\/...) common in JSON
    const regex = /https?:\\?\/\\?\/[^"'\s<>{}]+\.(?:jpg|jpeg|png|webp)/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        let rawUrl = match[0];
        
        // Clean up escaped slashes (e.g. https:\/\/ -> https://)
        rawUrl = rawUrl.replace(/\\/g, "");

        // Validate URL structure
        if (rawUrl.length < 300) { // Increased limit slightly
            processImage(rawUrl);
        }
    }

    // 4. Sort images: OG image first, then by size or likelihood?
 
    
    // Try to find the main article content
    let content = "";
    
    // Content extraction priorities
    const contentSelectors = [
      "article", 
      ".content", 
      ".entry-content", 
      ".post-content", 
      "main", 
      "#content", 
      ".detail__body-text", 
      ".read__content",
      ".article-body",
      ".news-content",
      ".post-body",
      ".article-content",
      "#main",
      ".main-content"
    ]; 
    
    // Try selectors first
    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        // Get text but preserve some structure if possible (paragraphs)
        // For simplicity, we just get text with newlines
        const text = el.text().trim();
        if (text.length > 200) { // Threshold to consider it valid content
           content = text;
           break;
        }
      }
    }

    if (!content) {
      // Fallback: Get all paragraphs
      content = $("p")
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 20) // Filter very short paragraphs
        .join("\n\n");
    }
    
    if (!content || content.length < 100) {
       // Last resort: Body text but cleaned
       content = $("body").text().replace(/\s+/g, " ").trim().slice(0, 5000);
    }

    // Sort images: OG image first, then by size or likelihood? 
    // We already have them in order of discovery: OG -> Body (Top to Bottom)
    // Just ensure we have enough.
    
    return {
      url,
      title,
      content: content.slice(0, 10000), // Increased limit for fuller context
      images: images.slice(0, 20), // Increased limit to 20 to give user more choices
    };
  } catch (error: any) {
    console.error("Scraping error:", error);
    return {
      url,
      title: "",
      content: "",
      images: [],
      error: error.message || "Failed to scrape URL",
    };
  }
}
