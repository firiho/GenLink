import { Trophy, Award, Star, Users, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ReleaseScoresModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: any;
  submissions: any[];
  specialAwardSelections: Record<string, string>;
  onSpecialAwardChange: (selections: Record<string, string>) => void;
  onRelease: () => void;
  isReleasing: boolean;
  onCancel: () => void;
}

// Helper to get score badge color
const getScoreBadgeColor = (score: number | null | undefined) => {
  if (score === null || score === undefined) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
  if (score >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
};

export const ReleaseScoresModal = ({
  open,
  onOpenChange,
  challenge,
  submissions,
  specialAwardSelections,
  onSpecialAwardChange,
  onRelease,
  isReleasing,
  onCancel
}: ReleaseScoresModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            Release Scores and Awards
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400">
            Review and confirm the winners for "{challenge?.title}". This action will make the results public.
          </DialogDescription>
        </DialogHeader>
        
        {challenge && (
          <div className="py-4 space-y-6">
            {/* Top 3 Winners Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-500" />
                Top 3 Winners (Based on Scores)
              </h3>
              
              {submissions.length === 0 ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No submissions found for this challenge.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* 1st Place */}
                  {submissions[0] && (
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-slate-800 rounded-lg border border-amber-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          1st
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{submissions[0].title}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            {submissions[0].participantType === 'team' ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {submissions[0].participant?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getScoreBadgeColor(submissions[0].score)} border-0`}>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {submissions[0].score ?? 'N/A'}/100
                        </Badge>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${challenge.prizeDistribution?.first || 0}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* 2nd Place */}
                  {submissions[1] && (
                    <div className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          2nd
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{submissions[1].title}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            {submissions[1].participantType === 'team' ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {submissions[1].participant?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getScoreBadgeColor(submissions[1].score)} border-0`}>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {submissions[1].score ?? 'N/A'}/100
                        </Badge>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${challenge.prizeDistribution?.second || 0}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* 3rd Place */}
                  {submissions[2] && (
                    <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-400 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          3rd
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{submissions[2].title}</p>
                          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                            {submissions[2].participantType === 'team' ? (
                              <Users className="h-3 w-3" />
                            ) : (
                              <User className="h-3 w-3" />
                            )}
                            {submissions[2].participant?.name}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getScoreBadgeColor(submissions[2].score)} border-0`}>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {submissions[2].score ?? 'N/A'}/100
                        </Badge>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${challenge.prizeDistribution?.third || 0}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Special Awards Section */}
            {challenge.prizeDistribution?.additional?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Award className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Special Awards
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select which submission should receive each special award.
                </p>
                
                <div className="space-y-3">
                  {challenge.prizeDistribution.additional.map((award: any, index: number) => (
                    <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span className="font-medium text-slate-900 dark:text-white">{award.name || `Special Award ${index + 1}`}</span>
                        </div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">${award.amount}</span>
                      </div>
                      <Select
                        value={specialAwardSelections[`award_${index}`] || ''}
                        onValueChange={(value) => onSpecialAwardChange({
                          ...specialAwardSelections,
                          [`award_${index}`]: value
                        })}
                      >
                        <SelectTrigger className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          <SelectValue placeholder="Select a submission..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                          {submissions.map((sub: any) => (
                            <SelectItem 
                              key={sub.id} 
                              value={sub.id}
                              className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <div className="flex items-center gap-2">
                                {sub.participantType === 'team' ? (
                                  <Users className="h-3 w-3 text-slate-400" />
                                ) : (
                                  <User className="h-3 w-3 text-slate-400" />
                                )}
                                <span>{sub.title}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">by {sub.participant?.name}</span>
                                {sub.score != null && (
                                  <Badge variant="outline" className="text-xs ml-2 border-slate-300 dark:border-slate-600">{sub.score}/100</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Warning Notice */}
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <strong>Note:</strong> Once scores are released, the results will be visible to all participants. This action cannot be undone.
              </p>
            </div>
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={onRelease}
            disabled={isReleasing || submissions.length === 0}
            className="bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50"
          >
            {isReleasing ? 'Releasing...' : 'Release Scores & Awards'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
