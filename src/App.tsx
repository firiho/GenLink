import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { toast, Toaster } from 'sonner';
import { useEffect } from 'react';
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

const PartnerRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'partner') {
      toast.error('You are not registed as a partner!');
      navigate('/signin');
    }
  }, [user, navigate]);

  return user?.role === 'partner' ? children : null;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/signin');
    }
  }, [user, navigate]);

  return user?.role === 'admin' ? children : null;
}

const ParticipantRoute = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'participant') {
      toast.error('You are not registed as a participant!');
      navigate('/signin');
    }
  }, [user, navigate]);

  return user?.role === 'participant' ? children : null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/community" element={<Community />} />
          <Route 
            path="/dashboard" 
            element={
              <ParticipantRoute>
                <Dashboard />
              </ParticipantRoute>
            }
          />
          <Route path="/partner-pending" element={<PartnerPending />} />
          <Route 
            path="/partner-dashboard" 
            element={
              <PartnerRoute>
                <PartnerDashboard />
              </PartnerRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
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
  );
}

export default App;
