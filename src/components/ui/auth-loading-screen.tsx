import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Shield, Users, Code } from 'lucide-react';
import Logo from '@/components/Logo';

export const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo with animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="flex items-center space-x-3">
            <img 
              src="/logo1.png" 
              alt="GenLink Logo" 
              className="h-16 w-auto"
            />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              GenLink
            </span>
          </div>
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Loading your dashboard
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please wait while we verify your session...
          </p>
        </motion.div>

        {/* Feature icons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex justify-center space-x-6 pt-4"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Challenges</span>
          </motion.div>
          
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Community</span>
          </motion.div>
          
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
            className="flex flex-col items-center space-y-2"
          >
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">Security</span>
          </motion.div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="w-64 mx-auto"
        >
          <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-slate-400 to-slate-500 dark:from-slate-500 dark:to-slate-400 rounded-full"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthLoadingScreen;
