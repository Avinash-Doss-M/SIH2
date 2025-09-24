-- Migration: Add 'job' and 'internship' to post_type enum for posts table

-- 1. Alter the enum type to add new values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'post_type') THEN
    CREATE TYPE post_type AS ENUM ('blog', 'announcement', 'discussion', 'job', 'internship');
  ELSE
    -- Add new values if not already present
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'job' AND enumtypid = 'post_type'::regtype) THEN
      ALTER TYPE post_type ADD VALUE 'job';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'internship' AND enumtypid = 'post_type'::regtype) THEN
      ALTER TYPE post_type ADD VALUE 'internship';
    END IF;
  END IF;
END$$;

-- 2. (Optional) Add company, location, description fields to posts table for jobs/internships
ALTER TABLE posts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS description TEXT;

-- Now you can use type = 'job' or 'internship' in the posts table
