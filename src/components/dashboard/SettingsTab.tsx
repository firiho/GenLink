import { Bell, Key, Mail, Shield, User, Globe, Palette, Save, Settings as SettingsIcon, Users, Megaphone, Check, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import { updateUser } from '@/services/user';
import { updateUserPassword } from '@/services/authActions';
import { NotificationPreferences } from '@/types/notification';
import { toast } from 'sonner';

export default function SettingsTab({user}) {
  const { theme, setTheme, actualTheme } = useTheme();
  const { preferences: contextPreferences, updatePreferences } = useNotifications();
  
  const preferences = contextPreferences || {
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    teamInvites: true,
    challengeUpdates: true
  };

  const [loading, setLoading] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>(user?.profileVisibility || 'private');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setPasswordRequirements({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  }, [newPassword]);

  // Update visibility state when user prop changes
  useEffect(() => {
    if (user?.profileVisibility) {
      setVisibility(user.profileVisibility);
    }
  }, [user]);

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

  const handleVisibilityChange = async (newVisibility: 'public' | 'private') => {
    const oldVisibility = visibility;
    setVisibility(newVisibility);
    try {
        const success = await updateUser({ profileVisibility: newVisibility });
        if (success) {
            toast.success(`Profile is now ${newVisibility}`);
        } else {
            toast.error('Failed to update profile visibility');
            setVisibility(oldVisibility);
        }
    } catch (error) {
        console.error('Failed to update visibility:', error);
        toast.error('Failed to update profile visibility');
        setVisibility(oldVisibility);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Optional: Add a toast notification
    // toast.success(`Theme changed to ${newTheme === 'system' ? 'System' : newTheme === 'dark' ? 'Dark' : 'Light'}`);
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmPassword) {
        toast.error('New passwords do not match');
        return;
    }

    if (!Object.values(passwordRequirements).every(Boolean)) {
        toast.error('Please meet all password requirements');
        return;
    }

    setLoading(true);
    try {
        await updateUserPassword(currentPassword, newPassword);
        toast.success('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    } catch (error: any) {
        console.error('Failed to update password:', error);
        toast.error(error.message || 'Failed to update password');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
        <WelcomeSection title="Settings" subtitle="Customize your experience and manage your account" />

        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <TabsTrigger 
                    value="general"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    General
                </TabsTrigger>
                <TabsTrigger 
                    value="notifications"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                >
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                </TabsTrigger>
                <TabsTrigger 
                    value="appearance"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                >
                    <Palette className="h-4 w-4 mr-2" />
                    Appearance
                </TabsTrigger>
                <TabsTrigger 
                    value="security"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                >
                    <Shield className="h-4 w-4 mr-2" />
                    Security
                </TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Account Information */}
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-xl">
                                <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Account Information</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                                <Input 
                                    value={user?.email || ''} 
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    disabled
                                />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact support to change your email</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">First Name</label>
                                    <Input 
                                        value={user?.firstName || ''} 
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                        placeholder="Enter your first name"
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Last Name</label>
                                    <Input 
                                        value={user?.lastName || ''} 
                                        className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                        placeholder="Enter your last name"
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
                    >
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-amber-500/10 rounded-xl">
                                <Key className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Current Password</label>
                                <Input 
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    placeholder="Enter current password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                <Input 
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <div className="mt-3 space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">Password requirements:</p>
                                    <ul className="space-y-1.5">
                                        <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                                        <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                                        <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                                        <RequirementItem met={passwordRequirements.number} text="One number" />
                                        <RequirementItem met={passwordRequirements.special} text="One special character" />
                                    </ul>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                <Input 
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Button 
                                    className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                                    onClick={handlePasswordChange}
                                    disabled={loading}
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    {loading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 mt-6">
                <div
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notifications</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {[
                            // {
                            //     key: 'emailNotifications',
                            //     title: 'Email Notifications',
                            //     description: 'Receive notifications via email',
                            //     icon: Mail
                            // },
                            {
                                key: 'pushNotifications',
                                title: 'Push Notifications',
                                description: 'Receive push notifications on your device',
                                icon: Bell
                            },
                            // {
                            //     key: 'marketingEmails',
                            //     title: 'Marketing Emails',
                            //     description: 'Receive updates about new features and promotions',
                            //     icon: Megaphone
                            // },
                            {
                                key: 'teamInvites',
                                title: 'Team Invites',
                                description: 'Get notified when someone invites you to a team',
                                icon: Users
                            },
                            {
                                key: 'challengeUpdates',
                                title: 'Challenge Updates',
                                description: 'Get notified about changes to your challenges',
                                icon: Globe
                            }
                        ].map((setting) => (
                            <div key={setting.key} className="flex items-start justify-between gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <setting.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.title}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{setting.description}</p>
                                    </div>
                                </div>
                                <Switch 
                                    checked={preferences[setting.key as keyof NotificationPreferences]} 
                                    onCheckedChange={(checked) => handlePreferenceChange(setting.key as keyof NotificationPreferences, checked)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 mt-6">
                <div
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-emerald-500/10 rounded-xl">
                            <Palette className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Appearance</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Theme</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Choose your preferred theme</p>
                                </div>
                                <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20">
                                    {theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}
                                    {theme === 'system' && (
                                        <span className="ml-1 text-xs opacity-75">
                                            ({actualTheme === 'dark' ? 'Dark' : 'Light'})
                                        </span>
                                    )}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { value: 'light', label: 'Light' },
                                    { value: 'dark', label: 'Dark' },
                                    { value: 'system', label: 'System' }
                                ].map((themeOption) => (
                                    <button
                                        key={themeOption.value}
                                        onClick={() => handleThemeChange(themeOption.value as 'light' | 'dark' | 'system')}
                                        className={`p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                            theme === themeOption.value
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' 
                                                : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                                        }`}
                                    >
                                        {themeOption.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 mt-6">
                <div
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
                >
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <Shield className="h-5 w-5 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Privacy & Security</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Profile Visibility</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">Control who can see your profile</p>
                                </div>
                                <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-900/20">
                                    {visibility === 'public' ? 'Public' : 'Private'}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Public', 'Private'].map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleVisibilityChange(option.toLowerCase() as 'public' | 'private')}
                                        className={`p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                            visibility === option.toLowerCase()
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                                                : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    </div>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
    return (
        <li className={`flex items-center text-xs transition-colors duration-200 ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {met ? (
                <Check className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
            ) : (
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600 mr-3 ml-1 flex-shrink-0" />
            )}
            {text}
        </li>
    );
}
