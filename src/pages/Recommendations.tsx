import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  recommendationEngine, 
  UserRecommendation, 
  JobRecommendation, 
  EventRecommendation 
} from '@/lib/recommendations';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink,
  Star,
  TrendingUp
} from 'lucide-react';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  graduation_year?: number;
  skills?: string[];
  interests?: string[];
}

const Recommendations = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedUsers, setRecommendedUsers] = useState<UserRecommendation[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobRecommendation[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<EventRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      loadRecommendations();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setUserProfile(data);
  };

  const loadRecommendations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Initialize the recommendation engine
      await recommendationEngine.initialize(user.id);
      
      // Get all recommendations in parallel
      const [users, jobs, events] = await Promise.all([
        recommendationEngine.getRecommendedUsers(8),
        recommendationEngine.getRecommendedJobs(6),
        recommendationEngine.getRecommendedEvents(6)
      ]);
      
      setRecommendedUsers(users);
      setRecommendedJobs(jobs);
      setRecommendedEvents(events);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={(userProfile?.role as 'alumni' | 'student' | 'admin') || 'student'}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={(userProfile?.role as 'alumni' | 'student' | 'admin') || 'student'}>
      <div className="max-w-6xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Personalized Recommendations</h1>
          <p className="text-muted-foreground">
            Discover connections, opportunities, and events tailored just for you
          </p>
        </div>

        {/* Recommended Connections */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Connections</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedUsers.map(user => (
                <div key={user.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {user.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {user.role}
                        {user.graduation_year && ` • Class of ${user.graduation_year}`}
                      </div>
                      {user.job_title && (
                        <div className="text-sm text-muted-foreground truncate">
                          {user.job_title} {user.company && `at ${user.company}`}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-2">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          {user.score}% match
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.reasons.slice(0, 2).map((reason, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recommendedUsers.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No connection recommendations available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Opportunities</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.map(job => (
                <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{job.title}</div>
                      {job.company && (
                        <div className="text-muted-foreground">{job.company}</div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant={job.type === 'job' ? 'default' : 'secondary'}>
                          {job.type}
                        </Badge>
                        {job.location && (
                          <>
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">{job.score}%</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {job.content}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {job.reasons.slice(0, 3).map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  
                  {job.link && (
                    <Button size="sm" className="w-full" asChild>
                      <a 
                        href={job.link.startsWith('http') ? job.link : `mailto:${job.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Apply Now
                      </a>
                    </Button>
                  )}
                </div>
              ))}
              {recommendedJobs.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No job recommendations available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Recommended Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedEvents.map(event => (
                <div key={event.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="mb-2">
                    <div className="font-semibold">{event.title}</div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.event_date).toLocaleDateString()}
                      {event.location && (
                        <>
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </>
                      )}
                    </div>
                  </div>
                  
                  {event.description && (
                    <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {event.description}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {event.category && (
                      <Badge variant="default" className="text-xs">
                        {event.category}
                      </Badge>
                    )}
                    {event.reasons.slice(0, 2).map((reason, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium">{event.score}% match</span>
                    </div>
                    <Button size="sm" variant="outline">
                      Learn More
                    </Button>
                  </div>
                </div>
              ))}
              {recommendedEvents.length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  No event recommendations available yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;
