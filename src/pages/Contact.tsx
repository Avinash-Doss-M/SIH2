import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock, MessageCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || 
        !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Attempting to submit contact form...', formData);
      
      // Try contact_queries table first, fallback to event_requests if it doesn't exist
      let contactError;
      
      // Attempt to use the proper contact_queries table
      const { error: primaryError } = await supabase
        .from('contact_queries')
        .insert({
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          status: 'pending'
        });
      
      // If contact_queries table doesn't exist, use event_requests as fallback
      if (primaryError && (primaryError.message.includes('does not exist') || primaryError?.message.includes('schema cache'))) {
        console.log('contact_queries table not found, using event_requests as fallback');
        const { error: fallbackError } = await supabase
          .from('event_requests')
          .insert({
            title: `Contact Query: ${formData.subject.trim()}`,
            description: `From: ${formData.firstName.trim()} ${formData.lastName.trim()}\nEmail: ${formData.email.trim()}\nSubject: ${formData.subject.trim()}\n\nMessage:\n${formData.message.trim()}`,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-US', { hour12: false }),
            location: 'Online Contact Form',
            category: 'contact_query',
            status: 'pending',
            requested_by: null // Set to null since we don't have a user UUID for public contact form
          });
        contactError = fallbackError;
      } else {
        contactError = primaryError;
      }
      
      if (contactError) {
        console.error('Error submitting contact form:', contactError);
        toast.error(`Failed to send message: ${contactError.message || 'Please check your connection and try again.'}`);
        return;
      }
      
      console.log('Contact form submitted successfully');

      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Unexpected error submitting contact form:', error);
      toast.error('An unexpected error occurred. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Have questions about our platform? Need support? Want to get involved? 
              We're here to help and would love to hear from you.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center">
                  <MessageCircle className="w-6 h-6 mr-2" />
                  Send us a Message
                </CardTitle>
                <p className="text-muted-foreground">
                  Fill out the form below and we'll get back to you within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input 
                      id="subject" 
                      placeholder="What's this about?" 
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea 
                      id="message" 
                      placeholder="Tell us more about your inquiry..."
                      className="min-h-32"
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-primary text-white"
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <Mail className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary">Email</h3>
                      <p className="text-muted-foreground">support@alumniplatform.edu</p>
                      <p className="text-muted-foreground">partnerships@alumniplatform.edu</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary">Phone</h3>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                      <p className="text-sm text-muted-foreground">Monday - Friday, 9AM - 6PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <MapPin className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary">Office Location</h3>
                      <p className="text-muted-foreground">
                        Alumni Relations Building<br />
                        123 University Drive<br />
                        Academic City, AC 12345
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary">Office Hours</h3>
                      <p className="text-muted-foreground">Monday - Friday: 8:00 AM - 5:00 PM</p>
                      <p className="text-muted-foreground">Saturday: 10:00 AM - 2:00 PM</p>
                      <p className="text-muted-foreground">Sunday: Closed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary">How Can We Help?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-primary mb-2">Technical Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Issues with login, profile updates, or platform functionality
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-primary mb-2">Partnership Inquiries</h3>
                      <p className="text-sm text-muted-foreground">
                        Institution partnerships, corporate collaborations, integrations
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h3 className="font-semibold text-primary mb-2">General Questions</h3>
                      <p className="text-sm text-muted-foreground">
                        Platform features, membership, events, and community guidelines
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-primary flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Join Our Alumni Network
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Schedule a Demo
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Report an Issue
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Request Partnership Info
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary mb-3">
                    How do I join the alumni network?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Click "Join as Alumni" on our homepage and complete the registration process. 
                    You'll need to verify your graduation status.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary mb-3">
                    Is the platform free to use?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! Our basic alumni networking features are completely free. 
                    Premium features for institutions may have associated costs.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary mb-3">
                    How can I become a mentor?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    After joining, visit your dashboard and enable mentorship in your profile. 
                    You can set your availability and areas of expertise.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-primary mb-3">
                    Can institutions customize the platform?
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Yes! We offer customizable branding, features, and integrations 
                    for institutional partners. Contact us for details.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Contact;