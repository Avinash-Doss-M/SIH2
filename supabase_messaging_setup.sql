-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    is_group BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create chat_room_members table (for managing room memberships)
CREATE TABLE IF NOT EXISTS chat_room_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    UNIQUE(room_id, user_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view public rooms and rooms they created" ON chat_rooms
    FOR SELECT USING (
        is_public = true OR 
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM chat_room_members 
            WHERE room_id = chat_rooms.id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rooms" ON chat_rooms
    FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update rooms they created" ON chat_rooms
    FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete rooms they created" ON chat_rooms
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in rooms they have access to" ON messages
    FOR SELECT USING (
        EXISTS (
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
        ) OR
        sender_id = auth.uid() OR 
        receiver_id = auth.uid()
    );

CREATE POLICY "Users can send messages to rooms they have access to" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND (
            EXISTS (
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
            ) OR
            receiver_id IS NOT NULL
        )
    );

-- RLS Policies for chat_room_members
CREATE POLICY "Users can view room members for accessible rooms" ON chat_room_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM chat_rooms cr 
            WHERE cr.id = chat_room_members.room_id 
            AND (
                cr.is_public = true OR 
                cr.created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM chat_room_members crm 
                    WHERE crm.room_id = cr.id AND crm.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Users can join public rooms" ON chat_room_members
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM chat_rooms cr 
            WHERE cr.id = chat_room_members.room_id AND cr.is_public = true
        )
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_room_id ON chat_room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);

-- Create some default chat rooms
INSERT INTO chat_rooms (name, description, is_public, created_by) VALUES
    ('General Chat', 'General discussion for all alumni members', true, (SELECT id FROM auth.users LIMIT 1)),
    ('Job Opportunities', 'Share and discuss job openings', true, (SELECT id FROM auth.users LIMIT 1)),
    ('Alumni Events', 'Discuss upcoming alumni events', true, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT DO NOTHING;