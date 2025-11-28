import { Switch } from "@/components/ui/switch";
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationPreferences } from '@/types/notification';
import { toast } from 'sonner';

export const NotificationSettings = () => {
  const { preferences: contextPreferences, updatePreferences } = useNotifications();

  const preferences = contextPreferences || {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    teamInvites: true,
    challengeUpdates: true
  };

  const handlePreferenceChange = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    try {
      await updatePreferences(newPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Notification Preferences</h3>
      <div className="space-y-6">
          {[   
               // {
                //     key: 'emailNotifications',
                //     title: 'Email Notifications',
                //     description: 'Receive notifications via email',
                //     icon: Mail
                // },
                // {
                //     key: 'marketingEmails',
                //     title: 'Marketing Emails',
                //     description: 'Receive updates about new features and promotions',
                //     icon: Megaphone
                // },
                            
              {
                  key: 'pushNotifications',
                  title: 'Push Notifications',
                  description: 'Receive push notifications on your device'
              },
              {
                  key: 'submissionsUpdates',
                  title: 'Submissions Updates',
                  description: 'Get notified submissions to your challenges'
              }
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{setting.title}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{setting.description}</p>
              </div>
              <Switch 
                  checked={preferences[setting.key as keyof NotificationPreferences]} 
                  onCheckedChange={(checked) => handlePreferenceChange(setting.key as keyof NotificationPreferences, checked)}
              />
            </div>
          ))}
      </div>
    </div>
  );
};
