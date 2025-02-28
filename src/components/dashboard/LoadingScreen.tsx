import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-4">
        <div className="h-12 w-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Loading your dashboard</h2>
      <p className="text-sm text-gray-500">Please wait while we fetch your data...</p>
    </motion.div>
  </div>
);

export default LoadingScreen;