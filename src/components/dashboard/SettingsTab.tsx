import { Bell, Key, Mail, Shield, User, Globe, Palette, Save, Settings as SettingsIcon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsTab({user}) {
  const { theme, setTheme, actualTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    // Optional: Add a toast notification
    // toast.success(`Theme changed to ${newTheme === 'system' ? 'System' : newTheme === 'dark' ? 'Dark' : 'Light'}`);
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
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">New Password</label>
                                <Input 
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    placeholder="Enter new password"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</label>
                                <Input 
                                    type="password"
                                    className="w-full bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                                    placeholder="Confirm new password"
                                />
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <Button 
                                    className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                                >
                                    <Key className="h-4 w-4 mr-2" />
                                    Update Password
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
                            {
                                title: 'Challenge Updates',
                                description: 'Get notified about changes to your challenges',
                                icon: Bell,
                                enabled: true
                            },
                            {
                                title: 'Team Messages',
                                description: 'Receive messages from your team members',
                                icon: Mail,
                                enabled: true
                            },
                            {
                                title: 'Security Alerts',
                                description: 'Get important security notifications',
                                icon: Shield,
                                enabled: true
                            }
                        ].map((setting, index) => (
                            <div key={setting.title} className="flex items-start justify-between gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <setting.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.title}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{setting.description}</p>
                                    </div>
                                </div>
                                <Switch defaultChecked={setting.enabled} />
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
                                    Public
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {['Public', 'Private'].map((visibility) => (
                                    <button
                                        key={visibility}
                                        className={`p-2 rounded-lg text-xs font-medium transition-colors duration-200 ${
                                            visibility === 'Public' 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' 
                                                : 'bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'
                                        }`}
                                    >
                                        {visibility}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <Button 
                            variant="outline" 
                            className="w-full justify-start hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Data & Privacy Settings
                        </Button>
                    </div>
                </div>
            </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div
            className="flex justify-end"
        >
            <Button className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-200">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
            </Button>
        </div>
    </div>
  )
}
