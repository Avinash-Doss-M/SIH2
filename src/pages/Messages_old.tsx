import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Search,
  Hash,
  Settings,
  MoreHorizontal,
  UserCheck,
  UserPlus,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import UserSearch from '@/components/UserSearch';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  room_id: string | null;
  is_group: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
}

interface UserConnection {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  relationship: 'follower' | 'following';
  chat_privacy: 'public' | 'followers' | 'private';
}

interface DirectMessage {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [newRoomIsPublic, setNewRoomIsPublic] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadChatRooms();
      loadUserConnections();
      loadDirectMessages();
      subscribeToMessages();
    }
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChatRooms = async () => {
    try {
      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          *,
          chat_room_members!inner(user_id)
        `)
        .or(`is_public.eq.true,created_by.eq.${user?.id},chat_room_members.user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      setChatRooms(data || []);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    }
  };

  const loadUserConnections = async () => {
    try {
      const { data } = await supabase.rpc('get_user_connections', {
        target_user_id: user?.id
      });

      setUserConnections(data || []);
    } catch (error) {
      console.error('Error loading user connections:', error);
    }
  };

  const loadDirectMessages = async () => {
    try {
      // Get recent direct message conversations
      const { data } = await supabase
        .from('messages')
        .select(`
          sender_id,
          receiver_id,
          content,
          created_at,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url),
          receiver:profiles!messages_receiver_id_fkey(first_name, last_name, avatar_url)
        `)
        .is('room_id', null)
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      // Group by conversation partner and get latest message
      const conversations = new Map<string, DirectMessage>();
      
      data?.forEach(message => {
        const partnerId = message.sender_id === user?.id ? message.receiver_id : message.sender_id;
        const partner = message.sender_id === user?.id ? message.receiver : message.sender;
        
        if (!conversations.has(partnerId) && partner) {
          conversations.set(partnerId, {
            user_id: partnerId,
            first_name: partner.first_name,
            last_name: partner.last_name,
            avatar_url: partner.avatar_url,
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0 // TODO: Implement unread count
          });
        }
      });

      setDirectMessages(Array.from(conversations.values()));
    } catch (error) {
      console.error('Error loading direct messages:', error);
    }
    setLoading(false);
  };

  const loadRoomMessages = async (roomId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading room messages:', error);
    }
  };

  const loadDirectMessageHistory = async (partnerId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url)
        `)
        .is('room_id', null)
        .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user?.id})`)
        .order('created_at', { ascending: true });

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading direct message history:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add message if it's for current room/DM
          if ((activeRoom && newMessage.room_id === activeRoom) ||
              (activeDM && ((newMessage.sender_id === user?.id && newMessage.receiver_id === activeDM) ||
                          (newMessage.sender_id === activeDM && newMessage.receiver_id === user?.id)))) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: user.id,
        room_id: activeRoom,
        receiver_id: activeDM,
        is_group: !!activeRoom
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) {
        console.error('Error sending message:', error);
      } else {
        setNewMessage('');
        // Message will be added via real-time subscription
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const createChatRoom = async () => {
    if (!newRoomName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name: newRoomName.trim(),
          description: newRoomDescription.trim() || null,
          is_public: newRoomIsPublic,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating chat room:', error);
      } else {
        setChatRooms(prev => [data, ...prev]);
        setNewRoomName('');
        setNewRoomDescription('');
        setShowNewRoomDialog(false);
        setActiveRoom(data.id);
        setActiveDM(null);
      }
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setActiveRoom(roomId);
    setActiveDM(null);
    loadRoomMessages(roomId);
  };

  const handleDMSelect = (userId: string) => {
    setActiveDM(userId);
    setActiveRoom(null);
    loadDirectMessageHistory(userId);
  };

  const handleUserSearchSelect = (selectedUser: any) => {
    // Start a direct message with the selected user
    handleDMSelect(selectedUser.user_id);
  };

  const handleMessageUser = (selectedUser: any) => {
    // Start a direct message with the selected user
    handleDMSelect(selectedUser.user_id);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-muted-foreground mt-2">
            Connect with your fellow alumni and colleagues
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[80vh]">
          {/* Sidebar - Conversations */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Chats
                  </CardTitle>
                  <Dialog open={showNewRoomDialog} onOpenChange={setShowNewRoomDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Chat Room</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Room name"
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                        />
                        <Input
                          placeholder="Description (optional)"
                          value={newRoomDescription}
                          onChange={(e) => setNewRoomDescription(e.target.value)}
                        />
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="public"
                            checked={newRoomIsPublic}
                            onChange={(e) => setNewRoomIsPublic(e.target.checked)}
                          />
                          <label htmlFor="public">Public room</label>
                        </div>
                        <Button onClick={createChatRoom} className="w-full">
                          Create Room
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="rooms" className="h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="rooms">Rooms</TabsTrigger>
                    <TabsTrigger value="direct">Direct</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>
                  
                  {/* Chat Rooms */}
                  <TabsContent value="rooms" className="mt-0">
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-1 p-2">
                        {chatRooms.map(room => (
                          <div
                            key={room.id}
                            onClick={() => handleRoomSelect(room.id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              activeRoom === room.id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <Hash className="h-4 w-4" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{room.name}</p>
                                {room.description && (
                                  <p className="text-sm opacity-70 truncate">
                                    {room.description}
                                  </p>
                                )}
                              </div>
                              {room.is_public && (
                                <Badge variant="secondary" className="text-xs">
                                  Public
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  {/* Direct Messages */}
                  <TabsContent value="direct" className="mt-0">
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-1 p-2">
                        {/* Followers/Following */}
                        {userConnections.map(connection => (
                          <div
                            key={connection.user_id}
                            onClick={() => handleDMSelect(connection.user_id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              activeDM === connection.user_id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={connection.avatar_url} />
                                <AvatarFallback>
                                  {connection.first_name[0]}{connection.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {connection.first_name} {connection.last_name}
                                </p>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {connection.relationship}
                                  </Badge>
                                  {connection.chat_privacy === 'public' && (
                                    <Badge variant="secondary" className="text-xs">
                                      Public
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {/* Recent Direct Messages */}
                        {directMessages.map(dm => (
                          <div
                            key={dm.user_id}
                            onClick={() => handleDMSelect(dm.user_id)}
                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                              activeDM === dm.user_id 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-accent'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={dm.avatar_url} />
                                <AvatarFallback>
                                  {dm.first_name[0]}{dm.last_name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {dm.first_name} {dm.last_name}
                                </p>
                                {dm.last_message && (
                                  <p className="text-sm opacity-70 truncate">
                                    {dm.last_message}
                                  </p>
                                )}
                              </div>
                              {dm.unread_count > 0 && (
                                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
                                  {dm.unread_count}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  
                  {/* User Search */}
                  <TabsContent value="search" className="mt-0 p-2">
                    <UserSearch 
                      onUserSelect={handleUserSearchSelect}
                      onMessageUser={handleMessageUser}
                      showMessageButton={true}
                      placeholder="Search users to message..."
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Main Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {(activeRoom || activeDM) ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {activeRoom ? (
                          <>
                            <Hash className="h-5 w-5" />
                            {chatRooms.find(room => room.id === activeRoom)?.name}
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-5 w-5" />
                            {directMessages.find(dm => dm.user_id === activeDM)?.first_name} {directMessages.find(dm => dm.user_id === activeDM)?.last_name}
                          </>
                        )}
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[50vh] p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender_id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {message.sender_id !== user?.id && (
                                <p className="text-xs font-medium mb-1">
                                  {message.sender?.first_name} {message.sender?.last_name}
                                </p>
                              )}
                              <p className="break-words">{message.content}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(message.created_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            sendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={sendMessage} size="sm">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* No Chat Selected */
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">
                      Select a conversation
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Choose a chat room or start a direct message to begin
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}