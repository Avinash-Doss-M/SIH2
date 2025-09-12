import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      company: "Tech Innovations Inc.",
      content: "Through AlumniConnect, I found an amazing mentor who helped me transition from academia to the tech industry. The networking opportunities have been invaluable for my career growth.",
      rating: 5,
      initials: "SC",
      gradient: "bg-gradient-to-br from-primary to-primary-light"
    },
    {
      name: "Michael Rodriguez",
      role: "Marketing Director",
      company: "Global Marketing Solutions",
      content: "I've hired three incredible talents through our alumni network on this platform. It's amazing how it connects people and creates opportunities for everyone involved.",
      rating: 5,
      initials: "MR",
      gradient: "bg-gradient-to-br from-accent to-accent-light"
    },
    {
      name: "Dr. Emily Watson",
      role: "Research Scientist",
      company: "Medical Research Institute",
      content: "The mentorship program connected me with a senior researcher who became not just a mentor, but a lifelong friend. The support system here is truly exceptional.",
      rating: 5,
      initials: "EW",
      gradient: "bg-gradient-to-br from-success to-success-light"
    },
    {
      name: "James Thompson",
      role: "Entrepreneur",
      company: "StartUp Ventures",
      content: "As a recent graduate, this platform helped me connect with successful alumni who provided crucial advice for starting my business. The community support is outstanding.",
      rating: 5,
      initials: "JT",
      gradient: "bg-gradient-to-br from-primary-light to-accent"
    },
    {
      name: "Lisa Park",
      role: "Financial Analyst",
      company: "Investment Partners LLC",
      content: "The events and networking opportunities have expanded my professional circle tremendously. I've made connections that have directly contributed to my career advancement.",
      rating: 5,
      initials: "LP",
      gradient: "bg-gradient-to-br from-warning to-accent-light"
    },
    {
      name: "David Kumar",
      role: "Project Manager",
      company: "Engineering Solutions",
      content: "Being able to give back as a mentor while also learning from other alumni creates such a positive cycle. This platform truly embodies the spirit of lifelong learning.",
      rating: 5,
      initials: "DK",
      gradient: "bg-gradient-to-br from-success to-primary"
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stories of{" "}
            <span className="text-primary">Success & Connection</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Hear from our community members about how AlumniConnect has transformed their professional journey and helped them build meaningful relationships.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 bg-card hover:bg-card-hover transition-smooth hover:shadow-lg hover:-translate-y-1 border-border group animate-slideUp relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Quote decoration */}
              <div className="absolute top-4 right-4 opacity-10">
                <Quote className="h-12 w-12 text-primary" />
              </div>
              
              {/* Rating stars */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-accent fill-current" />
                ))}
              </div>

              {/* Testimonial content */}
              <blockquote className="text-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </blockquote>

              {/* Author info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className={`${testimonial.gradient} text-white font-semibold`}>
                    {testimonial.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground group-hover:text-primary transition-fast">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </div>
                  <div className="text-sm text-primary font-medium">
                    {testimonial.company}
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-smooth pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Join thousands of alumni who are already connected and thriving
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="bg-secondary/50 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-2xl font-bold text-primary mb-2">15,000+</div>
              <div className="text-muted-foreground">Happy Alumni Connected</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-2xl font-bold text-accent mb-2">98%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;