import { FileText, Eye, PenTool, Play, Archive, Trophy, Users, User, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface ChallengeCardProps {
  challenge: any;
  onView: () => void;
  onEdit: () => void;
  onPublish: () => void;
  onArchive: () => void;
  onReleaseScores: () => void;
  onViewWinners?: () => void;
}

export const ChallengeCard = ({
  challenge,
  onView,
  onEdit,
  onPublish,
  onArchive,
  onReleaseScores,
  onViewWinners
}: ChallengeCardProps) => {
  // Determine if deadline has passed
  const deadlinePassed = challenge.daysLeft <= 0;
  // Determine if scores have been released
  const scoresReleased = challenge.scoresReleased === true;
  // Challenge is in judging phase - can release scores
  const canReleaseScores = challenge.status === 'judging' && !scoresReleased;
  // Show edit/archive only if deadline hasn't passed OR if it's a draft
  const showEditButtons = !deadlinePassed || challenge.status === 'draft';
  
  return (
    <div
      className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
            <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {challenge.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3 line-clamp-2">
              {challenge.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {challenge.categories.map((category: string) => (
                <Badge 
                  key={category}
                  variant="secondary" 
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={`${
                challenge.status === 'active' 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' 
                  : challenge.status === 'draft'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                  : challenge.status === 'judging'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
              } rounded-lg px-3 py-1`}
            >
              {challenge.status.charAt(0).toUpperCase() + challenge.status.slice(1)}
            </Badge>
            {scoresReleased && (
              <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg px-3 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                Scores Released
              </Badge>
            )}
          </div>
          <p className="text-slate-900 dark:text-white font-semibold">
            ${challenge.total_prize}
          </p>
        </div>
      </div>

      {/* Winners Summary - shown when scores are released */}
      {scoresReleased && challenge.awards && (
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">Winners</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {challenge.awards.first && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                <span className="w-5 h-5 bg-amber-400 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span className="text-sm text-slate-900 dark:text-white font-medium">{challenge.awards.first.projectTitle}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {challenge.awards.first.participantType === 'team' ? <Users className="h-3 w-3 inline" /> : <User className="h-3 w-3 inline" />}
                </span>
              </div>
            )}
            {challenge.awards.second && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="w-5 h-5 bg-slate-400 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span className="text-sm text-slate-900 dark:text-white font-medium">{challenge.awards.second.projectTitle}</span>
              </div>
            )}
            {challenge.awards.third && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
                <span className="w-5 h-5 bg-orange-400 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span className="text-sm text-slate-900 dark:text-white font-medium">{challenge.awards.third.projectTitle}</span>
              </div>
            )}
            {challenge.awards.specialAwards && challenge.awards.specialAwards.length > 0 && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
                <Award className="h-3 w-3 text-purple-500" />
                <span className="text-xs text-purple-700 dark:text-purple-300">+{challenge.awards.specialAwards.length} special</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Participants</p>
              <p className="font-semibold text-slate-900 dark:text-white">{challenge.participants}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Submissions</p>
              <p className="font-semibold text-slate-900 dark:text-white">{challenge.submissions}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Left</p>
              <p className={`font-semibold ${deadlinePassed ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
                {deadlinePassed ? 'Ended' : `${challenge.daysLeft} days`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {/* View button - always visible */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onView}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            
            {/* View Winners button - visible when scores are released */}
            {scoresReleased && onViewWinners && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onViewWinners}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                <Trophy className="h-4 w-4 mr-1" />
                Winners
              </Button>
            )}
            
            {/* Edit button - hidden if deadline passed (unless draft) */}
            {showEditButtons && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onEdit}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <PenTool className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            
            {/* Release Scores button - visible when deadline passed but scores not released */}
            {canReleaseScores && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20" 
                onClick={onReleaseScores}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Release Scores
              </Button>
            )}
            
            {/* Publish button - for drafts only */}
            {challenge.status === 'draft' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20" 
                onClick={onPublish}
              >
                <Play className="h-4 w-4 mr-1" />
                Publish
              </Button>
            )}
            
            {/* Archive button - visible for draft challenges that haven't passed deadline, OR after scores released on judging challenges */}
            {((challenge.status === 'draft' && showEditButtons) || (challenge.status === 'completed' && scoresReleased)) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" 
                onClick={onArchive}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
