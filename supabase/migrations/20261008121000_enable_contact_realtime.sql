-- Allow authenticated managers to receive new contact submissions while online.
-- Row Level Security still filters which user can read each lead.
-- Anonymous visitors can INSERT a lead, but cannot SELECT or subscribe to it.
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_submissions;
