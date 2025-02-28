import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';

interface StatsProps {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    icon: any;
    color: string;
    bg: string;
  }>;
}

export const Stats = ({ stats }: StatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-3xl font-bold mb-2">{stat.value}</p>
          <p className="text-green-500 text-sm flex items-center">
            <Activity className="h-4 w-4 mr-1" />
            {stat.change}
          </p>
        </motion.div>
      ))}
    </div>
  );
}; 