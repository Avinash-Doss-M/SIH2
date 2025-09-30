import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react";
import { format } from "date-fns";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading event...</div>;
  if (!event) return <div className="text-center py-20">Event not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card className={`relative overflow-hidden ${event.featured ? 'ring-2 ring-primary shadow-2xl' : 'shadow-xl'} bg-white dark:bg-gray-800`}>
            {event.featured && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="bg-gradient-to-r from-primary to-primary/80 h-32 relative">
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
            <CardHeader className="relative -mt-16 pb-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg mx-4">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {event.title}
                </CardTitle>
                <Badge className="text-sm px-3 py-1">{event.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">{event.description}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Event Details</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">{event.event_date ? format(new Date(event.event_date), 'PPP') : 'Date TBD'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <Clock className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">{event.time || 'Time TBD'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <MapPin className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">{event.location || 'Location TBD'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Host Information</h3>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
                    <Users className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">{event.host_name || event.created_by || 'Host TBD'}</span>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Status:</strong> {event.status === 'approved' ? 'Confirmed' : event.status}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button 
                  onClick={() => navigate(-1)}
                  variant="outline"
                  className="flex-1 md:flex-initial px-8 py-3"
                >
                  ← Back to Events
                </Button>
                <Button 
                  className="flex-1 md:flex-initial px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  onClick={() => window.open(`mailto:?subject=${encodeURIComponent(event.title)}&body=${encodeURIComponent(`Check out this event: ${event.title}\n\nDate: ${event.event_date}\nLocation: ${event.location}\n\nDescription: ${event.description}`)}`,'_blank')}
                >
                  Share Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
