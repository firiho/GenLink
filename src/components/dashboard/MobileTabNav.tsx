import { LayoutDashboard, Trophy, Users, Settings, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileTabNav = ({ activeView, setActiveView }) => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 z-40 px-2 pb-safe">
      <div className="flex justify-around py-2">
        {[
          { icon: LayoutDashboard, label: 'Overview', value: 'overview' },
          { icon: Trophy, label: 'Challenges', value: 'challenges' },
          { icon: Users, label: 'Teams', value: 'teams' },
          { icon: User, label: 'Profile', value: 'profile' },
          { icon: Settings, label: 'Settings', value: 'settings' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveView(tab.value)}
            className={cn(
              "flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200",
              "active:scale-95 touch-none select-none relative group",
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
                "text-xs mt-1 font-medium transition-colors duration-200",
                activeView === tab.value 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
              )}>
                {tab.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

export default MobileTabNav;