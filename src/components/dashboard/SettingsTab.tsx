import { Bell, Key, Mail, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import WelcomeSection from '@/components/dashboard/WelcomeSection';

export default function SettingsTab({user}) {
  return (
    <div className="space-y-4 sm:space-y-6 mt-5">
        <WelcomeSection title="Settings" subtitle="Manage your account preferences" />

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm p-4"
        >
            <h3 className="text-base font-medium mb-3">Account Information</h3>
            <div className="space-y-3">
            <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <Input 
                value={user?.email || ''} 
                className="w-full"
                disabled
                />
            </div>
            <Button 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto"
            >
                <Key className="h-4 w-4 mr-1.5" />
                Change Password
            </Button>
            </div>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-4"
        >
            <h3 className="text-base font-medium mb-3">Notifications</h3>
            <div className="space-y-3">
            {[
                {
                title: 'Challenge Updates',
                description: 'Get notified about changes to your challenges',
                icon: Bell
                },
                {
                title: 'Team Messages',
                description: 'Receive messages from your team members',
                icon: Mail
                },
                {
                title: 'Security Alerts',
                description: 'Get important security notifications',
                icon: Shield
                }
            ].map((setting) => (
                <div key={setting.title} className="flex items-start justify-between gap-3 py-1">
                <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg mt-0.5">
                    <setting.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                    <p className="text-sm font-medium">{setting.title}</p>
                    <p className="text-xs text-gray-600">{setting.description}</p>
                    </div>
                </div>
                <Switch />
                </div>
            ))}
            </div>
        </motion.div>
    </div>
  )
}
