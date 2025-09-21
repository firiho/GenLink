import { cn } from "@/lib/utils";
import { useTheme } from '@/contexts/ThemeContext';
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
  const { actualTheme } = useTheme();
  
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
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 border-t lg:hidden",
      actualTheme === 'dark' 
        ? "bg-slate-900 border-slate-800" 
        : "bg-white border-gray-200"
    )}>
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveView(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-4 min-w-[4rem] rounded-lg transition-all duration-200",
                activeView === tab.value 
                  ? actualTheme === 'dark'
                    ? "text-blue-400 bg-blue-500/20"
                    : "text-primary bg-primary/10"
                  : actualTheme === 'dark'
                    ? "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
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