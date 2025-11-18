-- Add public_id field to stories table
-- This is a short, alphanumeric code used in URLs instead of the numeric ID
ALTER TABLE public.stories
ADD COLUMN public_id character varying(8);

-- Create unique index on public_id
CREATE UNIQUE INDEX stories_public_id_idx ON public.stories (public_id);

-- Generate public_ids for existing rows (6 random alphanumeric characters)
-- Using random combinations of lowercase letters and numbers
DO $$
DECLARE
  story_record RECORD;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  FOR story_record IN SELECT id FROM public.stories WHERE public_id IS NULL LOOP
    LOOP
      -- Generate random 6-character alphanumeric code
      new_code := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));

      -- Check if code already exists
      SELECT EXISTS(SELECT 1 FROM public.stories WHERE public_id = new_code) INTO code_exists;

      -- If unique, use it
      EXIT WHEN NOT code_exists;
    END LOOP;

    UPDATE public.stories SET public_id = new_code WHERE id = story_record.id;
  END LOOP;
END $$;

-- Make public_id required for new rows
ALTER TABLE public.stories
ALTER COLUMN public_id SET NOT NULL;
