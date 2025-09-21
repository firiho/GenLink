import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutDashboard, Users, Trophy, Settings, LogOut, User} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import MobileHeader from '@/components/dashboard/MobileHeader';
import MobileTabNav from '@/components/dashboard/MobileTabNav';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import Logo from '@/components/Logo';
import OverviewTab from '@/components/dashboard/OverviewTab';
import ChallengesTab from '@/components/dashboard/challenges/ChallengesTab';
import TeamsTab from '@/components/dashboard/TeamsTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import ChallengesView from '@/components/dashboard/challenges/ChallengesView';

const Dashboard = () => {
  const { user: authUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [viewData, setViewData] = useState(null);

  const handleViewChange = (view, data = null) => {
    setActiveView(view);
    setViewData(data);
  };
  
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  useEffect(() => {
  if (!authUser) {
    navigate('/login');
  }
  }, [authUser]);
  

  const MENU_ITEMS = [
    {
      label: 'Main',
      items: [
        { 
          icon: LayoutDashboard, 
          text: 'Overview', 
          action: () => setActiveView('overview') 
        },
        { 
          icon: Trophy, 
          text: 'Challenges', 
          action: () => setActiveView('challenges') 
        },
        { 
          icon: Users, 
          text: 'Teams', 
          action: () => setActiveView('teams') 
        },
      ]
    },
    {
      label: 'Account',
      items: [
        { 
          icon: User, 
          text: 'Profile', 
          action: () => setActiveView('profile') 
        },
        { 
          icon: Settings, 
          text: 'Settings', 
          action: () => setActiveView('settings') 
        },
      ]
    }
  ];
  
  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewTab setActiveView={handleViewChange} user={authUser} />;

      case 'challenges':
        return <ChallengesTab setActiveView={handleViewChange}/>;
      
      case 'profile':
        return <ProfileTab user={authUser} />;
      
      case 'teams':
        return <TeamsTab />;

      case 'do-challenge':
        return <ChallengesView challengeId={viewData} onBack={() => setActiveView('challenges')} setActiveView={setActiveView} />;

      case 'settings':
        return <SettingsTab user={authUser} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <MobileHeader 
        user={authUser}
        onSignOut={handleSignOut}
      />
        <aside className={cn(
          "fixed left-0 top-0 h-screen bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 z-50",
          "w-72 hidden lg:block"
        )}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
              <Logo class_name="" />
            </div>
            
            <nav className="flex-1 p-6">
              <div className="space-y-6">
                {MENU_ITEMS.map((menu) => (
                  <div key={menu.label}>
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
                      {menu.label}
                    </div>
                    <div className="space-y-1">
                      {menu.items.map((item) => (
                        <Button 
                          key={item.text}
                          variant="ghost" 
                          className={`w-full justify-start h-11 px-3 ${
                            activeView === item.text.toLowerCase() 
                              ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          } rounded-lg transition-all duration-200 group`}
                          onClick={item.action}
                        >
                          <item.icon className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                          <span className="font-medium">{item.text}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
                      {authUser?.fullName?.[0] || 'A'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{authUser?.fullName || 'Admin User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{authUser?.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 h-9 text-sm"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <main className={cn(
          "transition-all duration-300 ease-out",
          "lg:ml-72",
          "px-3 sm:px-4 lg:px-6 xl:px-8",
          "pt-16 sm:pt-20 lg:pt-6 pb-20 lg:pb-8",
        )}>
          <div className="max-w-7xl mx-auto">
            {renderMainContent()}
          </div>
        </main>

      <MobileTabNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default Dashboard; 