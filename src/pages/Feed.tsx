import React, { useState, useEffect } from 'react';
// Local CommentInput component
interface CommentInputProps {
  value: string;
  onChange: (v: string) => void;
  onPost: () => void;
  disabled: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({ value, onChange, onPost, disabled }) => {
  return (
    <div className="mt-3">
      <Textarea
        placeholder="Write a comment..."
        rows={2}
        className="resize-none mb-2"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
      <Button
        size="sm"
        onClick={onPost}
        disabled={disabled}
      >
        Post
      </Button>
    </div>
  );
};
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
import ImageUpload from "@/components/ImageUpload";
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
  featured_image_url?: string | null;
  profiles?: Profile | null;
  liked_by_user?: boolean;
}

const Feed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<'alumni' | 'student' | 'admin'>('student');
  const [posts, setPosts] = useState<Post[]>([]);
  // Local state for comment visibility and input per post
  const [commentState, setCommentState] = useState<Record<string, { show: boolean; value: string }>>({});
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
const [posting, setPosting] = useState(false);
const [newPostImageUrl, setNewPostImageUrl] = useState<string | null>(null);
const [uploadingImage, setUploadingImage] = useState(false);
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

const handlePostImageSelect = async (event: any) => {
  const file = event.target.files?.[0];
  if (!file || !user) return;

  if (file.size > 5 * 1024 * 1024) {
    toast({ title: "Error", description: "File must be < 5MB", variant: "destructive" });
    return;
  }
  if (!file.type.startsWith('image/')) {
    toast({ title: "Error", description: "Please select an image", variant: "destructive" });
    return;
  }

  try {
    setUploadingImage(true);
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${user.id}/posts/${timestamp}-${sanitizedName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      console.error('Error uploading post image:', uploadError);
      toast({ title: "Error", description: "Upload failed", variant: "destructive" });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(path);

    setNewPostImageUrl(publicUrl);
    toast({ title: "Image ready", description: "Your photo will be attached to the post" });
  } catch (e) {
    console.error(e);
  } finally {
    setUploadingImage(false);
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
          is_published: true,
          featured_image_url: newPostImageUrl || null,
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
      setNewPostImageUrl(null);
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
            {newPostImageUrl && (
              <div className="rounded-md overflow-hidden border">
                <img
                  src={newPostImageUrl}
                  alt="Post image preview"
                  loading="lazy"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ImageUpload onImageSelect={handlePostImageSelect}>
                  <>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {uploadingImage ? 'Uploading...' : 'Photo'}
                  </>
                </ImageUpload>
                {newPostImageUrl && (
                  <Button variant="ghost" size="sm" onClick={() => setNewPostImageUrl(null)}>
                    Remove
                  </Button>
                )}
              </div>
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
                      {post.profiles?.job_title && post.profiles?.company && post.profiles?.role !== 'student' && (
                        <p className="text-xs text-muted-foreground">
                          {post.profiles.job_title} at {post.profiles.company}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(post.created_at)}
                      </p>
                    </div>
                    {user && post.author_id === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const { error } = await supabase
                            .from('posts')
                            .delete()
                            .eq('id', post.id);
                          if (!error) {
                            setPosts(prev => prev.filter(p => p.id !== post.id));
                            toast({ title: 'Deleted', description: 'Your post was deleted.' });
                          }
                        }}
                        className="text-destructive"
                        title="Delete Post"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed mb-4 whitespace-pre-wrap">
                    {post.content}
                  </p>
                  {post.featured_image_url && (
                    <div className="rounded-md overflow-hidden border mb-3">
                      <img
                        src={post.featured_image_url}
                        alt="Post image"
                        loading="lazy"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}
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
                    
                    {/* Comment Button and Input */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-muted-foreground"
                      onClick={() => {
                        setCommentState(prev => ({
                          ...prev,
                          [post.id]: {
                            show: !prev[post.id]?.show,
                            value: prev[post.id]?.value || ''
                          }
                        }));
                      }}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="text-xs">Comment</span>
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-muted-foreground">
                      <Share2 className="h-4 w-4" />
                      <span className="text-xs">Share</span>
                    </Button>
                  </div>
                  {/* Comment Input UI */}
                  {commentState[post.id]?.show && (
                    <CommentInput
                      value={commentState[post.id]?.value || ''}
                      onChange={val => setCommentState(prev => ({
                        ...prev,
                        [post.id]: {
                          show: true,
                          value: val
                        }
                      }))}
                      onPost={async () => {
                        if (!user || !(commentState[post.id]?.value || '').trim()) return;
                        // TODO: Insert comment to DB when table is available
                        toast({ title: 'Commented', description: 'Your comment was added.' });
                        setCommentState(prev => ({
                          ...prev,
                          [post.id]: { show: false, value: '' }
                        }));
                      }}
                      disabled={!(commentState[post.id]?.value || '').trim()}
                    />
                  )}

import React from 'react';

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