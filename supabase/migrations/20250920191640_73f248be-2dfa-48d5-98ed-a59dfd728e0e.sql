-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE public.user_role AS ENUM ('student', 'alumni', 'admin');
CREATE TYPE public.event_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled');
CREATE TYPE public.mentorship_status AS ENUM ('active', 'pending', 'completed', 'cancelled');
CREATE TYPE public.campaign_status AS ENUM ('active', 'completed', 'draft');
CREATE TYPE public.post_type AS ENUM ('blog', 'announcement', 'discussion');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'student',
  bio TEXT,
  avatar_url TEXT,
  graduation_year INTEGER,
  company TEXT,
  job_title TEXT,
  linkedin_url TEXT,
  skills TEXT[],
  interests TEXT[],
  location TEXT,
  is_mentor BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  virtual_link TEXT,
  max_attendees INTEGER,
  image_url TEXT,
  status event_status NOT NULL DEFAULT 'upcoming',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event_attendees table
CREATE TABLE public.event_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(event_id, user_id)
);

-- Create posts table (for blogs, announcements, discussions)
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  type post_type NOT NULL DEFAULT 'blog',
  featured_image_url TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT FALSE,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create mentorship_requests table
CREATE TABLE public.mentorship_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,
  status mentorship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  raised_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  status campaign_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create donations table
CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for mentorship communication
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentorship_request_id UUID NOT NULL REFERENCES public.mentorship_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Event creators and admins can update events" ON public.events FOR UPDATE USING (
  auth.uid() = created_by OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Event creators and admins can delete events" ON public.events FOR DELETE USING (
  auth.uid() = created_by OR public.get_user_role(auth.uid()) = 'admin'
);

-- Create RLS policies for event_attendees
CREATE POLICY "Users can view event attendees" ON public.event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can register for events" ON public.event_attendees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own registrations" ON public.event_attendees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own registrations" ON public.event_attendees FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for posts
CREATE POLICY "Anyone can view published posts" ON public.posts FOR SELECT USING (is_published = true OR auth.uid() = author_id);
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors and admins can update posts" ON public.posts FOR UPDATE USING (
  auth.uid() = author_id OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Authors and admins can delete posts" ON public.posts FOR DELETE USING (
  auth.uid() = author_id OR public.get_user_role(auth.uid()) = 'admin'
);

-- Create RLS policies for post_likes
CREATE POLICY "Users can view post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for mentorship_requests
CREATE POLICY "Users can view their own mentorship requests" ON public.mentorship_requests FOR SELECT USING (
  auth.uid() = mentor_id OR auth.uid() = mentee_id
);
CREATE POLICY "Users can create mentorship requests" ON public.mentorship_requests FOR INSERT WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "Mentors and mentees can update requests" ON public.mentorship_requests FOR UPDATE USING (
  auth.uid() = mentor_id OR auth.uid() = mentee_id
);

-- Create RLS policies for campaigns
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns FOR SELECT USING (
  status = 'active' OR auth.uid() = created_by OR public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Authenticated users can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Campaign creators and admins can update campaigns" ON public.campaigns FOR UPDATE USING (
  auth.uid() = created_by OR public.get_user_role(auth.uid()) = 'admin'
);

-- Create RLS policies for donations
CREATE POLICY "Users can view donations for active campaigns" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Users can make donations" ON public.donations FOR INSERT WITH CHECK (auth.uid() = donor_id);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in their mentorship requests" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.mentorship_requests mr 
    WHERE mr.id = mentorship_request_id 
    AND (mr.mentor_id = auth.uid() OR mr.mentee_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in their mentorship requests" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.mentorship_requests mr 
    WHERE mr.id = mentorship_request_id 
    AND (mr.mentor_id = auth.uid() OR mr.mentee_id = auth.uid())
  )
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_events_date ON public.events(event_date);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_posts_author ON public.posts(author_id);
CREATE INDEX idx_posts_type ON public.posts(type);
CREATE INDEX idx_posts_published ON public.posts(is_published);
CREATE INDEX idx_mentorship_mentor ON public.mentorship_requests(mentor_id);
CREATE INDEX idx_mentorship_mentee ON public.mentorship_requests(mentee_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX idx_messages_mentorship ON public.messages(mentorship_request_id);