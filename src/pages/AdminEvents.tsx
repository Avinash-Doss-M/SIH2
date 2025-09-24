import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/DashboardLayout";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const AdminEvents = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [events, setEvents] = useState<any[]>([]);
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
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from('events').select('*');
    setEvents(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await supabase.from('events').update({ status: newStatus }).eq('id', id);
    fetchEvents();
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
            <CardTitle>Event Management</CardTitle>
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
                      <th className="border px-2 py-1">Date</th>
                      <th className="border px-2 py-1">Status</th>
                      <th className="border px-2 py-1">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(e => (
                      <tr key={e.id}>
                        <td className="border px-2 py-1">{e.title}</td>
                        <td className="border px-2 py-1">{e.event_date}</td>
                        <td className="border px-2 py-1 capitalize">{e.status}</td>
                        <td className="border px-2 py-1">
                          <select
                            value={e.status}
                            onChange={ev => handleStatusChange(e.id, ev.target.value)}
                            className="border rounded px-2 py-1"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="ongoing">Ongoing</option>
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

export default AdminEvents;
