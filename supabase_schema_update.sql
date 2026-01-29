-- SQL Migration to add 'views' column and other enhancements

-- 1. Add 'views' column to 'articles' table if it doesn't exist
ALTER TABLE public.articles 
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- 2. Create a function to safely increment views (atomic operation)
CREATE OR REPLACE FUNCTION increment_article_view(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.articles
  SET views = COALESCE(views, 0) + 1
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Policy to allow public to increment views (optional, if using RLS)
-- Note: Usually, public read access is enough if using a secure RPC or server-side call.
-- If you are calling this from client-side RPC, you might need specific permissions.
-- Since we are using Server Actions (server-side), we bypass RLS for the update if using service role,
-- but standard client might need:
-- GRANT EXECUTE ON FUNCTION increment_article_view TO anon, authenticated;

-- 4. Add index for performance on filtering/sorting
CREATE INDEX IF NOT EXISTS idx_articles_views ON public.articles(views DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category);
