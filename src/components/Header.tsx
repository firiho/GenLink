import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sparkles, ChevronDown, Bell, Menu, ArrowRight, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
import { signOut } from '@/services/auth';
import Logo from './Logo';

const navItems = [
  { label: 'Challenges', path: '/challenges' },
  { label: 'Projects', path: '/projects' },
  { label: 'Community', path: '/community' },
];

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  const ProfileMenu = ({ user }) => {
    const navigate = useNavigate();

    const handleDashboardClick = () => {
      // Check if user is a partner and navigate accordingly
      if (user?.role === 'partner') {
        navigate('/partner-dashboard');
      } if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    };

    // const handleSettingsClick = () => {
    //   if (user?.role === 'partner') {
    //     navigate('/partner-dashboard');
    //   } if (user?.role === 'admin') {
    //     navigate('/admin/dashboard?view=settings');
    //   } else {
    //     navigate('/dashboard');
    //   }
    // };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.02 }}>
            <Button
              variant="ghost"
              className="rounded-xl hover:bg-primary/5 border border-gray-200/50 shadow-sm pl-2 pr-3"
            >
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 transition-transform duration-200 group-hover:rotate-180" />
              </div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 p-2 bg-white/80 backdrop-blur-xl border border-gray-200/50"
        >
          <div className="px-2 py-1.5 border-b border-gray-100">
            <p className="text-sm font-medium">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
          <DropdownMenuItem onClick={handleDashboardClick}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </DropdownMenuItem>
          {/* <DropdownMenuItem 
            onClick={handleSettingsClick}
            className="rounded-lg cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem> */}
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => handleLogout()}
            className="rounded-lg cursor-pointer"
          >
            Log Out
          </DropdownMenuItem>  
          
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-[100]"
    >
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/20' 
            : 'bg-white/70 backdrop-blur-lg'
        }`}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-12 h-full">
           <Logo />

            {/* Navigation Items */}
            
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'text-primary bg-primary/5 shadow-sm'
                      : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                  }`}
                >
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              ))}
            </nav>
            
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </motion.button>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className="relative rounded-xl hover:bg-primary/5 w-10 h-10 p-0"
                  >
                    <Bell className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                  </Button>
                </motion.div>

                <ProfileMenu user={user} />
              </div>
            ) : (
              <AnimatePresence>
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Link to="/signin">
                    <Button 
                      variant="ghost" 
                      className="text-gray-600 hover:text-primary hover:bg-primary/5 rounded-xl px-5"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="bg-gradient-to-r from-primary via-primary/90 to-blue-500 text-white hover:opacity-90 shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all rounded-xl px-6">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 shadow-lg"
          >
            <div className="p-4 space-y-3">
              {navItems.map((item) => (
                <Link 
                  key={item.label} 
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-3 rounded-xl ${
                      location.pathname === item.path
                        ? 'text-primary bg-primary/5 font-medium'
                        : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </motion.div>
                </Link>
              ))}
              {user ? (
                <div className="pt-3 border-t border-gray-200/50">
                  <Button
                    onClick={() => {
                      navigate('/dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                    variant="ghost"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-start text-red-600"
                    variant="ghost"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-gray-200/50 space-y-2">
                  <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};