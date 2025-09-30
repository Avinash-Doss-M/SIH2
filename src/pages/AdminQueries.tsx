import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Clock, CheckCircle, XCircle, MessageSquare, User } from 'lucide-react';
import { toast } from 'sonner';

interface ContactQuery {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  admin_response?: string;
  created_at: string;
  updated_at: string;
}

const AdminQueries = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<ContactQuery | null>(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchQueries();
    }
  }, [user]);

  const fetchUserRole = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (data?.role) setUserRole(data.role);
  };

  const fetchQueries = async () => {
    setLoading(true);
    try {
      // Fetch from both posts and event_requests tables
      const [postsResult, eventsResult] = await Promise.all([
        supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('event_requests')
          .select('*')
          .eq('category', 'contact_query')
          .order('created_at', { ascending: false })
      ]);

      const contactQueries: ContactQuery[] = [];

      // Process posts with contact_query tags
      if (postsResult.data) {
        const postQueries = postsResult.data
          .filter(post => post.tags && post.tags.includes('contact_query'))
          .map(post => ({
            id: post.id,
            name: post.tags?.find((tag: string) => tag.startsWith('name:'))?.replace('name:', '') || 'Unknown',
            email: post.tags?.find((tag: string) => tag.startsWith('email:'))?.replace('email:', '') || 'No email',
            subject: post.title,
            message: post.content,
            status: (post.tags?.find((tag: string) => tag.startsWith('status:'))?.replace('status:', '') || 'pending') as ContactQuery['status'],
            admin_response: post.excerpt || undefined,
            created_at: post.created_at,
            updated_at: post.updated_at
          }));
        contactQueries.push(...postQueries);
      }

      // Process event_requests that are contact queries
      if (eventsResult.data) {
        const eventQueries = eventsResult.data.map(event => {
          // Extract name and email from description
          const description = event.description || '';
          const nameMatch = description.match(/Name: ([^\n]+)/);
          const emailMatch = description.match(/Email: ([^\n]+)/);
          const messageMatch = description.match(/Message: ([\s\S]+)/);
          
          return {
            id: event.id,
            name: nameMatch ? nameMatch[1] : 'Unknown',
            email: emailMatch ? emailMatch[1] : 'No email',
            subject: event.title.replace('Contact Query: ', ''),
            message: messageMatch ? messageMatch[1] : description,
            status: (event.status || 'pending') as ContactQuery['status'],
            admin_response: undefined,
            created_at: event.created_at,
            updated_at: event.created_at
          };
        });
        contactQueries.push(...eventQueries);
      }

      // Sort all queries by creation date
      contactQueries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setQueries(contactQueries);
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load contact queries');
    } finally {
      setLoading(false);
    }
  };

  const updateQuery = async (queryId: string, updates: Partial<ContactQuery>) => {
    setSubmitting(true);
    try {
      // Try to update in posts table first
      const { data: currentPost, error: fetchPostError } = await supabase
        .from('posts')
        .select('tags')
        .eq('id', queryId)
        .single();

      if (!fetchPostError && currentPost) {
        // Update in posts table
        const updatedTags = (currentPost.tags || []).map((tag: string) => {
          if (tag.startsWith('status:')) {
            return `status:${updates.status}`;
          }
          return tag;
        });

        const { error: updatePostError } = await supabase
          .from('posts')
          .update({
            excerpt: updates.admin_response,
            tags: updatedTags,
            updated_at: new Date().toISOString()
          })
          .eq('id', queryId);

        if (updatePostError) {
          console.error('Error updating post query:', updatePostError);
          toast.error('Failed to update query');
          return;
        }
      } else {
        // Try to update in event_requests table
        const { error: updateEventError } = await supabase
          .from('event_requests')
          .update({
            status: updates.status
          })
          .eq('id', queryId);

        if (updateEventError) {
          console.error('Error updating event query:', updateEventError);
          toast.error('Failed to update query');
          return;
        }
      }

      toast.success('Query updated successfully');
      await fetchQueries();
      setSelectedQuery(null);
      setResponse('');
      setNewStatus('');
    } catch (error) {
      console.error('Error updating query:', error);
      toast.error('Failed to update query');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <MessageSquare className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredQueries = queries.filter(query => {
    if (filter === 'all') return true;
    return query.status === filter;
  });

  if (userRole !== 'admin') {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="max-w-2xl mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-6xl mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-primary">Contact Queries</h1>
            <p className="text-muted-foreground">Manage public contact form submissions</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Queries</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['pending', 'in_progress', 'resolved', 'closed'].map(status => {
            const count = queries.filter(q => q.status === status).length;
            return (
              <Card key={status}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                    {getStatusIcon(status)}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Queries List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Contact Queries ({filteredQueries.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredQueries.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No queries found for the selected filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQueries.map(query => (
                  <Card key={query.id} className="border-l-4 border-l-primary/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {query.name}
                              </span>
                            </div>
                            <Badge className={getStatusColor(query.status)}>
                              {query.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            {query.email} • {new Date(query.created_at).toLocaleString()}
                          </div>
                          
                          <div className="font-medium">{query.subject}</div>
                          
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {query.message}
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedQuery(query);
                                setResponse(query.admin_response || '');
                                setNewStatus(query.status);
                              }}
                            >
                              Manage
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Manage Contact Query</DialogTitle>
                            </DialogHeader>
                            
                            {selectedQuery && (
                              <div className="space-y-4">
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                      {selectedQuery.name}
                                    </h4>
                                    <Badge className={getStatusColor(selectedQuery.status)}>
                                      {selectedQuery.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {selectedQuery.email}
                                  </div>
                                  <div className="font-medium">{selectedQuery.subject}</div>
                                  <div className="text-sm">{selectedQuery.message}</div>
                                  <div className="text-xs text-muted-foreground">
                                    Submitted: {new Date(selectedQuery.created_at).toLocaleString()}
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Select value={newStatus} onValueChange={setNewStatus}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="response">Admin Response (Optional)</Label>
                                  <Textarea
                                    id="response"
                                    value={response}
                                    onChange={(e) => setResponse(e.target.value)}
                                    placeholder="Add internal notes or response details..."
                                    rows={4}
                                  />
                                </div>
                                
                                <div className="flex gap-2 justify-end">
                                  <Button 
                                    variant="outline" 
                                    onClick={() => setSelectedQuery(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={() => updateQuery(selectedQuery.id, {
                                      status: newStatus as ContactQuery['status'],
                                      admin_response: response.trim() || undefined
                                    })}
                                    disabled={submitting}
                                  >
                                    {submitting ? 'Updating...' : 'Update Query'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminQueries;