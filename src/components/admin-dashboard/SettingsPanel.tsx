import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import {
  Settings,
  Shield,
  Mail,
  Palette,
  Code,
  Globe,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import General from './settings-panel/General';
import Security from './settings-panel/Security';
import Email from './settings-panel/Email';
import API from './settings-panel/API';
import Appearance from './settings-panel/Appearance';

export default function SettingsPanel() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'GenLink',
    siteUrl: 'https://genlink.com',
    supportEmail: 'support@genlink.com',
    enableRegistration: true,
    enableNotifications: true,
    maintenanceMode: false,
    apiKey: '**********************',
    theme: 'light'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-white p-1 rounded-lg shadow-sm">
          <TabsTrigger value="general" className="space-x-2">
            <Settings className="h-4 w-4" />
            <span>General</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="space-x-2">
            <Shield className="h-4 w-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="space-x-2">
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="space-x-2">
            <Code className="h-4 w-4" />
            <span>API</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="space-x-2">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card className="p-6">
            <General settings={settings} setSettings={setSettings} />
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6">
            <Security />
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="p-6">
            <Email />
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card className="p-6">
            <API />
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card className="p-6">
            <Appearance />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}