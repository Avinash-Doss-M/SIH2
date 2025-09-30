-- Run this SQL in your Supabase SQL editor to create the contact_queries table

-- Create contact_queries table for public contact form submissions
CREATE TABLE IF NOT EXISTS contact_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_queries_status ON contact_queries(status);
CREATE INDEX IF NOT EXISTS idx_contact_queries_created_at ON contact_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_queries_email ON contact_queries(email);

-- Enable Row Level Security
ALTER TABLE contact_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (public can submit queries)
CREATE POLICY "Anyone can submit contact queries" ON contact_queries
  FOR INSERT WITH CHECK (true);

-- Policy: Only admins can read/update contact queries
CREATE POLICY "Admins can manage contact queries" ON contact_queries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_queries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_queries_updated_at
  BEFORE UPDATE ON contact_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_queries_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SEQUENCE contact_queries_id_seq TO anon;
GRANT INSERT ON contact_queries TO anon;
GRANT SELECT, UPDATE, DELETE ON contact_queries TO authenticated;