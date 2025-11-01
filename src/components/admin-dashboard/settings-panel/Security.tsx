import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Shield,
  Key,
  Lock,
  Eye,
  LogOut,
  Clock,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

export default function Security() {
  const { actualTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    passwordMinLength: 12,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    maxLoginAttempts: 5,
    sessionTimeout: 30,
    twoFactorAuth: true,
    ipWhitelist: '',
    adminIpRestriction: true
  });

  const recentActivity = [
    {
      id: 1,
      action: 'Login attempt',
      status: 'success',
      ip: '192.168.1.1',
      location: 'New York, US',
      timestamp: '2024-03-20 14:30:00'
    },
    {
      id: 2,
      action: 'Settings changed',
      status: 'success',
      ip: '192.168.1.1',
      location: 'New York, US',
      timestamp: '2024-03-20 14:25:00'
    }
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Security settings updated');
    } catch (error) {
      toast.error('Failed to update security settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Policy */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Password Policy</h2>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={cn(
                "text-sm font-medium mb-1.5 block",
                actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
              )}>
                Minimum Password Length
              </label>
              <Input
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => setSettings({
                  ...settings,
                  passwordMinLength: parseInt(e.target.value)
                })}
                className="w-full"
              />
            </div>
            <div>
              <label className={cn(
                "text-sm font-medium mb-1.5 block",
                actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
              )}>
                Maximum Login Attempts
              </label>
              <Input
                type="number"
                value={settings.maxLoginAttempts}
                onChange={(e) => setSettings({
                  ...settings,
                  maxLoginAttempts: parseInt(e.target.value)
                })}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "font-medium",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>Require Special Characters</p>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Require at least one special character</p>
              </div>
              <Switch
                checked={settings.requireSpecialChars}
                onCheckedChange={(checked) => 
                  setSettings({...settings, requireSpecialChars: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "font-medium",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>Require Numbers</p>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Require at least one number</p>
              </div>
              <Switch
                checked={settings.requireNumbers}
                onCheckedChange={(checked) => 
                  setSettings({...settings, requireNumbers: checked})}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className={cn(
                  "font-medium",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>Require Uppercase Letters</p>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>Require at least one uppercase letter</p>
              </div>
              <Switch
                checked={settings.requireUppercase}
                onCheckedChange={(checked) => 
                  setSettings({...settings, requireUppercase: checked})}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Two-Factor Authentication</h2>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <p className={cn(
              "font-medium",
              actualTheme === 'dark' ? "text-white" : "text-gray-900"
            )}>Enable Two-Factor Authentication</p>
            <p className={cn(
              "text-sm",
              actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
            )}>Require 2FA for all admin accounts</p>
          </div>
          <Switch
            checked={settings.twoFactorAuth}
            onCheckedChange={(checked) => 
              setSettings({...settings, twoFactorAuth: checked})}
          />
        </div>
      </Card>

      {/* IP Restrictions */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Key className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>IP Restrictions</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>
              IP Whitelist (comma-separated)
            </label>
            <Input
              value={settings.ipWhitelist}
              onChange={(e) => setSettings({...settings, ipWhitelist: e.target.value})}
              placeholder="e.g., 192.168.1.1, 10.0.0.1"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className={cn(
                "font-medium",
                actualTheme === 'dark' ? "text-white" : "text-gray-900"
              )}>Restrict Admin Access by IP</p>
              <p className={cn(
                "text-sm",
                actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
              )}>Only allow admin access from whitelisted IPs</p>
            </div>
            <Switch
              checked={settings.adminIpRestriction}
              onCheckedChange={(checked) => 
                setSettings({...settings, adminIpRestriction: checked})}
            />
          </div>
        </div>
      </Card>

      {/* Recent Security Activity */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Recent Security Activity</h2>
        </div>

        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg",
                actualTheme === 'dark' ? "bg-slate-700" : "bg-gray-50"
              )}
            >
              <div>
                <p className={cn(
                  "font-medium",
                  actualTheme === 'dark' ? "text-white" : "text-gray-900"
                )}>{activity.action}</p>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>
                  {activity.ip} • {activity.location}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-sm ${
                  activity.status === 'success' ? 'text-green-500' : 'text-red-500'
                }`}>
                  {activity.status}
                </p>
                <p className={cn(
                  "text-sm",
                  actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>{activity.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Security Settings'}
        </Button>
      </div>
    </div>
  );
}