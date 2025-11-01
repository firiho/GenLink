import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, ChevronDown, Menu, ArrowRight, LogOut, LayoutDashboard, Code, Sparkles, X, Folder, Users } from 'lucide-react';
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
import ThemeSwitcher from './ThemeSwitcher';

const navItems = [
  { label: 'Challenges', path: '/challenges', icon: Code },
  { label: 'Projects', path: '/projects', icon: Folder },
  //{ label: 'Teams', path: '/teams/discover', icon: Users },
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
      navigate('/partner/dashboard');
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
          <Button
            variant="ghost"
            className="rounded-xl hover:bg-accent/5 border border-border shadow-sm pl-2 pr-3"
          >
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-accent" />
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 p-2 bg-card/95 backdrop-blur-xl border border-border"
        >
          <div className="px-2 py-1.5 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || 'User'}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <DropdownMenuItem onClick={handleDashboardClick} className="text-foreground hover:bg-accent/5">
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
          <DropdownMenuSeparator className="bg-border" />
          
          <DropdownMenuItem 
            onClick={() => handleLogout()}
            className="rounded-lg cursor-pointer text-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            Log Out
          </DropdownMenuItem>  
          
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[100]"
    >
      <div 
        className={`absolute inset-0 transition-all duration-300 ${
          scrolled 
            ? 'bg-background/95 backdrop-blur-xl border-b border-border shadow-subtle' 
            : 'bg-background/80 backdrop-blur-lg border-b border-border/50'
        }`}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8 h-full">
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
                    <div
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 flex items-center space-x-2 ${
                        isActive
                          ? 'text-foreground bg-accent/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center ml-auto space-x-2">
            {user && <NotificationsDropdown />}
            <button
              className="p-2 rounded-md bg-accent/5 border border-border text-foreground hover:bg-accent/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeSwitcher />
            {user ? (
              <div className="flex items-center space-x-3">
                <NotificationsDropdown />
                <ProfileMenu user={user} />
              </div>
            ) : (
              <div 
                className="flex items-center space-x-3"
              >
                  <Link to="/signin">
                    <Button 
                      variant="ghost" 
                      className="text-muted-foreground hover:text-foreground hover:bg-accent/5 px-4"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg shadow-modern hover:shadow-lg transition-all duration-200 px-6">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden absolute top-full left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border shadow-modern"
        >
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link 
                    key={item.label} 
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={`px-4 py-3 rounded-md flex items-center space-x-3 transition-all ${
                        isActive
                          ? 'text-foreground bg-accent/10 font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/5'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <ThemeSwitcher simpleToggle={true} />
                </div>
              </div>
              {user ? (
                <div className="pt-3 border-t border-border">
                  <Button
                    onClick={() => {
                      handleDashboardClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/5"
                    variant="ghost"
                  >
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                    variant="ghost"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="pt-3 border-t border-border space-y-2">
                  <Link to="/signin" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-foreground hover:bg-accent/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
    </header>
  );
};