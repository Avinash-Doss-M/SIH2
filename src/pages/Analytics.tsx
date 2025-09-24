import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const Analytics = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [stats, setStats] = useState({
    totalUsers: 0,
    alumni: 0,
    students: 0,
    mentors: 0,
    events: 0,
    jobs: 0,
    posts: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setUserRole(data.role);
        });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    // Users
    const { data: users } = await supabase.from('profiles').select('*');
    // Events
    const { data: events } = await supabase.from('events').select('*');
    // Posts
    const { data: posts } = await supabase.from('posts').select('*');
    // Jobs (posts with type job/internship)
    const jobs = posts?.filter((p: any) => p.type === 'job' || p.type === 'internship') || [];
    setStats({
      totalUsers: users?.length || 0,
      alumni: users?.filter((u: any) => u.role === 'alumni').length || 0,
      students: users?.filter((u: any) => u.role === 'student').length || 0,
      mentors: users?.filter((u: any) => u.is_mentor).length || 0,
      events: events?.length || 0,
      jobs: jobs.length,
      posts: posts?.length || 0,
      activeUsers: users?.filter((u: any) => u.updated_at > new Date(Date.now() - 7*24*60*60*1000).toISOString()).length || 0,
    });
  };

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
      <div className="max-w-4xl mx-auto py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.alumni}</div>
                <div className="text-xs text-muted-foreground">Alumni</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.students}</div>
                <div className="text-xs text-muted-foreground">Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.mentors}</div>
                <div className="text-xs text-muted-foreground">Mentors</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.events}</div>
                <div className="text-xs text-muted-foreground">Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.jobs}</div>
                <div className="text-xs text-muted-foreground">Jobs/Internships</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.posts}</div>
                <div className="text-xs text-muted-foreground">Posts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <div className="text-xs text-muted-foreground">Active (7d)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
