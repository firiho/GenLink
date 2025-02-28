import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import {
  Key,
  RefreshCcw,
  Clock,
  BarChart,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function API() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: 'sk_test_51ABC123XYZ...',
    rateLimitRequests: 100,
    rateLimitInterval: 60,
    enableRateLimit: true,
    ipWhitelist: '',
    enableIPRestriction: false
  });

  const [usageStats] = useState([
    { endpoint: '/api/users', calls: 1250, errors: 12 },
    { endpoint: '/api/partners', calls: 850, errors: 5 },
    { endpoint: '/api/analytics', calls: 2100, errors: 18 }
  ]);

  const handleRegenerateKey = async () => {
    setLoading(true);
    try {
      const newKey = 'sk_test_' + Math.random().toString(36).substring(2);
      setSettings({ ...settings, apiKey: newKey });
      toast.success('API key regenerated successfully');
    } catch (error) {
      toast.error('Failed to regenerate API key');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      {/* API Key Management */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Key className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">API Key Management</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={settings.apiKey}
              readOnly
              type="password"
              className="font-mono"
            />
            <Button
              variant="outline"
              onClick={() => copyToClipboard(settings.apiKey)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleRegenerateKey}
              disabled={loading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Keep this key secure. Regenerate it if compromised.
          </p>
        </div>
      </Card>

      {/* Rate Limiting */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Rate Limiting</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Rate Limiting</p>
              <p className="text-sm text-gray-500">Limit API requests per interval</p>
            </div>
            <Switch
              checked={settings.enableRateLimit}
              onCheckedChange={(checked) => 
                setSettings({...settings, enableRateLimit: checked})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Requests Limit
              </label>
              <Input
                type="number"
                value={settings.rateLimitRequests}
                onChange={(e) => setSettings({
                  ...settings,
                  rateLimitRequests: parseInt(e.target.value)
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Time Interval (seconds)
              </label>
              <Input
                type="number"
                value={settings.rateLimitInterval}
                onChange={(e) => setSettings({
                  ...settings,
                  rateLimitInterval: parseInt(e.target.value)
                })}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* API Usage */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">API Usage</h2>
        </div>

        <div className="space-y-4">
          {usageStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-mono text-sm">{stat.endpoint}</p>
                <p className="text-sm text-gray-500">
                  {stat.calls.toLocaleString()} calls
                </p>
              </div>
              {stat.errors > 0 && (
                <div className="flex items-center text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {stat.errors} errors
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Documentation */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">API Documentation</h2>
          </div>
          <Button variant="outline">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Docs
          </Button>
        </div>
      </Card>
    </div>
  );
}