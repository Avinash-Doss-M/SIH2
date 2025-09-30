import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Shield, MessageSquare, Eye, Users, Settings2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserSearchSettings {
  chat_privacy: 'public' | 'followers' | 'private';
  searchable: boolean;
  show_in_suggestions: boolean;
  allow_message_requests: boolean;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSearchSettings>({
    chat_privacy: 'followers',
    searchable: true,
    show_in_suggestions: true,
    allow_message_requests: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user?.id) return;

    try {
      const { data } = await supabase
        .from('user_search_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings({
          chat_privacy: data.chat_privacy,
          searchable: data.searchable,
          show_in_suggestions: data.show_in_suggestions,
          allow_message_requests: data.allow_message_requests
        });
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_search_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving privacy settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to save privacy settings. Please try again.',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Settings Saved',
          description: 'Your privacy settings have been updated successfully.'
        });
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save privacy settings. Please try again.',
        variant: 'destructive'
      });
    }
    setSaving(false);
  };

  const updateSettings = (key: keyof UserSearchSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const getChatPrivacyDescription = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'Anyone can send you messages';
      case 'followers':
        return 'Only people you follow or who follow you can message you';
      case 'private':
        return 'No one can send you direct messages';
      default:
        return '';
    }
  };

  const getChatPrivacyColor = (privacy: string) => {
    switch (privacy) {
      case 'public':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'followers':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'private':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Privacy Settings
        </h2>
        <p className="text-muted-foreground mt-2">
          Control who can find you, message you, and see your information
        </p>
      </div>

      {/* Chat Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messaging Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Who can message you</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Choose who can send you direct messages
            </p>
            <Select 
              value={settings.chat_privacy} 
              onValueChange={(value: 'public' | 'followers' | 'private') => 
                updateSettings('chat_privacy', value)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  <div className="flex items-center justify-between w-full">
                    <span>Public</span>
                    <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Anyone
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="followers">
                  <div className="flex items-center justify-between w-full">
                    <span>Followers Only</span>
                    <Badge className="ml-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Connections
                    </Badge>
                  </div>
                </SelectItem>
                <SelectItem value="private">
                  <div className="flex items-center justify-between w-full">
                    <span>Private</span>
                    <Badge className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      No one
                    </Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2 p-3 bg-secondary/50 rounded-lg">
              <p className="text-sm flex items-center gap-2">
                <Badge className={getChatPrivacyColor(settings.chat_privacy)}>
                  {settings.chat_privacy.charAt(0).toUpperCase() + settings.chat_privacy.slice(1)}
                </Badge>
                {getChatPrivacyDescription(settings.chat_privacy)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Allow message requests</Label>
              <p className="text-sm text-muted-foreground">
                Let people send you message requests even if they can't normally message you
              </p>
            </div>
            <Switch
              checked={settings.allow_message_requests}
              onCheckedChange={(checked) => updateSettings('allow_message_requests', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search & Discovery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Search & Discovery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Make account searchable</Label>
              <p className="text-sm text-muted-foreground">
                Allow other users to find your profile when they search
              </p>
            </div>
            <Switch
              checked={settings.searchable}
              onCheckedChange={(checked) => updateSettings('searchable', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Show in suggestions</Label>
              <p className="text-sm text-muted-foreground">
                Let us suggest your profile to other users who might want to connect
              </p>
            </div>
            <Switch
              checked={settings.show_in_suggestions}
              onCheckedChange={(checked) => updateSettings('show_in_suggestions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Privacy Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Messaging</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Privacy Level:</span>
                  <Badge className={getChatPrivacyColor(settings.chat_privacy)}>
                    {settings.chat_privacy}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Message Requests:</span>
                  <Badge variant={settings.allow_message_requests ? 'default' : 'secondary'}>
                    {settings.allow_message_requests ? 'Allowed' : 'Blocked'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Discoverability</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Searchable:</span>
                  <Badge variant={settings.searchable ? 'default' : 'secondary'}>
                    {settings.searchable ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>In Suggestions:</span>
                  <Badge variant={settings.show_in_suggestions ? 'default' : 'secondary'}>
                    {settings.show_in_suggestions ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving} className="min-w-24">
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}