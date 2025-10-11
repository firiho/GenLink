import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { signOut } from '@/services/auth';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import AuthLoadingScreen from '@/components/ui/auth-loading-screen';
import MobileHeader from '@/components/dashboard/MobileHeader';
import MobileTabNav from '@/components/partner-dashboard/MobileTabNav';
import Logo from '@/components/Logo';
import { OverviewView } from '@/components/partner-dashboard/OverviewView';
import SubmissionsView from '@/components/partner-dashboard/SubmissionsView';
import { SettingsView } from '@/components/partner-dashboard/SettingsView';
import { ChallengesView } from '@/components/partner-dashboard/ChallengesView';
import { NewChallengeForm } from '@/components/partner-dashboard/NewChallengeForm';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import PreviewChallenge from '@/components/partner-dashboard/PreviewChallenge';
import { getPartnerTabFromPath, getPartnerRouteFromTab, type PartnerTab } from '@/lib/routing';

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, loading } = useAuth();
  
  // Initialize state from URL
  const [activeView, setActiveView] = useState<PartnerTab>(() => 
    getPartnerTabFromPath(location.pathname)
  );
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [fetchingChallenges, setFetchingChallenges] = useState(true);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(true);
  const [viewData, setViewData] = useState(null);
  const previousView = useRef(activeView);

  // Sync state with URL on mount and browser navigation
  useEffect(() => {
    // Set initial tab from URL
    const initialTab = getPartnerTabFromPath(location.pathname);
    setActiveView(initialTab);

    // Handle browser back/forward buttons
    const handlePopState = () => {
      const newTab = getPartnerTabFromPath(window.location.pathname);
      setActiveView(newTab);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []); // Only run once on mount

  // Extract the fetch function so we can reuse it
  const fetchChallenges = async () => {
    if (!authUser || !authUser.uid) return;
    
    setFetchingChallenges(true);
    try {
      // Query challenges where createdBy equals current user's UID
      const challengesQuery = query(
        collection(db, 'challenges'), 
        where('createdBy', '==', authUser.uid)
      );
      
      const querySnapshot = await getDocs(challengesQuery);
      const challengesList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamps to JS dates
        const createdAt = data.createdAt?.toDate ? 
          data.createdAt.toDate().toISOString() : 
          data.createdAt;
          
        const updatedAt = data.updatedAt?.toDate ? 
          data.updatedAt.toDate().toISOString() : 
          data.updatedAt;
          
        const deadline = data.deadline;
        
        // Calculate days left          
        const daysLeft = deadline ? 
          Math.max(0, Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 
          'Unknown';
        
        return {
          id: doc.id,
          ...data,
          createdAt,
          updatedAt,
          daysLeft,
          participants: data.participants || 0,
          submissions: data.submissions || 0,
        };
      });
      
      setChallenges(challengesList);
      console.log("Challenges refreshed:", challengesList.length);
      
      // Fetch submissions for these challenges
      if (challengesList.length > 0) {
        fetchSubmissions(challengesList.map(c => c.id));
      } else {
        setFetchingSubmissions(false);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setFetchingSubmissions(false);
    } finally {
      setFetchingChallenges(false);
    }
  };
  
  // New function to fetch submissions
  const fetchSubmissions = async (challengeIds) => {
    if (!challengeIds || challengeIds.length === 0) {
      setSubmissions([]);
      setFetchingSubmissions(false);
      return;
    }
    
    setFetchingSubmissions(true);
    try {
      // Get all submissions for challenges created by this partner
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('challengeId', 'in', challengeIds.slice(0, 10)) // Firestore limits 'in' queries to 10 items
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      const submissionsPromises = submissionsSnapshot.docs.map(async (submissionDoc) => {
        const data = submissionDoc.data();
        
        
        // Get public profile for avatar
        const publicProfileRef = doc(db, 'public_profiles', data.userId);
        const publicProfileSnap = await getDoc(publicProfileRef);
        const publicProfileData = publicProfileSnap.exists() ? publicProfileSnap.data() : {};
        
        console.log("Public Profile Data:", publicProfileData);
        // Get challenge data
        const challengeRef = doc(db, 'challenges', data.challengeId);
        const challengeSnap = await getDoc(challengeRef);
        const challengeData = challengeSnap.exists() ? challengeSnap.data() : {};
        
        console.log("Challenge Data:", challengeData);
        // Convert timestamps
        const submittedAt = data.createdAt?.toDate ? 
          data.createdAt.toDate().toISOString() : 
          data.createdAt;
          
        const updatedAt = data.updatedAt?.toDate ? 
          data.updatedAt.toDate().toISOString() : 
          data.updatedAt;
        
        return {
          id: submissionDoc.id,
          title: challengeData.title || 'Unnamed Challenge',
          challenge: challengeData.title || 'Unnamed Challenge',
          challengeId: data.challengeId,
          githubUrl: data.submissionUrl || '',
          participant: {
            uid: data.userId,
            name: publicProfileData.name || 'Anonymous User',
            email: publicProfileData.email || 'No email provided',
            avatar: publicProfileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(publicProfileData.fullName || 'U')}`
          },
          status: data.status || 'pending',
          submittedAt: submittedAt,
          lastUpdated: updatedAt,
          tags: challengeData.tags || [],
          score: data.score || 0,
          feedback: data.feedback || '',
          note: data.note || ''
        };
      });
      
      // Use Promise.all to process all promises in parallel
      const submissionsList = await Promise.all(submissionsPromises);
      
      // Sort submissions by date (newest first)
      submissionsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      
      setSubmissions(submissionsList);
      console.log("Submissions refreshed:", submissionsList.length);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setFetchingSubmissions(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    if (authUser) {
      fetchChallenges();
    }
  }, [authUser]);

  // Only fetch when specifically going to relevant views
  useEffect(() => {
    // Fetch challenges when returning to these views
    if ((activeView === 'challenges' && previousView.current === 'create-challenge') ||
        (activeView === 'overview' && 
         (previousView.current === 'create-challenge' || 
          previousView.current === 'preview-challenge'))) {
      fetchChallenges();
    }
    
    // Fetch submissions when going to submissions view
    if (activeView === 'submissions' && previousView.current !== 'submissions') {
      // If we already have challenge IDs, fetch submissions directly
      if (challenges.length > 0) {
        fetchSubmissions(challenges.map(c => c.id));
      }
    }
    
    // Update the previous view ref
    previousView.current = activeView;
  }, [activeView, challenges]);

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
    const route = getPartnerRouteFromTab(view);
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

  const isLoading = loading || fetchingChallenges || 
    (activeView === 'submissions' && fetchingSubmissions);

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <OverviewView 
            user={authUser} 
            recentChallenges={challenges.slice(0, 3)} 
            recentSubmissions={submissions.slice(0, 5)} 
            setActiveView={handleViewChange}
          />
        );

      case 'challenges':
        return (
          <ChallengesView 
            challenges={challenges} 
            setActiveView={handleViewChange}
            refreshChallenges={fetchChallenges}
          />
        );

      case 'submissions':
        return (
          <SubmissionsView 
            submissions={submissions} 
            challenges={challenges}
            refreshSubmissions={() => fetchSubmissions(challenges.map(c => c.id))}
            isLoading={fetchingSubmissions}
          />
        );

        case 'create-challenge':
          return (
            <NewChallengeForm 
              setActiveView={handleViewChange}
              editMode={viewData?.editMode || false}
              existingChallenge={viewData?.challenge || null}
            />
          );

      case 'settings':
        return (
          <SettingsView 
            user={authUser} 
            onSaveChanges={() => {}}
          />  
        );

        case 'preview-challenge':
          return (
            <PreviewChallenge 
              challenge={viewData?.challenge}
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
                    {authUser?.fullName?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{authUser?.fullName || 'Partner User'}</p>
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
          {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingScreen />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          {renderMainContent()}
        </div>
      )}  
      </main>
      {/* Rest of the component render code */}
      <MobileTabNav activeView={activeView} setActiveView={handleViewChange} />
    </div>
  );
};

export default PartnerDashboard;