import { Users, TrendingUp } from 'lucide-react';

interface TeamListItemProps {
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

export const TeamListItem = ({ 
  name, 
  challengeTitle,
  currentMembers,
  onClick,
  index = 0
}: TeamListItemProps) => {
  return (
    <div className="group">
      <div 
        className="flex items-center gap-4 py-4 px-2 hover:bg-accent/5 transition-all duration-200 cursor-pointer rounded-md"
        onClick={onClick}
      >
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold group-hover:text-accent transition-colors truncate mb-1">
            {name}
          </h3>
          {challengeTitle && (
            <div className="flex items-center text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-3 h-3 mr-1 text-primary flex-shrink-0" />
              <span className="truncate">{challengeTitle}</span>
            </div>
          )}
        </div>
        
        {/* Members Count */}
        <div className="flex items-center gap-1 flex-shrink-0 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{currentMembers}</span>
        </div>
      </div>
    </div>
  );
};

