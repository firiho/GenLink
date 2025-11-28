import { LayoutDashboard, Trophy, Users, Settings, Calendar, MoreVertical } from 'lucide-react';
import { cn } from "@/lib/utils";
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PERMISSIONS } from '@/constants/permissions';
import { User } from '@/types/user';

interface MobileTabNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
  user: User | null;
}

const MobileTabNav = ({ activeView, setActiveView, user }: MobileTabNavProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const hasPermission = (permission: string) => {
    return user?.permissions?.includes(permission);
  };

  const mainTabs = [
    { icon: LayoutDashboard, label: 'Overview', value: 'overview' },
    ...(hasPermission(PERMISSIONS.MANAGE_CHALLENGES) ? [{ icon: Trophy, label: 'Challenges', value: 'challenges' }] : []),
    ...(hasPermission(PERMISSIONS.MANAGE_SUBMISSIONS) ? [{ icon: Users, label: 'Submissions', value: 'submissions' }] : []),
  ];

  const menuTabs = [
    ...(hasPermission(PERMISSIONS.MANAGE_EVENTS) ? [{ icon: Calendar, label: 'Events', value: 'events' }] : []),
    { icon: Settings, label: 'Settings', value: 'settings' }
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-2 pb-safe">
      <div className="flex justify-around py-2">
        {/* Main tabs - visible on all mobile sizes */}
        {mainTabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveView(tab.value)}
            className={cn(
              "flex flex-col items-center px-2 sm:px-3 py-2 rounded-xl transition-all duration-200",
              "active:scale-95 touch-none select-none relative group flex-1 max-w-[25%]",
              activeView === tab.value 
                ? "text-slate-900 dark:text-white" 
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            {activeView === tab.value && (
              <div
                className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl"
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <tab.icon className={cn(
                "h-5 w-5 transition-all duration-200",
                activeView === tab.value 
                  ? "scale-110" 
                  : "group-hover:scale-105"
              )} />
              <span className={cn(
                "text-xs mt-1 font-medium transition-colors duration-200 text-center",
                activeView === tab.value 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
              )}>
                {tab.label}
              </span>
            </div>
          </button>
        ))}
        
        {/* Dots menu for Events and Settings */}
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center px-2 sm:px-3 py-2 rounded-xl transition-all duration-200",
                "active:scale-95 touch-none select-none relative group flex-1 max-w-[25%]",
                (activeView === 'events' || activeView === 'settings')
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              {(activeView === 'events' || activeView === 'settings') && (
                <div
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-xl"
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <MoreVertical className={cn(
                  "h-5 w-5 transition-all duration-200",
                  (activeView === 'events' || activeView === 'settings')
                    ? "scale-110" 
                    : "group-hover:scale-105"
                )} />
                <span className={cn(
                  "text-xs mt-1 font-medium transition-colors duration-200",
                  (activeView === 'events' || activeView === 'settings')
                    ? "text-slate-900 dark:text-white" 
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                )}>
                  More
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="mb-2 w-48">
            {menuTabs.map(tab => (
              <DropdownMenuItem
                key={tab.value}
                onClick={() => {
                  setActiveView(tab.value);
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  activeView === tab.value && "bg-slate-100 dark:bg-slate-800"
                )}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MobileTabNav;