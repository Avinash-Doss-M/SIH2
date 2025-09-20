import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Heart, Eye, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image_url: string | null;
  tags: string[] | null;
  views_count: number;
  likes_count: number;
  created_at: string;
  author_id: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const Blogs = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('type', 'blog')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Alumni Blogs</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover inspiring stories, career insights, and valuable experiences shared by our alumni community.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search posts by title or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {post.featured_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex flex-wrap gap-2 mb-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      {post.profiles?.first_name && post.profiles?.last_name
                        ? `${post.profiles.first_name} ${post.profiles.last_name}`
                        : 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.views_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes_count}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Be the first to share your story!'}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-8 bg-card rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Share Your Story</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have an inspiring journey or valuable insights to share? Join our community of storytellers and help fellow alumni.
          </p>
          <Button size="lg">Write a Blog Post</Button>
        </div>
      </div>
    </div>
  );
};

export default Blogs;