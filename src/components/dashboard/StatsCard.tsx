import { Activity, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const StatsCard = ({ stat, index, loading = false }) => (
    <motion.div
      key={stat.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-2">
        <div className={`p-1.5 sm:p-2 rounded-xl ${stat.bg}`}>
          <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
        </div>
        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
      </div>
      <p className="text-gray-600 text-xs sm:text-sm mb-1">{stat.label}</p>
      
      {loading ? (
        <>
          <Skeleton className="h-7 w-16 mb-1" />
          <Skeleton className="h-4 w-28" />
        </>
      ) : (
        <>
          <p className="text-lg sm:text-xl font-bold mb-1">{stat.value}</p>
          <p className="text-green-500 text-xs flex items-center">
            <Activity className="h-3 w-3 mr-1" />
            {stat.change}
          </p>
        </>
      )}
    </motion.div>
  );

export default StatsCard;