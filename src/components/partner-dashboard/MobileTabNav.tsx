import { LayoutDashboard, Trophy, Users, Settings, User } from 'lucide-react';
import { cn } from "@/lib/utils";

const MobileTabNav = ({ activeView, setActiveView }) => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-1 pb-safe">
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
              "flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
              "active:bg-gray-100 touch-none select-none",
              activeView === tab.value 
                ? "text-primary" 
                : "text-gray-500"
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