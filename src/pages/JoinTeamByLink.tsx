import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, AlertCircle } from 'lucide-react';

export default function JoinTeamByLink() {
  const { linkCode } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const findTeamByCode = async () => {
      if (!linkCode) {
        setError(true);
        setLoading(false);
        return;
      }
      
      try {
        // Try to find team by joinableCode (for backward compatibility with existing links)
        const teamQuery = query(
          collection(db, 'teams'),
          where('joinableCode', '==', linkCode)
        );
        
        const teamSnap = await getDocs(teamQuery);
        
        if (!teamSnap.empty) {
          const foundTeamId = teamSnap.docs[0].id;
          setTeamId(foundTeamId);
          // Redirect to team page
          navigate(`/t/${foundTeamId}`, { replace: true });
        } else {
          // If linkCode is actually a team ID, redirect directly
          // This handles cases where people share /t/:id links
          if (linkCode.length > 10) {
            navigate(`/t/${linkCode}`, { replace: true });
          } else {
            setError(true);
          }
        }
      } catch (error) {
        console.error('Error finding team:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    findTeamByCode();
  }, [linkCode, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">Redirecting to team page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Invalid Team Link
            </CardTitle>
            <CardDescription>
              This team link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Users className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                The team link you're trying to access is no longer valid. Please ask the team admin for a new link.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/community/teams')} 
              className="w-full"
            >
              Browse Teams
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null; // Will redirect automatically
}
