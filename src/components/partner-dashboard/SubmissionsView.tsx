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
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending Review</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Reviewed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'reviewed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="space-y-6 mt-5">
      <WelcomeSection title='Submissions' subtitle="Manage and review participant submissions." />
      
      {/* Filters */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <Input 
            type="search" 
            placeholder="Search submissions..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        
        <div className="flex space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={challengeFilter} onValueChange={setChallengeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by challenge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              {challenges.map(challenge => (
                <SelectItem key={challenge.id} value={challenge.id}>
                  {challenge.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Submissions table */}
      <div className="bg-white overflow-hidden rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                    No submissions found. Try adjusting your filters or check back later.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((submission) => (
                  <tr key={submission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="ml-0">
                          <div className="text-sm font-medium text-gray-900">{submission.title}</div>
                          <div className="text-xs text-gray-500">{submission.challenge}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                          <div className="text-sm font-medium text-gray-900">{submission.participant.name}</div>
                          <div className="text-xs text-gray-500">{submission.participant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(submission.submittedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(submission.status)}
                        <span className="ml-2">{getStatusBadge(submission.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.score ? `${submission.score}/100` : 'Not scored'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setFeedback(submission.feedback || '');
                              setScore(submission.score || 0);
                            }}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[625px]">
                          <DialogHeader>
                            <DialogTitle>Review Submission</DialogTitle>
                            <DialogDescription>
                              Provide feedback and scoring for this submission.
                            </DialogDescription>
                          </DialogHeader>
                          
                          {selectedSubmission && (
                            <div className="py-4">
                              <Tabs defaultValue="details">
                                <TabsList className="mb-4">
                                  <TabsTrigger value="details">Submission Details</TabsTrigger>
                                  <TabsTrigger value="feedback">Provide Feedback</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="details" className="space-y-4">
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedSubmission.title}</h3>
                                    <p className="text-sm text-gray-500">Submitted by {selectedSubmission.participant.name}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Submission URL</p>
                                      <a 
                                        href={selectedSubmission.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline break-all"
                                      >
                                        {selectedSubmission.githubUrl}
                                      </a>
                                    </div>
                                    
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Submitted</p>
                                      <p>{formatDate(selectedSubmission.submittedAt)}</p>
                                    </div>
                                  </div>
                                  
                                  {selectedSubmission.note && (
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Submission Note</p>
                                      <p className="text-sm mt-1 bg-gray-50 p-3 rounded-md">{selectedSubmission.note}</p>
                                    </div>
                                  )}
                                </TabsContent>
                                
                                <TabsContent value="feedback" className="space-y-4">
                                  <div className="space-y-2">
                                    <label htmlFor="feedback" className="text-sm font-medium text-gray-700">
                                      Feedback
                                    </label>
                                    <Textarea
                                      id="feedback"
                                      placeholder="Provide constructive feedback..."
                                      value={feedback}
                                      onChange={(e) => setFeedback(e.target.value)}
                                      className="min-h-[120px]"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <label htmlFor="score" className="text-sm font-medium text-gray-700">
                                      Score (0-100)
                                    </label>
                                    <Input
                                      id="score"
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={score}
                                      onChange={(e) => setScore(parseInt(e.target.value) || 0)}
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
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleReviewSubmit}
                              disabled={submitting}
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