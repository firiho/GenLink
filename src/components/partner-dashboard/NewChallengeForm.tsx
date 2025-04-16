import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import WelcomeSection from '../dashboard/WelcomeSection';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus } from 'lucide-react';

export const NewChallengeForm = () => {
  // New challenge form state
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    prize: '',
    total_prize: 0,
    deadline: '',
    requirements: '',
    categories: [],
    skills: [],
    status: 'draft',
    maxParticipants: '',
    submissionFormat: 'github', // or 'file' or 'url'
    evaluationCriteria: '',
    termsAndConditions: '',
    coverImage: null,
    companyInfo: {
      name: '',
      logo: null,
      website: '',
      contactEmail: ''
    },
    timeline: [
      { phase: 'Judging', startDate: '', endDate: '' },
      { phase: 'Announcement', startDate: '', endDate: '' }
    ],
    visibility: 'public',
    allowTeams: true,
    maxTeamSize: 5,
    judges: [],
    resources: [],
    faq: []
  });

  // For free-form input of categories and skills
  const [newCategory, setNewCategory] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !newChallenge.categories.includes(newCategory.trim())) {
      setNewChallenge({
        ...newChallenge,
        categories: [...newChallenge.categories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    setNewChallenge({
      ...newChallenge,
      categories: newChallenge.categories.filter(c => c !== category)
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !newChallenge.skills.includes(newSkill.trim())) {
      setNewChallenge({
        ...newChallenge,
        skills: [...newChallenge.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setNewChallenge({
      ...newChallenge,
      skills: newChallenge.skills.filter(s => s !== skill)
    });
  };

  const handleAddResource = () => {
    setNewChallenge({
      ...newChallenge,
      resources: [...newChallenge.resources, { title: '', link: '', type: 'link' }]
    });
  };

  const handleAddFaq = () => {
    setNewChallenge({
      ...newChallenge,
      faq: [...newChallenge.faq, { question: '', answer: '' }]
    });
  };

  const handleAddJudge = () => {
    setNewChallenge({
      ...newChallenge,
      judges: [...newChallenge.judges, { name: '', email: '', organization: '', title: '' }]
    });
  };

  const handleUploadImage = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would handle file upload to a storage service
      // For now, store the file object for preview
      if (field === 'coverImage') {
        setNewChallenge({ ...newChallenge, coverImage: file });
      } else if (field === 'companyLogo') {
        setNewChallenge({ 
          ...newChallenge, 
          companyInfo: { ...newChallenge.companyInfo, logo: file } 
        });
      }
    }
  };

  const updateTimelinePhase = (index, field, value) => {
    const updatedTimeline = [...newChallenge.timeline];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: value };
    setNewChallenge({ ...newChallenge, timeline: updatedTimeline });
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...newChallenge.resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setNewChallenge({ ...newChallenge, resources: updatedResources });
  };

  const updateFaq = (index, field, value) => {
    const updatedFaq = [...newChallenge.faq];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setNewChallenge({ ...newChallenge, faq: updatedFaq });
  };

  const updateJudge = (index, field, value) => {
    const updatedJudges = [...newChallenge.judges];
    updatedJudges[index] = { ...updatedJudges[index], [field]: value };
    setNewChallenge({ ...newChallenge, judges: updatedJudges });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('New Challenge:', newChallenge);
  };

  const onCancel = () => {
    // Handle cancel action here
    console.log('Cancelled');
  };

  const onSaveDraft = () => {
    setNewChallenge({ ...newChallenge, status: 'draft' });
    console.log('Saved as draft:', newChallenge);
  };

  return (
    <div>
      {!showPreview ? (
        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
          {/* Form Title */}
          <WelcomeSection title={'Create a New Challenge / Hackathon'} subtitle="Fill in the details below to create a new challenge." />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Challenge Details</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="additional">Additional Options</TabsTrigger>
            </TabsList>
            
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Challenge Title*</label>
                    <Input
                      value={newChallenge.title}
                      onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
                      placeholder="Enter challenge title"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Challenge Description*</label>
                    <textarea
                      className="w-full min-h-[150px] rounded-md border border-gray-200 p-2"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
                      placeholder="Describe your challenge in detail"
                      required
                    />
                  </div>
                  
                  {/* Prize */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize Details*</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
                      value={newChallenge.prize}
                      onChange={(e) => setNewChallenge({ ...newChallenge, prize: e.target.value })}
                      placeholder="Describe the prizes offered"
                      required
                    />
                  </div>

                  {/* Total Prize Amount */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Prize Amount*</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                      <Input
                        type="number"
                        min="0"
                        value={newChallenge.total_prize}
                        onChange={(e) => setNewChallenge({ 
                          ...newChallenge, 
                          total_prize: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="0.00"
                        className="pl-8"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Enter the total prize pool amount</p>
                  </div>

                  {/* Deadline */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Final Submission Deadline*</label>
                    <Input
                      type="date"
                      value={newChallenge.deadline}
                      onChange={(e) => setNewChallenge({ ...newChallenge, deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Cover Image */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                      {newChallenge.coverImage ? (
                        <div className="space-y-2">
                          <p>{newChallenge.coverImage.name}</p>
                          <button 
                            type="button" 
                            className="text-red-500 text-sm"
                            onClick={() => setNewChallenge({ ...newChallenge, coverImage: null })}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Drag and drop an image, or click to select
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage(e, 'coverImage')}
                            className="hidden"
                            id="cover-image-upload"
                          />
                          <label 
                            htmlFor="cover-image-upload" 
                            className="inline-block px-4 py-2 bg-gray-100 rounded-md text-sm cursor-pointer"
                          >
                            Select Image
                          </label>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
                  </div>
                  
                  {/* Company Info */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Company Information</label>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Company Name*</label>
                      <Input
                        value={newChallenge.companyInfo.name}
                        onChange={(e) => setNewChallenge({ 
                          ...newChallenge, 
                          companyInfo: { ...newChallenge.companyInfo, name: e.target.value } 
                        })}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Company Website</label>
                      <Input
                        type="url"
                        value={newChallenge.companyInfo.website}
                        onChange={(e) => setNewChallenge({ 
                          ...newChallenge, 
                          companyInfo: { ...newChallenge.companyInfo, website: e.target.value } 
                        })}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contact Email*</label>
                      <Input
                        type="email"
                        value={newChallenge.companyInfo.contactEmail}
                        onChange={(e) => setNewChallenge({ 
                          ...newChallenge, 
                          companyInfo: { ...newChallenge.companyInfo, contactEmail: e.target.value } 
                        })}
                        placeholder="contact@example.com"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Challenge Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Categories - Now free-form input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Categories*</label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add a category"
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddCategory}
                        size="icon"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {newChallenge.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newChallenge.categories.map((category) => (
                          <div 
                            key={category} 
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            <span>{category}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveCategory(category)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No categories added yet</p>
                    )}
                  </div>
                  
                  {/* Required Skills - Now free-form input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Required Skills</label>
                    <div className="flex space-x-2 mb-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a required skill"
                        className="flex-grow"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddSkill}
                        size="icon"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {newChallenge.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newChallenge.skills.map((skill) => (
                          <div 
                            key={skill} 
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
                          >
                            <span>{skill}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-gray-500 hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No skills added yet</p>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Submission Format */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Submission Format*</label>
                    <select
                      className="w-full rounded-md border border-gray-200 p-2"
                      value={newChallenge.submissionFormat}
                      onChange={(e) => setNewChallenge({ ...newChallenge, submissionFormat: e.target.value })}
                      required
                    >
                      <option value="github">GitHub Repository</option>
                      <option value="file">File Upload</option>
                      <option value="url">URL / Demo Link</option>
                      <option value="custom">Custom Requirements</option>
                    </select>
                  </div>
                  
                  {/* Max Participants */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Participants</label>
                    <Input
                      type="number"
                      min="0"
                      value={newChallenge.maxParticipants}
                      onChange={(e) => setNewChallenge({ ...newChallenge, maxParticipants: e.target.value })}
                      placeholder="Leave blank for unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for unlimited participants</p>
                  </div>
                  
                  {/* Evaluation Criteria */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Evaluation Criteria*</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
                      value={newChallenge.evaluationCriteria}
                      onChange={(e) => setNewChallenge({ ...newChallenge, evaluationCriteria: e.target.value })}
                      placeholder="Explain how submissions will be evaluated"
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              {/* Technical Requirements */}
              <div>
                <label className="block text-sm font-medium mb-1">Technical Requirements</label>
                <textarea
                  className="w-full min-h-[200px] rounded-md border border-gray-200 p-2"
                  value={newChallenge.requirements}
                  onChange={(e) => setNewChallenge({ ...newChallenge, requirements: e.target.value })}
                  placeholder="Describe any technical requirements or constraints for the challenge"
                />
              </div>
              
              {/* Add Resources */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Resources & Materials</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddResource}
                    size="sm"
                  >
                    Add Resource
                  </Button>
                </div>
                
                {newChallenge.resources.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No resources added yet</p>
                ) : (
                  <div className="space-y-3">
                    {newChallenge.resources.map((resource, index) => (
                      <div key={index} className="grid grid-cols-8 gap-2 items-start">
                        <div className="col-span-3">
                          <Input
                            value={resource.title}
                            onChange={(e) => updateResource(index, 'title', e.target.value)}
                            placeholder="Resource title"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={resource.link}
                            onChange={(e) => updateResource(index, 'link', e.target.value)}
                            placeholder="URL or description"
                          />
                        </div>
                        <div className="col-span-1">
                          <select
                            className="w-full rounded-md border border-gray-200 p-2"
                            value={resource.type}
                            onChange={(e) => updateResource(index, 'type', e.target.value)}
                          >
                            <option value="link">Link</option>
                            <option value="api">API</option>
                            <option value="dataset">Dataset</option>
                            <option value="doc">Documentation</option>
                          </select>
                        </div>
                        <div className="col-span-1">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              const updatedResources = [...newChallenge.resources];
                              updatedResources.splice(index, 1);
                              setNewChallenge({ ...newChallenge, resources: updatedResources });
                            }}
                            size="icon"
                            className="h-9 w-9"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* FAQs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Frequently Asked Questions</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddFaq}
                    size="sm"
                  >
                    Add FAQ
                  </Button>
                </div>
                
                {newChallenge.faq.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No FAQs added yet</p>
                ) : (
                  <div className="space-y-4">
                    {newChallenge.faq.map((faq, index) => (
                      <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-md">
                        <div className="flex justify-between">
                          <label className="block text-xs text-gray-500">Question</label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              const updatedFaqs = [...newChallenge.faq];
                              updatedFaqs.splice(index, 1);
                              setNewChallenge({ ...newChallenge, faq: updatedFaqs });
                            }}
                            size="icon"
                            className="h-6 w-6 text-gray-400"
                          >
                            ×
                          </Button>
                        </div>
                        <Input
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                        <label className="block text-xs text-gray-500 mt-2">Answer</label>
                        <textarea
                          className="w-full min-h-[80px] rounded-md border border-gray-200 p-2"
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Enter answer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Challenge Timeline</label>
                <div className="space-y-4">
                  {newChallenge.timeline.map((phase, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3 p-3 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{phase.phase}</label>
                        <Input
                          value={phase.phase}
                          onChange={(e) => updateTimelinePhase(index, 'phase', e.target.value)}
                          placeholder="Phase name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <Input
                          type="date"
                          value={phase.startDate}
                          onChange={(e) => updateTimelinePhase(index, 'startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <Input
                          type="date"
                          value={phase.endDate}
                          onChange={(e) => updateTimelinePhase(index, 'endDate', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Judges */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Judges / Evaluators</label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddJudge}
                    size="sm"
                  >
                    Add Judge
                  </Button>
                </div>
                
                {newChallenge.judges.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No judges added yet</p>
                ) : (
                  <div className="space-y-3">
                    {newChallenge.judges.map((judge, index) => (
                      <div key={index} className="grid grid-cols-9 gap-2 items-start">
                        <div className="col-span-2">
                          <Input
                            value={judge.name}
                            onChange={(e) => updateJudge(index, 'name', e.target.value)}
                            placeholder="Name"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="email"
                            value={judge.email}
                            onChange={(e) => updateJudge(index, 'email', e.target.value)}
                            placeholder="Email"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={judge.organization}
                            onChange={(e) => updateJudge(index, 'organization', e.target.value)}
                            placeholder="Organization"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            value={judge.title}
                            onChange={(e) => updateJudge(index, 'title', e.target.value)}
                            placeholder="Title"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => {
                              const updatedJudges = [...newChallenge.judges];
                              updatedJudges.splice(index, 1);
                              setNewChallenge({ ...newChallenge, judges: updatedJudges });
                            }}
                            size="icon"
                            className="h-9 w-9"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Additional Options Tab */}
            <TabsContent value="additional" className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Visibility */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Challenge Visibility</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="visibility-public"
                          name="visibility"
                          value="public"
                          checked={newChallenge.visibility === 'public'}
                          onChange={() => setNewChallenge({ ...newChallenge, visibility: 'public' })}
                        />
                        <label htmlFor="visibility-public">
                          <span className="font-medium">Public</span>
                          <p className="text-xs text-gray-500">Visible to everyone</p>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="visibility-private"
                          name="visibility"
                          value="private"
                          checked={newChallenge.visibility === 'private'}
                          onChange={() => setNewChallenge({ ...newChallenge, visibility: 'private' })}
                        />
                        <label htmlFor="visibility-private">
                          <span className="font-medium">Private</span>
                          <p className="text-xs text-gray-500">Accessible by invitation only</p>
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="visibility-unlisted"
                          name="visibility"
                          value="unlisted"
                          checked={newChallenge.visibility === 'unlisted'}
                          onChange={() => setNewChallenge({ ...newChallenge, visibility: 'unlisted' })}
                        />
                        <label htmlFor="visibility-unlisted">
                          <span className="font-medium">Unlisted</span>
                          <p className="text-xs text-gray-500">Accessible only by direct link</p>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Settings */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Team Settings</label>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="allow-teams" 
                        checked={newChallenge.allowTeams}
                        onCheckedChange={(checked) => setNewChallenge({ 
                          ...newChallenge, 
                          allowTeams: checked === true 
                        })}
                      />
                      <label htmlFor="allow-teams" className="text-sm">Allow team participation</label>
                    </div>
                    
                    {newChallenge.allowTeams && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Maximum Team Size</label>
                        <Input
                          type="number"
                          min="2"
                          max="20"
                          value={newChallenge.maxTeamSize}
                          onChange={(e) => setNewChallenge({ ...newChallenge, maxTeamSize: parseInt(e.target.value, 10) || 0 })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Terms and Conditions */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Terms and Conditions*</label>
                    <textarea
                      className="w-full min-h-[200px] rounded-md border border-gray-200 p-2"
                      value={newChallenge.termsAndConditions}
                      onChange={(e) => setNewChallenge({ ...newChallenge, termsAndConditions: e.target.value })}
                      placeholder="Enter terms and conditions that participants must agree to"
                      required
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <div>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="mr-2"
              >
                Preview
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onSaveDraft}
              >
                Save as Draft
              </Button>
            </div>
            <div className="space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary text-white">
                Create Challenge
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Challenge Preview</h2>
            <Button
              type="button"
              onClick={() => setShowPreview(false)}
            >
              Back to Edit
            </Button>
          </div>
          
          {/* Preview content */}
          <div className="border rounded-lg p-6 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{newChallenge.title || "Challenge Title"}</h1>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>Hosted by {newChallenge.companyInfo.name || "Company Name"}</span>
                <span>•</span>
                <span>Deadline: {newChallenge.deadline || "Not set"}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-500">
                <span>Total Prize: ${newChallenge.total_prize.toLocaleString()}</span>
              </div>
              {newChallenge.coverImage && (
                <div className="mt-4 w-full h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p>Cover Image: {newChallenge.coverImage.name}</p>
                </div>
              )}
            </div>
            
            <div className="prose">
              <h3>Description</h3>
              <p>{newChallenge.description || "No description provided"}</p>
              
              <h3>Prizes</h3>
              <p>{newChallenge.prize || "No prize information provided"}</p>
              
              {newChallenge.categories.length > 0 && (
                <>
                  <h3>Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {newChallenge.categories.map(category => (
                      <span key={category} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </>
              )}
              
              {newChallenge.skills.length > 0 && (
                <>
                  <h3>Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {newChallenge.skills.map(skill => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </>
              )}
              
              <h3>Timeline</h3>
              <ul>
                {newChallenge.timeline.map((phase, index) => (
                  <li key={index}>
                    <strong>{phase.phase}: </strong>
                    {phase.startDate && phase.endDate 
                      ? `${phase.startDate} to ${phase.endDate}`
                      : "Dates not set"}
                  </li>
                ))}
              </ul>
              
              {/* Additional preview sections would go here */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};