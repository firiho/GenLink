import { Users, TrendingUp, Calendar, Lock, Globe, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TeamCardProps {
  id: string;
  name: string;
  description?: string;
  challengeTitle?: string;
  currentMembers: number;
  maxMembers: number;
  visibility: 'public' | 'invite-only';
  tags?: string[];
  createdAt?: Date;
  hasSubmitted?: boolean;
  onClick?: () => void;
  index?: number;
}

export const TeamCard = ({ 
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
}: TeamCardProps) => {
  const memberPercentage = (currentMembers / maxMembers) * 100;
  const isNearlyFull = memberPercentage >= 80;
  
  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="h-full rounded-xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        {/* Header */}
        <div className="h-24 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {visibility === 'invite-only' ? (
              <div className="px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-1 text-xs">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </div>
            ) : (
              <div className="px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm flex items-center gap-1 text-xs">
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </div>
            )}
            {hasSubmitted && (
              <div className="px-2 py-1 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <Award className="w-3 h-3" />
              </div>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5 -mt-8 relative">
          {/* Team Icon */}
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          
          {/* Name */}
          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors line-clamp-1">
            {name}
          </h3>
          
          {/* Challenge Title */}
          {challengeTitle && (
            <div className="flex items-center text-muted-foreground text-xs mb-2">
              <TrendingUp className="w-3 h-3 mr-1 text-primary" />
              <span className="line-clamp-1">{challengeTitle}</span>
            </div>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
              {description}
            </p>
          )}
          
          {/* Members Progress */}
          <div className="mb-3">
            <div className="flex justify-between items-center text-sm mb-1">
              <span className="text-muted-foreground">Members</span>
              <span className={`font-semibold ${isNearlyFull ? 'text-orange-500' : 'text-accent'}`}>
                {currentMembers}/{maxMembers}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  isNearlyFull ? 'bg-orange-500' : 'bg-gradient-to-r from-primary to-accent'
                }`}
                style={{ width: `${memberPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Footer */}
          {createdAt && (
            <div className="flex items-center text-muted-foreground text-xs pt-3 border-t border-border/50">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Created {new Date(createdAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

