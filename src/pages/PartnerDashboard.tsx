import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { signOut } from '@/services/auth';
import { 
  LayoutDashboard, FileText, Users, Settings, LogOut, Plus,
  ChevronRight, Sparkles, Search,
  Trophy, DollarSign, Award, Download, Filter, InboxIcon, Eye, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { User } from '@/types/user';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from '@/contexts/AuthContext';
import StatsCard from '@/components/dashboard/StatsCard';
import LoadingScreen from '@/components/dashboard/LoadingScreen';
import ChallengeCard from '@/components/dashboard/ChallengeCard';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import MobileHeader from '@/components/dashboard/MobileHeader';
import MobileTabNav from '@/components/dashboard/MobileTabNav';
import NewChallengeForm from '@/components/dashboard/NewChallengeForm';
import SearchBar from '@/components/dashboard/SearchBar';
import Logo from '@/components/Logo';

const PartnerDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showNewChallengeModal, setShowNewChallengeModal] = useState(false);
  const navigate = useNavigate();
  const { user: authUser, loading } = useAuth();
  const user: User = {
    id: '1',
    fullName: 'John Doe',
    email: 'partner-approved@qiesta.com',
    userType: 'partner',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated'
  }

  // New challenge form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    prize: '',
    deadline: '',
    requirements: '',
    categories: '',
    status: 'draft',
    maxParticipants: '',
    submissionFormat: 'github', // or 'file' or 'url'
    evaluationCriteria: '',
    termsAndConditions: ''
  });

  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    score: '',
    comments: '',
    status: 'pending'
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateChallenge = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success('Challenge created successfully!');
    setShowNewChallengeModal(false);
  };

  // Mock data with more realistic information
  const stats = [
    {
      label: 'Active Challenges',
      value: '5',
      change: '+2 this month',
      icon: Trophy,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10'
    },
    {
      label: 'Total Participants',
      value: '842',
      change: '+156 this month',
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    },
    {
      label: 'Total Prize Pool',
      value: '$175K',
      change: '+$45K this month',
      icon: DollarSign,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10'
    },
    {
      label: 'Success Rate',
      value: '87%',
      change: '+12% this month',
      icon: Award,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10'
    }
  ];

  const challenges = [
    {
      id: '1',
      title: 'AI Innovation Challenge 2024',
      description: 'Looking for breakthrough AI solutions in healthcare',
      organization: 'TechCorp International',
      status: 'active',
      participants: 234,
      submissions: 89,
      progress: 75,
      daysLeft: 12,
      prize: '$75,000',
      deadline: '2024-05-20',
      categories: ['AI', 'Healthcare'],
      createdAt: '2024-01-15',
      updatedAt: '2024-03-01'
    },
    {
      id: '2',
      title: 'Sustainable Energy Challenge',
      description: 'Developing renewable energy solutions for rural areas',
      organization: 'TechCorp International',
      status: 'draft',
      participants: 0,
      submissions: 0,
      progress: 0,
      daysLeft: 30,
      prize: '$50,000',
      deadline: '2024-06-15',
      categories: ['CleanTech', 'Sustainability'],
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    }
  ];

  const submissions = [
    {
      id: '1',
      title: 'AI Healthcare Assistant',
      challenge: 'AI Innovation Challenge 2024',
      githubUrl: 'https://github.com/user/ai-healthcare',
      participant: {
        name: 'John Smith',
        email: 'john@example.com',
        avatar: 'https://ui-avatars.com/api/?name=John+Smith'
      },
      status: 'pending',
      submittedAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z',
      tags: ['AI', 'Healthcare', 'Python'],
      score: 0
    },
    {
      id: '2',
      title: 'Smart Diagnosis System',
      challenge: 'Sustainable Energy Challenge',
      githubUrl: 'https://github.com/user/smart-diagnosis',
      participant: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson'
      },
      status: 'pending',
      submittedAt: '2024-03-15T10:30:00Z',
      lastUpdated: '2024-03-15T10:30:00Z',
      tags: ['AI', 'Healthcare', 'Python'],
      score: 0
    },
  ];

  if (loading) {
      return <LoadingScreen />;
    }
  
    if (!authUser) {
      return <Navigate to="/signin" />;
    }

  const renderMainContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <WelcomeSection user={authUser} />
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {stats.map((stat, index) => (
                <StatsCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Submissions */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Submissions</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveView('submissions')}
                    >
                      View All <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  {submissions.length > 0 ? (
                    submissions.slice(0, 3).map((submission) => (
                      <div 
                        key={submission.id} 
                        className="flex items-start p-4 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowSubmissionModal(true);
                        }}
                      >
                        <div className="p-2 bg-primary/10 rounded-lg mr-4">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{submission.title}</p>
                          <p className="text-sm text-gray-500 mt-1">{submission.participant.name}</p>
                          <div className="flex items-center mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {submission.status}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No submissions yet
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowNewChallengeModal(true)}
                      className="w-full justify-start text-left"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Create New Challenge
                    </Button>
                    <Button 
                      onClick={() => setActiveView('submissions')}
                      className="w-full justify-start text-left"
                      variant="outline"
                    >
                      <InboxIcon className="mr-2 h-5 w-5" />
                      Review Submissions ({submissions.filter(s => s.status === 'pending').length})
                    </Button>
                    <Button 
                      onClick={() => setActiveView('settings')}
                      className="w-full justify-start text-left"
                      variant="outline"
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Update Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Challenges */}
            <div className="bg-white rounded-xl shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Active Challenges</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveView('challenges')}>
                    View All <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {challenges
                    .filter(challenge => challenge.status === 'active')
                    .slice(0, 2)
                    .map((challenge, index) => (
                      <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Challenge Management</h2>
                <p className="text-sm text-gray-600">Create and manage your innovation challenges</p>
              </div>
              <Button 
                onClick={() => setShowNewChallengeModal(true)}
                className="bg-primary text-white w-full sm:w-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Challenge
              </Button>
            </div>

            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
            />

            <Tabs defaultValue="all" className="w-full">
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <TabsList className="w-full justify-start min-w-max px-3 sm:px-0">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
                  <TabsTrigger value="draft" className="flex-1">Drafts</TabsTrigger>
                  <TabsTrigger value="completed" className="flex-1">Completed</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-4 sm:mt-6">
                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      index={index}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'submissions':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Submissions</h2>
                <p className="text-sm text-gray-600">Review and manage challenge submissions</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full sm:w-auto justify-center" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="w-full sm:w-auto justify-center" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Submissions', value: '97', change: '+12 today', color: 'blue' },
                { label: 'Pending Review', value: '24', change: '4 urgent', color: 'yellow' },
                { label: 'Approved', value: '45', change: '86% rate', color: 'green' },
                { label: 'Rejected', value: '28', change: '14% rate', color: 'red' }
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs text-${stat.color}-500 mt-1`}>{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search submissions..."
                  className="pl-9 w-full"
                />
              </div>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
                <option value="all">All Challenges</option>
                {challenges.map(challenge => (
                  <option key={challenge.id} value={challenge.id}>{challenge.title}</option>
                ))}
              </select>
              <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full sm:w-auto">
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="reviewed">Reviewed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Submissions Table/Grid */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[35%]">
                        Submission Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                        Participant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Submitted
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start">
                            <div className="p-2 bg-primary/10 rounded-lg mr-3 mt-1">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{submission.title}</div>
                              <p className="text-sm text-gray-500 mb-1">{submission.challenge}</p>
                              <div className="flex flex-wrap gap-1">
                                {submission.tags?.map(tag => (
                                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img 
                              src={submission.participant.avatar} 
                              alt={submission.participant.name}
                              className="h-8 w-8 rounded-full mr-3"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{submission.participant.name}</div>
                              <div className="text-sm text-gray-500">{submission.participant.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant="secondary"
                            className={cn(
                              submission.status === 'approved' && "bg-green-100 text-green-700",
                              submission.status === 'rejected' && "bg-red-100 text-red-700",
                              submission.status === 'pending' && "bg-yellow-100 text-yellow-700",
                              submission.status === 'reviewed' && "bg-blue-100 text-blue-700"
                            )}
                          >
                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                          </Badge>
                          {/* {submission.score && (
                            <div className="text-sm text-gray-500 mt-1">
                              Score: {submission.score}/100
                            </div>
                          )} */}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(submission.submittedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {submission.status === 'pending' && (
                            <Button variant="ghost" size="sm" className="text-primary">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="lg:hidden divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <div key={submission.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{submission.title}</p>
                          <p className="text-sm text-gray-500">{submission.challenge}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <img 
                              src={submission.participant.avatar} 
                              alt={submission.participant.name}
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="text-sm text-gray-600">{submission.participant.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {submission.tags?.map(tag => (
                              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ml-2",
                          submission.status === 'approved' && "bg-green-100 text-green-700",
                          submission.status === 'rejected' && "bg-red-100 text-red-700",
                          submission.status === 'pending' && "bg-yellow-100 text-yellow-700"
                        )}
                      >
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {submission.status === 'pending' && (
                          <Button variant="ghost" size="sm" className="text-primary">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="p-3 sm:p-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-sm text-gray-600 text-center sm:text-left">
                    Showing 1 to 10 of 97 submissions
                  </p>
                  <div className="flex items-center justify-center sm:justify-end gap-2">
                    <Button variant="outline" size="sm" className="w-24" disabled>
                      Previous
                    </Button>
                    <Button variant="outline" size="sm" className="w-24">
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">Settings</h2>
                <p className="text-sm text-gray-600">Manage your account and preferences</p>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            <div className="grid gap-6">
              {/* Profile Section */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium">Profile Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Update your account information</p>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <Input defaultValue={user.fullName} className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <Input defaultValue={user.email} type="email" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Organization
                        </label>
                        <Input defaultValue="TechCorp International" className="max-w-md" />
                      </div>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <Input type="tel" placeholder="+1 (555) 000-0000" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <Input placeholder="City, Country" className="max-w-md" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Website
                        </label>
                        <Input type="url" placeholder="https://" className="max-w-md" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium">Notification Settings</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your notification preferences</p>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive updates about your challenges</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">New Submissions</p>
                        <p className="text-sm text-gray-500">Get notified when participants submit solutions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Challenge Updates</p>
                        <p className="text-sm text-gray-500">Receive updates about challenge progress</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-medium">Security</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your account security settings</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Change Password</h4>
                    <div className="space-y-4 max-w-md">
                      <Input type="password" placeholder="Current Password" />
                      <Input type="password" placeholder="New Password" />
                      <Input type="password" placeholder="Confirm New Password" />
                      <Button>Update Password</Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes */}
              <div className="flex items-center justify-end gap-4 pt-4">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={() => toast.success('Settings saved successfully!')}
                  className="bg-primary text-white"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <MobileHeader
        user={user}
        onSignOut={handleSignOut}
      />

      <aside className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50",
        "w-72 hidden lg:block"
      )}>
        <div className="flex flex-col h-full">
          <Logo class_name="ml-4" />

          <nav className="flex-1 p-4">
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Main
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'overview' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('overview')}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Overview
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'challenges' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('challenges')}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Challenges
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'submissions' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('submissions')}
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Submissions
                  </Button>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                  Settings
                </div>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${
                      activeView === 'settings' 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-600'
                    }`}
                    onClick={() => setActiveView('settings')}
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </div>
              </div>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {authUser?.fullName?.[0] || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{authUser?.fullName || 'Admin User'}</p>
                  <p className="text-sm text-gray-500">{authUser?.email}</p>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className={cn(
        "transition-all duration-200 ease-in-out",
        "lg:ml-72",
        "px-3 sm:px-6 lg:px-8",
        "pt-14 pb-20 lg:pb-12"
      )}>
        <div className="max-w-7xl mx-auto">
          {renderMainContent()}
        </div>
      </main>

      <MobileTabNav activeView={activeView} setActiveView={setActiveView} />

      {showNewChallengeModal && (
        <NewChallengeForm
          challenge={newChallenge}
          setChallenge={setNewChallenge}
          onSubmit={handleCreateChallenge}
          onClose={() => setShowNewChallengeModal(false)}
        />
      )}

      {/* ... other modals ... */}
    </div>
  );
};

export default PartnerDashboard; 