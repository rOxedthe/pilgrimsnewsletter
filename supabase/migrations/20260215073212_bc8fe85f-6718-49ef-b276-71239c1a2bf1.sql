
-- Create membership tier enum
CREATE TYPE public.membership_tier AS ENUM ('member', 'premier_member');

-- Add membership tier to profiles
ALTER TABLE public.profiles
ADD COLUMN membership_tier membership_tier NOT NULL DEFAULT 'member';

-- Allow admins to update any profile's membership tier
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
