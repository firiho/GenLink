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
import ChallengesTab from '@/components/dashboard/ChallengesTab';
import TeamsTab from '@/components/dashboard/TeamsTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';

const Dashboard = () => {
  const { user: authUser, loading } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  
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

  if (!authUser) {
    return <Navigate to="/signin" />;
  }

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
      label: 'Settings',
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
        return <OverviewTab setActiveView={setActiveView} user={authUser} />;

      case 'challenges':
        return <ChallengesTab />;
      
      case 'profile':
        return <ProfileTab user={authUser} />;
      
      case 'teams':
        return <TeamsTab />;

      case 'settings':
        return <SettingsTab user={authUser} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <MobileHeader 
        user={authUser}
        onSignOut={handleSignOut}
      />
        <aside className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50",
          "w-72 hidden lg:block"
        )}>
          <div className="flex flex-col h-full">
            <Logo class_name="ml-4" />
            
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {MENU_ITEMS.map((menu) => (
                  <div key={menu.label}>
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                      {menu.label}
                    </div>
                    {menu.items.map((item) => (
                      <Button 
                        key={item.text}
                        variant="ghost" 
                        className={`w-full justify-start ${
                          activeView === item.text.toLowerCase() 
                            ? 'text-primary bg-primary/5'
                            : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                        } rounded-xl`}
                        onClick={item.action}
                      >
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.text}
                      </Button>
                    ))}
                  </div>
                ))}
              </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {authUser?.fullName?.[0] || 'A'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{authUser?.fullName || 'Admin User'}</p>
                    <p className="text-sm text-gray-500">{authUser?.email}</p>
                  </div>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </aside>
        <main className={cn(
          "transition-all duration-200 ease-in-out",
          "lg:ml-72",
          "px-3 sm:px-6 lg:px-8",
          "pt-20 sm:pt-17 lg:pt-1 pb-20 lg:pb-12",
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