import { motion } from 'framer-motion';
import { Users, TrendingUp, Calendar, Lock, Globe, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamListItemProps {
  id: string;
  name: string;
  description?: string;
  challengeTitle?: string;
  currentMembers: number;
  maxMembers: number;
  visibility: 'public' | 'private';
  tags?: string[];
  createdAt?: Date;
  hasSubmitted?: boolean;
  onClick?: () => void;
  index?: number;
}

export const TeamListItem = ({ 
  name, 
  description, 
  challengeTitle,
  currentMembers,
  maxMembers,
  visibility,
  tags = [],
  createdAt,
  hasSubmitted,
  onClick,
  index = 0
}: TeamListItemProps) => {
  const memberPercentage = (currentMembers / maxMembers) * 100;
  const isNearlyFull = memberPercentage >= 80;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div 
        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        {/* Team Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-semibold group-hover:text-accent transition-colors truncate">
                  {name}
                </h3>
                {visibility === 'private' ? (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs flex-shrink-0">
                    <Lock className="w-3 h-3" />
                    <span>Private</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs flex-shrink-0">
                    <Globe className="w-3 h-3" />
                    <span>Public</span>
                  </div>
                )}
                {hasSubmitted && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-xs flex-shrink-0">
                    <Award className="w-3 h-3" />
                  </div>
                )}
              </div>
              
              {challengeTitle && (
                <div className="flex items-center text-muted-foreground text-xs mb-1">
                  <TrendingUp className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
                  <span className="truncate">{challengeTitle}</span>
                </div>
              )}
              
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {description}
                </p>
              )}
              
              {/* Tags */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-0">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Members and Date */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Members */}
          <div className="text-right">
            <div className={`text-sm font-semibold ${isNearlyFull ? 'text-orange-500' : 'text-accent'}`}>
              {currentMembers}/{maxMembers}
            </div>
            <div className="text-xs text-muted-foreground">members</div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-24">
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  isNearlyFull ? 'bg-orange-500' : 'bg-gradient-to-r from-primary to-accent'
                }`}
                style={{ width: `${memberPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Created Date */}
          {createdAt && (
            <div className="flex items-center text-muted-foreground text-xs">
              <Calendar className="w-3 h-3 mr-1" />
              <span>{new Date(createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

