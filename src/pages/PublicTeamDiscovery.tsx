import { useState, useEffect } from 'react';
import { TeamService } from '@/services/teamService';
import { Team } from '@/types/team';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamDiscovery from '@/components/teams/TeamDiscovery';
import { Card, CardContent } from '@/components/ui/card';
import { Users, TrendingUp, Award, Globe } from 'lucide-react';

export default function PublicTeamDiscoveryPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTeams: 0,
    activeTeams: 0,
    totalMembers: 0,
    completedChallenges: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const publicTeams = await TeamService.discoverTeams({});
        setTeams(publicTeams);
        
        // Calculate stats
        const totalMembers = publicTeams.reduce((sum, team) => sum + team.currentMembers, 0);
        const completedChallenges = publicTeams.reduce((sum, team) => sum + team.completedChallenges, 0);
        
        setStats({
          totalTeams: publicTeams.length,
          activeTeams: publicTeams.filter(team => team.status === 'active').length,
          totalMembers,
          completedChallenges
        });
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Discover Teams
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Find and join teams that match your skills and interests. Collaborate on challenges and build amazing projects together.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-8">
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTeams}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Teams</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeTeams}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Active</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMembers}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Members</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 text-center">
                <Award className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedChallenges}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Won</div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Team Discovery */}
        <TeamDiscovery />
      </main>
      
      <Footer />
    </div>
  );
}
