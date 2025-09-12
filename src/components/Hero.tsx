import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Trophy, Heart } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-light/60"></div>
      
      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column - Text content */}
          <div className="text-center lg:text-left animate-fadeIn">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Connect. Grow.{" "}
              <span className="text-accent">Succeed Together.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 leading-relaxed max-w-2xl">
              Join our vibrant alumni community where connections flourish, careers advance, and lifelong relationships are built. Your next opportunity is just one connection away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button asChild variant="hero" size="xl">
                <Link to="/register" className="group">
                  Join as Alumni
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="accent" size="xl">
                <Link to="/login">Login</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-accent mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary-foreground">10,000+</div>
                <div className="text-sm text-primary-foreground/80">Active Alumni</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-6 w-6 text-accent mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary-foreground">5,000+</div>
                <div className="text-sm text-primary-foreground/80">Career Boosts</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Heart className="h-6 w-6 text-accent mr-2" />
                </div>
                <div className="text-2xl font-bold text-primary-foreground">2,500+</div>
                <div className="text-sm text-primary-foreground/80">Mentorships</div>
              </div>
            </div>
          </div>

          {/* Right column - Image */}
          <div className="relative lg:ml-8 animate-slideUp">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={heroImage}
                alt="Alumni networking and engagement"
                className="w-full h-[500px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 bg-accent text-accent-foreground p-4 rounded-full shadow-lg animate-float">
              <Users className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-success text-success-foreground p-4 rounded-full shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <Trophy className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="hsl(var(--background))"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;