import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";

const Events = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student'>('student');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', description: '', date: '', time: '', location: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setUserRole(data.role);
        });
    }
  }, [user]);

  useEffect(() => {
    setLoading(true);
    supabase
      .from('events')
      .select('*')
      .in('status', ['approved', 'published'])
      .order('event_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || []);
        setLoading(false);
      });
    if (userRole === 'admin') {
      supabase
        .from('event_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => setEventRequests(data || []));
    }
  }, [userRole, refresh]);

  const handleRequestEvent = async () => {
    setSubmitting(true);
    await supabase.from('event_requests').insert({
      requested_by: user.id,
      ...requestForm,
      status: 'pending',
    });
    setSubmitting(false);
    setShowRequestForm(false);
    setRequestForm({ title: '', description: '', date: '', time: '', location: '', category: '' });
    setRefresh(r => r + 1);
  };

  const handleApproveEvent = async (request: any) => {
    // Move request to events table and mark as approved
    await supabase.from('events').insert({
      title: request.title,
      description: request.description,
      event_date: request.date,
      location: request.location,
      category: request.category,
      status: 'approved',
      created_by: request.requested_by,
    });
    await supabase.from('event_requests').update({ status: 'approved' }).eq('id', request.id);
    setRefresh(r => r + 1);
  };

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    await supabase.from('event_attendees').insert({ event_id: eventId, user_id: user.id });
    setRefresh(r => r + 1);
  };

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

      {/* Role-based actions */}
      <div className="container mx-auto px-4 pt-8">
        {userRole === 'admin' && (
          <div className="mb-6 flex flex-col gap-3">
            <h2 className="font-bold text-lg">Pending Event Requests</h2>
            {eventRequests.length === 0 && <div className="text-muted-foreground">No pending requests.</div>}
            {eventRequests.filter(r => r.status === 'pending').map(request => (
              <Card key={request.id} className="mb-2">
                <CardHeader>
                  <CardTitle>{request.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">{request.description}</div>
                  <div className="mb-2 text-xs text-muted-foreground">Requested by: {request.requested_by}</div>
                  <Button size="sm" onClick={() => handleApproveEvent(request)}>Approve</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        {userRole === 'alumni' && (
          <div className="mb-6 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setShowRequestForm(true)}>Request New Event</Button>
          </div>
        )}
        {userRole === 'student' && (
          <div className="mb-6 flex flex-wrap gap-3">
            <span className="text-muted-foreground">Browse and register for events below.</span>
          </div>
        )}
        {/* Event Request Form */}
        {showRequestForm && (
          <div className="mb-6 p-4 border rounded-lg bg-card">
            <h3 className="font-semibold mb-2">Request New Event</h3>
            <input className="input mb-2" placeholder="Title" value={requestForm.title} onChange={e => setRequestForm(f => ({ ...f, title: e.target.value }))} />
            <textarea className="input mb-2" placeholder="Description" value={requestForm.description} onChange={e => setRequestForm(f => ({ ...f, description: e.target.value }))} />
            <input className="input mb-2" type="date" value={requestForm.date} onChange={e => setRequestForm(f => ({ ...f, date: e.target.value }))} />
            <input className="input mb-2" type="time" value={requestForm.time} onChange={e => setRequestForm(f => ({ ...f, time: e.target.value }))} />
            <input className="input mb-2" placeholder="Location" value={requestForm.location} onChange={e => setRequestForm(f => ({ ...f, location: e.target.value }))} />
            <input className="input mb-2" placeholder="Category" value={requestForm.category} onChange={e => setRequestForm(f => ({ ...f, category: e.target.value }))} />
            <Button size="sm" onClick={handleRequestEvent} disabled={submitting}>Submit</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowRequestForm(false)}>Cancel</Button>
          </div>
        )}
      </div>

      <main className="pt-10">
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
                        {/* TODO: Show attendee count if needed */}
                      </div>
                      <div className="flex gap-3">
                        {userRole === 'student' && (
                          <Button className="flex-1 bg-gradient-primary text-white" onClick={() => handleRegister(event.id)}>
                            Register Now
                          </Button>
                        )}
                        <Button variant="outline" className="flex-1">
                          Learn More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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