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
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        setJobs([]);
        return;
      }
      
      // Filter posts that have job or internship tags
      const jobsData = (posts || []).filter((p: any) => 
        p.tags && (p.tags.includes('job') || p.tags.includes('internship'))
      ).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        company: post.tags?.find((tag: string) => tag.startsWith('company:'))?.replace('company:', '') || 'Not specified',
        location: post.tags?.find((tag: string) => tag.startsWith('location:'))?.replace('location:', '') || 'Not specified',
        link: post.tags?.find((tag: string) => tag.startsWith('link:'))?.replace('link:', '') || '',
        type: post.tags?.includes('job') ? 'job' : 'internship',
        created_at: post.created_at,
        author_id: post.author_id,
        tags: post.tags
      }));
      
      setJobs(jobsData);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
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
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No jobs or internships found.
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <Card key={job.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="font-medium">{job.company}</span>
                            {job.location !== 'Not specified' && (
                              <>
                                <span>•</span>
                                <span>{job.location}</span>
                              </>
                            )}
                            <span>•</span>
                            <span className="capitalize bg-primary/10 text-primary px-2 py-1 rounded-md">
                              {job.type}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Posted on {new Date(job.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // TODO: Add edit functionality
                              console.log('Edit job:', job.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDelete(job.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {job.content}
                        </div>
                        {job.link && (
                          <div className="text-sm">
                            <span className="font-medium text-muted-foreground">Contact: </span>
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminJobs;
