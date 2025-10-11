import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  UserPlus,
  Key,
  LogIn
} from 'lucide-react';
import { TeamInvitation } from '@/types/team';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface InvitationListProps {
  invitations: TeamInvitation[];
  onRespond: (invitationId: string, status: 'accepted' | 'declined', message?: string) => void;
  onJoinByCode?: (code: string) => Promise<void>;
}

export default function InvitationList({ invitations, onRespond, onJoinByCode }: InvitationListProps) {
  const [selectedInvitation, setSelectedInvitation] = useState<TeamInvitation | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [invitationCode, setInvitationCode] = useState('');
  const [joiningByCode, setJoiningByCode] = useState(false);

  const handleRespond = async (invitation: TeamInvitation, status: 'accepted' | 'declined') => {
    setLoading(invitation.id);
    try {
      await onRespond(invitation.id, status, responseMessage.trim() || undefined);
      setSelectedInvitation(null);
      setResponseMessage('');
      toast.success(`Invitation ${status} successfully`);
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Failed to respond to invitation');
    } finally {
      setLoading(null);
    }
  };

  const handleJoinByCode = async () => {
    if (!invitationCode.trim()) {
      toast.error('Please enter an invitation code');
      return;
    }

    if (!onJoinByCode) {
      toast.error('Join by code is not available');
      return;
    }

    setJoiningByCode(true);
    try {
      await onJoinByCode(invitationCode.trim());
      setInvitationCode('');
      toast.success('Successfully joined team!');
    } catch (error) {
      console.error('Error joining by code:', error);
      toast.error('Invalid or expired invitation code');
    } finally {
      setJoiningByCode(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-900/20';
      case 'accepted':
        return 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/20';
      case 'declined':
        return 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-900/20';
      case 'expired':
        return 'border-gray-200 text-gray-700 bg-gray-50 dark:border-gray-800 dark:text-gray-300 dark:bg-gray-900/20';
      default:
        return 'border-slate-200 text-slate-700 bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:bg-slate-900/20';
    }
  };

  const getInvitationTypeLabel = (type: string) => {
    switch (type) {
      case 'direct':
        return 'Direct Invitation';
      case 'public_profile':
        return 'From Public Profile';
      case 'joinable_link':
        return 'Via Joinable Link';
      default:
        return 'Invitation';
    }
  };

  return (
    <div className="space-y-6">
      {/* Join by Code Section */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              Join Team with Code
            </CardTitle>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Enter an invitation code to join a team instantly
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., ABC12XYZ)"
              className="flex-1 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 uppercase"
              maxLength={8}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinByCode();
                }
              }}
            />
            <Button 
              onClick={handleJoinByCode}
              disabled={joiningByCode || !invitationCode.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Join Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Invitations</h3>
          <p className="text-slate-600 dark:text-slate-400">You have no pending team invitations</p>
        </div>
      ) : (
        <div className="space-y-4">
      {invitations.map((invitation, index) => (
        <motion.div
          key={invitation.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 bg-slate-100 dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600">
                    <AvatarFallback className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      <Users className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base text-slate-900 dark:text-white">
                      {invitation.teamName || 'Team Invitation'}
                    </CardTitle>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Invited by {invitation.invitedByName || invitation.invitedBy}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusIcon(invitation.status)}
                      <Badge variant="outline" className={`text-xs ${getStatusColor(invitation.status)}`}>
                        {invitation.status}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {getInvitationTypeLabel(invitation.invitationType)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(invitation.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {invitation.message && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    "{invitation.message}"
                  </p>
                </div>
              )}

              {invitation.responseMessage && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Your response: "{invitation.responseMessage}"
                  </p>
                </div>
              )}

              {invitation.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInvitation(invitation)}
                    className="flex-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleRespond(invitation, 'accepted')}
                    disabled={loading === invitation.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRespond(invitation, 'declined')}
                    disabled={loading === invitation.id}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}

              {invitation.status !== 'pending' && (
                <div className="text-center py-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Invitation {invitation.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Response Modal */}
      <Dialog open={!!selectedInvitation} onOpenChange={() => setSelectedInvitation(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Invitation</DialogTitle>
            <DialogDescription>
              Add a message to your response (optional)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Response Message
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Add a message to your response..."
                rows={3}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedInvitation(null);
                  setResponseMessage('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedInvitation && handleRespond(selectedInvitation, 'declined')}
                disabled={loading === selectedInvitation?.id}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button
                variant="default"
                onClick={() => selectedInvitation && handleRespond(selectedInvitation, 'accepted')}
                disabled={loading === selectedInvitation?.id}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      )}
    </div>
  );
}
