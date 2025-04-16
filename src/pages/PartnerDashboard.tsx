import { useState } from 'react';
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

const PartnerDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const navigate = useNavigate();
  const { user: authUser, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const challenges = [
    {
      id: '1',
      title: 'AI Innovation Challenge 2024',
      description: 'Looking for breakthrough AI solutions in healthcare',
      organization: 'TechCorp International',
      status: 'active',
      participants: 234,
      submissions: 89,
      progress: 75,
      daysLeft: 12,
      prize: '$75,000',
      deadline: '2024-05-20',
      categories: ['AI', 'Healthcare'],
      createdAt: '2024-01-15',
      updatedAt: '2024-03-01'
    },
    {
      id: '2',
      title: 'Sustainable Energy Challenge',
      description: 'Developing renewable energy solutions for rural areas',
      organization: 'TechCorp International',
      status: 'draft',
      participants: 0,
      submissions: 0,
      progress: 0,
      daysLeft: 30,
      prize: '$50,000',
      deadline: '2024-06-15',
      categories: ['CleanTech', 'Sustainability'],
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    }
  ];

  const submissions = [
    {
      id: '1',
      title: 'AI Healthcare Assistant',
      challenge: 'AI Innovation Challenge 2024',
      githubUrl: 'https://github.com/user/ai-healthcare',
      participant: {
        name: 'John Smith',
        email: 'john@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Smith'
      },
      status: 'pending',
      submittedAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z',
      tags: ['AI', 'Healthcare', 'Python'],
      score: 0
    },
    {
      id: '2',
      title: 'Smart Diagnosis System',
      challenge: 'Sustainable Energy Challenge',
      githubUrl: 'https://github.com/user/smart-diagnosis',
      participant: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
      },
      status: 'pending',
      submittedAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z',
      tags: ['AI', 'Healthcare', 'Python'],
      score: 0
    },
  ];

  if (loading) {
      return <LoadingScreen />;
    }
  
    if (!authUser) {
      return <Navigate to="/signin" />;
    }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
            < OverviewView user={authUser} recentChallenges={challenges} recentSubmissions={submissions} setActiveView={setActiveView}/>
        );

      case 'challenges':
        return (
            <ChallengesView challenges={challenges} setActiveView={setActiveView}/>
        );

      case 'submissions':
        return (
          <SubmissionsView submissions={submissions} challenges={challenges}/>
        );

      case 'create-challenge':
        return (
          <NewChallengeForm />
        );

      case 'settings':
        return (
            <SettingsView user={authUser} onSaveChanges={() => {}}/>  
        );

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
        <div className="max-w-7xl mx-auto">
          {renderMainContent()}
        </div>
      </main>

      <MobileTabNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default PartnerDashboard; 