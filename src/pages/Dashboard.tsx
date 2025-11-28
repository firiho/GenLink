import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/services/auth';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { LayoutDashboard, Users, Trophy, Settings, LogOut, User, FolderOpen, Calendar} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import MobileHeader from '@/components/dashboard/MobileHeader';
import MobileTabNav from '@/components/dashboard/MobileTabNav';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import AuthLoadingScreen from '@/components/ui/auth-loading-screen';
import Logo from '@/components/Logo';
import OverviewTab from '@/components/dashboard/OverviewTab';
import ChallengesTab from '@/components/dashboard/challenges/ChallengesTab';
import ProjectsTab from '@/components/dashboard/projects/ProjectsTab';
import CreateProject from '@/components/dashboard/projects/CreateProject';
import ProjectView from '@/components/dashboard/projects/ProjectView';
import EventsTab from '@/components/dashboard/events/EventsTab';
import CreateEvent from '@/components/dashboard/events/CreateEvent';
import EventView from '@/components/dashboard/events/EventView';
import TeamsTab from '@/components/dashboard/TeamsTab';
import SettingsTab from '@/components/dashboard/SettingsTab';
import ProfileTab from '@/components/dashboard/ProfileTab';
import ChallengesView from '@/components/dashboard/challenges/ChallengesView';
import TeamManagement from '@/pages/TeamManagement';
import NotificationsPage from '@/components/dashboard/NotificationsPage';
import { getDashboardTabFromPath, getDashboardRouteFromTab, type DashboardTab } from '@/lib/routing';

const Dashboard = () => {
  const { user: authUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  
  // Initialize state from URL
  const [activeView, setActiveView] = useState<DashboardTab>(() => 
    getDashboardTabFromPath(location.pathname)
  );
  const [viewData, setViewData] = useState(null);

  // Extract team ID from URL if on team management route
  const getTeamIdFromPath = () => {
    // Try both absolute (/dashboard/teams/:id) and relative (teams/:id) patterns
    const match = location.pathname.match(/\/teams\/([^/]+)$/);
    return match ? match[1] : null;
  };

  // Extract project ID from URL if on project route
  const getProjectIdFromPath = () => {
    // Handle both /projects/:id and /projects/:id/edit
    const match = location.pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : null;
  };

  // Extract challenge ID from URL if on challenge route
  const getChallengeIdFromPath = () => {
    const match = location.pathname.match(/\/challenges\/([^/]+)$/);
    return match ? match[1] : null;
  };

  // Extract event ID from URL if on event route
  const getEventIdFromPath = () => {
    // Handle both /events/:id and /events/:id/edit
    // Don't match "create" as an event ID
    const match = location.pathname.match(/\/events\/([^/]+)/);
    if (match && match[1] !== 'create') {
      return match[1];
    }
    return null;
  };

  // Sync state with URL on mount and browser navigation
  useEffect(() => {
    // Set initial tab from URL
    const initialTab = getDashboardTabFromPath(location.pathname);
    setActiveView(initialTab);
    
    // Extract project/team/challenge/event ID from URL if present
    if (initialTab === 'project' || initialTab === 'edit-project') {
      const projectId = getProjectIdFromPath();
      if (projectId) setViewData(projectId);
    } else if (initialTab === 'team-manage') {
      const teamId = getTeamIdFromPath();
      if (teamId) setViewData(teamId);
    } else if (initialTab === 'challenge' ) {
      const challengeId = getChallengeIdFromPath();
      if (challengeId) setViewData(challengeId);
    } else if (initialTab === 'event' || initialTab === 'edit-event') {
      const eventId = getEventIdFromPath();
      if (eventId) setViewData(eventId);
    }
  }, [location.pathname]); // Sync whenever pathname changes

  useEffect(() => {
    // Handle browser back/forward buttons
    const handlePopState = () => {
      const newTab = getDashboardTabFromPath(window.location.pathname);
      setActiveView(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

  const handleViewChange = (view: DashboardTab, data = null) => {
    // Update local state first
    setActiveView(view);
    setViewData(data);
    
    // Update URL without page reload
    let route = getDashboardRouteFromTab(view);
    
    // Handle routes that need IDs appended
    if (view === 'project' && data) {
      route = `/dashboard/projects/${data}`;
    } else if (view === 'team-manage' && data) {
      route = `/dashboard/teams/${data}`;
    } else if (view === 'edit-project' && data) {
      route = `/dashboard/projects/${data}/edit`;
    } else if (view === 'challenge' && data) {
      route = `/dashboard/challenges/${data}`;
    } else if (view === 'event' && data) {
      route = `/dashboard/events/${data}`;
    } else if (view === 'edit-event' && data) {
      route = `/dashboard/events/${data}/edit`;
    }
    
    // Use React Router's navigate to ensure proper URL updates and component re-rendering
    if (route !== location.pathname) {
      navigate(route, { replace: false });
    }
  };
  
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Check onboarding status AFTER all other hooks
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading && authUser) {
        if (!authUser.onboardingComplete) {
          navigate('/onboarding');
        } else {
          setCheckingOnboarding(false);
        }
      } else if (!loading && !authUser) {
        setCheckingOnboarding(false);
      }
    };
    
    checkOnboarding();
  }, [authUser, loading, navigate]);

  // Only redirect to signin if we're not loading and there's no user
  useEffect(() => {
    if (!loading && !authUser) {
      navigate('/signin');
    }
  }, [loading, authUser, navigate]);

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
  if (loading || checkingOnboarding) {
    return <AuthLoadingScreen />;
  }
  

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
          icon: Trophy, 
          text: 'Challenges', 
          action: () => handleViewChange('challenges') 
        },
        { 
          icon: FolderOpen, 
          text: 'Projects', 
          action: () => handleViewChange('projects') 
        },
        { 
          icon: Users, 
          text: 'Teams', 
          action: () => handleViewChange('teams') 
        },
        { 
          icon: Calendar, 
          text: 'Events', 
          action: () => handleViewChange('events') 
        },
      ]
    },
    {
      label: 'Account',
      items: [
        { 
          icon: User, 
          text: 'Profile', 
          action: () => handleViewChange('profile') 
        },
        { 
          icon: Settings, 
          text: 'Settings', 
          action: () => handleViewChange('settings') 
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
      
      case 'projects':
        return <ProjectsTab setActiveView={handleViewChange} />;
      
      case 'create-project':
        return <CreateProject 
          challengeContext={viewData}
          onBack={() => handleViewChange('projects')}
          setActiveView={handleViewChange}
        />;
      
      case 'project':
        return <ProjectView 
          projectId={viewData || getProjectIdFromPath()}
          onBack={() => handleViewChange('projects')}
          setActiveView={handleViewChange}
        />;
      
      case 'edit-project':
        return <CreateProject 
          projectId={viewData || getProjectIdFromPath()}
          onBack={() => handleViewChange('project', viewData || getProjectIdFromPath())}
          setActiveView={handleViewChange}
        />;
      
      case 'events':
        return <EventsTab setActiveView={handleViewChange} />;
      
      case 'create-event':
        return <CreateEvent 
          onBack={() => handleViewChange('events')}
          setActiveView={handleViewChange}
        />;
      
      case 'event':
        return <EventView 
          eventId={viewData || getEventIdFromPath()}
          onBack={() => handleViewChange('events')}
          setActiveView={handleViewChange}
        />;
      
      case 'edit-event':
        return <CreateEvent 
          eventId={viewData || getEventIdFromPath()}
          onBack={() => handleViewChange('event', viewData || getEventIdFromPath())}
          setActiveView={handleViewChange}
        />;
      
      case 'profile':
        return <ProfileTab user={authUser} />;
      
      case 'teams':
        return <TeamsTab setActiveView={handleViewChange} />;
      
      case 'teams-invitations':
        return <TeamsTab initialTab="invitations" setActiveView={handleViewChange} />;
      
      case 'team-manage':
        // Use viewData if available (from handleViewChange), otherwise try to get from URL
        const teamIdForManage = viewData || getTeamIdFromPath();
        return <TeamManagement teamId={teamIdForManage} />;

      case 'challenge':
        return <ChallengesView challengeId={viewData || getChallengeIdFromPath()} onBack={() => handleViewChange('challenges')} setActiveView={handleViewChange} />;

      case 'notifications':
        return <NotificationsPage />;

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
                      {authUser?.firstName?.[0] || authUser?.lastName?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {authUser?.firstName && authUser?.lastName 
                        ? `${authUser.firstName} ${authUser.lastName}`
                        : authUser?.firstName || authUser?.lastName || 'User'}
                    </p>
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

      <MobileTabNav activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default Dashboard;