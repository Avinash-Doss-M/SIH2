-- Create followers table for Instagram-like follow system
CREATE TABLE IF NOT EXISTS followers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Create user_search_settings table for privacy controls
CREATE TABLE IF NOT EXISTS user_search_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    chat_privacy VARCHAR(20) DEFAULT 'followers' CHECK (chat_privacy IN ('public', 'followers', 'private')),
    searchable BOOLEAN DEFAULT true,
    show_in_suggestions BOOLEAN DEFAULT true,
    allow_message_requests BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create search_history table for improving search algorithm
CREATE TABLE IF NOT EXISTS search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_query TEXT NOT NULL,
    search_type VARCHAR(20) DEFAULT 'user' CHECK (search_type IN ('user', 'hashtag', 'post', 'event')),
    result_clicked_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add new columns to profiles table for enhanced search
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_company VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_available_for_mentoring BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_looking_for_job BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hashtags TEXT[];

-- Enable RLS
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_search_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for followers table
CREATE POLICY "Users can view all follow relationships" ON followers
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own follow relationships" ON followers
    FOR INSERT WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete their own follow relationships" ON followers
    FOR DELETE USING (follower_id = auth.uid());

-- RLS Policies for user_search_settings
CREATE POLICY "Users can view their own search settings" ON user_search_settings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own search settings" ON user_search_settings
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for search_history
CREATE POLICY "Users can manage their own search history" ON search_history
    FOR ALL USING (user_id = auth.uid());

-- Update messages table RLS policy to include new messaging rules
DROP POLICY IF EXISTS "Users can view messages in rooms they have access to" ON messages;

CREATE POLICY "Users can view messages based on privacy settings" ON messages
    FOR SELECT USING (
        -- Group messages in chat rooms
        (room_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM chat_rooms cr 
            WHERE cr.id = messages.room_id 
            AND (
                cr.is_public = true OR 
                cr.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM chat_room_members crm 
                    WHERE crm.room_id = cr.id AND crm.user_id = auth.uid()
                )
            )
        )) OR
        -- Direct messages
        (room_id IS NULL AND (
            sender_id = auth.uid() OR 
            receiver_id = auth.uid()
        ))
    );

-- Update messages insert policy to include new messaging rules
DROP POLICY IF EXISTS "Users can send messages to rooms they have access to" ON messages;

CREATE POLICY "Users can send messages based on privacy and follow rules" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND (
            -- Group messages in accessible rooms
            (room_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM chat_rooms cr 
                WHERE cr.id = messages.room_id 
                AND (
                    cr.is_public = true OR 
                    cr.created_by = auth.uid() OR
                    EXISTS (
                        SELECT 1 FROM chat_room_members crm 
                        WHERE crm.room_id = cr.id AND crm.user_id = auth.uid()
                    )
                )
            )) OR
            -- Direct messages with privacy rules
            (room_id IS NULL AND receiver_id IS NOT NULL AND (
                -- Can always message yourself
                receiver_id = auth.uid() OR
                -- Can message if receiver has public chat
                EXISTS (
                    SELECT 1 FROM user_search_settings uss 
                    WHERE uss.user_id = receiver_id AND uss.chat_privacy = 'public'
                ) OR
                -- Can message followers/following if receiver allows followers
                (EXISTS (
                    SELECT 1 FROM user_search_settings uss 
                    WHERE uss.user_id = receiver_id AND uss.chat_privacy = 'followers'
                ) AND (
                    EXISTS (SELECT 1 FROM followers WHERE follower_id = auth.uid() AND following_id = receiver_id) OR
                    EXISTS (SELECT 1 FROM followers WHERE follower_id = receiver_id AND following_id = auth.uid())
                )) OR
                -- Can message if no privacy settings (default to followers)
                (NOT EXISTS (
                    SELECT 1 FROM user_search_settings WHERE user_id = receiver_id
                ) AND (
                    EXISTS (SELECT 1 FROM followers WHERE follower_id = auth.uid() AND following_id = receiver_id) OR
                    EXISTS (SELECT 1 FROM followers WHERE follower_id = receiver_id AND following_id = auth.uid())
                ))
            ))
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_user_search_settings_user_id ON user_search_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_hashtags ON profiles USING GIN(hashtags);
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(location);
CREATE INDEX IF NOT EXISTS idx_profiles_graduation_year ON profiles(graduation_year);

