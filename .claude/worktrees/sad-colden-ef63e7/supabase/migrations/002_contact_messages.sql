-- Contact Messages Table Migration

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anon users) - essential for public contact form
CREATE POLICY "Allow public inserts"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users (likely admins) to view all messages
-- note: in a real app you'd check for admin role, but for now we'll allow auth'd users
CREATE POLICY "Allow auth users to view messages"
  ON contact_messages FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
