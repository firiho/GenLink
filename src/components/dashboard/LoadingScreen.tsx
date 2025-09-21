import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LoadingScreen = () => (
  <div className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center px-4 z-50">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20 dark:border-slate-800/50"
    >
      <div className="relative mb-4">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-slate-600 dark:text-slate-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Loading your dashboard</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">Please wait while we fetch your data...</p>
    </motion.div>
  </div>
);

export default LoadingScreen;