-- Create functions for search algorithm
CREATE OR REPLACE FUNCTION search_users(
    search_query TEXT,
    current_user_id UUID DEFAULT auth.uid(),
    role_filter TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    graduation_year_filter INTEGER DEFAULT NULL,
    skills_filter TEXT[] DEFAULT NULL,
    available_for_mentoring BOOLEAN DEFAULT NULL,
    looking_for_job BOOLEAN DEFAULT NULL,
    limit_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT,
    bio TEXT,
    location TEXT,
    graduation_year INTEGER,
    current_company TEXT,
    job_title TEXT,
    skills TEXT[],
    hashtags TEXT[],
    is_following BOOLEAN,
    is_follower BOOLEAN,
    chat_privacy TEXT,
    relevance_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_matches AS (
        SELECT 
            p.user_id,
            au.email,
            p.first_name,
            p.last_name,
            p.avatar_url,
            p.role,
            p.bio,
            p.location,
            p.graduation_year,
            p.current_company,
            p.job_title,
            p.skills,
            p.hashtags,
            -- Check if current user follows this user
            EXISTS(SELECT 1 FROM followers WHERE follower_id = current_user_id AND following_id = p.user_id) as is_following,
            -- Check if this user follows current user
            EXISTS(SELECT 1 FROM followers WHERE follower_id = p.user_id AND following_id = current_user_id) as is_follower,
            -- Get chat privacy setting
            COALESCE(uss.chat_privacy, 'followers') as chat_privacy,
            -- Calculate relevance score (rule-based algorithm)
            (
                -- Name match (highest priority)
                CASE 
                    WHEN LOWER(CONCAT(p.first_name, ' ', p.last_name)) ILIKE '%' || LOWER(search_query) || '%' THEN 100
                    WHEN LOWER(p.first_name) ILIKE '%' || LOWER(search_query) || '%' THEN 80
                    WHEN LOWER(p.last_name) ILIKE '%' || LOWER(search_query) || '%' THEN 80
                    ELSE 0
                END +
                -- Email match
                CASE WHEN LOWER(au.email) ILIKE '%' || LOWER(search_query) || '%' THEN 60 ELSE 0 END +
                -- Company match
                CASE WHEN p.current_company IS NOT NULL AND LOWER(p.current_company) ILIKE '%' || LOWER(search_query) || '%' THEN 50 ELSE 0 END +
                -- Job title match
                CASE WHEN p.job_title IS NOT NULL AND LOWER(p.job_title) ILIKE '%' || LOWER(search_query) || '%' THEN 40 ELSE 0 END +
                -- Skills match
                CASE WHEN p.skills IS NOT NULL AND EXISTS(SELECT 1 FROM unnest(p.skills) skill WHERE LOWER(skill) ILIKE '%' || LOWER(search_query) || '%') THEN 30 ELSE 0 END +
                -- Bio match
                CASE WHEN p.bio IS NOT NULL AND LOWER(p.bio) ILIKE '%' || LOWER(search_query) || '%' THEN 20 ELSE 0 END +
                -- Location match
                CASE WHEN p.location IS NOT NULL AND LOWER(p.location) ILIKE '%' || LOWER(search_query) || '%' THEN 15 ELSE 0 END +
                -- Hashtags match
                CASE WHEN p.hashtags IS NOT NULL AND EXISTS(SELECT 1 FROM unnest(p.hashtags) hashtag WHERE LOWER(hashtag) ILIKE '%' || LOWER(search_query) || '%') THEN 25 ELSE 0 END +
                -- Boost for mutual connections
                CASE 
                    WHEN EXISTS(SELECT 1 FROM followers WHERE follower_id = current_user_id AND following_id = p.user_id) THEN 10
                    WHEN EXISTS(SELECT 1 FROM followers WHERE follower_id = p.user_id AND following_id = current_user_id) THEN 10
                    ELSE 0
                END
            ) as relevance_score
        FROM profiles p
        JOIN auth.users au ON au.id = p.user_id
        LEFT JOIN user_search_settings uss ON uss.user_id = p.user_id
        WHERE 
            p.user_id != current_user_id
            AND (uss.searchable IS NULL OR uss.searchable = true)
            AND (role_filter IS NULL OR p.role = role_filter)
            AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
            AND (graduation_year_filter IS NULL OR p.graduation_year = graduation_year_filter)
            AND (skills_filter IS NULL OR p.skills && skills_filter)
            AND (available_for_mentoring IS NULL OR p.is_available_for_mentoring = available_for_mentoring)
            AND (looking_for_job IS NULL OR p.is_looking_for_job = looking_for_job)
    )
    SELECT * FROM user_matches 
    WHERE relevance_score > 0
    ORDER BY relevance_score DESC, first_name ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user followers and following
CREATE OR REPLACE FUNCTION get_user_connections(target_user_id UUID DEFAULT auth.uid())
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    role TEXT,
    relationship TEXT, -- 'follower' or 'following'
    chat_privacy TEXT
) AS $$
BEGIN
    RETURN QUERY
    -- Get followers
    SELECT 
        p.user_id,
        au.email,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.role,
        'follower'::TEXT as relationship,
        COALESCE(uss.chat_privacy, 'followers') as chat_privacy
    FROM followers f
    JOIN profiles p ON p.user_id = f.follower_id
    JOIN auth.users au ON au.id = p.user_id
    LEFT JOIN user_search_settings uss ON uss.user_id = p.user_id
    WHERE f.following_id = target_user_id
    
    UNION ALL
    
    -- Get following
    SELECT 
        p.user_id,
        au.email,
        p.first_name,
        p.last_name,
        p.avatar_url,
        p.role,
        'following'::TEXT as relationship,
        COALESCE(uss.chat_privacy, 'followers') as chat_privacy
    FROM followers f
    JOIN profiles p ON p.user_id = f.following_id
    JOIN auth.users au ON au.id = p.user_id
    LEFT JOIN user_search_settings uss ON uss.user_id = p.user_id
    WHERE f.follower_id = target_user_id
    
    ORDER BY first_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;