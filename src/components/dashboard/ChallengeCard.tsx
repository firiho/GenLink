import { Trophy, Building2, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { cn } from "@/lib/utils";

const ChallengeCard = ({ challenge, index }) => {
    return (
      <motion.div
        key={challenge.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.1 }}
        className="group bg-gray-50 rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-all cursor-pointer"
      >
        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-xl flex-shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-base sm:text-lg group-hover:text-primary transition-colors truncate">
                  {challenge.title}
                </h3>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "shrink-0 text-xs rounded-lg px-2 py-1",
                    challenge.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  )}
                >
                  {challenge.status}
                </Badge>
              </div>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {challenge.description}
              </p>
            </div>
          </div>
  
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
            <div className="flex items-center text-gray-500">
              <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{challenge.organization}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span>{challenge.participants} participants</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span>{challenge.daysLeft} days left</span>
            </div>
          </div>
          
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-600">Prize:</span>
                  <span className="ml-1 text-primary font-semibold">{challenge.prize}</span>
                </div>
                <div className="text-xs sm:text-sm">
                  <span className="text-gray-600">Submissions:</span>
                  <span className="ml-1 font-medium">{challenge.submissions}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium">{challenge.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${challenge.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

export default ChallengeCard;