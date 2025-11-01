import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, ArrowRight, KeyRound, ShieldCheck, RefreshCw } from 'lucide-react';
import Logo from '@/components/Logo';
import { sendPasswordReset } from '@/services/authActions';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordReset(email);
      setIsEmailSent(true);
      toast.success('Reset instructions sent to your email!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset instructions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      icon: Mail,
      title: 'Enter Email',
      description: 'Provide the email associated with your account'
    },
    {
      icon: KeyRound,
      title: 'Check Your Inbox',
      description: 'Click the reset link sent to your email'
    },
    {
      icon: ShieldCheck,
      title: 'Reset Password',
      description: 'Create a new secure password for your account'
    }
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 grid lg:grid-cols-2 overflow-hidden">
      {/* Left Side - Form */}
      <div className="relative flex items-center justify-center p-8 overflow-y-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/50 dark:from-slate-800/50 to-transparent" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md z-10 my-auto"
        >
          {/* Logo */}
          <div className="mb-12">
            <Logo class_name="text-slate-900 dark:text-white" />
          </div>

          {isEmailSent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">Check your email</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                We've sent password reset instructions to your email
              </p>
              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try another email
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Welcome Text */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Forgot password?</h2>
                <p className="text-slate-600 dark:text-slate-400">
                  No worries, we'll help you reset it
                </p>
              </div>

              {/* Reset Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors rounded-xl h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="h-4 w-4 border-2 border-slate-100/30 dark:border-slate-900/30 border-t-slate-100 dark:border-t-slate-900 rounded-full animate-spin mr-2" />
                      Sending instructions...
                    </div>
                  ) : (
                    <span className="flex items-center">
                      Send Instructions
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Remember your password?{' '}
                  <Link
                    to="/signin"
                    className="text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 transition-colors font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </motion.div>
      </div>

      {/* Right Side - Steps */}
      <div className="hidden lg:block relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          
          {/* Animated Blobs */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"
          />

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white max-w-md"
            >
              <div className="mb-6">
                <Logo class_name="text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-8">
                Password Reset Process
              </h2>
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-4"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {step.title}
                      </h3>
                      <p className="text-slate-300">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 