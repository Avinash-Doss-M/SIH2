import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Heart, Award } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              About Our Platform
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Bridging the gap between alumni, students, and institutions through 
              meaningful connections and collaborative growth.
            </p>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  To create a comprehensive platform that fosters lifelong connections 
                  between alumni and current students, facilitating mentorship, career 
                  development, and institutional growth.
                </p>
                <p className="text-lg text-muted-foreground">
                  We believe that education doesn't end at graduation – it's a lifelong 
                  journey enriched by community connections and shared experiences.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-primary mb-6">Our Vision</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  To become the leading platform for alumni engagement, creating a 
                  global network where knowledge, opportunities, and support flow 
                  seamlessly between generations of learners.
                </p>
                <p className="text-lg text-muted-foreground">
                  We envision a future where every student has access to mentorship 
                  and every graduate remains connected to their alma mater.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-3">Community</h3>
                  <p className="text-muted-foreground">
                    Building strong, supportive networks that last a lifetime
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-3">Purpose</h3>
                  <p className="text-muted-foreground">
                    Connecting people with meaningful opportunities and goals
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-3">Care</h3>
                  <p className="text-muted-foreground">
                    Fostering genuine relationships built on mutual support
                  </p>
                </CardContent>
              </Card>
              
              <Card className="text-center p-6">
                <CardContent className="pt-6">
                  <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary mb-3">Excellence</h3>
                  <p className="text-muted-foreground">
                    Striving for the highest standards in everything we do
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Platform Impact */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-primary mb-12">Platform Impact</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <div className="text-lg text-muted-foreground">Alumni Connected</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
                <div className="text-lg text-muted-foreground">Mentorship Matches</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
                <div className="text-lg text-muted-foreground">Career Opportunities</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default About;