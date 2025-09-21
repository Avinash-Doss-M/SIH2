import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Calendar, 
  MessageSquare, 
  User,
  Heart,
  Briefcase,
  BarChart3,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileNavigationProps {
  userRole?: "alumni" | "student" | "admin";
}

const MobileNavigation = ({ userRole = "alumni" }: MobileNavigationProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavigationItems = () => {
    const baseItems = [
      { title: "Home", url: "/dashboard", icon: Home },
      { title: "Network", url: "/dashboard/network", icon: Users },
      { title: "Events", url: "/dashboard/events", icon: Calendar },
      { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
      { title: "Profile", url: "/dashboard/profile", icon: User },
    ];

    const roleSpecificItems = {
      alumni: [
        { title: "Home", url: "/dashboard", icon: Home },
        { title: "Network", url: "/dashboard/network", icon: Users },
        { title: "Create", url: "/dashboard/create", icon: Plus },
        { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
        { title: "Profile", url: "/dashboard/profile", icon: User },
      ],
      student: [
        { title: "Home", url: "/dashboard", icon: Home },
        { title: "Mentors", url: "/dashboard/mentors", icon: Heart },
        { title: "Jobs", url: "/dashboard/jobs", icon: Briefcase },
        { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
        { title: "Profile", url: "/dashboard/profile", icon: User },
      ],
      admin: [
        { title: "Home", url: "/dashboard", icon: Home },
        { title: "Users", url: "/dashboard/users", icon: Users },
        { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
        { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
        { title: "Profile", url: "/dashboard/profile", icon: User },
      ]
    };

    return roleSpecificItems[userRole] || baseItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path: string) => currentPath === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
      <nav className="flex items-center justify-around px-2 py-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.url);
          
          return (
            <Link
              key={item.title}
              to={item.url}
              className="flex flex-col items-center justify-center p-2 min-w-0 flex-1"
            >
              <div className={`
                flex flex-col items-center space-y-1 transition-colors duration-200
                ${active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}>
                <div className="relative">
                  <IconComponent className="h-5 w-5" />
                  {item.title === "Messages" && (
                    <Badge className="absolute -top-2 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs bg-accent text-accent-foreground">
                      2
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium leading-none">
                  {item.title}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;