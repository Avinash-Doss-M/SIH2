import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AdminJobs = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    setLoading(true);
    const { data: posts } = await supabase.from('posts').select('*');
    const jobsData = (posts || []).filter((p: any) => p.type === 'job' || p.type === 'internship');
    setJobs(jobsData);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('posts').delete().eq('id', id);
    fetchJobs();
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
            <CardTitle>Job & Internship Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Title</th>
                      <th className="border px-2 py-1">Company</th>
                      <th className="border px-2 py-1">Type</th>
                      <th className="border px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(j => (
                      <tr key={j.id}>
                        <td className="border px-2 py-1">{j.title}</td>
                        <td className="border px-2 py-1">{j.company}</td>
                        <td className="border px-2 py-1 capitalize">{j.type}</td>
                        <td className="border px-2 py-1">
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(j.id)}>
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobs;
