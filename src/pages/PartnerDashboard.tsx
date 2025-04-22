import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { signOut } from '@/services/auth';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
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

const PartnerDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const navigate = useNavigate();
  const { user: authUser, loading } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [fetchingChallenges, setFetchingChallenges] = useState(true);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(true);
  const [viewData, setViewData] = useState(null);
  const previousView = useRef(activeView);

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

  const handleViewChange = (view, data = null) => {
    setActiveView(view);
    setViewData(data);
  };

  if (!authUser) {
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
    <div className="min-h-screen bg-gray-50/50">
      {/* Rest of the component render code */}
      <MobileHeader
        user={authUser}
        onSignOut={handleSignOut}
      />

      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50",
        "w-72 hidden lg:block"
      )}>
        {/* Sidebar content remains the same */}
        <div className="flex flex-col h-full">
          <Logo class_name="ml-4" />

          <nav className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Main
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'overview' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('overview')}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Overview
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'challenges' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('challenges')}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Challenges
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'submissions' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('submissions')}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Submissions
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Settings
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'settings' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('settings')}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </div>
              </div>
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
      <MobileTabNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default PartnerDashboard;