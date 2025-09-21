import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  Palette,
  Sun,
  Moon,
  Type,
  Layout,
  Monitor,
  Save,
  Undo,
  Code
} from 'lucide-react';
import { toast } from 'sonner';

export default function Appearance() {
  const { theme, setTheme, actualTheme } = useTheme();
  const [settings, setSettings] = useState({
    theme: 'system',
    primaryColor: '#0066FF',
    secondaryColor: '#6B7280',
    fontFamily: 'Inter',
    fontSize: 'md',
    borderRadius: '0.5rem',
    enableCustomCSS: false,
    customCSS: '',
    layoutDensity: 'comfortable'
  });

  const [loading, setLoading] = useState(false);

  // Sync with theme context
  useEffect(() => {
    setSettings(prev => ({ ...prev, theme }));
  }, [theme]);

  const fontSizes = {
    sm: '14px',
    md: '16px',
    lg: '18px'
  };

  const fontOptions = [
    'Inter',
    'Roboto',
    'SF Pro Display',
    'Poppins'
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSettings(prev => ({ ...prev, theme: newTheme }));
    setTheme(newTheme);
    toast.success(`Theme changed to ${newTheme}`);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Appearance settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      theme: 'system',
      primaryColor: '#0066FF',
      secondaryColor: '#6B7280',
      fontFamily: 'Inter',
      fontSize: 'md',
      borderRadius: '0.5rem',
      enableCustomCSS: false,
      customCSS: '',
      layoutDensity: 'comfortable'
    });
    setTheme('system');
    toast.success('Settings reset to default');
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Theme Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>Theme Mode</label>
            <Select 
              value={settings.theme}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center">
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center">
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={cn(
                "text-sm font-medium mb-1.5 block",
                actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
              )}>Primary Color</label>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                className="h-10 w-full"
              />
            </div>
            <div>
              <label className={cn(
                "text-sm font-medium mb-1.5 block",
                actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
              )}>Secondary Color</label>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                className="h-10 w-full"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Type className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Typography</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>Font Family</label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => setSettings({...settings, fontFamily: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map(font => (
                  <SelectItem key={font} value={font}>{font}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>Font Size</label>
            <Select
              value={settings.fontSize}
              onValueChange={(value) => setSettings({...settings, fontSize: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small ({fontSizes.sm})</SelectItem>
                <SelectItem value="md">Medium ({fontSizes.md})</SelectItem>
                <SelectItem value="lg">Large ({fontSizes.lg})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Layout */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center gap-2 mb-6">
          <Layout className="h-5 w-5 text-primary" />
          <h2 className={cn(
            "text-lg font-semibold",
            actualTheme === 'dark' ? "text-white" : "text-gray-900"
          )}>Layout Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>Border Radius</label>
            <Input
              type="text"
              value={settings.borderRadius}
              onChange={(e) => setSettings({...settings, borderRadius: e.target.value})}
              placeholder="0.5rem"
            />
          </div>

          <div>
            <label className={cn(
              "text-sm font-medium mb-1.5 block",
              actualTheme === 'dark' ? "text-slate-300" : "text-gray-700"
            )}>Layout Density</label>
            <Select
              value={settings.layoutDensity}
              onValueChange={(value) => setSettings({...settings, layoutDensity: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="relaxed">Relaxed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Custom CSS */}
      <Card className={cn(
        "p-6",
        actualTheme === 'dark' ? "bg-slate-800 border-slate-700" : "bg-white"
      )}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className={cn(
              "text-lg font-semibold",
              actualTheme === 'dark' ? "text-white" : "text-gray-900"
            )}>Custom CSS</h2>
          </div>
          <Switch
            checked={settings.enableCustomCSS}
            onCheckedChange={(checked) => 
              setSettings({...settings, enableCustomCSS: checked})}
          />
        </div>

        {settings.enableCustomCSS && (
          <textarea
            value={settings.customCSS}
            onChange={(e) => setSettings({...settings, customCSS: e.target.value})}
            className={cn(
              "w-full h-32 p-3 font-mono text-sm rounded-lg",
              actualTheme === 'dark' 
                ? "bg-slate-700 text-white border-slate-600" 
                : "bg-gray-50 text-gray-900 border-gray-200"
            )}
            placeholder=":root { --custom-color: #ff0000; }"
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
          <Undo className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}