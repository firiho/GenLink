import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { AdminSignIn } from '@/services/auth';
import { toast } from 'sonner';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting admin sign in...');
      const { user } = await AdminSignIn({ email, password });
      console.log('Admin sign in successful, user:', user);
      
      if (!user || user.role !== 'admin') {
        throw new Error('Unauthorized access');
      }

      navigate('/admin/dashboard');
    } catch (error: unknown) {
      console.error('Admin sign in error:', error);
      const message = error instanceof Error ? error.message : 'Invalid credentials';
      setError(message);
      toast.error(message);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 0);
    }
  };

  return (
    <div className="h-screen bg-background grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Form */}
      <div className="relative flex items-center justify-center p-8 overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10 my-auto"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-12">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Admin Portal
            </h1>
          </Link>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2 text-foreground">Admin Access</h2>
            <p className="text-muted-foreground">
              Sign in to access administrative controls
            </p>
          </div>

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-card border-border"
                    placeholder="Enter admin email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 bg-card border-border"
                    placeholder="Enter password"
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors rounded-xl h-11"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Authenticating...
                </div>
              ) : (
                <span className="flex items-center">
                  Access Admin Panel
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Not an administrator?{' '}
              <Link
                to="/signin"
                className="text-accent hover:text-accent/80 transition-colors font-medium"
              >
                Return to login
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Image/Pattern */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-primary/10 to-accent/20">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.03]" />
          
          {/* Animated Blobs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-accent/40 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-primary/40 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center text-foreground max-w-md"
            >
              <Shield className="h-12 w-12 mb-6 mx-auto text-accent" />
              <h2 className="text-3xl font-bold mb-4">
                Admin Control Center
              </h2>
              <p className="text-muted-foreground text-lg">
                Secure access to system administration and management tools
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;