import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Star } from "lucide-react";

const getCategoryColor = (category: string) => {
  // ...category color logic...
  return "bg-secondary";
};

export default function PublicEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-primary mb-12 text-center">
            Upcoming Events
          </h2>
          {loading ? (
            <div className="text-center text-muted-foreground">Loading events...</div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {events.length === 0 && <div className="text-muted-foreground">No events found.</div>}
              {events.map((event) => (
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
                        {event.event_date}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 mr-2 text-primary" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        {event.location}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
