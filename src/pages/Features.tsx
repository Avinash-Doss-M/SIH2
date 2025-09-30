import Navbar from "@/components/Navbar";
import Features from "@/components/Features";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
              Platform Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover all the powerful tools and features designed to help you 
              connect, grow, and succeed in your professional journey.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <Features />
        </section>
      </main>
    </div>
  );
};

export default FeaturesPage;