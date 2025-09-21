import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Calendar, DollarSign, Target, Users, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal_amount: number;
  raised_amount: number;
  image_url: string | null;
  status: string;
  end_date: string | null;
  created_at: string;
  created_by: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Alumni Campaigns</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Support meaningful causes and initiatives started by our alumni community. Together, we can make a difference.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const progressPercentage = getProgressPercentage(campaign.raised_amount, campaign.goal_amount);
            const daysRemaining = getDaysRemaining(campaign.end_date);

            return (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {campaign.image_url && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={campaign.image_url} 
                      alt={campaign.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default">Active</Badge>
                    {daysRemaining !== null && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{daysRemaining} days left</span>
                      </div>
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {campaign.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {formatCurrency(campaign.raised_amount)} raised
                        </span>
                        <span className="text-muted-foreground">
                          of {formatCurrency(campaign.goal_amount)}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-center">
                        {progressPercentage.toFixed(1)}% funded
                      </div>
                    </div>

                    {/* Campaign Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          By {campaign.profiles?.first_name && campaign.profiles?.last_name
                            ? `${campaign.profiles.first_name} ${campaign.profiles.last_name}`
                            : 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{formatCurrency(campaign.goal_amount)}</span>
                      </div>
                    </div>

                    <Button className="w-full">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Donate Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'Check back later for new campaigns!'}
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12 py-8 bg-card rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Start Your Own Campaign</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have a cause you're passionate about? Create a campaign and rally the alumni community to support your initiative.
          </p>
          <Button size="lg">
            <Target className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;