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
  link?: string;
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
    link: '',
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
    try {
      // Fetch posts with tags containing 'job' or 'internship'
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        return;
      }
      
      if (data) {
        // Filter and transform posts that have job/internship tags
        const jobPosts = data.filter(post => 
          post.tags && (post.tags.includes('job') || post.tags.includes('internship'))
        );
        
        const transformedJobs = jobPosts.map(post => ({
          id: post.id,
          title: post.title,
          company: post.tags?.find(tag => tag.startsWith('company:'))?.replace('company:', '') || '',
          location: post.tags?.find(tag => tag.startsWith('location:'))?.replace('location:', '') || '',
          description: post.content,
          link: post.tags?.find(tag => tag.startsWith('link:'))?.replace('link:', '') || '',
          author_id: post.author_id,
          created_at: post.created_at,
          type: post.tags?.includes('job') ? 'job' : 'internship'
        }));
        setJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handlePost = async () => {
    if (!user) return;
    
    // Create tags array with job type and company/location/link info
    const tags = [form.type];
    if (form.company.trim()) tags.push(`company:${form.company.trim()}`);
    if (form.location.trim()) tags.push(`location:${form.location.trim()}`);
    if (form.link.trim()) tags.push(`link:${form.link.trim()}`);
    
    await supabase.from('posts').insert({
      title: form.title,
      content: form.description,
      author_id: user.id,
      type: 'announcement', // Use existing enum value
      tags: tags,
      is_published: true
    });
    
    setForm({ title: '', company: '', location: '', description: '', link: '', type: 'job' });
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
              <Input
                placeholder="Company website or contact (e.g., https://company.com or +1234567890)"
                value={form.link}
                onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
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
                {job.link && (
                  <div className="my-2">
                    <span className="text-sm font-medium text-muted-foreground">Contact: </span>
                    {job.link.startsWith('http') ? (
                      <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {job.link}
                      </a>
                    ) : (
                      <span className="text-primary">{job.link}</span>
                    )}
                  </div>
                )}
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
