import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { toast, Toaster } from 'sonner';
import { useEffect } from 'react';
import AuthLoadingScreen from '@/components/ui/auth-loading-screen';
import PartnerDashboard from '@/pages/PartnerDashboard';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import Index from '@/pages/Index';
import Challenges from '@/pages/Challenges';
import Projects from '@/pages/Projects';
import Community from '@/pages/Community';
import Dashboard from '@/pages/Dashboard';
import ForgotPassword from '@/pages/ForgotPassword';
import PartnerPending from '@/pages/PartnerPending';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import ChallengeView from '@/pages/ChallengeView';
import VerifyAction from '@/pages/VerifyAction';
import EmailVerification from '@/pages/EmailVerification';
import Onboarding from '@/pages/Onboarding';
import UserProfile from '@/pages/UserProfile';
import TeamDetails from '@/pages/TeamDetails';
import EventDetails from '@/pages/EventDetails';
import { auth } from '@/lib/firebase';

const PartnerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'partner') {
        toast.error('You are not registered as a partner!');
        navigate('/signin');
      } else if (!auth.currentUser?.emailVerified) {
        // Redirect to email verification if not verified
        navigate('/email-verification');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return user?.role === 'partner' && auth.currentUser?.emailVerified ? children : null;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return user?.role === 'admin' ? children : null;
}

const ParticipantRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'participant') {
        toast.error('You are not registered as a participant!');
        navigate('/signin');
      } else if (!auth.currentUser?.emailVerified) {
        // Redirect to email verification if not verified
        navigate('/email-verification');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <AuthLoadingScreen />;
  }

  return user?.role === 'participant' && auth.currentUser?.emailVerified ? children : null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenge/:id" element={<ChallengeView />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/community" element={<Community />} />
            <Route path="/u/:id" element={<UserProfile />} />
            <Route path="/t/:id" element={<TeamDetails />} />
            <Route path="/e/:id" element={<EventDetails />} />
            <Route path="/verify" element={<VerifyAction />} />
            <Route path="/email-verification" element={<EmailVerification />} />
            <Route 
              path="/onboarding" 
              element={
                <ParticipantRoute>
                  <Onboarding />
                </ParticipantRoute>
              } 
            />
            {/* Dashboard routes with wildcards for deep linking */}
            <Route 
              path="/dashboard/*" 
              element={
                <ParticipantRoute>
                  <Dashboard />
                </ParticipantRoute>
              }
            />
            <Route path="/partner-pending" element={<PartnerPending />} />
            <Route 
              path="/partner/dashboard/*" 
              element={
                <PartnerRoute>
                  <PartnerDashboard />
                </PartnerRoute>
              } 
            />
            <Route 
              path="/admin/dashboard/*" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
