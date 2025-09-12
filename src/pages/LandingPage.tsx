import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Phone, MapPin, GraduationCap, Heart, Users } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Testimonials />
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-90"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Expand Your Network?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join our thriving community of alumni and students. Start building meaningful connections today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="accent" size="xl">
              <Link to="/register" className="group">
                Join as Alumni
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-accent p-2 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-accent-foreground" />
                </div>
                <span className="text-2xl font-bold">AlumniConnect</span>
              </div>
              <p className="text-primary-foreground/80 mb-6 max-w-md">
                Connecting alumni, students, and institutions to create a thriving community of lifelong learners and achievers.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-primary-foreground/80">
                  <Users className="h-5 w-5" />
                  <span>15,000+ Members</span>
                </div>
                <div className="flex items-center space-x-2 text-primary-foreground/80">
                  <Heart className="h-5 w-5" />
                  <span>5,000+ Connections</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-primary-foreground/80 hover:text-accent transition-fast">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-primary-foreground/80 hover:text-accent transition-fast">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/events" className="text-primary-foreground/80 hover:text-accent transition-fast">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to="/mentorship" className="text-primary-foreground/80 hover:text-accent transition-fast">
                    Mentorship
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-primary-foreground/80 hover:text-accent transition-fast">
                    Career Center
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">hello@alumniconnect.edu</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-accent" />
                  <span className="text-primary-foreground/80">123 University Ave, City, State</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-primary-light/20 mt-12 pt-8 text-center">
            <p className="text-primary-foreground/60">
              © 2024 AlumniConnect. All rights reserved. Building connections that last a lifetime.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;