import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { TeamService } from '@/services/teamService';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, Users, Shield, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export default function JoinTeamByLink() {
  const { linkCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [teamInfo, setTeamInfo] = useState<any>(null);

  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!linkCode) return;
      
      try {
        // Try to get team info from the link code
        const linkQuery = await TeamService.joinTeamByLink(linkCode, 'temp'); // This will fail but we can catch the team info
        // For now, we'll show a generic team join interface
        setTeamInfo({
          name: 'Team',
          description: 'Join this team to collaborate on challenges',
          memberCount: 0,
          maxMembers: 10
        });
      } catch (error) {
        console.error('Error fetching team info:', error);
      }
    };

    fetchTeamInfo();
  }, [linkCode]);

  const handleJoinTeam = async () => {
    if (!user || !linkCode) return;
    
    try {
      setLoading(true);
      const response = await TeamService.joinTeamByLink(linkCode, user.uid);
      setResult(response);
      
      if (response.success) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error joining team:', error);
      setResult({ success: false, message: 'An error occurred while joining the team' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Login Required
            </CardTitle>
            <CardDescription>
              You need to be logged in to join a team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Sign in to your account to join this team and start collaborating on challenges.
              </p>
            </div>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Join Team
          </CardTitle>
          <CardDescription>
            You've been invited to join a team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {teamInfo && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{teamInfo.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{teamInfo.description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{teamInfo.memberCount}/{teamInfo.maxMembers} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Active team</span>
                </div>
              </div>
            </div>
          )}

          {result ? (
            <Alert className={result.success ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'}>
              <div className="flex items-center">
                {result.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className="ml-2">
                  {result.message}
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                  Response Message (Optional)
                </label>
                <Textarea
                  placeholder="Tell the team why you want to join..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={3}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
              
              <Button 
                onClick={handleJoinTeam} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Join Team
                  </>
                )}
              </Button>
            </>
          )}

          {result?.success && (
            <div className="text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting to dashboard...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
