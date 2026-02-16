import { ArrowLeft, FileText, Users, Award, Calendar, ExternalLink, Clock, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, getCurrencySymbol } from '@/lib/currency';

export default function PreviewChallenge({ challenge, setActiveView }) {
  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
        <h3 className="text-xl font-medium text-slate-500 dark:text-slate-400">Challenge not found</h3>
        <p className="text-slate-400 dark:text-slate-500 mt-2">The requested challenge could not be loaded</p>
        <Button 
          className="mt-6 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200" 
          onClick={() => setActiveView('challenges')}
        >
          Back to Challenges
        </Button>
      </div>
    );
  }

  const formattedDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining until deadline
  const calculateDaysRemaining = () => {
    if (!challenge.deadline) return "No deadline";
    
    const deadline = new Date(challenge.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  const statusColor = {
    draft: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    archived: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
  };

  return (
    <div className="space-y-6 mt-5">
      {/* Back button and status */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
          onClick={() => setActiveView('challenges')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Challenges
        </Button>
        <div className="flex items-center space-x-3">
          <Badge 
            variant="secondary"
            className={`${statusColor[challenge.status]} px-3 py-1 capitalize text-sm`}
          >
            {challenge.status}
          </Badge>
          <Button 
            variant="outline" 
            className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700"
            onClick={() => setActiveView('create-challenge', { challenge, editMode: true })}
          >
            Edit Challenge
          </Button>
        </div>
      </div>

      {/* Challenge header */}
      <div 
        className="relative rounded-xl overflow-hidden"
      >
        {challenge.coverImageUrl ? (
          <div className="h-64 w-full relative">
            <img 
              src={challenge.coverImageUrl} 
              alt={challenge.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold">{challenge.title}</h1>
              <p className="mt-2 text-white/80">
                Hosted by {challenge.companyInfo?.name || 'Company Name'}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-6 h-48 flex flex-col justify-end">
            <div className="p-3 bg-white dark:bg-slate-900 inline-block rounded-lg mb-4 shadow-sm">
              <FileText className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{challenge.title}</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Hosted by {challenge.companyInfo?.name || 'Company Name'}
            </p>
          </div>
        )}
      </div>

      {/* Challenge overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Prize</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formatCurrency(challenge.total_prize || 0, challenge.currency)}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Deadline</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{formattedDate(challenge.deadline)}</p>
            </div>
          </div>
        </div>

        <div 
          className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Time Remaining</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">{calculateDaysRemaining()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Challenge details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <TabsTrigger 
                value="overview"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="details"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Details
              </TabsTrigger>
              <TabsTrigger 
                value="resources"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Resources
              </TabsTrigger>
              <TabsTrigger 
                value="faq"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                FAQ
              </TabsTrigger>
              <TabsTrigger 
                value="submission"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 rounded-lg"
              >
                Submission
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div 
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Challenge Description</h2>
                <div className="prose max-w-none">
                  <p className="text-slate-700 dark:text-slate-300">{challenge.description}</p>
                </div>
              </div>

              <div 
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Prize Distribution</h2>
                
                {/* Total Prize Display */}
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total Prize Pool</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">{formatCurrency(challenge.total_prize || 0, challenge.currency)}</p>
                  </div>
                </div>
                
                {/* Prize Distribution Visualization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {/* 1st Place */}
                  <div className="bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
                    <div className="mx-auto w-10 h-10 bg-amber-400 dark:bg-amber-600 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">1st Place</h4>
                    <p className="text-amber-800 dark:text-amber-300 font-bold text-xl">
                      {formatCurrency(challenge.prizeDistribution?.first || Math.round((challenge.total_prize || 0) * 0.6), challenge.currency)}
                    </p>
                  </div>
                  
                  {/* 2nd Place */}
                  <div className="bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800/20 dark:to-slate-700/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                    <div className="mx-auto w-10 h-10 bg-slate-400 dark:bg-slate-600 rounded-full flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">2nd Place</h4>
                    <p className="text-slate-800 dark:text-slate-200 font-bold text-xl">
                      {formatCurrency(challenge.prizeDistribution?.second || Math.round((challenge.total_prize || 0) * 0.3), challenge.currency)}
                    </p>
                  </div>
                  
                  {/* 3rd Place */}
                  <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/70 dark:from-amber-900/10 dark:to-amber-800/10 p-4 rounded-lg border border-amber-200/70 dark:border-amber-800/50 text-center">
                    <div className="mx-auto w-10 h-10 bg-amber-700 dark:bg-amber-600 rounded-full flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1 text-slate-900 dark:text-white">3rd Place</h4>
                    <p className="text-amber-800 dark:text-amber-300 font-bold text-xl">
                      {formatCurrency(challenge.prizeDistribution?.third || Math.round((challenge.total_prize || 0) * 0.1), challenge.currency)}
                    </p>
                  </div>
                </div>
                
                {/* Additional Prizes */}
                {challenge.prizeDistribution?.additional && challenge.prizeDistribution.additional.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-medium mb-3 text-slate-900 dark:text-white">Special Prizes</h3>
                    <div className="space-y-3">
                      {challenge.prizeDistribution.additional.map((prize, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 mr-3">
                              <Award className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-slate-900 dark:text-white">{prize.name || 'Special Prize'}</span>
                          </div>
                          <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(Number(prize.amount), challenge.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Non-monetary benefits */}
                {challenge.prize && (
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-base font-medium mb-3 text-slate-900 dark:text-white">Additional Benefits</h3>
                    <div className="prose max-w-none text-slate-600 dark:text-slate-400">
                      <p>{challenge.prize}</p>
                    </div>
                  </div>
                )}
              </div>

              {challenge.categories?.length > 0 && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {challenge.categories.map((category) => (
                      <Badge 
                        key={category}
                        variant="secondary" 
                        className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {challenge.timeline?.length > 0 && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Timeline</h2>
                  <div className="space-y-4">
                    {challenge.timeline.map((phase, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-4 h-4 mt-1 rounded-full bg-slate-600 dark:bg-slate-400 flex-shrink-0"></div>
                        <div className="ml-4">
                          <h3 className="font-medium text-slate-900 dark:text-white">{phase.phase}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {phase.startDate && phase.endDate 
                              ? `${formattedDate(phase.startDate)} - ${formattedDate(phase.endDate)}`
                              : "Dates not set"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {challenge.requirements && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Technical Requirements</h2>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 dark:text-slate-300">{challenge.requirements}</p>
                  </div>
                </div>
              )}

              {challenge.evaluationCriteria && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Evaluation Criteria</h2>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 dark:text-slate-300">{challenge.evaluationCriteria}</p>
                  </div>
                </div>
              )}

              {challenge.skills?.length > 0 && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {challenge.skills.map((skill) => (
                      <Badge 
                        key={skill}
                        variant="outline" 
                        className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {challenge.termsAndConditions && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Terms and Conditions</h2>
                  <div className="prose max-w-none">
                    <p className="text-slate-700 dark:text-slate-300">{challenge.termsAndConditions}</p>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              {challenge.resources?.length > 0 ? (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Resources & Materials</h2>
                  <div className="space-y-3">
                    {challenge.resources.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-slate-900 dark:text-white">{resource.title}</h3>
                        </div>
                        {resource.link && (
                          resource.type === 'api' ? (
                            // show it
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              API Key: {resource.link}
                            </p>
                          ) : (
                            <a 
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open
                            </a>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">No resources have been added for this challenge.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              {challenge.faq?.length > 0 ? (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {challenge.faq.map((item, index) => (
                      <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg mb-2 text-slate-900 dark:text-white">{item.question}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
                  <p className="text-slate-500 dark:text-slate-400">No FAQs have been added for this challenge.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-6">
              <div 
                className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
              >
                <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Submission Format</h2>
                <div className="prose max-w-none">
                  <p className="text-slate-700 dark:text-slate-300">
                    {challenge.submissionFormat === 'github' && 'Participants should submit a GitHub repository with their solution.'}
                    {challenge.submissionFormat === 'file' && 'Participants should upload their solution files directly.'}
                    {challenge.submissionFormat === 'url' && 'Participants should submit a URL to their deployed solution.'}
                    {challenge.submissionFormat === 'custom' && 'This challenge has custom submission requirements.'}
                  </p>
                </div>
              </div>
              
              {challenge.maxParticipants && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Participation Limit</h2>
                  <p className="text-slate-700 dark:text-slate-300">This challenge is limited to {challenge.maxParticipants} participants.</p>
                </div>
              )}

              {challenge.allowTeams && (
                <div 
                  className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                >
                  <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Team Information</h2>
                  <p className="text-slate-700 dark:text-slate-300">This challenge allows team participation with up to {challenge.maxTeamSize || 'unlimited'} members per team.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organization info */}
          <div 
            className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">About the Organizer</h2>
            <div className="flex flex-col items-center text-center">
              {challenge.companyInfo?.logoUrl ? (
                <img 
                  src={challenge.companyInfo.logoUrl} 
                  alt={challenge.companyInfo.name} 
                  className="w-24 h-24 object-contain mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">
                    {challenge.companyInfo?.name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
              <h3 className="font-medium text-lg text-slate-900 dark:text-white">{challenge.companyInfo?.name}</h3>
              {challenge.companyInfo?.website && (
                <a 
                  href={challenge.companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline mt-1 inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Website
                </a>
              )}
              {challenge.companyInfo?.contactEmail && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                  Contact: {challenge.companyInfo.contactEmail}
                </p>
              )}
            </div>
          </div>

          {/* Challenge stats */}
          <div 
            className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Challenge Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Participants</span>
                <span className="font-medium text-slate-900 dark:text-white">{challenge.participants || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Submissions</span>
                <span className="font-medium text-slate-900 dark:text-white">{challenge.submissions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Views</span>
                <span className="font-medium text-slate-900 dark:text-white">{challenge.views || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Created On</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {challenge.createdAt 
                    ? (typeof challenge.createdAt.toDate === 'function' 
                        ? formattedDate(challenge.createdAt.toDate())
                        : formattedDate(challenge.createdAt))
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Judges */}
          {challenge.judges?.length > 0 && (
            <div 
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
            >
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Judges & Evaluators</h2>
              <div className="space-y-4">
                {challenge.judges.map((judge, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {judge.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">{judge.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{judge.title}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{judge.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div 
            className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
          >
            <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Share Challenge</h2>
            <Button variant="outline" className="w-full flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700">
              <Share2 className="h-4 w-4 mr-2" />
              Copy Challenge Link
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}