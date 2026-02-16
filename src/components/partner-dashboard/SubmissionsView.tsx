import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Users, User, ExternalLink, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { doc, updateDoc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import WelcomeSection from '../dashboard/WelcomeSection';
import { useNavigate } from 'react-router-dom';

export default function SubmissionsView({ user }) {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [challengeFilter, setChallengeFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<'submittedAt' | 'score'>('submittedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch submissions and challenges
  const fetchSubmissionsData = async () => {
    const orgId = user?.organization?.id;
    if (!orgId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // First fetch challenge IDs from org subcollection
      const orgChallengesRef = collection(db, 'organizations', orgId, 'challenges');
      const orgChallengesSnapshot = await getDocs(orgChallengesRef);
      const challengeIds = orgChallengesSnapshot.docs.map(d => d.id);
      
      // Fetch full challenge data for each ID
      const challengesList = [];
      for (const challengeId of challengeIds) {
        const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
        if (challengeDoc.exists()) {
          challengesList.push({
            id: challengeDoc.id,
            title: challengeDoc.data().title,
            ...challengeDoc.data()
          });
        }
      }
      setChallenges(challengesList);

      // Then fetch submissions for these challenges
      if (challengesList.length > 0) {
        const allChallengeIds = challengesList.map(c => c.id);
        const allSubmissions = [];
        
        // Process in batches of 10 (Firestore limit)
        for (let i = 0; i < allChallengeIds.length; i += 10) {
          const batch = allChallengeIds.slice(i, i + 10);
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('challengeId', 'in', batch)
          );
          const submissionsSnapshot = await getDocs(submissionsQuery);
          allSubmissions.push(...submissionsSnapshot.docs);
        }

        const submissionsList = await Promise.all(
          allSubmissions.map(async (submissionDoc) => {
            const data = submissionDoc.data();
            
            // Get project data
            let projectData = null;
            let projectTitle = 'Untitled Project';
            if (data.projectId) {
              try {
                const projectRef = doc(db, 'projects', data.projectId);
                const projectSnap = await getDoc(projectRef);
                if (projectSnap.exists()) {
                  projectData = projectSnap.data();
                  projectTitle = projectData.title || 'Untitled Project';
                }
              } catch (error) {
                console.error('Error fetching project:', error);
              }
            }

            // Get challenge data
            const challengeRef = doc(db, 'challenges', data.challengeId);
            const challengeSnap = await getDoc(challengeRef);
            const challengeData = challengeSnap.exists() ? challengeSnap.data() : {};

            // Get participant info
            let participant = null;
            let participantType = 'individual';
            
            if (data.teamId) {
              try {
                const teamRef = doc(db, 'teams', data.teamId);
                const teamSnap = await getDoc(teamRef);
                if (teamSnap.exists()) {
                  const teamData = teamSnap.data();
                  participantType = 'team';
                  participant = {
                    uid: data.teamId,
                    name: teamData.name || 'Unnamed Team',
                    email: '',
                    avatar: teamData.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(teamData.name || 'T')}`,
                    type: 'team'
                  };
                }
              } catch (error) {
                console.error('Error fetching team:', error);
              }
            }
            
            if (!participant && data.userId) {
              try {
                const profileRef = doc(db, 'profiles', data.userId);
                const profileSnap = await getDoc(profileRef);
                const profileData = profileSnap.exists() ? profileSnap.data() : {};
                participant = {
                  uid: data.userId,
                  name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Anonymous User',
                  email: profileData.email || 'No email provided',
                  avatar: profileData.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.firstName || 'U')}`,
                  type: 'individual'
                };
              } catch (error) {
                console.error('Error fetching profile:', error);
              }
            }

            if (!participant) {
              participant = {
                uid: data.userId || 'unknown',
                name: 'Anonymous User',
                email: 'No email provided',
                avatar: 'https://ui-avatars.com/api/?name=U',
                type: 'individual'
              };
            }

            // Convert timestamps
            const submittedAt = data.createdAt?.toDate ? 
              data.createdAt.toDate().toISOString() : 
              data.createdAt;
            const updatedAt = data.updatedAt?.toDate ? 
              data.updatedAt.toDate().toISOString() : 
              data.updatedAt;
            const reviewedAt = data.reviewedAt?.toDate ? 
              data.reviewedAt.toDate().toISOString() : 
              data.reviewedAt;

            return {
              id: submissionDoc.id,
              projectId: data.projectId || null,
              title: projectTitle,
              challenge: challengeData.title || 'Unnamed Challenge',
              challengeId: data.challengeId,
              participant,
              participantType,
              teamId: data.teamId || null,
              status: data.status || 'pending',
              submittedAt,
              lastUpdated: updatedAt,
              reviewedAt,
              tags: challengeData.tags || [],
              score: data.score !== undefined ? data.score : null,
              feedback: data.feedback || '',
              note: data.note || '',
              projectData
            };
          })
        );

        // Sort by date (newest first)
        submissionsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        setSubmissions(submissionsList);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissionsData();
  }, [user?.organization?.id]);

  const refreshSubmissions = () => {
    fetchSubmissionsData();
  };

  const handleSortToggle = (field: 'submittedAt' | 'score') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Switch to new field with default desc order
      setSortField(field);
      setSortDirection('desc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const handleReviewSubmit = async () => {
    if (!selectedSubmission) return;
    
    if (score < 0 || score > 100) {
      toast.error('Score must be between 0 and 100');
      return;
    }
    
    setSubmitting(true);
    try {
      // Update the submission with feedback and score
      const submissionRef = doc(db, 'submissions', selectedSubmission.id);
      await updateDoc(submissionRef, {
        feedback: feedback.trim(),
        score: score,
        status: 'reviewed',
        reviewedAt: new Date()
      });
      
      toast.success("Review submitted successfully!");
      setSelectedSubmission(null);
      setFeedback('');
      setScore(0);
      
      // Refresh submissions list
      if (refreshSubmissions) refreshSubmissions();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewProject = (submission) => {
    if (submission.projectId) {
      // Navigate to project showcase page
      window.open(`/p/${submission.projectId}`, '_blank');
    } else {
      toast.error('Project not available');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter submissions based on search, status, challenge, and score
  const filteredSubmissions = useMemo(() => {
    const filtered = submissions.filter(submission => {
      const matchesSearch = 
        submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        submission.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
      
      const matchesChallenge = challengeFilter === 'all' || submission.challengeId === challengeFilter;
      
      // Score filtering
      let matchesScore = true;
      if (scoreFilter === 'scored') {
        matchesScore = submission.score !== null && submission.score !== undefined;
      } else if (scoreFilter === 'not-scored') {
        matchesScore = submission.score === null || submission.score === undefined;
      } else if (scoreFilter === 'high') {
        matchesScore = submission.score !== null && submission.score !== undefined && submission.score >= 80;
      } else if (scoreFilter === 'medium') {
        matchesScore = submission.score !== null && submission.score !== undefined && submission.score >= 50 && submission.score < 80;
      } else if (scoreFilter === 'low') {
        matchesScore = submission.score !== null && submission.score !== undefined && submission.score < 50;
      }
      
      return matchesSearch && matchesStatus && matchesChallenge && matchesScore;
    });

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      if (sortField === 'submittedAt') {
        const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortField === 'score') {
        const scoreA = a.score ?? -1; // Treat null/undefined as -1 for sorting
        const scoreB = b.score ?? -1;
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      return 0;
    });

    return sorted;
  }, [submissions, searchQuery, statusFilter, challengeFilter, scoreFilter, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSubmissions.slice(startIndex, endIndex);
  }, [filteredSubmissions, currentPage, itemsPerPage]);

  // Reset to first page when filters change
  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300 border-amber-300 dark:border-amber-800">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">Reviewed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-300 dark:border-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />;
      case 'reviewed':
        return <CheckCircle className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500 dark:text-slate-400" />;
    }
  };

  const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-slate-500 dark:text-slate-400';
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBadgeColor = (score) => {
    if (score === null || score === undefined) return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    if (score >= 80) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
    if (score >= 50) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        <WelcomeSection title='Submissions' subtitle="Manage and review participant submissions from teams and individuals." />
        
        {/* Filter Skeletons */}
        <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-4">
          <Skeleton className="h-10 flex-grow rounded-md" />
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Skeleton className="h-10 w-full sm:w-[180px] rounded-md" />
            <Skeleton className="h-10 w-full sm:w-[200px] rounded-md" />
            <Skeleton className="h-10 w-full sm:w-[200px] rounded-md" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Project</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Participant</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Score</th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i}>
                    <td className="px-3 sm:px-6 py-4">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full mr-3" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-32 mt-1 hidden sm:block" />
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <Skeleton className="h-5 w-5 rounded-full mr-2" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Skeleton className="h-8 w-8 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <WelcomeSection title='Submissions' subtitle="Manage and review participant submissions from teams and individuals." />
      
      {/* Filters */}
      <div className="flex flex-col space-y-3 lg:flex-row lg:space-y-0 lg:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <Input 
            type="search" 
            placeholder="Search by project name or participant..." 
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Select value={statusFilter} onValueChange={(value) => handleFilterChange(setStatusFilter, value)}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Statuses</SelectItem>
              <SelectItem value="pending" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Pending Review</SelectItem>
              <SelectItem value="reviewed" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Reviewed</SelectItem>
              <SelectItem value="rejected" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={challengeFilter} onValueChange={(value) => handleFilterChange(setChallengeFilter, value)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by challenge" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Challenges</SelectItem>
              {challenges.map(challenge => (
                <SelectItem key={challenge.id} value={challenge.id} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                  {challenge.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={scoreFilter} onValueChange={(value) => handleFilterChange(setScoreFilter, value)}>
            <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Filter by score" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Scores</SelectItem>
              <SelectItem value="scored" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Has Score</SelectItem>
              <SelectItem value="not-scored" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Not Scored</SelectItem>
              <SelectItem value="high" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">High (80+)</SelectItem>
              <SelectItem value="medium" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Medium (50-79)</SelectItem>
              <SelectItem value="low" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Low (&lt;50)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Submissions table */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Project</span>
                  <span className="sm:hidden">Proj</span>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Participant</span>
                  <span className="sm:hidden">User</span>
                </th>
                <th 
                  scope="col" 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell cursor-pointer transition-colors select-none"
                  onClick={() => handleSortToggle('submittedAt')}
                >
                  <div className="flex items-center gap-1">
                    Submitted
                    {sortField === 'submittedAt' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                    {sortField !== 'submittedAt' && (
                      <ChevronDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell cursor-pointer transition-colors select-none"
                  onClick={() => handleSortToggle('score')}
                >
                  <div className="flex items-center gap-1">
                    Score
                    {sortField === 'score' && (
                      sortDirection === 'asc' ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                    )}
                    {sortField !== 'score' && (
                      <ChevronDown className="h-4 w-4 opacity-30" />
                    )}
                  </div>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {paginatedSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No submissions found. Try adjusting your filters or check back later.
                  </td>
                </tr>
              ) : (
                paginatedSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                            {submission.title}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{submission.challenge}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-3 border-2 border-slate-200 dark:border-slate-700">
                          <img 
                            src={submission.participant.avatar} 
                            alt={submission.participant.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(submission.participant.name)}`;
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">{submission.participant.name}</div>
                            {submission.participantType === 'team' ? (
                              <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                <Users className="h-3 w-3 mr-1" />
                                Team
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                <User className="h-3 w-3 mr-1" />
                                Individual
                              </Badge>
                            )}
                          </div>
                          {submission.participant.email && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{submission.participant.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(submission.status)}
                        <span className="ml-2">{getStatusBadge(submission.status)}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      {submission.score !== null && submission.score !== undefined ? (
                        <Badge className={`${getScoreBadgeColor(submission.score)} border-0`}>
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          {submission.score}/100
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400 dark:text-slate-500">Not scored</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center gap-2 justify-end">
                        {submission.projectId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewProject(submission)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                            title="View project"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setFeedback(submission.feedback || '');
                                setScore(submission.score !== null && submission.score !== undefined ? submission.score : 0);
                              }}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[700px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle className="text-slate-900 dark:text-white">Review Submission</DialogTitle>
                              <DialogDescription className="text-slate-600 dark:text-slate-400">
                                Provide feedback and scoring for this submission.
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedSubmission && (
                              <div className="py-4">
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-full grid grid-cols-2">
                                    <TabsTrigger 
                                      value="details"
                                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                                    >
                                      Project Details
                                    </TabsTrigger>
                                    <TabsTrigger 
                                      value="feedback"
                                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                                    >
                                      Provide Feedback
                                    </TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="space-y-4 mt-0">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                      <div className="flex items-start justify-between mb-4">
                                        <div>
                                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{selectedSubmission.title}</h3>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            {selectedSubmission.participantType === 'team' ? (
                                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                                <Users className="h-3 w-3 mr-1" />
                                                Team Submission
                                              </Badge>
                                            ) : (
                                              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                                                <User className="h-3 w-3 mr-1" />
                                                Individual Submission
                                              </Badge>
                                            )}
                                            <Badge variant="outline">{selectedSubmission.challenge}</Badge>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-3">
                                        <div>
                                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Submitted by</p>
                                          <div className="flex items-center gap-2">
                                            <img 
                                              src={selectedSubmission.participant.avatar} 
                                              alt={selectedSubmission.participant.name}
                                              className="h-6 w-6 rounded-full"
                                              onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSubmission.participant.name)}`;
                                              }}
                                            />
                                            <p className="text-sm text-slate-900 dark:text-white">{selectedSubmission.participant.name}</p>
                                          </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Submitted</p>
                                            <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedSubmission.submittedAt)}</p>
                                          </div>
                                          
                                          {selectedSubmission.reviewedAt && (
                                            <div>
                                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Reviewed</p>
                                              <p className="text-sm text-slate-900 dark:text-white">{formatDate(selectedSubmission.reviewedAt)}</p>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {selectedSubmission.projectId && (
                                          <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">Project</p>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => handleViewProject(selectedSubmission)}
                                              className="w-full justify-start text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                            >
                                              <Eye className="h-4 w-4 mr-2" />
                                              View Full Project
                                              <ExternalLink className="h-3 w-3 ml-2" />
                                            </Button>
                                          </div>
                                        )}
                                        
                                        {selectedSubmission.score !== null && selectedSubmission.score !== undefined && (
                                          <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Current Score</p>
                                            <Badge className={`${getScoreBadgeColor(selectedSubmission.score)} border-0 text-base px-3 py-1`}>
                                              <Star className="h-4 w-4 mr-1 fill-current" />
                                              {selectedSubmission.score}/100
                                            </Badge>
                                          </div>
                                        )}
                                        
                                        {selectedSubmission.feedback && (
                                          <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Previous Feedback</p>
                                            <p className="text-sm bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md text-slate-900 dark:text-white">{selectedSubmission.feedback}</p>
                                          </div>
                                        )}
                                        
                                        {selectedSubmission.note && (
                                          <div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Submission Note</p>
                                            <p className="text-sm bg-slate-100 dark:bg-slate-700/50 p-3 rounded-md text-slate-900 dark:text-white">{selectedSubmission.note}</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="feedback" className="space-y-6 mt-0">
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <label htmlFor="score" className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                          <Star className="h-4 w-4 text-amber-500" />
                                          Score (0-100)
                                        </label>
                                        <div className="space-y-3">
                                          <Slider
                                            value={[score]}
                                            onValueChange={(value) => setScore(value[0])}
                                            max={100}
                                            min={0}
                                            step={1}
                                            className="w-full"
                                          />
                                          <div className="flex items-center justify-between">
                                            <Input
                                              id="score"
                                              type="number"
                                              min="0"
                                              max="100"
                                              value={score}
                                              onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                setScore(Math.min(100, Math.max(0, val)));
                                              }}
                                              className="w-24 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-center font-semibold"
                                            />
                                            <div className="flex items-center gap-2">
                                              <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                                                {score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : score > 0 ? 'Needs Improvement' : 'Not Scored'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      <div className="space-y-2">
                                        <label htmlFor="feedback" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                          Feedback
                                        </label>
                                        <Textarea
                                          id="feedback"
                                          placeholder="Provide constructive feedback about the submission. Be specific about strengths, areas for improvement, and overall impressions..."
                                          value={feedback}
                                          onChange={(e) => setFeedback(e.target.value)}
                                          className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[200px] resize-none"
                                        />
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                          {feedback.length} characters
                                        </p>
                                      </div>
                                      
                                      {selectedSubmission.feedback && (
                                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">Note:</p>
                                          <p className="text-xs text-amber-700 dark:text-amber-400">
                                            This submission already has feedback. Your new feedback will replace the existing one.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                            
                            <DialogFooter className="gap-2 sm:gap-0">
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedSubmission(null);
                                  setFeedback('');
                                  setScore(0);
                                }}
                                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                              >
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleReviewSubmit}
                                disabled={submitting || score < 0 || score > 100}
                                className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50"
                              >
                                {submitting ? 'Submitting...' : 'Submit Review'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredSubmissions.length)} of {filteredSubmissions.length} submissions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first, last, current, and pages around current
                    if (page === 1 || page === totalPages) return true;
                    if (Math.abs(page - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((page, index, array) => (
                    <React.Fragment key={page}>
                      {/* Show ellipsis if there's a gap */}
                      {index > 0 && page - array[index - 1] > 1 && (
                        <span className="px-2 text-slate-400 dark:text-slate-500">...</span>
                      )}
                      <Button
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page 
                          ? "bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 min-w-[36px]" 
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 min-w-[36px]"
                        }
                      >
                        {page}
                      </Button>
                    </React.Fragment>
                  ))
                }
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
