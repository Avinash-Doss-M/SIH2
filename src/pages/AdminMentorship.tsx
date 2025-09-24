import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AdminMentorship = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [requests, setRequests] = useState<any[]>([]);
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
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase.from('mentorship_requests').select('*');
    setRequests(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('mentorship_requests').update({ status: newStatus }).eq('id', id);
    fetchRequests();
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
            <CardTitle>Mentorship Requests Management</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">Mentee</th>
                      <th className="border px-2 py-1">Mentor</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td className="border px-2 py-1">{r.mentee_id}</td>
                        <td className="border px-2 py-1">{r.mentor_id}</td>
                        <td className="border px-2 py-1 capitalize">{r.status}</td>
                        <td className="border px-2 py-1">
                          <select
                            value={r.status}
                            onChange={ev => handleStatusChange(r.id, ev.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
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

export default AdminMentorship;
