import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Briefcase, 
  TrendingUp, 
  Heart, 
  Award,
  ArrowRight,
  Clock,
  MapPin,
  Building,
  Star,
  Eye,
  ThumbsUp,
  CheckCircle,
  Plus,
  Activity,
  BookOpen,
  Target,
  Zap
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'student' | 'alumni' | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalJobs: 0,
    totalConnections: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch user role
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .single();
        
        if (profileData?.role) setUserRole(profileData.role);

        // Fetch stats
        const [usersResult, eventsResult, jobsResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('events').select('id', { count: 'exact' }),
          supabase.from('posts').select('id', { count: 'exact' }).eq('type', 'blog')
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalEvents: eventsResult.count || 0,
          totalJobs: jobsResult.count || 0,
          totalConnections: 156 // Mock data
        });

        // Fetch recent events
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        setUpcomingEvents(eventsData || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout userRole={userRole || 'student'}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const renderDashboardByRole = () => {
    if (!userRole) return <div>Loading dashboard...</div>;
    
    if (userRole === 'admin') {
      return (
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">Here's what's happening with your platform today</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Total Users</p>
                    <p className="text-3xl font-bold text-blue-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+12% from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-300">Active Events</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-white">{stats.totalEvents}</p>
                  </div>
                  <div className="p-3 bg-green-500 rounded-full">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+5 new this week</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Job Posts</p>
                    <p className="text-3xl font-bold text-purple-900 dark:text-white">{stats.totalJobs}</p>
                  </div>
                  <div className="p-3 bg-purple-500 rounded-full">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+8 new positions</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-300">Connections</p>
                    <p className="text-3xl font-bold text-orange-900 dark:text-white">{stats.totalConnections}</p>
                  </div>
                  <div className="p-3 bg-orange-500 rounded-full">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600 font-medium">+23 this week</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Quick Actions</CardTitle>
              <CardDescription>Manage your platform efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-16 flex-col space-y-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-700 dark:hover:bg-blue-900 transition-all duration-200" asChild>
                  <Link to="/dashboard/users">
                    <Users className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 dark:border-green-700 dark:hover:bg-green-900 transition-all duration-200" asChild>
                  <Link to="/dashboard/manage-events">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Approve Events</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:border-purple-700 dark:hover:bg-purple-900 transition-all duration-200" asChild>
                  <Link to="/dashboard/manage-jobs">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">Review Jobs</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 flex-col space-y-2 border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 dark:border-orange-700 dark:hover:bg-orange-900 transition-all duration-200" asChild>
                  <Link to="/dashboard/analytics">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">View Analytics</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Student/Alumni Dashboard
    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-blue-500 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back! ✨
              </h1>
              <p className="text-white/90 text-lg">Ready to connect and grow your network?</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30" asChild>
                <Link to="/dashboard/feed">
                  <Users className="h-5 w-5 mr-2" />
                  Find Connections
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-6 w-6 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Get started with these popular features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group" asChild>
                    <Link to="/dashboard/jobs">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {userRole === 'alumni' ? 'Post Job' : 'Find Jobs'}
                      </span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group" asChild>
                    <Link to="/dashboard/mentorship">
                      <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Heart className="h-6 w-6 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Find Mentor</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group" asChild>
                    <Link to="/dashboard/events">
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Calendar className="h-6 w-6 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">
                        {userRole === 'alumni' ? 'Create Event' : 'Join Events'}
                      </span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-20 flex-col space-y-2 border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group" asChild>
                    <Link to="/dashboard/recommendations">
                      <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Award className="h-6 w-6 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium">Recommendations</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <Avatar className="ring-2 ring-blue-200">
                        <AvatarFallback className="bg-gradient-to-r from-blue-400 to-purple-500 text-white">
                          JD
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">New connection request</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">John Doe wants to connect</p>
                      </div>
                      <div className="flex items-center text-xs text-gray-400">
                        <Clock className="h-3 w-3 mr-1" />
                        2h ago
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700" asChild>
                  <Link to="/dashboard/feed">
                    View all activity
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Events & Stats */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.slice(0, 3).map((event: any) => (
                    <div key={event.id} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.location && (
                        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-green-600 hover:text-green-700" asChild>
                  <Link to="/dashboard/events">
                    View all events
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Profile Completion */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Complete your profile</span>
                    <span className="text-sm text-purple-600">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Add your skills and interests to get better recommendations
                  </p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" asChild>
                    <Link to="/dashboard/profile">
                      Complete Profile
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Your Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">42</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Connections</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">8</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Events Joined</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout userRole={userRole || 'student'}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-6">
          {renderDashboardByRole()}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;