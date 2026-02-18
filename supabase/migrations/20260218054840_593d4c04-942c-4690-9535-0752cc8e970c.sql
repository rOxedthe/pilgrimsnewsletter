
-- Create banned_words table
CREATE TABLE public.banned_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  word text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banned_words ENABLE ROW LEVEL SECURITY;

-- Anyone can read (needed for frontend filter checks)
CREATE POLICY "Anyone can read banned words"
ON public.banned_words FOR SELECT
USING (true);

-- Only admins can manage
CREATE POLICY "Admins can insert banned words"
ON public.banned_words FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete banned words"
ON public.banned_words FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed with the existing hardcoded list
INSERT INTO public.banned_words (word) VALUES
  ('fuck'), ('shit'), ('ass'), ('bitch'), ('damn'), ('crap'), ('dick'), ('piss'),
  ('bastard'), ('slut'), ('whore'), ('cunt'),
  ('nigger'), ('nigga'), ('faggot'), ('retard'), ('retarded'),
  ('nazi'), ('holocaust denial'),
  ('buy now'), ('click here'), ('free money'), ('make money fast'),
  ('kill yourself'), ('kys');
