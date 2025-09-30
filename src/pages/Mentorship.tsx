import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Briefcase, GraduationCap, MessageCircle, Search, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';

interface Mentor {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  company: string | null;
  job_title: string | null;
  location: string | null;
  skills: string[] | null;
  graduation_year: number | null;
  avatar_url: string | null;
}

const Mentorship = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('find-mentors');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMentors();
      fetchMyRequests();
    }
  }, [user]);

  const fetchMyRequests = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select(`
          *,
          mentor:profiles!mentorship_requests_mentor_id_fkey(first_name, last_name, avatar_url, job_title, company)
        `)
        .eq('mentee_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests(data || []);
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
    }
  };

  // Only allow access to logged-in users
  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access the mentorship program.</p>
        </div>
      </DashboardLayout>
    );
  }

  const fetchMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_mentor', true)
        .order('first_name');

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMentorshipRequest = async () => {
    if (!user || !selectedMentor) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('mentorship_requests')
        .insert({
          mentor_id: selectedMentor.user_id,
          mentee_id: user.id,
          message: requestMessage,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Mentorship request sent successfully!');
      setRequestMessage('');
      setSelectedMentor(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send mentorship request');
      console.error('Error sending mentorship request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMentors = mentors.filter(mentor =>
    (mentor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (mentor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (mentor.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (mentor.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) || false)
  );

  // Only allow access to logged-in users
  if (!user) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">Please log in to access the mentorship program.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">Find Your Mentor</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with experienced alumni who can guide you in your career journey and personal growth.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="find">Find Mentors</TabsTrigger>
              <TabsTrigger value="requests">My Requests</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="find">
            {/* Search */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, company, role, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  {mentor.avatar_url ? (
                    <img 
                      src={mentor.avatar_url} 
                      alt={`${mentor.first_name} ${mentor.last_name}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-primary">
                      {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">
                  {mentor.first_name} {mentor.last_name}
                </CardTitle>
                <CardDescription className="flex flex-col gap-1">
                  {mentor.job_title && (
                    <div className="flex items-center justify-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      <span>{mentor.job_title}</span>
                    </div>
                  )}
                  {mentor.company && (
                    <div className="font-medium">{mentor.company}</div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentor.location && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{mentor.location}</span>
                    </div>
                  )}
                  
                  {mentor.graduation_year && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span>Class of {mentor.graduation_year}</span>
                    </div>
                  )}

                  {mentor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {mentor.bio}
                    </p>
                  )}

                  {mentor.skills && mentor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentor.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentor.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full" 
                        onClick={() => setSelectedMentor(mentor)}
                        disabled={!user}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Request Mentorship
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Request Mentorship</DialogTitle>
                        <DialogDescription>
                          Send a personalized message to {mentor.first_name} {mentor.last_name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="message">Your Message</Label>
                          <Textarea
                            id="message"
                            placeholder="Introduce yourself and explain why you'd like their mentorship..."
                            value={requestMessage}
                            onChange={(e) => setRequestMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleMentorshipRequest}
                            disabled={submitting || !requestMessage.trim()}
                          >
                            {submitting ? 'Sending...' : 'Send Request'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {filteredMentors.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new mentors!'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {myRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          {request.mentor?.avatar_url ? (
                            <img 
                              src={request.mentor.avatar_url} 
                              alt={`${request.mentor.first_name} ${request.mentor.last_name}`}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-lg font-bold text-primary">
                              {request.mentor?.first_name?.[0]}{request.mentor?.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">
                            {request.mentor?.first_name} {request.mentor?.last_name}
                          </CardTitle>
                          <CardDescription>
                            {request.mentor?.job_title} at {request.mentor?.company}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {request.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {request.message && (
                    <CardContent>
                      <div className="p-3 bg-muted rounded">
                        <p className="text-sm">{request.message}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}

              {myRequests.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No mentorship requests yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by requesting mentorship from available mentors
                  </p>
                  <Button onClick={() => setActiveTab('find')}>
                    Find Mentors
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action - Role-based */}
        <BecomeMentorSection user={user} />
      </div>
    </DashboardLayout>
  );
};

// Component for becoming a mentor based on user role
const BecomeMentorSection = ({ user }: { user: any }) => {
  const [isApplying, setIsApplying] = useState(false);

  const handleBecomeMentor = async () => {
    if (!user) return;
    
    setIsApplying(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_mentor: true })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('You are now registered as a mentor! Your profile will be visible to mentees.');
      // Reload the page to show updated mentor status
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to register as mentor');
      console.error('Error registering as mentor:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="text-center mt-12 py-8 bg-card rounded-lg border">
      <h3 className="text-2xl font-bold mb-4">Become a Mentor</h3>
      <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
        Share your experience and help guide the next generation. Make a difference in someone's career journey.
      </p>
      
      {user?.role === 'alumni' ? (
        <Button 
          size="lg" 
          onClick={handleBecomeMentor} 
          disabled={isApplying}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isApplying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Registering...
            </>
          ) : (
            <>
              <Star className="w-4 h-4 mr-2" />
              Become a Mentor
            </>
          )}
        </Button>
      ) : user?.role === 'student' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Mentorship is available to alumni. Complete your studies and join as an alumni to become a mentor!
          </p>
        </div>
      ) : (
        <Button size="lg" disabled>
          <Star className="w-4 h-4 mr-2" />
          Available to Alumni
        </Button>
      )}
    </div>
  );
};

export default Mentorship;