import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Heart, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Award,
  Globe,
  Shield
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Smart Networking",
      description: "Connect with alumni based on industry, location, and shared interests using our AI-powered matching system.",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "Mentorship Programs",
      description: "Find mentors or become one. Our platform facilitates meaningful mentorship relationships for career growth.",
      color: "text-success"
    },
    {
      icon: Briefcase,
      title: "Career Opportunities",
      description: "Access exclusive job postings, internships, and career advice shared by successful alumni in your network.",
      color: "text-accent"
    },
    {
      icon: Calendar,
      title: "Events & Networking",
      description: "Attend virtual and in-person events, reunions, and professional development workshops.",
      color: "text-primary-light"
    },
    {
      icon: MessageSquare,
      title: "Community Discussions",
      description: "Engage in meaningful conversations, share experiences, and seek advice in our active community forums.",
      color: "text-warning"
    },
    {
      icon: TrendingUp,
      title: "Analytics Dashboard",
      description: "Track your networking progress, engagement metrics, and career advancement through detailed insights.",
      color: "text-success"
    },
    {
      icon: Award,
      title: "Recognition Programs",
      description: "Celebrate achievements, milestones, and contributions to the alumni community with our recognition system.",
      color: "text-accent"
    },
    {
      icon: Globe,
      title: "Global Network",
      description: "Connect with alumni worldwide, expanding your professional network across different countries and cultures.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your personal and professional information is protected with enterprise-grade security and privacy controls.",
      color: "text-muted-foreground"
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need to{" "}
            <span className="text-primary">Connect & Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and features you need to build meaningful connections, advance your career, and give back to your community.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 bg-card hover:bg-card-hover transition-smooth hover:shadow-lg hover:-translate-y-1 border-border group animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-secondary rounded-lg group-hover:bg-primary/10 transition-smooth">
                      <IconComponent className={`h-6 w-6 ${feature.color} group-hover:scale-110 transition-transform`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-fast">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to unlock the full potential of your alumni network?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg">
              Get Started Today
            </Button>
            <Button variant="outline" size="lg">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;