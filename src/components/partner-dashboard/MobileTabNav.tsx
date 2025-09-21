import { LayoutDashboard, Trophy, Users, Settings, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileTabNav = ({ activeView, setActiveView }) => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-40 px-1 pb-safe">
      <div className="flex justify-around py-1">
        {[
          { icon: LayoutDashboard, label: 'Overview', value: 'overview' },
          { icon: Trophy, label: 'Challenges', value: 'challenges' },
          { icon: Users, label: 'Submissions', value: 'submissions' },
          { icon: Settings, label: 'Settings', value: 'settings' }
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveView(tab.value)}
            className={cn(
              "flex flex-col items-center px-3 py-2 rounded-lg transition-all duration-200",
              "active:bg-slate-100 dark:active:bg-slate-800 touch-none select-none",
              activeView === tab.value 
                ? "text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50"
            )}
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

export default MobileTabNav;