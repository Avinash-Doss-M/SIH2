import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarTrigger,
  useSidebar 
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  Briefcase, 
  Heart, 
  Settings, 
  Bell,
  Search,
  User,
  BarChart3,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "alumni" | "student" | "admin";
}

  const DashboardLayout = ({ children, userRole = "alumni" }: DashboardLayoutProps) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role?: string;
  }>({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "Feed", url: "/dashboard/feed", icon: Users },
      { title: "Profile", url: "/dashboard/profile", icon: User },
      { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
      { title: "Events", url: "/dashboard/events", icon: Calendar },
    ];

    const roleSpecificItems = {
      alumni: [
        { title: "My Network", url: "/dashboard/network", icon: Users },
        { title: "Mentorship", url: "/dashboard/mentorship", icon: Heart },
        { title: "Job Board", url: "/dashboard/jobs", icon: Briefcase },
      ],
      student: [
        { title: "Find Mentors", url: "/dashboard/mentors", icon: Heart },
        { title: "Career Center", url: "/dashboard/career", icon: Briefcase },
        { title: "Alumni Network", url: "/dashboard/alumni", icon: Users },
      ],
      admin: [
        { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
        { title: "User Management", url: "/dashboard/users", icon: Shield },
        { title: "Event Management", url: "/dashboard/manage-events", icon: Calendar },
      ]
    };

    return [...baseItems, ...roleSpecificItems[userRole]];
  };

  const navigationItems = getNavigationItems();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <AppSidebar 
          navigationItems={navigationItems} 
          userRole={profile.role || userRole}
          currentPath={currentPath}
          profile={profile}
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Header */}
          <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center space-x-2">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">AlumniConnect</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search connections, events..."
                  className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-secondary">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile.avatar_url} alt="User" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {profile.first_name?.[0]}{profile.last_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="font-medium text-foreground">
                        {profile.first_name && profile.last_name 
                          ? `${profile.first_name} ${profile.last_name}` 
                          : user?.email?.split('@')[0] || 'User'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {profile.role || userRole}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <div className="flex items-center justify-between w-full">
                      <span className="flex items-center">
                        <span className="mr-2">🌙</span>
                        Theme
                      </span>
                      <ThemeToggle />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

interface AppSidebarProps {
  navigationItems: Array<{ title: string; url: string; icon: any }>;
  userRole: string;
  currentPath: string;
  profile: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    role?: string;
  };
  onSignOut: () => void;
}

const AppSidebar = ({ navigationItems, userRole, currentPath, profile, onSignOut }: AppSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  
  const isActive = (path: string) => currentPath === path;
  const getNavClass = (path: string) => 
    isActive(path) ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className={getNavClass(item.url)}>
                        <IconComponent className="h-5 w-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/dashboard/settings" className={getNavClass("/dashboard/settings")}>
                    <Settings className="h-5 w-5" />
                    {!collapsed && <span>Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/help" className="hover:bg-sidebar-accent/50">
                    <HelpCircle className="h-5 w-5" />
                    {!collapsed && <span>Help & Support</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Profile Section */}
        {!collapsed && (
          <div className="mt-auto p-4 border-t border-sidebar-border">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url} alt="User" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold">
                  {profile.first_name?.[0]}{profile.last_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sidebar-foreground truncate">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'User'
                  }
                </div>
                <div className="text-sm text-sidebar-foreground/70 capitalize">
                  {profile.role || userRole}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardLayout;