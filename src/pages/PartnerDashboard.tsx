import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { signOut } from '@/services/auth';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import AuthLoadingScreen from '@/components/ui/auth-loading-screen';
import MobileHeader from '@/components/dashboard/MobileHeader';
import MobileTabNav from '@/components/partner-dashboard/MobileTabNav';
import Logo from '@/components/Logo';
import { OverviewView } from '@/components/partner-dashboard/OverviewView';
import SubmissionsView from '@/components/partner-dashboard/SubmissionsView';
import { SettingsView } from '@/components/partner-dashboard/SettingsView';
import { ChallengesView, NewChallengeForm, PreviewChallenge } from '@/components/partner-dashboard/challenges';
import EventsTab from '@/components/dashboard/events/EventsTab';
import CreateEvent from '@/components/dashboard/events/CreateEvent';
import EventView from '@/components/dashboard/events/EventView';

import NotificationsPage from '@/components/dashboard/NotificationsPage';
import { getPartnerTabFromPath, getPartnerRouteFromTab, type PartnerTab } from '@/lib/routing';
import { PERMISSIONS } from '@/constants/permissions';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, loading } = useAuth();
  
  // Initialize state from URL
  const [activeView, setActiveView] = useState<PartnerTab>(() => 
    getPartnerTabFromPath(location.pathname)
  );
  const [viewData, setViewData] = useState(null);

  const hasPermission = (permission: string) => {
    return authUser?.permissions?.includes(permission);
  };

  const getEventIdFromPath = () => {
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
    const initialTab = getPartnerTabFromPath(location.pathname);
    setActiveView(initialTab);
    
    // Extract event ID from URL if present
    if (initialTab === 'event' || initialTab === 'edit-event') {
      const eventId = getEventIdFromPath();
      if (eventId) setViewData(eventId);
    }
  }, [location.pathname]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewChange = (view: PartnerTab, data = null) => {
    // Update local state
    setActiveView(view);
    setViewData(data);
    
    // Update URL without page reload
    let route = getPartnerRouteFromTab(view);
    
    // Handle routes that need IDs appended
    if (view === 'event' && data) {
      route = `/partner/dashboard/events/${data}`;
    } else if (view === 'edit-event' && data) {
      route = `/partner/dashboard/events/${data}/edit`;
    }
    
    if (route !== window.location.pathname) {
      window.history.pushState(null, '', route);
    }
  };

  // Show auth loading screen while authentication is being verified
  if (loading) {
    return <AuthLoadingScreen />;
  }

  // Only redirect to signin if we're not loading and there's no user
  if (!loading && !authUser) {
    return <Navigate to="/signin" />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewView 
            user={authUser} 
            setActiveView={handleViewChange}
          />
        );

      case 'challenges':
        if (!hasPermission(PERMISSIONS.MANAGE_CHALLENGES)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <ChallengesView 
            setActiveView={handleViewChange}
            user={authUser}
          />
        );

      case 'submissions':
        if (!hasPermission(PERMISSIONS.MANAGE_SUBMISSIONS)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <SubmissionsView 
            user={authUser}
          />
        );

        case 'create-challenge':
          if (!hasPermission(PERMISSIONS.MANAGE_CHALLENGES)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
          return (
            <NewChallengeForm 
              setActiveView={handleViewChange}
              editMode={viewData?.editMode || false}
              existingChallenge={viewData?.challenge || null}
            />
          );

      case 'preview-challenge':
        if (!hasPermission(PERMISSIONS.MANAGE_CHALLENGES)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <PreviewChallenge 
            challenge={viewData?.challenge}
            setActiveView={handleViewChange}
          />
        );

      case 'settings':
        return (
          <SettingsView 
            user={authUser} 
            onSaveChanges={() => {}}
          />
        );

      case 'notifications':
        return <NotificationsPage />;

      case 'events':
        if (!hasPermission(PERMISSIONS.MANAGE_EVENTS)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <EventsTab setActiveView={handleViewChange} />
        );

      case 'create-event':
        if (!hasPermission(PERMISSIONS.MANAGE_EVENTS)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <CreateEvent 
            onBack={() => handleViewChange('events')} 
            setActiveView={handleViewChange}
          />
        );

      case 'edit-event':
        if (!hasPermission(PERMISSIONS.MANAGE_EVENTS)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <CreateEvent 
            eventId={viewData} 
            onBack={() => handleViewChange('events')} 
            setActiveView={handleViewChange}
          />
        );

      case 'event':
        if (!hasPermission(PERMISSIONS.MANAGE_EVENTS)) return <div className="p-8 text-center text-slate-500">Access Denied</div>;
        return (
          <EventView 
            eventId={viewData} 
            onBack={() => handleViewChange('events')} 
            setActiveView={handleViewChange}
          />
        );

      default:
        return null;
    }
  };

  // Rest of the component remains the same...
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
        {/* Sidebar content remains the same */}
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50">
            <Logo class_name="" />
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
                  Main
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-11 px-3 ${
                      activeView === 'overview' 
                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    } rounded-lg transition-all duration-200 group`}
                    onClick={() => handleViewChange('overview')}
                  >
                    <LayoutDashboard className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-medium">Overview</span>
                  </Button>
                  
                  {hasPermission(PERMISSIONS.MANAGE_CHALLENGES) && (
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-11 px-3 ${
                        activeView === 'challenges' 
                          ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      } rounded-lg transition-all duration-200 group`}
                      onClick={() => handleViewChange('challenges')}
                    >
                      <FileText className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Challenges</span>
                    </Button>
                  )}

                  {hasPermission(PERMISSIONS.MANAGE_SUBMISSIONS) && (
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-11 px-3 ${
                        activeView === 'submissions' 
                          ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      } rounded-lg transition-all duration-200 group`}
                      onClick={() => handleViewChange('submissions')}
                    >
                      <Users className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Submissions</span>
                    </Button>
                  )}

                  {hasPermission(PERMISSIONS.MANAGE_EVENTS) && (
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-11 px-3 ${
                        activeView === 'events' 
                          ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      } rounded-lg transition-all duration-200 group`}
                      onClick={() => handleViewChange('events')}
                    >
                      <Calendar className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Events</span>
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
                  Settings
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-11 px-3 ${
                      activeView === 'settings' 
                        ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    } rounded-lg transition-all duration-200 group`}
                    onClick={() => handleViewChange('settings')}
                  >
                    <Settings className="mr-3 h-4 w-4 transition-transform group-hover:scale-110" />
                    <span className="font-medium">Settings</span>
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-6 border-t border-slate-200/50 dark:border-slate-800/50">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold text-sm">
                    {authUser?.firstName?.[0] || authUser?.lastName?.[0] || 'P'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                    {authUser?.firstName && authUser?.lastName 
                      ? `${authUser.firstName} ${authUser.lastName}`
                      : authUser?.firstName || authUser?.lastName || 'Partner User'}
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
      {/* Rest of the component render code */}
      <MobileTabNav activeView={activeView} setActiveView={handleViewChange} user={authUser} />
    </div>
  );
};

export default PartnerDashboard;