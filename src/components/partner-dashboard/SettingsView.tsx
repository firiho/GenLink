import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Building2, Globe, Mail, Bell, Users, Shield,
  CreditCard, Smartphone, Upload, ChevronRight, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsViewProps {
  user: User | null;
  onSaveChanges: () => void;
}

export const SettingsView = ({ user, onSaveChanges }: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState('organization');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold mb-2">Settings</h2>
        <p className="text-gray-600">Manage your organization and account settings</p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start border-b mb-6">
          <TabsTrigger value="organization" className="flex-1">
            Organization
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1">
            Team Members
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex-1">
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          {/* Organization Profile */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Organization Profile</h3>
                <p className="text-sm text-gray-500">
                  Update your organization's public information
                </p>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Partner
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Logo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={previewUrl || user?.organization?.logo || ''} />
                        <AvatarFallback>
                          <Building2 className="h-8 w-8 text-gray-400" />
                        </AvatarFallback>
                      </Avatar>
                      <label 
                        htmlFor="logo-upload" 
                        className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-primary text-white cursor-pointer hover:bg-primary/90 transition-colors"
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
                    <div className="text-sm text-gray-500">
                      <p>Upload a new organization logo</p>
                      <p>PNG, JPG up to 2MB</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <Input 
                    value={user?.organization?.name || ''} 
                    className="max-w-md"
                    placeholder="Enter organization name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative max-w-md">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                      type="url"
                      placeholder="https://example.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    className="w-full min-h-[150px] rounded-md border border-gray-200 p-3"
                    placeholder="Describe your organization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select className="w-full rounded-md border border-gray-200 p-2">
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
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">API Access</p>
                  <p className="text-sm text-gray-600">Enable API access for integrations</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          {/* Team Members List */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <p className="text-sm text-gray-500">Manage your team members and their roles</p>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
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
                <div key={index} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{member.role}</Badge>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
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
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="font-medium text-gray-900">Push Notifications</h4>
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
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          {/* Billing Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-6">Billing Information</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-2">Current Plan</p>
                  <div className="p-4 border border-primary/20 rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-primary text-white">Enterprise</Badge>
                      <p className="text-primary font-semibold">$499/month</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Unlimited challenges, priority support, and advanced analytics
                    </p>
                  </div>
                </div>

                <div>
                  <p className="font-medium mb-2">Payment Method</p>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-gray-500">Expires 12/24</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="font-medium">Billing History</p>
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
                    <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{invoice.date}</p>
                        <p className="text-sm text-gray-500">{invoice.amount}</p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-600">
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
    </motion.div>
  );
}; 