import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  // TODO: Fetch userRole, stats, recentActivity, and upcomingEvents from API or context
  const userRole = "alumni"; // Replace with dynamic role from auth
  const stats = null; // Replace with fetched stats
  const currentStats = null; // Replace with fetched stats
  const recentActivity = []; // Replace with fetched activity
  const upcomingEvents = []; // Replace with fetched events

  // TODO: Render dashboard content based on fetched data
  const renderAlumniDashboard = () => {
    // Render nothing or a loading state for now
    return null;
  };

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening in your alumni network today.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button variant="hero">
              <Users className="h-5 w-5 mr-2" />
              Find Connections
            </Button>
          </div>
        </div>

        {renderAlumniDashboard()}

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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 hover:bg-secondary/50 rounded-lg transition-fast">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View all activity
                <ArrowRight className="h-4 w-4 ml-2" />
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
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-card-hover transition-smooth">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {event.attendees} attending
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4">
                View all events
                <ArrowRight className="h-4 w-4 ml-2" />
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
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Briefcase className="h-6 w-6" />
                <span className="text-sm">Post Job</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Heart className="h-6 w-6" />
                <span className="text-sm">Find Mentor</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Calendar className="h-6 w-6" />
                <span className="text-sm">Create Event</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Award className="h-6 w-6" />
                <span className="text-sm">View Achievements</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;