import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  MessagesSquare,
  Settings
} from 'lucide-react';

interface AdminMobileTabNavProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const AdminMobileTabNav = ({ activeView, setActiveView }: AdminMobileTabNavProps) => {
  const tabs = [
    {
      icon: LayoutDashboard,
      label: 'Overview',
      value: 'overview'
    },
    {
      icon: Building2,
      label: 'Partners',
      value: 'partners'
    },
    {
      icon: Users,
      label: 'Communities',
      value: 'communities'
    },
    {
      icon: MessagesSquare,
      label: 'Support',
      value: 'support'
    },
    {
      icon: Settings,
      label: 'Settings', 
      value: 'settings'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 lg:hidden">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveView(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 min-w-[4rem]",
                "transition-colors duration-200",
                activeView === tab.value 
                  ? "text-primary" 
                  : "text-slate-400 hover:text-slate-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMobileTabNav;