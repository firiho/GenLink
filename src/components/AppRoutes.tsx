import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './Header';
import Index from '@/pages/Index';
import Challenges from '@/pages/Challenges';
import Projects from '@/pages/Projects';
import Community from '@/pages/Community';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import PartnerPending from '@/pages/PartnerPending';
import PartnerDashboard from '@/pages/PartnerDashboard';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
  const location = useLocation();
  const noHeaderPaths = ['/dashboard', '/signin', '/signup', '/partner-pending', '/partner-dashboard'];
  const showHeader = !noHeaderPaths.some(path => location.pathname.startsWith(path));
  
  return (
    <>
      {showHeader && <Header />}
      <div className={showHeader ? "pt-16" : ""}> {/* Only add padding when header is shown */}
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/community" element={<Community />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Protected Routes with Role Checks */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['participant']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/partner-dashboard"
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/partner-pending" 
            element={
              <ProtectedRoute allowedRoles={['partner']}>
                <PartnerPending />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
} 