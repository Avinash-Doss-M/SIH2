import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  MoreHorizontal,
  Send,
  Image as ImageIcon
} from "lucide-react";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  job_title?: string;
  company?: string;
  role: 'alumni' | 'student' | 'admin';
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  likes_count: number;
  title: string;
  type: string;
  profiles?: Profile | null;
  liked_by_user?: boolean;
}

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'alumni' | 'student' | 'admin'>('student');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchPosts();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch posts
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
        return;
      }

      // Fetch profiles for each post author
      if (postsData && postsData.length > 0) {
        const authorIds = postsData.map(post => post.author_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('*')
          .in('user_id', authorIds);

        // Create a map of profiles by user_id
        const profilesMap = profilesData?.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, any>) || {};

        // Check which posts the current user has liked
        if (user) {
          const postIds = postsData.map(post => post.id);
          const { data: likesData } = await supabase
            .from('post_likes')
            .select('post_id')
            .in('post_id', postIds)
            .eq('user_id', user.id);

          const likedPostIds = likesData?.map(like => like.post_id) || [];

          const postsWithLikes = postsData.map(post => ({
            ...post,
            profiles: profilesMap[post.author_id] || null,
            liked_by_user: likedPostIds.includes(post.id)
          }));

          setPosts(postsWithLikes);
        } else {
          const postsWithProfiles = postsData.map(post => ({
            ...post,
            profiles: profilesMap[post.author_id] || null
          }));
          setPosts(postsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async () => {
    if (!user || !newPost.trim()) return;

    setPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          author_id: user.id,
          content: newPost.trim(),
          title: newPost.trim().substring(0, 50) + (newPost.trim().length > 50 ? '...' : ''),
          type: 'discussion',
          is_published: true
        });

      if (error) {
        console.error('Error creating post:', error);
        toast({
          title: "Error",
          description: "Failed to create post",
          variant: "destructive"
        });
        return;
      }

      setNewPost('');
      toast({
        title: "Success",
        description: "Post created successfully!"
      });
      
      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPosting(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.liked_by_user) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (!error) {
          setPosts(prev => prev.map(p => 
            p.id === postId 
              ? { ...p, liked_by_user: false, likes_count: p.likes_count - 1 }
              : p
          ));
        }
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (!error) {
          setPosts(prev => prev.map(p => 
            p.id === postId 
              ? { ...p, liked_by_user: true, likes_count: p.likes_count + 1 }
              : p
          ));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'alumni': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Create Post */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Share your thoughts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button 
                onClick={createPost}
                disabled={!newPost.trim() || posting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {posting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Feed */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading posts...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {post.profiles?.first_name?.[0]}{post.profiles?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-sm">
                          {post.profiles?.first_name} {post.profiles?.last_name}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-0.5 ${getRoleBadgeColor(post.profiles?.role || 'student')}`}
                        >
                          {post.profiles?.role}
                        </Badge>
                      </div>
                      {post.profiles?.job_title && post.profiles?.company && (
                        <p className="text-xs text-muted-foreground">
                          {post.profiles.job_title} at {post.profiles.company}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center space-x-2 ${post.liked_by_user ? 'text-red-600' : 'text-muted-foreground'}`}
                    >
                      <Heart className={`h-4 w-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                      <span className="text-xs">{post.likes_count || 0}</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs">Comment</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {posts.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Feed;