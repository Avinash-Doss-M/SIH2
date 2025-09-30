import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Search,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import UserSearch from '@/components/UserSearch';

interface SimpleMessage {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

interface UserConnection {
  user_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [userConnections, setUserConnections] = useState<UserConnection[]>([]);
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    if (user) {
      loadUserConnections();
    }
  }, [user]);

  const loadUserConnections = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url, role')
        .neq('user_id', user?.id || '')
        .limit(10);

      if (data) {
        const connections: UserConnection[] = data.map(profile => ({
          user_id: profile.user_id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          avatar_url: profile.avatar_url,
          role: profile.role || 'student'
        }));
        setUserConnections(connections);
      }
    } catch (error) {
      console.error('Error loading user connections:', error);
    }
    setLoading(false);
  };

  const loadDirectMessageHistory = async (partnerId: string) => {
    try {
      // For now, we'll use the existing messages table structure
      const { data } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(first_name, last_name, avatar_url)
        `)
        .eq('sender_id', partnerId)
        .order('created_at', { ascending: true })
        .limit(20);

      // Transform to our expected format
      const transformedMessages: SimpleMessage[] = (data || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleDMSelect = (userId: string) => {
    setActiveDM(userId);
    loadDirectMessageHistory(userId);
  };

  const handleUserSearchSelect = (selectedUser: any) => {
    handleDMSelect(selectedUser.user_id);
  };

  const handleMessageUser = (selectedUser: any) => {
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
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chats
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="direct" className="h-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="direct">Direct</TabsTrigger>
                    <TabsTrigger value="search">Search</TabsTrigger>
                  </TabsList>
                  
                  {/* Direct Messages */}
                  <TabsContent value="direct" className="mt-0">
                    <ScrollArea className="h-[60vh]">
                      <div className="space-y-1 p-2">
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
                                <Badge variant="outline" className="text-xs">
                                  {connection.role}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {userConnections.length === 0 && (
                          <div className="text-center p-8 text-muted-foreground">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No connections yet</p>
                            <p className="text-sm">Use search to find people to message</p>
                          </div>
                        )}
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
              {activeDM ? (
                <>
                  {/* Chat Header */}
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        {userConnections.find(conn => conn.user_id === activeDM)?.first_name} {userConnections.find(conn => conn.user_id === activeDM)?.last_name}
                      </CardTitle>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 p-0">
                    <ScrollArea className="h-[50vh] p-4">
                      <div className="space-y-4">
                        {messages.length > 0 ? (
                          messages.map((message) => (
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
                          ))
                        ) : (
                          <div className="text-center p-8 text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No messages yet</p>
                            <p className="text-sm">Start the conversation!</p>
                          </div>
                        )}
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
                            // For now, just clear the input (messaging to be implemented after DB setup)
                            console.log('Send message:', newMessage, 'to:', activeDM);
                            setNewMessage('');
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={() => {
                          // For now, just clear the input
                          console.log('Send message:', newMessage, 'to:', activeDM);
                          setNewMessage('');
                        }}
                        size="sm"
                      >
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
                      Choose someone to start messaging or use search to find new connections
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