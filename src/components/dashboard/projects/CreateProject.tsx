import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { TeamService } from '@/services/teamService';

interface CreateProjectProps {
  projectId?: string; // If provided, we're editing
  challengeContext?: {
    challengeId: string;
    challengeTitle: string;
    teamId?: string;
  };
  onBack: () => void;
  setActiveView: (view: string, data?: any) => void;
}

export default function CreateProject({ projectId, challengeContext, onBack, setActiveView }: CreateProjectProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingProject, setFetchingProject] = useState(!!projectId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [readme, setReadme] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  const [selectedChallengeId, setSelectedChallengeId] = useState(challengeContext?.challengeId || '');
  const [selectedTeamId, setSelectedTeamId] = useState(challengeContext?.teamId || '');
  const [availableChallenges, setAvailableChallenges] = useState([]);
  const [userTeams, setUserTeams] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // If editing, fetch the existing project
      if (projectId) {
        try {
          setFetchingProject(true);
          const projectRef = doc(db, 'projects', projectId);
          const projectSnap = await getDoc(projectRef);
          
          if (projectSnap.exists()) {
            const projectData = projectSnap.data();
            setTitle(projectData.title || '');
            setDescription(projectData.description || '');
            setReadme(projectData.readme || '');
            setYoutubeUrl(projectData.youtubeVideoId ? `https://www.youtube.com/watch?v=${projectData.youtubeVideoId}` : '');
            setVisibility(projectData.visibility || 'private');
            setSelectedChallengeId(projectData.challengeId || '');
            setSelectedTeamId(projectData.teamId || '');
          } else {
            toast.error('Project not found');
            onBack();
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          toast.error('Error loading project');
          onBack();
        } finally {
          setFetchingProject(false);
        }
      }

      // Fetch user's challenges
      try {
        const userChallengesRef = collection(db, 'users', user.uid, 'challenges');
        const userChallengesSnap = await getDocs(userChallengesRef);
        
        const challenges = [];
        for (const challengeDoc of userChallengesSnap.docs) {
          const challengeId = challengeDoc.id;
          const challengeRef = doc(db, 'challenges', challengeId);
          const challengeSnap = await getDoc(challengeRef);
          if (challengeSnap.exists()) {
            challenges.push({
              id: challengeId,
              title: challengeSnap.data().title || 'Unknown Challenge'
            });
          }
        }
        setAvailableChallenges(challenges);
      } catch (error) {
        console.error('Error fetching challenges:', error);
      }

      // Fetch user's teams
      try {
        const teams = await TeamService.getUserTeams(user.uid);
        setUserTeams(teams.filter(team => team.status === 'active'));
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };

    fetchData();
  }, [user, projectId]);

  const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;
    
    // Match various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedChallengeId) {
      toast.error('Please select a challenge');
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const youtubeVideoId = extractYouTubeVideoId(youtubeUrl);

      if (projectId) {
        // Update existing project
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
          title: title.trim(),
          description: description.trim(),
          readme: readme.trim(),
          youtubeVideoId: youtubeVideoId || null,
          visibility: visibility,
          updatedAt: new Date()
        });

        toast.success('Project updated successfully!');
        setActiveView('project', projectId);
      } else {
        // Create new project
        const projectData = {
          title: title.trim(),
          description: description.trim(),
          readme: readme.trim(),
          youtubeVideoId: youtubeVideoId || null,
          challengeId: selectedChallengeId,
          userId: user.uid,
          teamId: selectedTeamId || null,
          visibility: visibility,
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'projects'), projectData);

        toast.success('Project created successfully!');
        setActiveView('project', docRef.id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Button 
        variant="ghost" 
        className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-3" 
        onClick={onBack}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Projects
      </Button>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            {projectId ? 'Edit Project' : 'Create New Project'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fetchingProject ? (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400">
              Loading project...
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="challenge" className="text-slate-700 dark:text-slate-300">
                Challenge <span className="text-red-500">*</span>
              </Label>
              <select
                id="challenge"
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                required
                disabled={!!projectId || !!challengeContext}
                className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
              >
                <option value="">Select a challenge</option>
                {availableChallenges.map((challenge) => (
                  <option key={challenge.id} value={challenge.id}>
                    {challenge.title}
                  </option>
                ))}
              </select>
            </div>

            {userTeams.length > 0 && (
              <div>
                <Label htmlFor="team" className="text-slate-700 dark:text-slate-300">
                  Team (Optional)
                </Label>
                <select
                  id="team"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100"
                  disabled={!!projectId || !!challengeContext?.teamId}
                >
                  <option value="">Individual Project</option>
                  {userTeams
                    .filter(team => team.challengeId === selectedChallengeId || !selectedChallengeId)
                    .map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select a team if this is a team project
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">
                Project Title <span className="text-red-500">*</span>
              </Label>
              <Input 
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="My Awesome Project"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 resize-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="Brief description of your project..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="readme" className="text-slate-700 dark:text-slate-300">
                Readme (Markdown supported)
              </Label>
              <Textarea 
                id="readme"
                value={readme}
                onChange={(e) => setReadme(e.target.value)}
                className="mt-1 resize-none font-mono text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="# Project Name&#10;&#10;## Overview&#10;Your project description here..."
                rows={12}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Use Markdown syntax for formatting (headers, lists, code blocks, etc.)
              </p>
            </div>

            <div>
              <Label htmlFor="youtube" className="text-slate-700 dark:text-slate-300">
                YouTube Demo Video URL
              </Label>
              <Input 
                id="youtube"
                type="url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="mt-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white"
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Share a demo video of your project (optional)
              </p>
            </div>

            <div>
              <Label className="text-slate-700 dark:text-slate-300 mb-2 block">
                Visibility
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    visibility === 'private'
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold mb-1">Private</div>
                    <div className="text-xs opacity-80">
                      Only accessible by challenge maker and team members
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors ${
                    visibility === 'public'
                      ? 'border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-left">
                    <div className="font-semibold mb-1">Public</div>
                    <div className="text-xs opacity-80">
                      Can be showcased on public pages
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {visibility === 'private' 
                  ? 'This project will only be visible to you, team members, and the challenge organizer.' 
                  : 'This project can be featured on showcase pages for others to discover.'}
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim() || !description.trim() || !selectedChallengeId}
                className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-slate-100 dark:border-slate-900 border-t-transparent rounded-full animate-spin mr-2"></span>
                    {projectId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {projectId ? 'Update Project' : 'Create Project'}
                  </>
                )}
              </Button>
            </div>
          </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}