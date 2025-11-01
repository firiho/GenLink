import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '@/components/Logo';
import { auth } from '@/lib/firebase';
import { sendEmailVerification } from '@/services/authActions';
import { signOut } from '@/services/auth';
import { getUserType } from '@/services/user';

const EmailVerification = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    if (!auth.currentUser) {
      navigate('/signin');
      return;
    }

    // Check if email is already verified
    if (auth.currentUser.emailVerified) {
      // Redirect based on user role using centralized function
      const checkUserRole = async () => {
        try {
          const userData = await getUserType();
          
          if (!userData) {
            navigate('/signin');
            return;
          }

          // Get full user data to check status
          const { getCurrentUser } = await import('@/services/user');
          const fullUserData = await getCurrentUser();
          
          if (fullUserData?.userType === 'partner') {
            // Check partner status
            if (fullUserData.status === 'pending') {
              navigate('/partner-pending');
            } else {
              navigate('/partner/dashboard');
            }
          } else if (fullUserData?.userType === 'admin') {
            navigate('/admin/dashboard');
          } else {
            // Participant
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          navigate('/signin');
        }
      };
      checkUserRole();
    }

    setUser(auth.currentUser);
  }, [navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    setIsSending(true);
    try {
      await sendEmailVerification();
      toast.success('Verification email sent! Please check your inbox.');
      setCooldown(60); // 60 second cooldown
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      await user.reload();
      
      if (user.emailVerified) {
        toast.success('Email verified successfully!');
        
        // Get full user data to check type and status
        const { getCurrentUser } = await import('@/services/user');
        const fullUserData = await getCurrentUser();
        
        if (!fullUserData) {
          toast.error('Failed to load user data');
          navigate('/signin');
          return;
        }
        
        if (fullUserData.userType === 'partner') {
          // Check partner status
          if (fullUserData.status === 'pending') {
            navigate('/partner-pending');
          } else {
            navigate('/partner/dashboard');
          }
        } else if (fullUserData.userType === 'admin') {
          navigate('/admin/dashboard');
        } else {
          // Participant
          navigate('/dashboard');
        }
      } else {
        toast.error('Email not verified yet. Please check your inbox and click the verification link.');
      }
    } catch (error: any) {
      toast.error('Failed to check verification status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo class_name="mx-auto" />
        </div>

        {/* Content Card */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl border border-border p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-3xl font-bold mb-2 text-foreground">
              Verify Your Email
            </h2>
            <p className="text-muted-foreground">
              We've sent a verification link to
            </p>
            <p className="text-foreground font-medium mt-1">
              {user?.email}
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <h3 className="font-medium text-foreground mb-2 flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-accent" />
                How to verify:
              </h3>
              <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the verification link in the email</li>
                <li>Come back here and click "I've Verified"</li>
              </ol>
            </div>

            <Button
              onClick={handleCheckVerification}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  I've Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendEmail}
              variant="outline"
              className="w-full"
              disabled={isSending || cooldown > 0}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend in {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Wrong email address?
            </p>
            <Button
              onClick={handleSignOut}
              variant="ghost"
              className="w-full text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
              Sign out and try again
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Didn't receive the email? Check your spam folder or click resend.
        </p>
      </motion.div>
    </div>
  );
};

export default EmailVerification;

