import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Trophy, 
  Target, 
  Crown, 
  Calendar, 
  MessageSquare, 
  Settings, 
  Copy,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { Team } from '@/types/team';
import { toast } from 'sonner';

interface TeamCardProps {
  team: Team;
  onManage?: (team: Team) => void;
  onChat?: (team: Team) => void;
  onViewDetails?: (team: Team) => void;
  showActions?: boolean;
  isMember?: boolean;
}

export default function TeamCard({ team, onManage, onChat, onViewDetails, showActions = true, isMember = false }: TeamCardProps) {
  const [showJoinableLink, setShowJoinableLink] = useState(false);

  const copyJoinableLink = () => {
    if (team.joinableLink) {
      navigator.clipboard.writeText(team.joinableLink);
      toast.success('Joinable link copied to clipboard');
    }
  };

  const shareTeam = () => {
    if (navigator.share && team.joinableLink) {
      navigator.share({
        title: `Join ${team.name} on GenLink`,
        text: team.description,
        url: team.joinableLink
      });
    } else {
      copyJoinableLink();
    }
  };

  const getVisibilityIcon = () => {
    switch (team.visibility) {
      case 'public':
        return <Users className="h-4 w-4 text-green-500" />;
      case 'invite-only':
        return <Users className="h-4 w-4 text-orange-500" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (team.visibility) {
      case 'public':
        return 'Public';
      case 'invite-only':
        return 'Invite Only';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className="group"
    >
      <Card 
        className="h-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer"
        onClick={() => onViewDetails?.(team)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <Users className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                    {team.name}
                  </h3>
                  <Crown className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                  {team.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span>Last active {new Date(team.lastActivity).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-1">
                {getVisibilityIcon()}
                <Badge 
                  variant="outline" 
                  className="text-xs border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                >
                  {getVisibilityLabel()}
                </Badge>
              </div>
              <Badge 
                variant="outline" 
                className="border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20 text-xs"
              >
                {team.status}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Member Count */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4 mr-1" />
              <span>{team.currentMembers}/{team.maxMembers} members</span>
            </div>
            {team.joinableEnabled && team.joinableLink && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJoinableLink(!showJoinableLink)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                <Share2 className="h-3 w-3 mr-1" />
                Share
              </Button>
            )}
          </div>

          {/* Joinable Link */}
          {showJoinableLink && team.joinableLink && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                    Joinable Link
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-300 truncate">
                    {team.joinableLink}
                  </p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyJoinableLink}
                    className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={shareTeam}
                    className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Challenge Info */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Target className="h-4 w-4" />
            <span className="font-medium">{team.challengeTitle}</span>
          </div>

          {/* Tags */}
          {team.tags && team.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {team.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-1 border-slate-200 dark:border-slate-700">
                  {tag}
                </Badge>
              ))}
              {team.tags.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-1 border-slate-200 dark:border-slate-700">
                  +{team.tags.length - 2} more
                </Badge>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Active</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{team.activeChallenges}</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-emerald-500 mr-1" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">Won</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{team.completedChallenges}</p>
            </div>
          </div>

          {/* Actions */}
          {showActions && isMember && (
            <div className="flex gap-2 pt-2">
              {onChat && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChat(team);
                  }}
                  className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
              )}
              {onManage && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onManage(team);
                  }}
                  className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
