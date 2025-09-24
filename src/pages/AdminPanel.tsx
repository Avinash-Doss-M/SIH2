import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AdminPanel = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({});

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
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    const { data: usersData } = await supabase.from('profiles').select('*');
    setUsers(usersData || []);
    const { data: eventsData } = await supabase.from('events').select('*');
    setEvents(eventsData || []);
    // Fetch jobs/internships from posts table where type is 'job' or 'internship'
    const { data: jobsData } = await supabase
      .from('posts')
      .select('*')
      .in('type', ['job', 'internship']);
    setJobs(jobsData || []);
    // Dummy analytics
    setAnalytics({
      totalUsers: usersData?.length || 0,
      totalEvents: eventsData?.length || 0,
      totalJobs: jobsData?.length || 0,
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
      <div className="max-w-5xl mx-auto py-10 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users.map(u => (
                <div key={u.id} className="border rounded p-3">
                  <div className="font-semibold">{u.first_name} {u.last_name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                  <div className="text-xs capitalize">{u.role}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Event Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(e => (
                <div key={e.id} className="border rounded p-3">
                  <div className="font-semibold">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.status}</div>
                  <div className="text-xs">{e.event_date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Job Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(j => (
                <div key={j.id} className="border rounded p-3">
                  <div className="font-semibold">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.company || j.author_id}</div>
                  <div className="text-xs capitalize">{j.type}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Engagement Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-8">
              <div>
                <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                <div className="text-xs text-muted-foreground">Total Users</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalEvents}</div>
                <div className="text-xs text-muted-foreground">Total Events</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{analytics.totalJobs}</div>
                <div className="text-xs text-muted-foreground">Total Jobs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
