import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Mail,
  ArrowRight 
} from 'lucide-react';
import Logo from '@/components/Logo';
import { 
  checkActionCodeInfo, 
  verifyEmail, 
  resetPassword, 
  verifyResetCode 
} from '@/services/authActions';

type ActionMode = 'resetPassword' | 'verifyEmail' | 'recoverEmail' | null;
type ViewState = 'loading' | 'error' | 'success' | 'resetPassword';

const VerifyAction = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [viewState, setViewState] = useState<ViewState>('loading');
  const [mode, setMode] = useState<ActionMode>(null);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const oobCode = searchParams.get('oobCode');
  const actionMode = searchParams.get('mode') as ActionMode;

  useEffect(() => {
    handleAction();
  }, [oobCode, actionMode]);

  const handleAction = async () => {
    if (!oobCode) {
      setErrorMessage('Invalid or missing verification code.');
      setViewState('error');
      return;
    }

    try {
      // Check what type of action this is
      const actionInfo = await checkActionCodeInfo(oobCode);
      setEmail(actionInfo.email || '');
      setMode(actionMode);

      switch (actionMode) {
        case 'resetPassword':
          // Verify the code is valid, then show password reset form
          await verifyResetCode(oobCode);
          setViewState('resetPassword');
          break;

        case 'verifyEmail':
          // Apply the email verification
          await verifyEmail(oobCode);
          setViewState('success');
          toast.success('Email verified successfully!');
          setTimeout(() => navigate('/dashboard'), 3000);
          break;

        case 'recoverEmail':
          // Handle email recovery
          await verifyEmail(oobCode);
          setViewState('success');
          toast.success('Email recovered successfully!');
          setTimeout(() => navigate('/signin'), 3000);
          break;

        default:
          setErrorMessage('Unknown action type.');
          setViewState('error');
      }
    } catch (error: any) {
      console.error('Action handling error:', error);
      setErrorMessage(error.message || 'An error occurred. Please try again.');
      setViewState('error');
      toast.error(error.message || 'Verification failed');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!oobCode) return;

    setIsSubmitting(true);
    try {
      await resetPassword(oobCode, newPassword);
      setViewState('success');
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/signin'), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
      setErrorMessage(error.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (viewState) {
      case 'loading':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="h-8 w-8 text-slate-600 dark:text-slate-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Verifying...
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Please wait while we verify your request
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              {errorMessage}
            </p>
            <Button
              onClick={() => navigate('/signin')}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900"
            >
              Back to Sign In
            </Button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
              {mode === 'verifyEmail' ? 'Email Verified!' : 'Success!'}
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              {mode === 'verifyEmail' 
                ? 'Your email has been verified successfully.'
                : mode === 'resetPassword'
                ? 'Your password has been reset successfully.'
                : 'Action completed successfully.'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Redirecting you shortly...
            </p>
          </div>
        );

      case 'resetPassword':
        return (
          <div>
            <div className="mb-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <KeyRound className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white text-center">
                Reset your password
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center">
                Enter a new password for {email}
              </p>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-6">
              <div>
                <label 
                  htmlFor="newPassword" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                  minLength={6}
                  disabled={isSubmitting}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-medium py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 dark:from-slate-800/50 to-transparent" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Logo class_name="text-slate-900 dark:text-white" />
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8">
          {renderContent()}
        </div>

        {/* Back to Sign In Link */}
        {viewState !== 'loading' && viewState !== 'success' && (
          <div className="text-center mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/signin')}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyAction;
