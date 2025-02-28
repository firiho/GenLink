import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    toast.success('Settings reset to default');
  };

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Theme Settings</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Theme Mode</label>
            <Select 
              value={settings.theme}
              onValueChange={(value) => setSettings({...settings, theme: value})}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Primary Color</label>
              <Input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({...settings, primaryColor: e.target.value})}
                className="h-10"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Secondary Color</label>
              <Input
                type="color"
                value={settings.secondaryColor}
                onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})}
                className="h-10"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Typography */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Type className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Typography</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Font Family</label>
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
            <label className="text-sm font-medium mb-1.5 block">Font Size</label>
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
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Layout className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Layout Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Border Radius</label>
            <Input
              type="text"
              value={settings.borderRadius}
              onChange={(e) => setSettings({...settings, borderRadius: e.target.value})}
              placeholder="0.5rem"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Layout Density</label>
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
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Custom CSS</h2>
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
            className="w-full h-32 p-3 font-mono text-sm bg-gray-50 rounded-lg"
            placeholder=":root { --custom-color: #ff0000; }"
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={handleReset}>
          <Undo className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}