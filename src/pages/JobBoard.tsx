import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string;
  title: string;
  company?: string;
  location?: string;
  description?: string;
  author_id: string;
  created_at: string;
  type: string;
}

const JobBoard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'alumni' | 'admin' | 'student'>('student');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    type: 'job',
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
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    // @ts-ignore: allow job/internship types after migration
    const { data } = await supabase
      .from('posts')
      .select('*')
      // @ts-ignore
      .in('type', ['job', 'internship'])
      .order('created_at', { ascending: false });
    if (data) setJobs(data as Job[]);
  };

  const handlePost = async () => {
    if (!user) return;
    // @ts-ignore: allow job/internship types after migration
    await supabase.from('posts').insert({
      title: form.title,
      company: form.company,
      location: form.location,
      description: form.description,
      author_id: user.id,
      type: form.type,
    });
    setForm({ title: '', company: '', location: '', description: '', type: 'job' });
    setShowForm(false);
    fetchJobs();
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-3xl mx-auto py-10 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Job Board</h1>
          {(userRole === 'alumni' || userRole === 'admin') && (
            <Button onClick={() => setShowForm(v => !v)}>
              {showForm ? 'Cancel' : 'Add Job/Internship'}
            </Button>
          )}
        </div>
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Post a Job or Internship</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
              <Input
                placeholder="Company"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              />
              <Input
                placeholder="Location"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="border rounded px-2 py-1"
              >
                <option value="job">Job</option>
                <option value="internship">Internship</option>
              </select>
              <Button onClick={handlePost}>Post</Button>
            </CardContent>
          </Card>
        )}
        <div className="space-y-4">
          {jobs.map(job => (
            <Card key={job.id}>
              <CardHeader>
                <CardTitle>{job.title} <span className="text-xs text-muted-foreground">({job.type})</span></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-semibold">{job.company}</div>
                <div className="text-sm text-muted-foreground">{job.location}</div>
                <div className="my-2">{job.description}</div>
                <div className="text-xs text-muted-foreground">Posted on {new Date(job.created_at).toLocaleDateString()}</div>
              </CardContent>
            </Card>
          ))}
          {jobs.length === 0 && <div className="text-muted-foreground">No jobs or internships posted yet.</div>}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobBoard;
