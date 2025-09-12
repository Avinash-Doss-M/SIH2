import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Annual Alumni Networking Gala",
      date: "2024-03-15",
      time: "6:00 PM - 10:00 PM",
      location: "Grand Ballroom, Downtown Hotel",
      attendees: 250,
      category: "Networking",
      featured: true,
      description: "Join us for an elegant evening of networking, dining, and celebrating our community's achievements."
    },
    {
      id: 2,
      title: "Career Development Workshop",
      date: "2024-03-22",
      time: "2:00 PM - 5:00 PM",
      location: "Campus Conference Center",
      attendees: 75,
      category: "Professional Development",
      featured: false,
      description: "Learn advanced career strategies from industry leaders and successful alumni mentors."
    },
    {
      id: 3,
      title: "Alumni Mentorship Speed Networking",
      date: "2024-04-05",
      time: "7:00 PM - 9:00 PM",
      location: "Student Union Building",
      attendees: 120,
      category: "Mentorship",
      featured: true,
      description: "Fast-paced networking event connecting students with alumni mentors across various industries."
    },
    {
      id: 4,
      title: "Tech Innovation Summit",
      date: "2024-04-18",
      time: "9:00 AM - 4:00 PM",
      location: "Engineering Building Auditorium",
      attendees: 200,
      category: "Technology",
      featured: false,
      description: "Explore cutting-edge technologies and startup opportunities with tech industry alumni."
    },
    {
      id: 5,
      title: "Homecoming Weekend Celebration",
      date: "2024-05-10",
      time: "All Day",
      location: "Campus Grounds",
      attendees: 500,
      category: "Social",
      featured: true,
      description: "Three days of festivities, reunions, and celebrations welcoming alumni back to campus."
    },
    {
      id: 6,
      title: "Leadership Excellence Workshop",
      date: "2024-05-25",
      time: "1:00 PM - 6:00 PM",
      location: "Business School Classroom",
      attendees: 60,
      category: "Leadership",
      featured: false,
      description: "Develop leadership skills through interactive sessions led by successful alumni executives."
    }
  ];

  const eventCategories = ["All", "Networking", "Professional Development", "Mentorship", "Technology", "Social", "Leadership"];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Networking": "bg-blue-100 text-blue-800",
      "Professional Development": "bg-green-100 text-green-800",
      "Mentorship": "bg-purple-100 text-purple-800",
      "Technology": "bg-orange-100 text-orange-800",
      "Social": "bg-pink-100 text-pink-800",
      "Leadership": "bg-yellow-100 text-yellow-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Alumni Events
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join our vibrant community at networking events, professional workshops, 
              and social gatherings designed to strengthen alumni connections.
            </p>
            <Button size="lg" className="bg-gradient-primary text-white">
              View All Events
            </Button>
          </div>
        </section>

        {/* Event Categories Filter */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap gap-3 justify-center">
              {eventCategories.map((category) => (
                <Badge
                  key={category}
                  variant={category === "All" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Events */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">
              Upcoming Events
            </h2>
            <div className="grid lg:grid-cols-2 gap-8">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className={`relative ${event.featured ? 'ring-2 ring-primary shadow-lg' : ''}`}>
                  {event.featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-primary text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl font-semibold text-primary pr-4">
                        {event.title}
                      </CardTitle>
                    </div>
                    <Badge className={getCategoryColor(event.category)}>
                      {event.category}
                    </Badge>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2 text-primary" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        {event.time}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        {event.location}
                      </div>
                      
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2 text-primary" />
                        {event.attendees} registered
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button className="flex-1 bg-gradient-primary text-white">
                        Register Now
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary mb-6">
              Don't Miss Out on Future Events
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay connected with our alumni community and be the first to know 
              about upcoming networking opportunities, workshops, and social gatherings.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-primary text-white">
                Join Alumni Network
              </Button>
              <Button size="lg" variant="outline">
                Subscribe to Updates
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Events;