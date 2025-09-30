import { useState, useEffect } from 'react';
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import UserSearch from '@/components/UserSearch';
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

  // Only allow 'admin' role for users who are already admins (not for sign-up)
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
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchNotifications();
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

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      // Fetch recent activities as notifications
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);
      
      const notificationList = [
        ...(posts?.map(post => ({
          id: `post-${post.id}`,
          title: 'New Post Available',
          message: post.content?.substring(0, 50) + '...' || 'Check out this new post',
          type: 'post',
          timestamp: post.created_at,
          read: false
        })) || []),
        ...(events?.map(event => ({
          id: `event-${event.id}`,
          title: 'New Event',
          message: `${event.title} - ${event.description?.substring(0, 30)}...`,
          type: 'event',
          timestamp: event.created_at,
          read: false
        })) || [])
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
       .slice(0, 5);
      
      setNotifications(notificationList);
      setUnreadCount(notificationList.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
      { title: "Job Board", url: "/dashboard/jobs", icon: Briefcase },
      { title: "Mentorship", url: "/dashboard/mentorship", icon: Heart },
      { title: "Recommendations", url: "/dashboard/recommendations", icon: Heart },
    ];

    const adminItems = [
      { title: "Admin Panel", url: "/dashboard/admin-panel", icon: Shield },
      { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
      { title: "User Management", url: "/dashboard/users", icon: Shield },
      { title: "Alumni Data", url: "/dashboard/manage-alumni", icon: Users },
      { title: "Event Management", url: "/dashboard/manage-events", icon: Calendar },
      { title: "Job Management", url: "/dashboard/manage-jobs", icon: Briefcase },
      { title: "Mentorship Management", url: "/dashboard/manage-mentorship", icon: Heart },
      { title: "Contact Queries", url: "/dashboard/manage-queries", icon: MessageSquare },
    ];

    if (userRole === 'admin') {
      return [...baseItems, ...adminItems];
    }
    return baseItems;
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
          {/* Modern Top Header */}
          <header className="h-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center space-x-6">
              <SidebarTrigger className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors" />
              <div className="hidden md:flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AlumniConnect
                </span>
              </div>
              
              {/* Quick Access Links */}
              <div className="hidden lg:flex items-center space-x-1 ml-8">
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === '/dashboard' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/dashboard/feed" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === '/dashboard/feed' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Feed
                </Link>
                <Link 
                  to="/dashboard/events" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === '/dashboard/events' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Events
                </Link>
                <Link 
                  to="/dashboard/jobs" 
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    currentPath === '/dashboard/jobs' 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 shadow-sm' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  Jobs
                </Link>
                {userRole === 'admin' && (
                  <Link 
                    to="/dashboard/manage-alumni" 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPath === '/dashboard/manage-alumni' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 shadow-sm' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    Alumni Data
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <SearchComponent />

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Notifications</h3>
                      {unreadCount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setNotifications(prev => prev.map(n => ({...n, read: true})));
                            setUnreadCount(0);
                          }}
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-2">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`p-3 rounded-lg border ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}
                          >
                            <div className="font-medium text-sm">{notification.title}</div>
                            <div className="text-xs text-gray-600 mt-1">{notification.message}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 py-4 text-center">
                        No notifications yet
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-gray-200 dark:ring-gray-700">
                      <AvatarImage src={profile.avatar_url} alt="User" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {profile.first_name?.[0]}{profile.last_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent transition-all duration-200">
                        {profile.first_name && profile.last_name 
                          ? `${profile.first_name} ${profile.last_name}` 
                          : user?.email?.split('@')[0] || 'User'
                        }
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-400 capitalize transition-colors duration-200">
                        {profile.role || userRole}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
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
    isActive(path) 
      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg" 
      : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white";

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-lg`}>
      <SidebarContent className="py-4">
        {/* User Profile Section */}
        {!collapsed && (
          <div className="px-4 pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="ring-2 ring-blue-200 dark:ring-blue-700">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                  {profile.first_name?.[0]}{profile.last_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'User'
                  }
                </p>
                <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                  {profile.role || userRole}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : "px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"}`}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 mt-2">
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.url} 
                        className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${getNavClass(item.url)} group`}
                        title={collapsed ? item.title : undefined}
                      >
                        <IconComponent className={`h-5 w-5 ${isActive(item.url) ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                        {!collapsed && (
                          <span className="font-medium text-sm">{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : "px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"}`}>
            Quick Actions
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-2 mt-2">
            <SidebarMenu className="space-y-1">
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/dashboard/profile" 
                    className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 ${getNavClass("/dashboard/profile")} group`}
                    title={collapsed ? "Profile Settings" : undefined}
                  >
                    <Settings className={`h-5 w-5 ${isActive('/dashboard/profile') ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
                    {!collapsed && <span className="font-medium text-sm">Profile Settings</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/help" 
                    className="flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white group"
                    title={collapsed ? "Help & Support" : undefined}
                  >
                    <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
                    {!collapsed && <span className="font-medium text-sm">Help & Support</span>}
                  </a>
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
                <div className="font-medium bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent truncate">
                  {profile.first_name && profile.last_name 
                    ? `${profile.first_name} ${profile.last_name}` 
                    : 'User'
                  }
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-400 capitalize">
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

// Search Component for the header
const SearchComponent = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setShowSearch(true);
    }
  };

  return (
    <>
      {/* Desktop Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchInput}
          onClick={() => setShowSearch(true)}
          placeholder="Search connections, events..."
          className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
        />
      </div>

      {/* Mobile Search Button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden"
        onClick={() => setShowSearch(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* Search Modal */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Search Users</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <UserSearch 
              onUserSelect={(user) => {
                console.log('Selected user:', user);
                setShowSearch(false);
              }}
              placeholder="Search users by name, company, skills..."
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardLayout;