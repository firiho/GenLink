import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Menu, ArrowRight, LogOut, LayoutDashboard, Code, Sparkles, X, Folder } from 'lucide-react';
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
import NotificationsDropdown from './dashboard/NotificationsDropdown';

const navItems = [
  { label: 'Challenges', path: '/challenges', icon: Code },
  { label: 'Projects', path: '/projects', icon: Folder },
  { label: 'Community', path: '/community', icon: User },
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

  const handleDashboardClick = () => {
    if (user?.role === 'partner') {
      navigate('/partner-dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const ProfileMenu = ({ user }) => {

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
        className={`absolute inset-0 transition-all duration-500 ${
          scrolled 
            ? 'bg-neutral-900/95 backdrop-blur-xl shadow-xl shadow-black/20 border-b border-neutral-800/50' 
            : 'bg-neutral-900/80 backdrop-blur-lg border-b border-neutral-800/30'
        }`}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-12 h-full">
            <Logo />

            {/* Navigation Items */}
            
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.label} 
                    to={item.path}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                        isActive
                          ? 'text-primary bg-primary/10 shadow-lg shadow-primary/20 border border-primary/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
            </nav>
            
          </div>

          {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center ml-auto space-x-2">
            {user && <NotificationsDropdown />}
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/5 border border-neutral-700 text-white hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.button>
            </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <NotificationsDropdown />
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
                      className="text-gray-300 hover:text-white hover:bg-white/5 border border-neutral-700 hover:border-neutral-600 backdrop-blur-sm rounded-xl px-5"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button className="bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 px-6">
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
            className="md:hidden absolute top-full left-0 right-0 bg-neutral-900/98 backdrop-blur-xl border-t border-neutral-800/50 shadow-xl"
          >
            <div className="p-4 space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.label} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className={`px-4 py-3 rounded-xl flex items-center space-x-3 transition-all ${
                        isActive
                          ? 'text-primary bg-primary/10 font-medium border border-primary/30'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}
              {user ? (
                <div className="pt-3 border-t border-neutral-800/50">
                  <Button
                    onClick={() => {
                      handleDashboardClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/5"
                    variant="ghost"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    variant="ghost"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-neutral-800/50 space-y-2">
                  <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90">
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