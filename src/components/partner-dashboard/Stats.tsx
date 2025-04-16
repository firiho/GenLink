import { motion } from 'framer-motion';
import { TrendingUp, Activity } from 'lucide-react';
import StatsCard from '../dashboard/StatsCard';

interface StatsProps {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    icon: any;
    color: string;
    bg: string;
  }>;
  loading: boolean;
}

export const Stats = ({ stats, loading }: StatsProps) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
    {stats.map((stat, index) => (
        <StatsCard key={stat.label} stat={stat} index={index} loading={loading} />
    ))}
</div>
  );
}; 