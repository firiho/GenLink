import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function General({ settings, setSettings }) {
  const { actualTheme } = useTheme();
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className={cn(
            "text-sm font-medium mb-1.5 block",
            actualTheme === 'dark' ? "text-slate-300" : "text-slate-700"
          )}>
            Site Name
          </label>
          <Input
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className={cn(
              actualTheme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-white" 
                : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>
        <div>
          <label className={cn(
            "text-sm font-medium mb-1.5 block",
            actualTheme === 'dark' ? "text-slate-300" : "text-slate-700"
          )}>
            Site URL
          </label>
          <Input
            value={settings.siteUrl}
            onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
            className={cn(
              actualTheme === 'dark' 
                ? "bg-slate-800 border-slate-700 text-white" 
                : "bg-white border-slate-200 text-slate-900"
            )}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "font-medium",
              actualTheme === 'dark' ? "text-white" : "text-slate-900"
            )}>Enable Registration</p>
            <p className={cn(
              "text-sm",
              actualTheme === 'dark' ? "text-slate-400" : "text-slate-500"
            )}>Allow new users to register</p>
          </div>
          <Switch
            checked={settings.enableRegistration}
            onCheckedChange={(checked) => 
              setSettings({...settings, enableRegistration: checked})}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className={cn(
              "font-medium",
              actualTheme === 'dark' ? "text-white" : "text-slate-900"
            )}>Maintenance Mode</p>
            <p className={cn(
              "text-sm",
              actualTheme === 'dark' ? "text-slate-400" : "text-slate-500"
            )}>Put site in maintenance mode</p>
          </div>
          <Switch
            checked={settings.maintenanceMode}
            onCheckedChange={(checked) => 
              setSettings({...settings, maintenanceMode: checked})}
          />
        </div>
      </div>
    </div>
  )
}
