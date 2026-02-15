-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  read_time TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT true,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Anyone can read published articles
CREATE POLICY "Anyone can view published articles"
ON public.articles FOR SELECT
USING (published = true);

-- Authors can insert their own articles
CREATE POLICY "Authors can insert articles"
ON public.articles FOR INSERT
WITH CHECK (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Authors can update their own articles
CREATE POLICY "Authors can update own articles"
ON public.articles FOR UPDATE
USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Authors can delete their own articles
CREATE POLICY "Authors can delete own articles"
ON public.articles FOR DELETE
USING (author_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_articles_updated_at
BEFORE UPDATE ON public.articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for common queries
CREATE INDEX idx_articles_category ON public.articles(category);
CREATE INDEX idx_articles_featured ON public.articles(featured) WHERE featured = true;
CREATE INDEX idx_articles_slug ON public.articles(slug);