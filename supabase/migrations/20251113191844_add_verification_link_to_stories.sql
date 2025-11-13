-- Add verification_link column to stories table
ALTER TABLE public.stories
ADD COLUMN verification_link character varying;

-- Add index for verification_link
CREATE INDEX stories_verification_link_idx ON public.stories (verification_link) WHERE verification_link IS NOT NULL;
