import React, { useState } from 'react';
import { Search, Filter, ChevronDown, CheckCircle, XCircle, Clock } from 'lucide-react';
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
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import WelcomeSection from '../dashboard/WelcomeSection';

export default function SubmissionsView({ submissions, challenges, refreshSubmissions, isLoading }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [challengeFilter, setChallengeFilter] = useState('all');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleReviewSubmit = async () => {
    if (!selectedSubmission) return;
    
    setSubmitting(true);
    try {
      // Update the submission with feedback and score
      const submissionRef = doc(db, 'submissions', selectedSubmission.id);
      await updateDoc(submissionRef, {
        feedback: feedback,
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

  // Filter submissions based on search, status, and challenge
  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.participant.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    
    const matchesChallenge = challengeFilter === 'all' || submission.challengeId === challengeFilter;
    
    return matchesSearch && matchesStatus && matchesChallenge;
  });

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <WelcomeSection title='Submissions' subtitle="Manage and review participant submissions." />
      
      {/* Filters */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </div>
          <Input 
            type="search" 
            placeholder="Search submissions..." 
            className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          
          <Select value={challengeFilter} onValueChange={setChallengeFilter}>
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
        </div>
      </div>
      
      {/* Submissions table */}
      <div className="bg-white dark:bg-slate-900 overflow-hidden rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Submission</span>
                  <span className="sm:hidden">Sub</span>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span className="hidden sm:inline">Participant</span>
                  <span className="sm:hidden">User</span>
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                  Submitted
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                  Score
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-10 text-center text-slate-500 dark:text-slate-400 text-sm">
                    No submissions found. Try adjusting your filters or check back later.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{submission.title}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{submission.challenge}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full overflow-hidden mr-3">
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
                          <div className="text-sm font-medium text-slate-900 dark:text-white">{submission.participant.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{submission.participant.email}</div>
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
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {submission.score ? `${submission.score}/100` : 'Not scored'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setFeedback(submission.feedback || '');
                              setScore(submission.score || 0);
                            }}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          <DialogHeader>
                            <DialogTitle className="text-slate-900 dark:text-white">Review Submission</DialogTitle>
                            <DialogDescription className="text-slate-600 dark:text-slate-400">
                              Provide feedback and scoring for this submission.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="py-4">
                              <Tabs defaultValue="details">
                                <TabsList className="mb-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                                  <TabsTrigger 
                                    value="details"
                                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                                  >
                                    Submission Details
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="feedback"
                                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
                                  >
                                    Provide Feedback
                                  </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="details" className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedSubmission.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Submitted by {selectedSubmission.participant.name}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submission URL</p>
                                      <a 
                                        href={selectedSubmission.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                                      >
                                        {selectedSubmission.githubUrl}
                                      </a>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submitted</p>
                                      <p className="text-slate-900 dark:text-white">{formatDate(selectedSubmission.submittedAt)}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedSubmission.note && (
                                    <div>
                                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Submission Note</p>
                                      <p className="text-sm mt-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-slate-900 dark:text-white">{selectedSubmission.note}</p>
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="feedback" className="space-y-4">
                                  <div className="space-y-2">
                                    <label htmlFor="feedback" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                      Feedback
                                    </label>
                                    <Textarea
                                      id="feedback"
                                      placeholder="Provide constructive feedback..."
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white min-h-[120px]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label htmlFor="score" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                      Score (0-100)
                                    </label>
                                    <Input
                                      id="score"
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={score}
                                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
                                      className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                                    />
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </div>
                          )}
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedSubmission(null)}
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleReviewSubmit}
                              disabled={submitting}
                              className="bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200"
                            >
                              {submitting ? 'Submitting...' : 'Submit Review'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}