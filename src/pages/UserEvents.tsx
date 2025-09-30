import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";

const getCategoryColor = (category: string) => {
  // ...category color logic...
  return "bg-secondary";
};


export default function UserEvents() {
  const [userRole, setUserRole] = useState<'admin' | 'alumni' | 'student' | null>(null);
  const [refresh, setRefresh] = useState(0);
  // Registered users for each event (admin view)
  const [eventAttendees, setEventAttendees] = useState<Record<string, any[]>>({});

  // Fetch attendees for all events (admin only)
  useEffect(() => {
    if (userRole === 'admin') {
      supabase
        .from('event_attendees')
        .select('event_id, user_id, profiles(name)')
        .then(({ data }) => {
          const grouped: Record<string, any[]> = {};
          (data || []).forEach((row: any) => {
            if (!grouped[row.event_id]) grouped[row.event_id] = [];
            grouped[row.event_id].push(row);
          });
          setEventAttendees(grouped);
        });
    }
  }, [userRole, refresh]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [eventRequests, setEventRequests] = useState<any[]>([]);
  // Student: fetch approved events and registration state
  const [approvedEvents, setApprovedEvents] = useState<any[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  // All events for event list
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    if (userRole === 'student') {
      supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .order('event_date', { ascending: true })
        .then(({ data }) => setApprovedEvents(data || []));
      // Fetch registered events for this student
      if (user) {
        supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id)
          .then(({ data }) => setRegisteredEventIds((data || []).map((row: any) => row.event_id)));
      }
    }
  }, [userRole, user, refresh]);

  // Student: register for event
  const handleRegisterEvent = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('event_attendees')
      .insert({ event_id: eventId, user_id: user.id });
    if (error) {
      toast({ title: 'Error', description: 'Failed to register for event', variant: 'destructive' });
    } else {
      setRefresh(r => r + 1);
      toast({ title: 'Success', description: 'Registered for event!' });
    }
  };
  // Fetch all events for event list (for all roles)
  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .then(({ data }) => setEvents(data || []));
  }, [refresh]);
  // Admin: fetch all event requests
  const [allEventRequests, setAllEventRequests] = useState<any[]>([]);
  const [showApproveModal, setShowApproveModal] = useState<{ open: boolean, request: any | null }>({ open: false, request: null });
  const [approveLoading, setApproveLoading] = useState(false);
  const [editedLocation, setEditedLocation] = useState('');
  useEffect(() => {
    if (userRole === 'admin') {
      supabase
        .from('event_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => setAllEventRequests(data || []));
    }
  }, [userRole, refresh]);

  // Admin: approve event request
  const handleApproveRequest = async (request: any) => {
    setApproveLoading(true);
    // 1. Update event request status
    const { error: updateError } = await supabase
      .from('event_requests')
      .update({ status: 'approved' })
      .eq('id', request.id);
    if (updateError) {
      setApproveLoading(false);
      toast({ title: 'Error', description: 'Failed to approve event', variant: 'destructive' });
      return;
    }
    // 2. Insert into events table
    const { error: insertError } = await supabase
      .from('events')
      .insert({
        title: request.title,
        description: request.description,
        event_date: request.date,
        location: request.location,
        category: request.category,
        created_by: request.requested_by,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    setApproveLoading(false);
    if (insertError) {
      console.error('Event insertion error:', insertError);
      toast({ title: 'Error', description: `Failed to add to events board: ${insertError.message}`, variant: 'destructive' });
    } else {
      setShowApproveModal({ open: false, request: null });
      setRefresh(r => r + 1);
      toast({ title: 'Success', description: 'Event approved and added to dashboard!' });
    }
  };

  // Admin: deny event request
  const handleDenyRequest = async (request: any) => {
    setApproveLoading(true);
    const { error } = await supabase
      .from('event_requests')
      .update({ status: 'denied' })
      .eq('id', request.id);
    setApproveLoading(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to deny event', variant: 'destructive' });
    } else {
      setShowApproveModal({ open: false, request: null });
      setRefresh(r => r + 1);
      toast({ title: 'Success', description: 'Event denied.' });
    }
  };
  // ...existing code...

  // Fetch user role from Supabase profile
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data && data.role) setUserRole(data.role);
        });
    }
  }, [user]);
  // ...other hooks for events, attendees, etc...

  // Handler to delete an event request (alumni only)
  const handleDeleteRequest = async (requestId: string) => {
    const { error } = await supabase.from('event_requests').delete().eq('id', requestId);
    if (error) {
      toast({ title: 'Error', description: 'Failed to delete event request', variant: 'destructive' });
    } else {
      setEventRequests(reqs => reqs.filter(r => r.id !== requestId));
      toast({ title: 'Deleted', description: 'Event request deleted successfully' });
    }
  };

  // Handler to submit a new event request (alumni only)
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: '', description: '', date: '', time: '', location: '', category: '' });
  const [submitting, setSubmitting] = useState(false);
  const handleRequestEvent = async () => {
    setSubmitting(true);
    const { error } = await supabase.from('event_requests').insert([
      {
        title: requestForm.title,
        description: requestForm.description,
        date: requestForm.date,
        time: requestForm.time,
        location: requestForm.location,
        category: requestForm.category,
        requested_by: user.id,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ]);
    setSubmitting(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to submit event request', variant: 'destructive' });
    } else {
      setShowRequestForm(false);
      setRequestForm({ title: '', description: '', date: '', time: '', location: '', category: '' });
      setRefresh(r => r + 1);
      toast({ title: 'Success', description: 'Event request submitted!' });
    }
  };

  // Fetch event requests for alumni
  useEffect(() => {
    if (user && userRole === 'alumni') {
      supabase
        .from('event_requests')
        .select('*')
        .eq('requested_by', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => setEventRequests(data || []));
    }
  }, [user, userRole, refresh]);

  // ...other logic for fetching events, attendees, hosts, etc...

  if (!userRole) {
    return <div className="text-center text-muted-foreground py-20">Loading...</div>;
  }

  return (
    <div>
      {/* Alumni: My Event Requests (only for alumni) */}
  {userRole === 'alumni' ? (
        <section className="py-10">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-primary mb-6">My Event Requests</h2>
            <div className="mb-6 flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setShowRequestForm(true)}>Request New Event</Button>
            </div>
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
            {eventRequests.length === 0 ? (
              <div className="text-muted-foreground">You have not requested any events yet.</div>
            ) : (
              <div className="grid gap-6">
                {eventRequests.map(request => (
                  <Card key={request.id} className="relative">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-primary">{request.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge>{request.status}</Badge>
                        <span className="text-xs text-muted-foreground">{request.event_date}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-muted-foreground">{request.description}</div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        {request.location}
                      </div>
                      <div className="flex gap-3">
                        {request.status !== 'approved' && request.created_by === user?.id && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteRequest(request.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : userRole === 'student' ? (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">Student Event Dashboard</h2>
            <h3 className="text-xl font-semibold mb-4">Available Events</h3>
            {approvedEvents.length === 0 ? (
              <div className="text-muted-foreground">No approved events available.</div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                {approvedEvents.map(event => (
                  <Card key={event.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${event.featured ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50' : 'hover:shadow-lg bg-white'}`}>
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
                      <p className="text-muted-foreground mb-6">{event.description}</p>
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
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="w-4 h-4 mr-2 text-primary" />
                          Host: {event.host_name || event.created_by}
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {registeredEventIds.includes(event.id) ? (
                          <Badge variant="secondary">Registered</Badge>
                        ) : (
                          <Button size="sm" onClick={() => handleRegisterEvent(event.id)}>Register</Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/events/${event.id}`)}>Learn More</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : userRole === 'admin' ? (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-primary mb-12 text-center">Admin Event Dashboard</h2>
            <h3 className="text-xl font-semibold mb-4">Pending Event Requests</h3>
            {allEventRequests.filter(r => r.status === 'pending').length === 0 ? (
              <div className="text-muted-foreground">No pending event requests found.</div>
            ) : (
              <div className="grid gap-6 mb-10">
                {allEventRequests.filter(request => request.status === 'pending').map(request => (
                  <Card key={request.id} className="relative">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-semibold text-primary">{request.title}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge>{request.status}</Badge>
                        <span className="text-xs text-muted-foreground">{request.event_date}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-2 text-muted-foreground">{request.description}</div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-2 text-primary" />
                        {request.location}
                      </div>
                      <div className="flex gap-3">
                        <Button size="sm" onClick={() => {
                          setShowApproveModal({ open: true, request });
                          setEditedLocation(request.location || '');
                        }} disabled={approveLoading}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDenyRequest(request)} disabled={approveLoading}>Deny</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {/* Approve Modal */}
            {showApproveModal.open && showApproveModal.request && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
                  <h3 className="font-bold text-2xl mb-2">Approve Event Request</h3>
                  <div className="mb-2 text-muted-foreground">{showApproveModal.request.title}</div>
                  <div className="mb-2">{showApproveModal.request.description}</div>
                  <div className="mb-2"><b>Date:</b> {showApproveModal.request.date}</div>
                  <div className="mb-2"><b>Time:</b> {showApproveModal.request.time}</div>
                  <div className="mb-2"><b>Venue:</b> <input className="input border rounded px-3 py-2 w-full" value={editedLocation} onChange={e => setEditedLocation(e.target.value)} /></div>
                  <div className="mb-2"><b>Category:</b> {showApproveModal.request.category}</div>
                  <div className="flex justify-end mt-4 gap-2">
                    <Button size="sm" onClick={() => handleApproveRequest({...showApproveModal.request, location: editedLocation})} disabled={approveLoading}>Approve</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDenyRequest(showApproveModal.request)} disabled={approveLoading}>Deny</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowApproveModal({ open: false, request: null })}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
            <h3 className="text-xl font-semibold mb-4 mt-10">All Events</h3>
            {events.filter(e => e.status === 'approved').length === 0 ? (
              <div className="text-muted-foreground">No approved events found.</div>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {events.filter(event => event.status === 'approved').map(event => (
                  <Card key={event.id} className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${event.featured ? 'ring-2 ring-primary shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50' : 'hover:shadow-lg bg-white'}`}>
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
                      <p className="text-muted-foreground mb-6">{event.description}</p>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2 text-primary" />
                          {event.event_date ? format(new Date(event.event_date), 'PPP') : ''}
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
                          Host: {event.host_name || event.created_by || event.requested_by}
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        {userRole === 'admin' && (
                          <>
                            <Button size="sm" variant="destructive" onClick={async () => {
                              await supabase.from('events').delete().eq('id', event.id);
                              setRefresh(r => r + 1);
                              toast({ title: 'Deleted', description: 'Event deleted.' });
                            }}>Delete</Button>
                            {/* Show registered users */}
                            <div className="ml-4">
                              <b>Registered Users:</b>
                              <ul className="list-disc ml-4">
                                {(eventAttendees[event.id] || []).map(a => (
                                  <li key={a.user_id}>{a.profiles?.name || a.user_id}</li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/events/${event.id}`)}>Learn More</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
  ) : null}
      {/* No global event list below dashboard, handled in admin/student/alumni sections above */}
    </div>
  );
}

