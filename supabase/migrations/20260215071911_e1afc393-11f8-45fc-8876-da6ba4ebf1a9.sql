
-- Create page_seo table for per-page SEO settings
CREATE TABLE public.page_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  og_image TEXT NOT NULL DEFAULT '',
  canonical_url TEXT NOT NULL DEFAULT '',
  no_index BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read page seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Admins can insert page seo" ON public.page_seo FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update page seo" ON public.page_seo FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete page seo" ON public.page_seo FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_page_seo_updated_at BEFORE UPDATE ON public.page_seo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed with default pages
INSERT INTO public.page_seo (page_path, meta_title, meta_description) VALUES
  ('/', 'Home | Pilgrims Newsletter', 'Deep essays on Himalayan philosophy, rare book discoveries, and the timeless art of mindful reading.'),
  ('/blog', 'Blog | Pilgrims Newsletter', 'Browse our latest articles and essays.'),
  ('/subscribe', 'Subscribe | Pilgrims Newsletter', 'Join our community of mindful readers.'),
  ('/auth', 'Sign In | Pilgrims Newsletter', 'Sign in or create an account.');
