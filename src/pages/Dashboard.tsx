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
  const userRole = "alumni"; // This would be dynamic based on authentication

  // Mock data - would come from API
  const stats = {
    alumni: {
      connections: 127,
      mentorships: 3,
      events: 8,
      messages: 12
    },
    student: {
      mentors: 2,
      applications: 5,
      events: 6,
      connections: 34
    },
    admin: {
      totalUsers: 10247,
      activeEvents: 15,
      monthlyGrowth: 12.3,
      engagementRate: 78.5
    }
  };

  const currentStats = stats[userRole];

  const recentActivity = [
    {
      type: "connection",
      message: "Sarah Chen accepted your connection request",
      time: "2 hours ago",
      avatar: "SC"
    },
    {
      type: "event",
      message: "New event: Tech Alumni Networking Night",
      time: "4 hours ago",
      avatar: "E"
    },
    {
      type: "message",
      message: "Michael Rodriguez sent you a message",
      time: "6 hours ago",
      avatar: "MR"
    },
    {
      type: "mentorship",
      message: "Your mentorship session with Dr. Watson is tomorrow",
      time: "1 day ago",
      avatar: "DW"
    }
  ];

  const upcomingEvents = [
    {
      title: "Alumni Career Fair 2024",
      date: "Dec 15, 2024",
      time: "10:00 AM",
      location: "Virtual Event",
      attendees: 127
    },
    {
      title: "Tech Industry Meetup",
      date: "Dec 18, 2024",
      time: "6:00 PM",
      location: "San Francisco, CA",
      attendees: 45
    },
    {
      title: "Mentorship Program Kickoff",
      date: "Dec 20, 2024",
      time: "2:00 PM",
      location: "Virtual Event",
      attendees: 89
    }
  ];

  const renderAlumniDashboard = () => {
    const alumniStats = currentStats as typeof stats.alumni;
    
    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-card border-border hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{alumniStats.connections}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Heart className="h-6 w-6 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{alumniStats.mentorships}</div>
                  <div className="text-sm text-muted-foreground">Active Mentorships</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{alumniStats.events}</div>
                  <div className="text-sm text-muted-foreground">Events Attended</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-lg transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">{alumniStats.messages}</div>
                  <div className="text-sm text-muted-foreground">Unread Messages</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8 border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Complete Your Profile</CardTitle>
            <CardDescription>
              A complete profile helps you connect better with the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Profile completion</span>
                <span className="text-sm font-medium text-foreground">75%</span>
              </div>
              <Progress value={75} className="w-full" />
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">✓ Basic Info</Badge>
                <Badge variant="secondary">✓ Work Experience</Badge>
                <Badge variant="outline">+ Add Skills</Badge>
                <Badge variant="outline">+ Upload Photo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
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