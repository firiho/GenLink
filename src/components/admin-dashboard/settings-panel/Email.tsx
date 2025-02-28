import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Mail,
  Send,
  Settings,
  AlertCircle,
  CheckCircle,
  MailCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Email() {
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: 'noreply@genlink.com',
    fromName: 'GenLink',
    enableSSL: true,
    enableNotifications: true,
    welcomeTemplate: 'Welcome to GenLink!\n\nThank you for joining our platform.',
    supportTemplate: 'Thank you for contacting support.\n\nWe will respond shortly.'
  });

  const [emailLogs] = useState([
    {
      id: 1,
      type: 'Welcome Email',
      recipient: 'user@example.com',
      status: 'delivered',
      timestamp: '2024-03-20 15:30:00'
    },
    {
      id: 2,
      type: 'Password Reset',
      recipient: 'another@example.com',
      status: 'failed',
      timestamp: '2024-03-20 15:25:00'
    }
  ]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Email settings saved successfully');
    } catch (error) {
      toast.error('Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Test email sent successfully');
    } catch (error) {
      toast.error('Failed to send test email');
    }
  };

  return (
    <div className="space-y-6">
      {/* SMTP Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">SMTP Configuration</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">SMTP Host</label>
            <Input
              value={settings.smtpHost}
              onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">SMTP Port</label>
            <Input
              value={settings.smtpPort}
              onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Username</label>
            <Input
              value={settings.smtpUsername}
              onChange={(e) => setSettings({...settings, smtpUsername: e.target.value})}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Password</label>
            <Input
              type="password"
              value={settings.smtpPassword}
              onChange={(e) => setSettings({...settings, smtpPassword: e.target.value})}
            />
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable SSL/TLS</p>
              <p className="text-sm text-gray-500">Use secure connection</p>
            </div>
            <Switch
              checked={settings.enableSSL}
              onCheckedChange={(checked) => 
                setSettings({...settings, enableSSL: checked})}
            />
          </div>
        </div>
      </Card>

      {/* Email Templates */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          {/* <Template className="h-5 w-5 text-primary" /> */}
          <h2 className="text-lg font-semibold">Email Templates</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Welcome Email</label>
            <Textarea
              value={settings.welcomeTemplate}
              onChange={(e) => setSettings({...settings, welcomeTemplate: e.target.value})}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Support Response</label>
            <Textarea
              value={settings.supportTemplate}
              onChange={(e) => setSettings({...settings, supportTemplate: e.target.value})}
              rows={4}
            />
          </div>
        </div>
      </Card>

      {/* Test Email */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Send className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Send Test Email</h2>
        </div>

        <div className="flex gap-4">
          <Input
            placeholder="Enter test email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleTestEmail}>
            Send Test
          </Button>
        </div>
      </Card>

      {/* Email Logs */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MailCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Email Logs</h2>
        </div>

        <div className="space-y-4">
          {emailLogs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">{log.type}</p>
                <p className="text-sm text-gray-500">{log.recipient}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm flex items-center ${
                  log.status === 'delivered' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {log.status === 'delivered' ? (
                    <CheckCircle className="h-4 w-4 mr-1" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-1" />
                  )}
                  {log.status}
                </p>
                <p className="text-sm text-gray-500">{log.timestamp}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Email Settings'}
        </Button>
      </div>
    </div>
  );
}