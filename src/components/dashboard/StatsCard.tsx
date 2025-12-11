import { TrendingUp, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  stat: {
    label: string;
    value: string;
    change: string;
    isPositive?: boolean; // If not provided, infer from change string
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    onClick?: () => void;
  };
  index: number;
  loading?: boolean;
}

const StatsCard = ({ stat, index, loading = false }: StatCardProps) => {
  // Determine if change is positive based on isPositive prop or infer from change string
  const isPositive = stat.isPositive ?? !stat.change.startsWith('-');
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div
      className={cn(
        "group relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300/50 dark:hover:border-slate-600/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
        stat.onClick && "cursor-pointer"
      )}
      onClick={stat.onClick}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent dark:from-slate-700/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 sm:p-3 rounded-xl ${stat.bg} shadow-sm group-hover:shadow-md transition-all duration-300`}>
            <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
          </div>
          <div className="flex items-center space-x-1">
            <TrendIcon 
              className={cn(
                "h-3 w-3 sm:h-4 sm:w-4",
                isPositive ? "text-emerald-500" : "text-red-500"
              )} 
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wide">{stat.label}</p>
          
          {loading ? (
            <>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors duration-300">
                {stat.value}
              </p>
              <p className={cn(
                "text-xs sm:text-sm flex items-center font-medium",
                isPositive 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              )}>
                <TrendIcon className="h-3 w-3 mr-1.5" />
                {stat.change}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;