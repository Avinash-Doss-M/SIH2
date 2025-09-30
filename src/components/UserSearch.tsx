import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Users, MapPin, Calendar, Briefcase, Star, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { debounce } from 'lodash';

interface SearchResult {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  bio?: string;
  location?: string;
  graduation_year?: number;
  current_company?: string;
  job_title?: string;
  skills?: string[];
  hashtags?: string[];
  is_following: boolean;
  is_follower: boolean;
  chat_privacy: 'public' | 'followers' | 'private';
  relevance_score: number;
}

interface SearchFilters {
  role?: string;
  location?: string;
  graduation_year?: number;
  skills?: string[];
  available_for_mentoring?: boolean;
  looking_for_job?: boolean;
}

interface UserSearchProps {
  onUserSelect?: (user: SearchResult) => void;
  onMessageUser?: (user: SearchResult) => void;
  showMessageButton?: boolean;
  placeholder?: string;
}

const UserSearch = ({ 
  onUserSelect, 
  onMessageUser, 
  showMessageButton = false, 
  placeholder = "Search users, skills, companies..." 
}: UserSearchProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [popularHashtags, setPopularHashtags] = useState<string[]>([]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string, currentFilters: SearchFilters) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Build the query with filters
        let queryBuilder = supabase
          .from('profiles')
          .select(`
            user_id,
            first_name,
            last_name,
            avatar_url,
            role,
            bio,
            location,
            graduation_year,
            company,
            job_title,
            email
          `)
          .neq('user_id', user?.id || '');

        // Apply role filter
        if (currentFilters.role && ['student', 'alumni', 'admin'].includes(currentFilters.role)) {
          queryBuilder = queryBuilder.eq('role', currentFilters.role as 'student' | 'alumni' | 'admin');
        }

        // Apply graduation year filter
        if (currentFilters.graduation_year) {
          queryBuilder = queryBuilder.eq('graduation_year', currentFilters.graduation_year);
        }

        // Apply location filter
        if (currentFilters.location) {
          queryBuilder = queryBuilder.ilike('location', `%${currentFilters.location}%`);
        }

        // Apply availability filters
        if (currentFilters.available_for_mentoring) {
          queryBuilder = queryBuilder.eq('is_mentor', true);
        }

        const { data, error } = await queryBuilder.limit(20);

        if (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } else {
          // Filter results based on search query
          const filtered = (data || []).filter(profile => {
            const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
            const searchLower = query.toLowerCase();
            
            return fullName.includes(searchLower) ||
                   profile.first_name?.toLowerCase().includes(searchLower) ||
                   profile.last_name?.toLowerCase().includes(searchLower) ||
                   profile.email?.toLowerCase().includes(searchLower) ||
                   profile.company?.toLowerCase().includes(searchLower) ||
                   profile.job_title?.toLowerCase().includes(searchLower) ||
                   profile.location?.toLowerCase().includes(searchLower) ||
                   profile.bio?.toLowerCase().includes(searchLower);
          });

          // Transform to SearchResult format
          const searchResults: SearchResult[] = filtered.map(profile => ({
            user_id: profile.user_id,
            email: profile.email || '',
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            avatar_url: profile.avatar_url,
            role: profile.role || 'student',
            bio: profile.bio,
            location: profile.location,
            graduation_year: profile.graduation_year,
            current_company: profile.company,
            job_title: profile.job_title,
            skills: [],
            hashtags: [],
            is_following: false,
            is_follower: false,
            chat_privacy: 'followers' as const,
            relevance_score: 0
          }));

          setSearchResults(searchResults);
          
          // Save search to history
          if (query.trim()) {
            saveSearchToHistory(query.trim());
          }
        }
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 300),
    [user?.id]
  );

  // Load initial data
  useEffect(() => {
    loadRecentSearches();
    loadPopularHashtags();
  }, [user?.id]);

  // Trigger search when query or filters change
  useEffect(() => {
    debouncedSearch(searchQuery, filters);
  }, [searchQuery, filters, debouncedSearch]);

  const loadRecentSearches = async () => {
    // Simplified - using localStorage for now
    try {
      const stored = localStorage.getItem(`recentSearches_${user?.id}`);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const loadPopularHashtags = async () => {
    // Set some default popular hashtags for now
    setPopularHashtags(['javascript', 'python', 'react', 'nodejs', 'ai', 'startups', 'design', 'marketing']);
  };

  const saveSearchToHistory = (query: string) => {
    try {
      const stored = localStorage.getItem(`recentSearches_${user?.id}`);
      const recent = stored ? JSON.parse(stored) : [];
      const updated = [query, ...recent.filter((s: string) => s !== query)].slice(0, 5);
      localStorage.setItem(`recentSearches_${user?.id}`, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Error saving search to history:', error);
    }
  };

  const handleFollowUser = async (targetUserId: string) => {
    // For now, just update local state (follow functionality to be implemented after database setup)
    console.log('Follow user:', targetUserId);
    setSearchResults(prev =>
      prev.map(result =>
        result.user_id === targetUserId
          ? { ...result, is_following: true }
          : result
      )
    );
  };

  const handleUnfollowUser = async (targetUserId: string) => {
    // For now, just update local state (unfollow functionality to be implemented after database setup)
    console.log('Unfollow user:', targetUserId);
    setSearchResults(prev =>
      prev.map(result =>
        result.user_id === targetUserId
          ? { ...result, is_following: false }
          : result
      )
    );
  };

  const canMessageUser = (userResult: SearchResult) => {
    if (userResult.chat_privacy === 'public') return true;
    if (userResult.chat_privacy === 'followers' && (userResult.is_following || userResult.is_follower)) return true;
    return false;
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleHashtagClick = (hashtag: string) => {
    setSearchQuery(`#${hashtag}`);
  };

  const FilterSheet = () => (
    <Sheet open={showFilters} onOpenChange={setShowFilters}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {Object.keys(filters).length > 0 && (
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {Object.keys(filters).length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Search Filters</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          {/* Role Filter */}
          <div>
            <Label className="text-sm font-medium">Role</Label>
            <Select value={filters.role || ''} onValueChange={(value) => 
              setFilters(prev => ({ ...prev, role: value || undefined }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All roles</SelectItem>
                <SelectItem value="alumni">Alumni</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location Filter */}
          <div>
            <Label className="text-sm font-medium">Location</Label>
            <Input 
              placeholder="Enter location"
              value={filters.location || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value || undefined }))}
            />
          </div>

          {/* Graduation Year */}
          <div>
            <Label className="text-sm font-medium">Graduation Year</Label>
            <Input 
              type="number"
              placeholder="e.g. 2023"
              value={filters.graduation_year || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, graduation_year: e.target.value ? parseInt(e.target.value) : undefined }))}
            />
          </div>

          {/* Availability Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Availability</Label>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="mentoring"
                checked={filters.available_for_mentoring || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, available_for_mentoring: checked === true ? true : undefined }))
                }
              />
              <Label htmlFor="mentoring">Available for mentoring</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="job-seeking"
                checked={filters.looking_for_job || false}
                onCheckedChange={(checked) => 
                  setFilters(prev => ({ ...prev, looking_for_job: checked === true ? true : undefined }))
                }
              />
              <Label htmlFor="job-seeking">Looking for job opportunities</Label>
            </div>
          </div>

          {/* Clear Filters */}
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Clear all filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters and Popular Tags */}
      <div className="flex items-center justify-between">
        <FilterSheet />
        
        {!searchQuery && popularHashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {popularHashtags.slice(0, 3).map(hashtag => (
              <Badge 
                key={hashtag}
                variant="secondary" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => handleHashtagClick(hashtag)}
              >
                #{hashtag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches - show when no query */}
      {!searchQuery && recentSearches.length > 0 && (
        <div>
          <Label className="text-sm text-muted-foreground">Recent searches</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {recentSearches.map(search => (
              <Badge 
                key={search}
                variant="outline" 
                className="cursor-pointer hover:bg-secondary"
                onClick={() => setSearchQuery(search)}
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <ScrollArea className="h-96">
          {isSearching ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((result) => (
                <Card key={result.user_id} className="p-4 hover:bg-accent transition-colors cursor-pointer">
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center space-x-3 flex-1"
                        onClick={() => onUserSelect?.(result)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={result.avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {result.first_name?.[0]}{result.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium truncate">
                              {result.first_name} {result.last_name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {result.role}
                            </Badge>
                            {result.is_following && (
                              <Badge variant="outline" className="text-xs">
                                Following
                              </Badge>
                            )}
                          </div>
                          {result.bio && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {result.bio}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            {result.current_company && (
                              <span className="flex items-center space-x-1">
                                <Briefcase className="h-3 w-3" />
                                <span>{result.current_company}</span>
                              </span>
                            )}
                            {result.location && (
                              <span className="flex items-center space-x-1">
                                <MapPin className="h-3 w-3" />
                                <span>{result.location}</span>
                              </span>
                            )}
                            {result.graduation_year && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{result.graduation_year}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Message Button */}
                        {showMessageButton && canMessageUser(result) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMessageUser?.(result)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Follow/Unfollow Button */}
                        <Button
                          size="sm"
                          variant={result.is_following ? "secondary" : "default"}
                          onClick={() => 
                            result.is_following 
                              ? handleUnfollowUser(result.user_id)
                              : handleFollowUser(result.user_id)
                          }
                        >
                          <Users className="h-4 w-4 mr-1" />
                          {result.is_following ? 'Unfollow' : 'Follow'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No users found matching your search.
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default UserSearch;