import { useState } from 'react';
import { 
  Plus, Building2, Globe,
  CreditCard, Upload, ChevronRight, Check,
  Settings as SettingsIcon, Key, Palette, User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WelcomeSection from '../dashboard/WelcomeSection';
import { useTheme } from '@/contexts/ThemeContext';

interface SettingsViewProps {
  user: User | null;
  onSaveChanges: () => void;
}

export const SettingsView = ({ user, onSaveChanges }: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { theme, setTheme, actualTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 lg:space-y-8"
    >

      <WelcomeSection title={'Settings'} subtitle={'Manage your organization and account settings'} />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger 
            value="general" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <SettingsIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          <TabsTrigger 
            value="organization" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <span className="hidden sm:inline">Organization</span>
            <span className="sm:hidden">Org</span>
          </TabsTrigger>
          <TabsTrigger 
            value="team" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <span className="hidden sm:inline">Team Members</span>
            <span className="sm:hidden">Team</span>
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notif</span>
          </TabsTrigger>
          <TabsTrigger 
            value="billing" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Account Information */}
            <div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-6"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <UserIcon className="h-5 w-5 text-blue-600" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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

          {/* Appearance Settings */}
          <div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
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

        <TabsContent value="organization" className="space-y-4 sm:space-y-6">
          {/* Organization Profile */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1 text-slate-900 dark:text-white">Organization Profile</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update your organization's public information
                </p>
              </div>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600">
                Partner
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Organization Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={previewUrl || user?.organization?.logo || ''} />
                        <AvatarFallback>
                          <Building2 className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="logo-upload" 
                        className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 cursor-pointer hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
                      >
                        <Upload className="h-4 w-4" />
                      </label>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoChange}
                      />
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      <p>Upload a new organization logo</p>
                      <p>PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Organization Name
                  </label>
                  <Input 
                    value={user?.organization?.name || ''} 
                    className="max-w-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Website
                  </label>
                  <div className="relative max-w-md">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <Input 
                      type="url"
                      placeholder="https://example.com"
                      className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea 
                    className="w-full min-h-[150px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-3"
                    placeholder="Describe your organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Industry
                  </label>
                  <select className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white p-2">
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">API Access</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Enable API access for integrations</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-4 sm:space-y-6">
          {/* Team Members List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Team Members</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Manage your team members and their roles</p>
                </div>
                <Button className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {[
                {
                  name: 'John Smith',
                  email: 'john@example.com',
                  role: 'Admin',
                  avatar: 'https://ui-avatars.com/api/?name=John+Smith'
                },
                {
                  name: 'Sarah Johnson',
                  email: 'sarah@example.com',
                  role: 'Editor',
                  avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
                }
              ].map((member, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600">{member.role}</Badge>
                    <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Email Notifications</h4>
                {[
                  {
                    title: 'New Submissions',
                    description: 'Get notified when a new submission is received'
                  },
                  {
                    title: 'Challenge Updates',
                    description: 'Receive updates about your active challenges'
                  },
                  {
                    title: 'Team Activity',
                    description: 'Stay informed about team member actions'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Push Notifications</h4>
                {[
                  {
                    title: 'Mobile Notifications',
                    description: 'Receive notifications on your mobile device'
                  },
                  {
                    title: 'Browser Notifications',
                    description: 'Get instant notifications in your browser'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4 sm:space-y-6">
          {/* Billing Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Billing Information</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-2 text-slate-900 dark:text-white">Current Plan</p>
                  <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900">Enterprise</Badge>
                      <p className="text-slate-900 dark:text-white font-semibold">$499/month</p>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Unlimited challenges, priority support, and advanced analytics
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2 text-slate-900 dark:text-white">Payment Method</p>
                  <div className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                    <CreditCard className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">•••• •••• •••• 4242</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Expires 12/24</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-medium text-slate-900 dark:text-white">Billing History</p>
                <div className="space-y-2">
                  {[
                    {
                      date: 'Mar 1, 2024',
                      amount: '$499.00',
                      status: 'Paid'
                    },
                    {
                      date: 'Feb 1, 2024',
                      amount: '$499.00',
                      status: 'Paid'
                    }
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{invoice.date}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.amount}</p>
                      </div>
                      <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400">
                        {invoice.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="bg-primary text-white" onClick={onSaveChanges}>
          <Check className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}; 