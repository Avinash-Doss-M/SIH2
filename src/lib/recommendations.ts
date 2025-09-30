import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'alumni' | 'admin';
  graduation_year?: number;
  skills?: string[];
  interests?: string[];
  location?: string;
  job_title?: string;
  company?: string;
  bio?: string;
  avatar_url?: string;
  is_mentor?: boolean;
}

export interface JobRecommendation {
  id: string;
  title: string;
  content: string;
  company?: string;
  location?: string;
  link?: string;
  type: 'job' | 'internship';
  tags?: string[];
  created_at: string;
  score: number;
  reasons: string[];
}

export interface UserRecommendation {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  job_title?: string;
  company?: string;
  location?: string;
  avatar_url?: string;
  graduation_year?: number;
  skills?: string[];
  interests?: string[];
  is_mentor?: boolean;
  score: number;
  reasons: string[];
}

export interface EventRecommendation {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  category?: string;
  created_by: string;
  score: number;
  reasons: string[];
}

export class RecommendationEngine {
  private currentUser: UserProfile | null = null;

  async initialize(userId: string): Promise<void> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    
    this.currentUser = data;
  }

  // Calculate similarity score between two users
  private calculateUserSimilarity(user1: UserProfile, user2: UserProfile): number {
    let score = 0;
    const reasons: string[] = [];

    // Role similarity (higher weight for mentorship)
    if (user1.role === 'student' && user2.role === 'alumni') {
      score += 30;
      reasons.push('Alumni connection');
    } else if (user1.role === user2.role) {
      score += 20;
      reasons.push('Same role');
    }

    // Skills similarity
    if (user1.skills && user2.skills) {
      const commonSkills = user1.skills.filter(skill => 
        user2.skills?.some(s => s.toLowerCase() === skill.toLowerCase())
      );
      score += commonSkills.length * 15;
      if (commonSkills.length > 0) {
        reasons.push(`${commonSkills.length} common skills`);
      }
    }

    // Interests similarity
    if (user1.interests && user2.interests) {
      const commonInterests = user1.interests.filter(interest => 
        user2.interests?.some(i => i.toLowerCase() === interest.toLowerCase())
      );
      score += commonInterests.length * 10;
      if (commonInterests.length > 0) {
        reasons.push(`${commonInterests.length} shared interests`);
      }
    }

    // Location similarity
    if (user1.location && user2.location && 
        user1.location.toLowerCase() === user2.location.toLowerCase()) {
      score += 15;
      reasons.push('Same location');
    }

    // Graduation year proximity (for alumni-alumni connections)
    if (user1.graduation_year && user2.graduation_year) {
      const yearDiff = Math.abs(user1.graduation_year - user2.graduation_year);
      if (yearDiff <= 2) {
        score += 20 - (yearDiff * 5);
        reasons.push(`Similar graduation year (${yearDiff} years apart)`);
      }
    }

    // Industry/company similarity
    if (user1.company && user2.company && 
        user1.company.toLowerCase() === user2.company.toLowerCase()) {
      score += 25;
      reasons.push('Same company');
    }

    // Mentor availability bonus for students
    if (user1.role === 'student' && user2.is_mentor) {
      score += 40;
      reasons.push('Available mentor');
    }

    return score;
  }

  // Calculate job relevance score
  private calculateJobRelevance(job: any): { score: number; reasons: string[] } {
    if (!this.currentUser) return { score: 0, reasons: [] };

    let score = 0;
    const reasons: string[] = [];

    // Extract job metadata from tags
    const company = job.tags?.find((tag: string) => tag.startsWith('company:'))?.replace('company:', '');
    const location = job.tags?.find((tag: string) => tag.startsWith('location:'))?.replace('location:', '');
    const jobType = job.tags?.includes('job') ? 'job' : 'internship';

    // Role-based scoring
    if (this.currentUser.role === 'student' && jobType === 'internship') {
      score += 30;
      reasons.push('Internship suitable for students');
    } else if (this.currentUser.role === 'alumni' && jobType === 'job') {
      score += 25;
      reasons.push('Full-time position');
    }

    // Skills matching
    if (this.currentUser.skills && job.content) {
      const matchingSkills = this.currentUser.skills.filter(skill => 
        job.content.toLowerCase().includes(skill.toLowerCase()) ||
        job.title.toLowerCase().includes(skill.toLowerCase())
      );
      score += matchingSkills.length * 20;
      if (matchingSkills.length > 0) {
        reasons.push(`Matches ${matchingSkills.length} of your skills`);
      }
    }

    // Location matching
    if (this.currentUser.location && location && 
        this.currentUser.location.toLowerCase().includes(location.toLowerCase())) {
      score += 25;
      reasons.push('Location match');
    }

    // Interest matching
    if (this.currentUser.interests && job.content) {
      const matchingInterests = this.currentUser.interests.filter(interest => 
        job.content.toLowerCase().includes(interest.toLowerCase()) ||
        job.title.toLowerCase().includes(interest.toLowerCase())
      );
      score += matchingInterests.length * 15;
      if (matchingInterests.length > 0) {
        reasons.push(`Aligns with your interests`);
      }
    }

    // Company preference (if user has experience in similar companies)
    if (this.currentUser.company && company && 
        this.currentUser.company.toLowerCase() === company.toLowerCase()) {
      score += 30;
      reasons.push('Same company as your experience');
    }

    // Recent posting bonus
    const daysSincePosted = Math.floor(
      (Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePosted <= 7) {
      score += 15;
      reasons.push('Recently posted');
    }

    return { score, reasons };
  }

  async getRecommendedUsers(limit = 10): Promise<UserRecommendation[]> {
    if (!this.currentUser) return [];

    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('user_id', this.currentUser.user_id);

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      const recommendations = users
        .map(user => {
          const score = this.calculateUserSimilarity(this.currentUser!, user);
          const reasons: string[] = [];
          
          // Generate reasons based on similarity factors
          if (this.currentUser!.role === 'student' && user.role === 'alumni') {
            reasons.push('Alumni connection');
          }
          if (user.is_mentor) reasons.push('Available mentor');
          
          return {
            ...user,
            score,
            reasons
          };
        })
        .filter(user => user.score > 10) // Minimum relevance threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error generating user recommendations:', error);
      return [];
    }
  }

  async getRecommendedJobs(limit = 10): Promise<JobRecommendation[]> {
    if (!this.currentUser) return [];

    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching jobs:', error);
        return [];
      }

      // Filter job/internship posts
      const jobPosts = posts.filter(post => 
        post.tags && (post.tags.includes('job') || post.tags.includes('internship'))
      );

      const recommendations = jobPosts
        .map(job => {
          const { score, reasons } = this.calculateJobRelevance(job);
          
          return {
            id: job.id,
            title: job.title,
            content: job.content,
            company: job.tags?.find((tag: string) => tag.startsWith('company:'))?.replace('company:', ''),
            location: job.tags?.find((tag: string) => tag.startsWith('location:'))?.replace('location:', ''),
            link: job.tags?.find((tag: string) => tag.startsWith('link:'))?.replace('link:', ''),
            type: job.tags?.includes('job') ? 'job' : 'internship' as 'job' | 'internship',
            tags: job.tags,
            created_at: job.created_at,
            score,
            reasons
          };
        })
        .filter(job => job.score > 10) // Minimum relevance threshold
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error generating job recommendations:', error);
      return [];
    }
  }

  async getRecommendedEvents(limit = 8): Promise<EventRecommendation[]> {
    if (!this.currentUser) return [];

    try {
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      const recommendations = events
        .map(event => {
          let score = 10; // Base score
          const reasons: string[] = [];

          // Category-based matching
          if (event.category && this.currentUser!.interests) {
            const categoryMatch = this.currentUser!.interests.some(interest => 
              event.category.toLowerCase().includes(interest.toLowerCase()) ||
              interest.toLowerCase().includes(event.category.toLowerCase())
            );
            if (categoryMatch) {
              score += 25;
              reasons.push('Matches your interests');
            }
          }

          // Location proximity
          if (this.currentUser!.location && event.location && 
              this.currentUser!.location.toLowerCase().includes(event.location.toLowerCase())) {
            score += 20;
            reasons.push('Local event');
          }

          // Role-specific events
          if (event.title || event.description) {
            const eventText = `${event.title} ${event.description || ''}`.toLowerCase();
            if (this.currentUser!.role === 'student' && 
                (eventText.includes('student') || eventText.includes('career') || eventText.includes('internship'))) {
              score += 20;
              reasons.push('Student-focused');
            }
            if (this.currentUser!.role === 'alumni' && 
                (eventText.includes('alumni') || eventText.includes('networking') || eventText.includes('professional'))) {
              score += 20;
              reasons.push('Alumni networking');
            }
          }

          // Time proximity bonus (events happening soon)
          const daysUntilEvent = Math.floor(
            (new Date(event.event_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          if (daysUntilEvent <= 14) {
            score += 15;
            reasons.push('Happening soon');
          }

          return {
            ...event,
            score,
            reasons
          };
        })
        .filter(event => event.score > 15)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return recommendations;
    } catch (error) {
      console.error('Error generating event recommendations:', error);
      return [];
    }
  }
}

export const recommendationEngine = new RecommendationEngine();