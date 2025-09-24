import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  graduation_year?: number;
  skills?: string[];
  interests?: string[];
}

interface JobPost {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type: string;
  description?: string;
}

const Recommendations = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedUsers, setRecommendedUsers] = useState<UserProfile[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobPost[]>([]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecommendations();
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

  const fetchRecommendations = async () => {
    // Fetch users with similar interests/skills/role
    const { data: users } = await supabase
      .from('profiles')
      .select('*');
    // Dummy logic: recommend users with same role or overlapping skills/interests
    if (users && userProfile) {
      const recUsers = users.filter((u: any) =>
        u.id !== userProfile.id &&
        (u.role === userProfile.role ||
          (u.skills && userProfile.skills && u.skills.some((s: string) => userProfile.skills.includes(s))) ||
          (u.interests && userProfile.interests && u.interests.some((i: string) => userProfile.interests.includes(i)))
        )
      );
      setRecommendedUsers(recUsers.slice(0, 5));
    }
    // Fetch jobs/internships from posts
    const { data: jobs } = await supabase
      .from('posts')
      .select('*')
      .in('type', ['job', 'internship']);
    setRecommendedJobs((jobs || []).slice(0, 5));
  };

  return (
    <DashboardLayout userRole={userProfile?.role || 'student'}>
      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Recommended Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedUsers.map(u => (
                <div key={u.id} className="border rounded p-3">
                  <div className="font-semibold">{u.first_name} {u.last_name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{u.role}</div>
                  <div className="text-xs">{u.graduation_year}</div>
                  <div className="text-xs">Skills: {u.skills?.join(', ')}</div>
                  <div className="text-xs">Interests: {u.interests?.join(', ')}</div>
                </div>
              ))}
              {recommendedUsers.length === 0 && <div className="text-muted-foreground">No recommendations yet.</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recommended Jobs & Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.map(j => (
                <div key={j.id} className="border rounded p-3">
                  <div className="font-semibold">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.company}</div>
                  <div className="text-xs capitalize">{j.type}</div>
                  <div className="text-xs">{j.location}</div>
                  <div className="text-xs">{j.description?.slice(0, 60)}...</div>
                </div>
              ))}
              {recommendedJobs.length === 0 && <div className="text-muted-foreground">No jobs or internships recommended yet.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;
