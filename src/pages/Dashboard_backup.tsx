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
  Building
} from "lucide-react";

const Dashboard = () => {

  // Fetch user info from auth context
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'student' | 'alumni' | null>(null);
  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      if (data && data.role) setUserRole(data.role);
    };
    fetchRole();
  }, [user]);
  const stats = null; // Replace with fetched stats
  const currentStats = null; // Replace with fetched stats
  const recentActivity = []; // Replace with fetched activity
  const upcomingEvents = []; // Replace with fetched events

  // Render dashboard content based on user role
  const renderDashboardByRole = () => {
    if (!userRole) return <div>Loading dashboard...</div>;
    if (userRole === 'admin') {
      return (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Manage users, events, jobs, and site analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard/users">Manage Users</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/manage-events">Approve Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/manage-jobs">Review Jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    if (userRole === 'student') {
      return (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Student Dashboard</CardTitle>
            <CardDescription>Explore jobs, find mentors, and join events.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard/jobs">Find Jobs</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/mentorship">Find Mentor</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/events">Join Events</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/recommendations">View Achievements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    // Default: alumni
    return null; // Alumni UI is the default below
  };

  return (
    <DashboardLayout userRole={userRole || undefined}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {`Welcome back, ${user?.user_metadata?.first_name || user?.email || "User"}!`} 👋
            </h1>
            <p className="text-muted-foreground">
              {userRole === 'admin' && "Here's what's happening in the admin panel."}
              {userRole === 'student' && "Here's what's happening for students today."}
              {(!userRole || userRole === 'alumni') && "Here's what's happening in your alumni network today."}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="hero" asChild>
              <Link to="/dashboard/feed">
                <Users className="h-5 w-5 mr-2" />
                Find Connections
              </Link>
            </Button>
          </div>
        </div>
        {renderDashboardByRole()}
        {/* Alumni UI (default) */}
        {(!userRole || userRole === 'alumni') && (
          <>
            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Stay updated with your network activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* ...existing code for recentActivity... */}
                  </div>
                  <Button variant="ghost" className="w-full mt-4" asChild>
                    <Link to="/dashboard/feed">
                      View all activity
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              {/* Upcoming Events */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-accent" />
                    Upcoming Events
                  </CardTitle>
                  <CardDescription>
                    Don't miss these networking opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* ...existing code for upcomingEvents... */}
                  </div>
                  <Button variant="ghost" className="w-full mt-4" asChild>
                    <Link to="/dashboard/events">
                      View all events
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            {/* Quick Actions */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription>
                  Jump into the most common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                    <Link to="/dashboard/jobs">
                      <Briefcase className="h-6 w-6" />
                      <span className="text-sm">Post Job</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                    <Link to="/dashboard/mentorship">
                      <Heart className="h-6 w-6" />
                      <span className="text-sm">Find Mentor</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                    <Link to="/dashboard/events">
                      <Calendar className="h-6 w-6" />
                      <span className="text-sm">Create Event</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2" asChild>
                    <Link to="/dashboard/recommendations">
                      <Award className="h-6 w-6" />
                      <span className="text-sm">View Achievements</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;