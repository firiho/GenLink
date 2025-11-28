import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WelcomeSection from '../dashboard/WelcomeSection';
import { GeneralSettings } from './settings/GeneralSettings';
import { OrganizationSettings } from './settings/OrganizationSettings';
import { TeamSettings } from './settings/TeamSettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { BillingSettings } from './settings/BillingSettings';
import { PERMISSIONS } from '@/constants/permissions';

interface SettingsViewProps {
  user: User | null;
  onSaveChanges: () => void;
}

export const SettingsView = ({ user, onSaveChanges }: SettingsViewProps) => {
  const [activeTab, setActiveTab] = useState('general');

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission);
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">

      <WelcomeSection title={'Settings'} subtitle={'Manage your organization and account settings'} />

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full justify-start mb-6 overflow-x-auto">
          <TabsTrigger 
            value="general" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <SettingsIcon className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">General</span>
            <span className="sm:hidden">Gen</span>
          </TabsTrigger>
          
          {hasPermission(PERMISSIONS.MANAGE_ORGANIZATION) && (
            <TabsTrigger 
              value="organization" 
              className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
            >
              <span className="hidden sm:inline">Organization</span>
              <span className="sm:hidden">Org</span>
            </TabsTrigger>
          )}

          {hasPermission(PERMISSIONS.MANAGE_TEAM) && (
            <TabsTrigger 
              value="team" 
              className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
            >
              <span className="hidden sm:inline">Team Members</span>
              <span className="sm:hidden">Team</span>
            </TabsTrigger>
          )}

          <TabsTrigger 
            value="notifications" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <span className="hidden sm:inline">Notifications</span>
            <span className="sm:hidden">Notif</span>
          </TabsTrigger>
          {/* <TabsTrigger 
            value="billing" 
            className="flex-1 min-w-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
          >
            <span className="hidden sm:inline">Billing</span>
            <span className="sm:hidden">Bill</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="general" className="space-y-4 sm:space-y-6">
          <GeneralSettings user={user} />
        </TabsContent>

        {hasPermission(PERMISSIONS.MANAGE_ORGANIZATION) && (
          <TabsContent value="organization" className="space-y-4 sm:space-y-6">
            <OrganizationSettings user={user} />
          </TabsContent>
        )}

        {hasPermission(PERMISSIONS.MANAGE_TEAM) && (
          <TabsContent value="team" className="space-y-4 sm:space-y-6">
            <TeamSettings />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="space-y-4 sm:space-y-6">
          <NotificationSettings />
        </TabsContent>

        {/* <TabsContent value="billing" className="space-y-4 sm:space-y-6">
          <BillingSettings />
        </TabsContent> */}
      </Tabs>
    </div>
  );
};