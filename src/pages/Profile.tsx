import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/DashboardLayout";
import ProfileCompletionCard from "@/components/ProfileCompletionCard";
import ImageUpload from "@/components/ImageUpload";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Briefcase, 
  Link as LinkIcon,
  Save
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userRole, setUserRole] = useState<'alumni' | 'student' | 'admin'>('student');
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    job_title: '',
    company: '',
    location: '',
    graduation_year: '',
    degree: '',
    internship: '', // for students
    work_profile: '', // for alumni
    linkedin_url: '',
    avatar_url: '',
    skills: [] as string[],
    interests: [] as string[]
  });

  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          bio: data.bio || '',
          job_title: data.job_title || '',
          company: data.company || '',
          location: data.location || '',
          graduation_year: data.graduation_year?.toString() || '',
          degree: data.degree || '',
          internship: data.internship || '',
          work_profile: data.work_profile || '',
          linkedin_url: data.linkedin_url || '',
          avatar_url: data.avatar_url || '',
          skills: data.skills || [],
          interests: data.interests || []
        });
        setUserRole(data.role || 'student');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          job_title: profile.job_title,
          company: profile.company,
          location: profile.location,
          graduation_year: profile.graduation_year ? parseInt(profile.graduation_year) : null,
          degree: profile.degree,
          internship: profile.internship,
          work_profile: profile.work_profile,
          linkedin_url: profile.linkedin_url,
          avatar_url: profile.avatar_url,
          skills: profile.skills,
          interests: profile.interests
        }, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving profile:', error);
        toast({
          title: "Error",
          description: "Failed to save profile",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Profile saved successfully!"
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error", 
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive"
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setProfile(prev => ({ ...prev, avatar_url: publicUrl }));
      
      toast({
        title: "Success",
        description: "Profile photo updated!"
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profile.interests.includes(newInterest.trim())) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const calculateCompletionPercentage = () => {
    const fields = [
      profile.first_name,
      profile.last_name,
      profile.bio,
      profile.job_title,
      profile.company,
      profile.location,
      profile.graduation_year,
      profile.avatar_url,
      profile.skills.length > 0,
      profile.interests.length > 0
    ];
    
    const completedFields = fields.filter(Boolean).length;
    return (completedFields / fields.length) * 100;
  };

  const getProfileSteps = () => [
    { id: 'basic', title: 'Basic Info', completed: !!(profile.first_name && profile.last_name), required: true },
    { id: 'avatar', title: 'Profile Photo', completed: !!profile.avatar_url, required: false },
    { id: 'bio', title: 'Bio/About', completed: !!profile.bio, required: true },
    { id: 'work', title: userRole === 'student' ? 'Experience (Optional)' : 'Work Info', completed: !!(profile.job_title && profile.company), required: false },
    { id: 'education', title: 'Graduation Year', completed: !!profile.graduation_year, required: true },
    { id: 'location', title: 'Location', completed: !!profile.location, required: false },
    { id: 'skills', title: 'Skills', completed: profile.skills.length > 0, required: true },
    { id: 'interests', title: 'Interests', completed: profile.interests.length > 0, required: false },
    { id: 'social', title: 'LinkedIn', completed: !!profile.linkedin_url, required: false }
  ];

  const handleStepClick = (stepId: string) => {
    console.log('Navigate to step:', stepId);
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-pulse">Loading profile...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
            <p className="text-muted-foreground">
              Manage your profile information and preferences
            </p>
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Profile Completion */}
        <ProfileCompletionCard
          profileSteps={getProfileSteps()}
          completionPercentage={calculateCompletionPercentage()}
          onStepClick={handleStepClick}
        />

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="skills">Skills & Interests</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your basic profile information visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ImageUpload onImageSelect={handleImageUpload} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="degree">Degree *</Label>
                    <Input
                      id="degree"
                      value={profile.degree}
                      onChange={(e) => setProfile(prev => ({ ...prev, degree: e.target.value }))}
                      placeholder="e.g., B.Tech, MBA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={profile.first_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={profile.last_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / About *</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell others about yourself, your interests, and what you're looking for..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduationYear">Graduation Year *</Label>
                    <Input
                      id="graduationYear"
                      type="number"
                      value={profile.graduation_year}
                      onChange={(e) => setProfile(prev => ({ ...prev, graduation_year: e.target.value }))}
                      placeholder="2023"
                      min="1950"
                      max="2030"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  {userRole === 'student' ? 'Experience' : 'Professional Information'}
                </CardTitle>
                <CardDescription>
                  {userRole === 'student' 
                    ? 'Optional: Add your internships, workshops, or work experience'
                    : 'Your work experience and professional details'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">
                      {userRole === 'student' ? 'Position/Role' : 'Job Title'}
                    </Label>
                    <Input
                      id="jobTitle"
                      value={profile.job_title}
                      onChange={(e) => setProfile(prev => ({ ...prev, job_title: e.target.value }))}
                      placeholder={userRole === 'student' ? 'Intern, Workshop Participant' : 'Software Engineer'}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">
                      {userRole === 'student' ? 'Organization' : 'Company'}
                    </Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      placeholder={userRole === 'student' ? 'Company, Institution' : 'Google'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile(prev => ({ ...prev, linkedin_url: e.target.value }))}
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>

                {/* Internship (Student) or Work Profile (Alumni) */}
                {userRole === 'student' && (
                  <div className="space-y-2">
                    <Label htmlFor="internship">Internship (Optional)</Label>
                    <Input
                      id="internship"
                      value={profile.internship}
                      onChange={(e) => setProfile(prev => ({ ...prev, internship: e.target.value }))}
                      placeholder="e.g., Summer Intern at Google"
                    />
                  </div>
                )}
                {userRole === 'alumni' && (
                  <div className="space-y-2">
                    <Label htmlFor="work_profile">Work Profile</Label>
                    <Input
                      id="work_profile"
                      value={profile.work_profile}
                      onChange={(e) => setProfile(prev => ({ ...prev, work_profile: e.target.value }))}
                      placeholder="e.g., Senior Engineer at Microsoft"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills *</CardTitle>
                  <CardDescription>
                    Add your professional skills and expertise
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="e.g., JavaScript, Marketing"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                  <CardDescription>
                    What are you passionate about?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="e.g., Photography, Travel"
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeInterest(interest)}
                      >
                        {interest} ×
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;