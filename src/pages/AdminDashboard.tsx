import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth';
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { 
  LayoutDashboard, Users, Shield, Settings, LogOut, 
  MessagesSquare, BarChart, Building2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from "@/lib/utils";
import MobileHeader from '@/components/dashboard/MobileHeader';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import AuthLoadingScreen from '@/components/ui/auth-loading-screen';
import Overview from '@/components/admin-dashboard/Overview';
import Partners from '@/components/admin-dashboard/Partners';
import Communities from '@/components/admin-dashboard/Communities';
import Support from '@/components/admin-dashboard/Support';
import Analytics from '@/components/admin-dashboard/Analytics';
import SettingsPanel from '@/components/admin-dashboard/SettingsPanel';
import AdminMobileTabNav from '@/components/admin-dashboard/AdminMobileTabNav';
import { getAdminTabFromPath, getAdminRouteFromTab, type AdminTab } from '@/lib/routing';

const AdminDashboard = () => {
  const { user: authUser, loading } = useAuth();
  const { actualTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize state from URL
  const [activeView, setActiveView] = useState<AdminTab>(() => 
    getAdminTabFromPath(location.pathname)
  );

  // Sync state with URL on mount and browser navigation
  useEffect(() => {
    // Set initial tab from URL
    const initialTab = getAdminTabFromPath(location.pathname);
    setActiveView(initialTab);

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const newTab = getAdminTabFromPath(window.location.pathname);
      setActiveView(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

  const handleViewChange = (view: AdminTab) => {
    // Update local state
    setActiveView(view);
    
    // Update URL without page reload
    const route = getAdminRouteFromTab(view);
    if (route !== window.location.pathname) {
      window.history.pushState(null, '', route);
    }
  };

  const MENU_ITEMS = [
    {
      label: 'Main',
      items: [
        { 
          icon: LayoutDashboard, 
          text: 'Overview', 
          action: () => handleViewChange('overview') 
        },
        { 
          icon: Building2, 
          text: 'Partner Applications', 
          action: () => handleViewChange('partners') 
        },
        { 
          icon: Users, 
          text: 'Communities', 
          action: () => handleViewChange('communities') 
        },
        { 
          icon: MessagesSquare, 
          text: 'Support', 
          action: () => handleViewChange('support') 
        },
      ]
    },
    {
      label: 'System',
      items: [
        { 
          icon: BarChart, 
          text: 'Analytics', 
          action: () => handleViewChange('analytics') 
        },
        { 
          icon: Settings, 
          text: 'Settings', 
          action: () => handleViewChange('settings') 
        },
      ]
    }
  ];

  

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

  // Show auth loading screen while authentication is being verified
  if (loading) {
    return <AuthLoadingScreen />;
  }
  
  // Only redirect to admin login if we're not loading and there's no user or user is not admin
  if (!loading && (!authUser || authUser.role !== 'admin')) {
    return <Navigate to="/admin/login" />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return <Overview setActiveView={setActiveView}/>;
      case 'partners':
        return <Partners />;
      case 'communities':
        return <Communities />;
      case 'support':
        return <Support />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "min-h-screen",
      actualTheme === 'dark' ? "bg-slate-900" : "bg-gray-50/50"
    )}>
      <MobileHeader 
        user={authUser}
        onSignOut={handleSignOut}
      />

      <aside className={cn(
        "fixed left-0 top-0 h-screen border-r z-50",
        "w-72 hidden lg:block",
        actualTheme === 'dark' 
          ? "bg-slate-900 border-slate-800" 
          : "bg-white border-gray-200"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className={cn(
            "p-6 border-b",
            actualTheme === 'dark' ? "border-slate-800" : "border-gray-200"
          )}>
            <Link to="/" className="flex items-center space-x-2">
              <div className={cn(
                "p-2 rounded-xl",
                actualTheme === 'dark' 
                  ? "bg-blue-500/20" 
                  : "bg-primary/10"
              )}>
                <Shield className={cn(
                  "h-6 w-6",
                  actualTheme === 'dark' 
                    ? "text-blue-400" 
                    : "text-primary"
                )} />
              </div>
              <h1 className={cn(
                "text-2xl font-bold",
                actualTheme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                Admin Panel
              </h1>
            </Link>
          </div>

          <nav className="flex-1 p-4">
            <div className="space-y-6">
              {MENU_ITEMS.map((menu) => (
                <div key={menu.label}>
                  <div className={cn(
                    "text-xs font-semibold uppercase tracking-wider px-4 mb-2",
                    actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {menu.label}
                  </div>
                  {menu.items.map((item) => (
                    <Button 
                      key={item.text}
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start mb-1 rounded-xl transition-all duration-200",
                        activeView === item.text.toLowerCase() 
                          ? actualTheme === 'dark'
                            ? 'text-blue-400 bg-blue-500/20 border border-blue-500/30'
                            : 'text-primary bg-primary/10 border border-primary/20'
                          : actualTheme === 'dark'
                            ? 'text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-200'
                      )}
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

          <div className={cn(
            "p-4 border-t",
            actualTheme === 'dark' ? "border-slate-800" : "border-gray-200"
          )}>
            <div className={cn(
              "rounded-xl p-4",
              actualTheme === 'dark' ? "bg-slate-800" : "bg-gray-50"
            )}>
              {/* User profile section */}
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {authUser?.firstName?.[0] || 'A'}
                  </span>
                </div>
                <div>
                  <p className={cn(
                    "font-medium",
                    actualTheme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {authUser?.firstName || 'Admin'}
                  </p>
                  <p className={cn(
                    "text-sm",
                    actualTheme === 'dark' ? "text-slate-400" : "text-gray-500"
                  )}>
                    {authUser?.email}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-400/10"
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
        "px-4 sm:px-6 lg:px-8",
        "pt-14 pb-20 lg:pb-12"
      )}>
        <div className="max-w-7xl mx-auto my-4">
          {renderMainContent()}
        </div>
      </main>

      <AdminMobileTabNav 
        activeView={activeView} 
        setActiveView={handleViewChange} 
      />
    </div>
  );
};

export default AdminDashboard;