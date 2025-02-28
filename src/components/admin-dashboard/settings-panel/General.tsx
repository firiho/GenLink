import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

export default function General({ settings, setSettings }) {
  return (
    <div className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Site Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Site URL
                  </label>
                  <Input
                    value={settings.siteUrl}
                    onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Registration</p>
                    <p className="text-sm text-gray-500">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={settings.enableRegistration}
                    onCheckedChange={(checked) => 
                      setSettings({...settings, enableRegistration: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Put site in maintenance mode</p>
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
