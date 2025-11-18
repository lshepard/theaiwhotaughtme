-- Add status field to stories table
-- Status can be: initial, sent_for_interview, scheduled, completed
ALTER TABLE public.stories
ADD COLUMN status text DEFAULT 'initial' NOT NULL;

-- Add check constraint to ensure valid status values
ALTER TABLE public.stories
ADD CONSTRAINT stories_status_check
CHECK (status IN ('initial', 'sent_for_interview', 'scheduled', 'completed'));

-- Add index for status field for efficient filtering
CREATE INDEX stories_status_idx ON public.stories (status);

-- Update existing rows to have 'initial' status
UPDATE public.stories SET status = 'initial' WHERE status IS NULL;
