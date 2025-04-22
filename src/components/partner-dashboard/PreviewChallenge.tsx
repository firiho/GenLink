import { ArrowLeft, FileText, Users, Award, Calendar, ExternalLink, Clock, Share2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';

export default function PreviewChallenge({ challenge, setActiveView }) {
  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px]">
        <FileText className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium text-gray-500">Challenge not found</h3>
        <p className="text-gray-400 mt-2">The requested challenge could not be loaded</p>
        <Button 
          className="mt-6" 
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
    draft: "bg-yellow-100 text-yellow-700",
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    archived: "bg-gray-100 text-gray-700"
  };

  return (
    <div className="space-y-6 mt-5">
      {/* Back button and status */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          className="flex items-center text-gray-600"
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
            onClick={() => setActiveView('create-challenge', { challenge, editMode: true })}
          >
            Edit Challenge
          </Button>
        </div>
      </div>

      {/* Challenge header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
          <div className="bg-gradient-to-r from-primary/10 to-primary/20 p-6 h-48 flex flex-col justify-end">
            <div className="p-3 bg-white inline-block rounded-lg mb-4 shadow-sm">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <p className="mt-2 text-gray-600">
              Hosted by {challenge.companyInfo?.name || 'Company Name'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Challenge overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Prize</p>
              <p className="text-lg font-semibold">${challenge.total_prize?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="text-lg font-semibold">{formattedDate(challenge.deadline)}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Remaining</p>
              <p className="text-lg font-semibold">{calculateDaysRemaining()}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Challenge details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="submission">Submission</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4">Challenge Description</h2>
                <div className="prose max-w-none">
                  <p>{challenge.description}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4">Prize Distribution</h2>
                
                {/* Total Prize Display */}
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Prize Pool</p>
                    <p className="text-xl font-semibold">${challenge.total_prize?.toLocaleString() || '0'}</p>
                  </div>
                </div>
                
                {/* Prize Distribution Visualization */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                  {/* 1st Place */}
                  <div className="bg-gradient-to-b from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 text-center">
                    <div className="mx-auto w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">1st Place</h4>
                    <p className="text-amber-800 font-bold text-xl">
                      ${(challenge.prizeDistribution?.first || 
                        Math.round((challenge.total_prize || 0) * 0.6)
                      ).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* 2nd Place */}
                  <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 text-center">
                    <div className="mx-auto w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">2nd Place</h4>
                    <p className="text-gray-800 font-bold text-xl">
                      ${(challenge.prizeDistribution?.second || 
                        Math.round((challenge.total_prize || 0) * 0.3)
                      ).toLocaleString()}
                    </p>
                  </div>
                  
                  {/* 3rd Place */}
                  <div className="bg-gradient-to-b from-amber-50/70 to-amber-100/70 p-4 rounded-lg border border-amber-200/70 text-center">
                    <div className="mx-auto w-10 h-10 bg-amber-700 rounded-full flex items-center justify-center mb-2">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-sm mb-1">3rd Place</h4>
                    <p className="text-amber-800 font-bold text-xl">
                      ${(challenge.prizeDistribution?.third || 
                        Math.round((challenge.total_prize || 0) * 0.1)
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Additional Prizes */}
                {challenge.prizeDistribution?.additional && challenge.prizeDistribution.additional.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-base font-medium mb-3">Special Prizes</h3>
                    <div className="space-y-3">
                      {challenge.prizeDistribution.additional.map((prize, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                              <Award className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{prize.name || 'Special Prize'}</span>
                          </div>
                          <span className="text-primary font-bold">${Number(prize.amount).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Non-monetary benefits */}
                {challenge.prize && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h3 className="text-base font-medium mb-3">Additional Benefits</h3>
                    <div className="prose max-w-none text-gray-600">
                      <p>{challenge.prize}</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {challenge.categories?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Categories</h2>
                  <div className="flex flex-wrap gap-2">
                    {challenge.categories.map((category) => (
                      <Badge 
                        key={category}
                        variant="secondary" 
                        className="bg-primary/10 text-primary"
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {challenge.timeline?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Timeline</h2>
                  <div className="space-y-4">
                    {challenge.timeline.map((phase, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-4 h-4 mt-1 rounded-full bg-primary flex-shrink-0"></div>
                        <div className="ml-4">
                          <h3 className="font-medium">{phase.phase}</h3>
                          <p className="text-sm text-gray-500">
                            {phase.startDate && phase.endDate 
                              ? `${formattedDate(phase.startDate)} - ${formattedDate(phase.endDate)}`
                              : "Dates not set"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {challenge.requirements && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Technical Requirements</h2>
                  <div className="prose max-w-none">
                    <p>{challenge.requirements}</p>
                  </div>
                </motion.div>
              )}

              {challenge.evaluationCriteria && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Evaluation Criteria</h2>
                  <div className="prose max-w-none">
                    <p>{challenge.evaluationCriteria}</p>
                  </div>
                </motion.div>
              )}

              {challenge.skills?.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {challenge.skills.map((skill) => (
                      <Badge 
                        key={skill}
                        variant="outline" 
                        className="border-gray-300"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              )}

              {challenge.termsAndConditions && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Terms and Conditions</h2>
                  <div className="prose max-w-none">
                    <p>{challenge.termsAndConditions}</p>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              {challenge.resources?.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Resources & Materials</h2>
                  <div className="space-y-3">
                    {challenge.resources.map((resource, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 border border-gray-100 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{resource.title}</h3>
                        </div>
                        {resource.link && (
                          resource.type === 'api' ? (
                            // show it
                            <p className="text-sm text-gray-500">
                              API Key: {resource.link}
                            </p>
                          ) : (
                            <a 
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open
                            </a>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <p className="text-gray-500">No resources have been added for this challenge.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="faq" className="space-y-6">
              {challenge.faq?.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-4">
                    {challenge.faq.map((item, index) => (
                      <div key={index} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-medium text-lg mb-2">{item.question}</h3>
                        <p className="text-gray-600">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                  <p className="text-gray-500">No FAQs have been added for this challenge.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="submission" className="space-y-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm"
              >
                <h2 className="text-xl font-semibold mb-4">Submission Format</h2>
                <div className="prose max-w-none">
                  <p>
                    {challenge.submissionFormat === 'github' && 'Participants should submit a GitHub repository with their solution.'}
                    {challenge.submissionFormat === 'file' && 'Participants should upload their solution files directly.'}
                    {challenge.submissionFormat === 'url' && 'Participants should submit a URL to their deployed solution.'}
                    {challenge.submissionFormat === 'custom' && 'This challenge has custom submission requirements.'}
                  </p>
                </div>
              </motion.div>
              
              {challenge.maxParticipants && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Participation Limit</h2>
                  <p>This challenge is limited to {challenge.maxParticipants} participants.</p>
                </motion.div>
              )}

              {challenge.allowTeams && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white p-6 rounded-xl shadow-sm"
                >
                  <h2 className="text-xl font-semibold mb-4">Team Information</h2>
                  <p>This challenge allows team participation with up to {challenge.maxTeamSize || 'unlimited'} members per team.</p>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Organization info */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">About the Organizer</h2>
            <div className="flex flex-col items-center text-center">
              {challenge.companyInfo?.logoUrl ? (
                <img 
                  src={challenge.companyInfo.logoUrl} 
                  alt={challenge.companyInfo.name} 
                  className="w-24 h-24 object-contain mb-4"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-gray-400">
                    {challenge.companyInfo?.name?.charAt(0) || 'C'}
                  </span>
                </div>
              )}
              <h3 className="font-medium text-lg">{challenge.companyInfo?.name}</h3>
              {challenge.companyInfo?.website && (
                <a 
                  href={challenge.companyInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-1 inline-flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Visit Website
                </a>
              )}
              {challenge.companyInfo?.contactEmail && (
                <p className="text-gray-500 text-sm mt-2">
                  Contact: {challenge.companyInfo.contactEmail}
                </p>
              )}
            </div>
          </motion.div>

          {/* Challenge stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Challenge Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Participants</span>
                <span className="font-medium">{challenge.participants || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Submissions</span>
                <span className="font-medium">{challenge.submissions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Views</span>
                <span className="font-medium">{challenge.views || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Created On</span>
                <span className="font-medium">
                  {challenge.createdAt 
                    ? (typeof challenge.createdAt.toDate === 'function' 
                        ? formattedDate(challenge.createdAt.toDate())
                        : formattedDate(challenge.createdAt))
                    : 'Unknown'}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Judges */}
          {challenge.judges?.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <h2 className="text-xl font-semibold mb-4">Judges & Evaluators</h2>
              <div className="space-y-4">
                {challenge.judges.map((judge, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-semibold text-gray-500">
                        {judge.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{judge.name}</h3>
                      <p className="text-sm text-gray-500">{judge.title}</p>
                      <p className="text-xs text-gray-400">{judge.organization}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Share */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Share Challenge</h2>
            <Button variant="outline" className="w-full flex items-center justify-center">
              <Share2 className="h-4 w-4 mr-2" />
              Copy Challenge Link
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}