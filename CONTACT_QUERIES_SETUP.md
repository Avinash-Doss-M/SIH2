# Contact Queries Table Setup Guide

## Problem
The contact form is failing because the `contact_queries` table doesn't exist in your Supabase database.

## Solution
You need to create the `contact_queries` table in your Supabase database. Here are two ways to do it:

## Method 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Project Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project: `mquahufkabxbwzkortut`

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "+ New query"

3. **Run the following SQL script:**

```sql
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
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT INSERT ON contact_queries TO anon;
GRANT SELECT, UPDATE, DELETE ON contact_queries TO authenticated;
```

4. **Click "Run" to execute the SQL**

## Method 2: Using the Table Editor

1. **Go to Table Editor**
   - Click "Table Editor" in the left sidebar
   - Click "Create a new table"

2. **Configure the table:**
   - Name: `contact_queries`
   - Add the following columns:
     - `id` (uuid, primary key, default: gen_random_uuid())
     - `first_name` (text, required)
     - `last_name` (text, required)
     - `email` (text, required)
     - `subject` (text, required)
     - `message` (text, required)
     - `status` (text, default: 'pending')
     - `admin_response` (text, nullable)
     - `responded_by` (uuid, nullable)
     - `created_at` (timestamptz, default: now())
     - `updated_at` (timestamptz, default: now())
     - `resolved_at` (timestamptz, nullable)

3. **Set up RLS (Row Level Security)**
   - Enable RLS on the table
   - Add policies as shown in the SQL above

## Temporary Solution
I've updated the contact form to use a fallback method. If the `contact_queries` table doesn't exist, it will temporarily use the `event_requests` table to store contact messages.

## Verification
After creating the table, test the contact form again. It should work properly and store messages in the dedicated `contact_queries` table.

## Admin Panel Integration
Once the table is created, you can view and manage contact queries in the Admin Panel under the "Queries" section.