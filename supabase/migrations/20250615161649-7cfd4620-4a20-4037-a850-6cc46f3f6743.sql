
-- Re-create shared_contacts table and secure it with RLS

CREATE TABLE public.shared_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  contact_email TEXT NOT NULL,
  last_shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (owner_id, contact_email)
);

ALTER TABLE public.shared_contacts ENABLE ROW LEVEL SECURITY;

-- Only owner can select their own contacts
CREATE POLICY "Only owner can select contact"
  ON public.shared_contacts
  FOR SELECT
  USING (owner_id = auth.uid());

-- Only owner can insert their own contacts
CREATE POLICY "Only owner can insert contact"
  ON public.shared_contacts
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());
