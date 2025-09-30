import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { GraduationCap, Menu, X, Users, Calendar, MessageSquare } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-primary p-2 rounded-lg">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">AlumniConnect</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-foreground hover:text-primary transition-fast font-medium"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-foreground hover:text-primary transition-fast font-medium"
            >
              About
            </Link>
            <Link 
              to="/features" 
              className="text-foreground hover:text-primary transition-fast font-medium"
            >
              Features
            </Link>
            <Link 
              to="/public-events" 
              className="text-foreground hover:text-primary transition-fast font-medium"
            >
              Events
            </Link>
            {user && (
              <Link 
                to="/dashboard/events" 
                className="text-foreground hover:text-primary transition-fast font-medium"
              >
                My Events
              </Link>
            )}
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-fast font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild variant="accent">
              <Link to="/auth">Join Now</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border mt-4 pt-4 pb-4 animate-slideUp">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-foreground hover:text-primary transition-fast font-medium"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-foreground hover:text-primary transition-fast font-medium"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/features" 
                className="text-foreground hover:text-primary transition-fast font-medium"
                onClick={() => setIsOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/public-events" 
                className="text-foreground hover:text-primary transition-fast font-medium"
                onClick={() => setIsOpen(false)}
              >
                Events
              </Link>
              {user && (
                <Link 
                  to="/dashboard/events" 
                  className="text-foreground hover:text-primary transition-fast font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  My Events
                </Link>
              )}
              <Link 
                to="/contact" 
                className="text-foreground hover:text-primary transition-fast font-medium"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-3 pt-4 border-t border-border">
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>Login</Link>
                </Button>
                <Button asChild variant="accent" className="justify-start">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>Join Now</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;