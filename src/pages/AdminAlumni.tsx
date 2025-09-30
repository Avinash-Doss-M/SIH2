import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Mail, Phone, MapPin, Calendar, GraduationCap, User, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AlumniProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string;
  bio: string;
  company: string;
  position: string;
  degree: string;
  graduation_year: number;
  skills: string[];
  interests: string[];
  linkedin_url: string;
  phone: string;
  location: string;
  created_at: string;
  is_mentor: boolean;
}

const AdminAlumni: React.FC = () => {
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [degreeFilter, setDegreeFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedAlumni, setSelectedAlumni] = useState<AlumniProfile | null>(null);

  useEffect(() => {
    fetchAlumniData();
  }, []);

  useEffect(() => {
    filterAlumni();
  }, [alumni, searchTerm, yearFilter, degreeFilter, skillFilter]);

  const fetchAlumniData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'alumni')
        .order('graduation_year', { ascending: false });

      if (error) throw error;
      
      const alumniData: AlumniProfile[] = data.map(profile => ({
        ...profile,
        skills: profile.skills || [],
        interests: profile.interests || [],
        position: (profile as any).position || '',
        phone: (profile as any).phone || ''
      }));

      setAlumni(alumniData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alumni data:', error);
      setLoading(false);
    }
  };

  const filterAlumni = () => {
    let filtered = alumni.filter(alumnus => {
      const matchesSearch = 
        `${alumnus.first_name} ${alumnus.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumnus.position?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesYear = !yearFilter || alumnus.graduation_year?.toString() === yearFilter;
      const matchesDegree = !degreeFilter || alumnus.degree?.toLowerCase().includes(degreeFilter.toLowerCase());
      const matchesSkill = !skillFilter || alumnus.skills?.some(skill => 
        skill.toLowerCase().includes(skillFilter.toLowerCase())
      );

      return matchesSearch && matchesYear && matchesDegree && matchesSkill;
    });

    setFilteredAlumni(filtered);
  };

  const getUniqueValues = (field: keyof AlumniProfile) => {
    return [...new Set(alumni.map(alumnus => alumnus[field]).filter(Boolean))];
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Graduation Year', 'Degree', 'Company', 'Position', 'Skills', 'Location'];
    const csvData = filteredAlumni.map(alumnus => [
      `${alumnus.first_name} ${alumnus.last_name}`,
      alumnus.email,
      alumnus.graduation_year,
      alumnus.degree,
      alumnus.company,
      alumnus.position,
      alumnus.skills?.join('; '),
      alumnus.location
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'alumni-data.csv';
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alumni Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage and filter alumni data ({filteredAlumni.length} of {alumni.length} alumni)
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
            variant="outline"
          >
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search name, email, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Graduation Year</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All years</SelectItem>
                  {getUniqueValues('graduation_year')
                    .sort((a, b) => (b as number) - (a as number))
                    .map((year, index) => (
                    <SelectItem key={`year-${index}`} value={year?.toString() || ''}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
              <Select value={degreeFilter} onValueChange={setDegreeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All degrees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All degrees</SelectItem>
                  {getUniqueValues('degree').map((degree, index) => (
                    <SelectItem key={`degree-${index}`} value={degree as string}>{degree}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills</label>
              <Input
                placeholder="Filter by skills..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Display */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alumnus) => (
            <Card key={alumnus.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16 ring-4 ring-blue-100 dark:ring-blue-900">
                    <AvatarImage src={alumnus.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white font-semibold">
                      {alumnus.first_name?.[0]}{alumnus.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                      {alumnus.first_name} {alumnus.last_name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{alumnus.email}</p>
                    {alumnus.is_mentor && (
                      <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Mentor
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                    <span>{alumnus.degree} • {alumnus.graduation_year}</span>
                  </div>
                  
                  {alumnus.company && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Briefcase className="h-4 w-4 mr-2 text-green-500" />
                      <span className="truncate">{alumnus.position} at {alumnus.company}</span>
                    </div>
                  )}

                  {alumnus.location && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      <span>{alumnus.location}</span>
                    </div>
                  )}

                  {alumnus.skills && alumnus.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {alumnus.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {alumnus.skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alumnus.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Alumni Profile Details</DialogTitle>
                      </DialogHeader>
                      <AlumniDetailView alumnus={alumnus} />
                    </DialogContent>
                  </Dialog>
                  
                  {alumnus.email && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${alumnus.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alumni
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Education
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Skills
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAlumni.map((alumnus) => (
                    <tr key={alumnus.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={alumnus.avatar_url} />
                            <AvatarFallback>
                              {alumnus.first_name?.[0]}{alumnus.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {alumnus.first_name} {alumnus.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{alumnus.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{alumnus.degree}</div>
                        <div className="text-sm text-gray-500">{alumnus.graduation_year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{alumnus.position}</div>
                        <div className="text-sm text-gray-500">{alumnus.company}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {alumnus.skills?.slice(0, 2).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {(alumnus.skills?.length || 0) > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{(alumnus.skills?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Alumni Profile Details</DialogTitle>
                              </DialogHeader>
                              <AlumniDetailView alumnus={alumnus} />
                            </DialogContent>
                          </Dialog>
                          
                          {alumnus.email && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`mailto:${alumnus.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredAlumni.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No alumni found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Component for detailed alumni view
const AlumniDetailView: React.FC<{ alumnus: AlumniProfile }> = ({ alumnus }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={alumnus.avatar_url} />
          <AvatarFallback className="text-xl">
            {alumnus.first_name?.[0]}{alumnus.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold">{alumnus.first_name} {alumnus.last_name}</h2>
          <p className="text-gray-600">{alumnus.email}</p>
          {alumnus.is_mentor && (
            <Badge className="mt-2 bg-green-100 text-green-800">Mentor Available</Badge>
          )}
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Education & Career</h3>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">{alumnus.degree}</p>
                <p className="text-sm text-gray-600">Graduated {alumnus.graduation_year}</p>
              </div>
            </div>

            {alumnus.company && (
              <div className="flex items-center space-x-3">
                <Briefcase className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">{alumnus.position}</p>
                  <p className="text-sm text-gray-600">{alumnus.company}</p>
                </div>
              </div>
            )}

            {alumnus.location && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <p>{alumnus.location}</p>
              </div>
            )}

            {alumnus.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-purple-500" />
                <p>{alumnus.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Skills & Interests</h3>
          
          {alumnus.skills && alumnus.skills.length > 0 && (
            <div>
              <p className="font-medium mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {alumnus.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          )}

          {alumnus.interests && alumnus.interests.length > 0 && (
            <div>
              <p className="font-medium mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {alumnus.interests.map((interest, index) => (
                  <Badge key={index} variant="outline">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {alumnus.bio && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold text-lg mb-2">Bio</h3>
            <p className="text-gray-700 leading-relaxed">{alumnus.bio}</p>
          </div>
        </>
      )}

      <Separator />

      <div className="flex gap-3">
        {alumnus.email && (
          <Button asChild>
            <a href={`mailto:${alumnus.email}`}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </a>
          </Button>
        )}
        {alumnus.linkedin_url && (
          <Button variant="outline" asChild>
            <a href={alumnus.linkedin_url} target="_blank" rel="noopener noreferrer">
              LinkedIn Profile
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminAlumni;