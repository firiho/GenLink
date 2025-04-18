import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import WelcomeSection from '../dashboard/WelcomeSection';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { query, collection, where, getDocs } from 'firebase/firestore';

export const NewChallengeForm = ({setActiveView, editMode=false, existingChallenge = null}) => {

  console.log('Edit Mode:', editMode, existingChallenge);
  // New challenge form state
  const [challengeData, setChallengeData] = useState(() => {
    if (editMode && existingChallenge) {
      // When editing, use the existing challenge data
      return {
        ...existingChallenge,
        // Ensure all expected fields exist
        timeline: existingChallenge.timeline || [
          { phase: 'Judging', startDate: '', endDate: '' },
          { phase: 'Announcement', startDate: '', endDate: '' }
        ],
        resources: existingChallenge.resources || [],
        faq: existingChallenge.faq || [],
        judges: existingChallenge.judges || [],
        categories: existingChallenge.categories || [],
        skills: existingChallenge.skills || [],
        companyInfo: existingChallenge.companyInfo || {
          name: '',
          logo: null,
          logoUrl: '',
          website: '',
          contactEmail: ''
        },
      };
    } else {
      // When creating, use the default values
      return {
        id: uuidv4(),
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
        coverImageUrl: '',
        companyInfo: {
          name: '',
          logo: null,
          logoUrl: '',
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
        faq: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: '' 
      };
    }
  });

  // For free-form input of categories and skills
  const [newCategory, setNewCategory] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  const { user } = useAuth();


  // Fetch organization data when component mounts
  useEffect(() => {
    const fetchOrganizationData = async () => {
      if (!user || !user.uid) return;
      
      setIsLoading(true);
      try {
        const orgQuery = query(collection(db, 'organizations'), where('created_by', '==', user.uid));
        const orgSnapshot = await getDocs(orgQuery);
        const orgDoc = orgSnapshot.docs.length > 0 ? orgSnapshot.docs[0] : null;
  
        console.log('Organization document:', orgDoc?.exists(), orgDoc?.data());
        
        // Create a single update to the state
        setChallengeData(prevData => {
          const updatedData = { ...prevData, createdBy: user.uid };
          
          // If org data exists, update the company info
          if (orgDoc && orgDoc.exists()) {
            const orgData = orgDoc.data();
            updatedData.companyInfo = {
              ...updatedData.companyInfo,
              name: orgData.name || updatedData.companyInfo.name,
              logoUrl: orgData.logoUrl || updatedData.companyInfo.logoUrl,
              website: orgData.website || updatedData.companyInfo.website,
              contactEmail: user.email || updatedData.companyInfo.contactEmail
            };
          }
          
          return updatedData;
        });
  
      } catch (error) {
        console.error("Error fetching organization data:", error);
        toast.error('Error fetching organization data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchOrganizationData();
  }, [user]);

  const handleAddCategory = () => {
    if (newCategory.trim() && !challengeData.categories.includes(newCategory.trim())) {
      setChallengeData({
        ...challengeData,
        categories: [...challengeData.categories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (category) => {
    setChallengeData({
      ...challengeData,
      categories: challengeData.categories.filter(c => c !== category)
    });
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !challengeData.skills.includes(newSkill.trim())) {
      setChallengeData({
        ...challengeData,
        skills: [...challengeData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setChallengeData({
      ...challengeData,
      skills: challengeData.skills.filter(s => s !== skill)
    });
  };

  const handleAddResource = () => {
    setChallengeData({
      ...challengeData,
      resources: [...challengeData.resources, { title: '', link: '', type: 'link' }]
    });
  };

  const handleAddFaq = () => {
    setChallengeData({
      ...challengeData,
      faq: [...challengeData.faq, { question: '', answer: '' }]
    });
  };

  const handleAddJudge = () => {
    setChallengeData({
      ...challengeData,
      judges: [...challengeData.judges, { name: '', email: '', organization: '', title: '' }]
    });
  };

  const handleUploadImage = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
  
    if (field === 'coverImage') {
      // If replacing an existing image, keep track of the original URL 
      // in case we want to restore it
      const previousImageUrl = challengeData.coverImageUrl;
      
      setChallengeData({ 
        ...challengeData, 
        coverImage: file,
        // Keep old URL for preview until new image is uploaded 
        _previousCoverImageUrl: previousImageUrl 
      });
    } else if (field === 'companyLogo') {
      const previousLogoUrl = challengeData.companyInfo.logoUrl;
      
      setChallengeData({ 
        ...challengeData, 
        companyInfo: { 
          ...challengeData.companyInfo, 
          logo: file,
          // Keep old URL for preview until new image is uploaded
          _previousLogoUrl: previousLogoUrl
        } 
      });
    }
  };

  const updateTimelinePhase = (index, field, value) => {
    const updatedTimeline = [...challengeData.timeline];
    updatedTimeline[index] = { ...updatedTimeline[index], [field]: value };
    setChallengeData({ ...challengeData, timeline: updatedTimeline });
  };

  const updateResource = (index, field, value) => {
    const updatedResources = [...challengeData.resources];
    updatedResources[index] = { ...updatedResources[index], [field]: value };
    setChallengeData({ ...challengeData, resources: updatedResources });
  };

  const updateFaq = (index, field, value) => {
    const updatedFaq = [...challengeData.faq];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setChallengeData({ ...challengeData, faq: updatedFaq });
  };

  const updateJudge = (index, field, value) => {
    const updatedJudges = [...challengeData.judges];
    updatedJudges[index] = { ...updatedJudges[index], [field]: value };
    setChallengeData({ ...challengeData, judges: updatedJudges });
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    try {
      // Create a storage reference
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get and return the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  
  // Function to upload images to storage
  const uploadImages = async () => {
    let updatedChallenge = { ...challengeData };
    setIsSubmitting(true);
    
    try {
      // Upload cover image if there's a new file
      if (challengeData.coverImage) {
        const coverImagePath = `challenges/${challengeData.id}/cover`;
        const coverImageUrl = await uploadImage(challengeData.coverImage, coverImagePath);
        updatedChallenge.coverImageUrl = coverImageUrl;
        updatedChallenge.coverImage = null; // Clear file reference after upload
      }
      
      // Upload company logo if there's a new file
      if (challengeData.companyInfo.logo) {
        const logoPath = `challenges/${challengeData.id}/company_logo`;
        const logoUrl = await uploadImage(challengeData.companyInfo.logo, logoPath);
        updatedChallenge.companyInfo = {
          ...updatedChallenge.companyInfo,
          logoUrl: logoUrl,
          logo: null // Clear file reference after upload
        };
      }
      
      return updatedChallenge;
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to save challenge to Firestore
  const saveChallenge = async (challengeData, status) => {
    try {
      setIsSubmitting(true);
      
      // Prepare challenge data for Firestore
      const { coverImage, companyInfo, ...rest } = challengeData;
      
      const preparedData = {
        ...rest,
        status,
        companyInfo,
        updatedAt: new Date()
      };
      
      // Save to firebase
      try {
        const docRef = doc(db, 'challenges', preparedData.id);
        await setDoc(docRef, preparedData, { merge: true });
      } catch (error) {
        console.error('Error adding document:', error);
        throw error;
      }
    
    } catch (error) {
      console.error("Error saving challenge:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // First upload images
      const challengeWithImages = await uploadImages();
      
      // Then save to Firestore with 'active' status
      await saveChallenge(challengeWithImages, 'active');
      
      toast.success('Challenge created successfully!');
      
      // Here you would typically redirect to the challenge page
      console.log('Challenge created:', challengeWithImages);
    } catch (error) {
      toast.error('Error creating challenge. Please try again.');
    }
  };

  const onCancel = () => {
    // Handle cancel action here
    setActiveView('challenges')
  };

  const onSaveDraft = async () => {
    try {
      // First upload images
      const challengeWithImages = await uploadImages();
      
      // Then save to Firestore with 'draft' status
      await saveChallenge(challengeWithImages, 'draft');
      
      toast.success('Draft saved successfully!');

    } catch (error) {
      toast.error('Error saving draft. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
          <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-r-4 border-l-4 border-indigo-300 animate-pulse"></div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-primary animate-pulse">
            Preparing Your Challenge Canvas
          </h3>
          <p className="text-gray-500 max-w-md">
            Setting up the perfect environment for your next challenge...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <form onSubmit={onSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8 mt-5">
          {/* Form Title */}
          <WelcomeSection 
              title={editMode ? 'Edit Challenge' : 'Create a New Challenge / Hackathon'} 
              subtitle={editMode ? "Update your challenge details below." : "Fill in the details below to create a new challenge."} 
            />
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
                      value={challengeData.title}
                      onChange={(e) => setChallengeData({ ...challengeData, title: e.target.value })}
                      placeholder="Enter challenge title"
                      required
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Challenge Description*</label>
                    <textarea
                      className="w-full min-h-[150px] rounded-md border border-gray-200 p-2"
                      value={challengeData.description}
                      onChange={(e) => setChallengeData({ ...challengeData, description: e.target.value })}
                      placeholder="Describe your challenge in detail"
                      required
                    />
                  </div>
                  
                  {/* Prize */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Prize Details*</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
                      value={challengeData.prize}
                      onChange={(e) => setChallengeData({ ...challengeData, prize: e.target.value })}
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
                        value={challengeData.total_prize}
                        onChange={(e) => setChallengeData({ 
                          ...challengeData, 
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
                      value={challengeData.deadline}
                      onChange={(e) => setChallengeData({ ...challengeData, deadline: e.target.value })}
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
                      {challengeData.coverImage ? (
                        <div className="space-y-2">
                          <p>{challengeData.coverImage.name}</p>
                          <button 
                            type="button" 
                            className="text-red-500 text-sm"
                            onClick={() => setChallengeData({ ...challengeData, coverImage: null })}
                          >
                            Remove
                          </button>
                        </div>
                      ) : challengeData.coverImageUrl ? (
                        <div className="space-y-2">
                          <div className="relative w-full h-32 mb-2">
                            <img 
                              src={challengeData.coverImageUrl} 
                              alt="Cover" 
                              className="h-full w-auto mx-auto object-contain"
                            />
                          </div>
                          <p className="text-sm">Current cover image</p>
                          <div className="flex justify-center gap-2">
                            <button 
                              type="button" 
                              className="text-red-500 text-sm"
                              onClick={() => setChallengeData({ 
                                ...challengeData, 
                                coverImageUrl: '' 
                              })}
                            >
                              Remove
                            </button>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleUploadImage(e, 'coverImage')}
                              className="hidden"
                              id="cover-image-replace"
                            />
                            <label 
                              htmlFor="cover-image-replace" 
                              className="text-primary text-sm cursor-pointer"
                            >
                              Replace
                            </label>
                          </div>
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
                        value={challengeData.companyInfo.name}
                        onChange={(e) => setChallengeData({ 
                          ...challengeData, 
                          companyInfo: { ...challengeData.companyInfo, name: e.target.value } 
                        })}
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Company Website</label>
                      <Input
                        type="url"
                        value={challengeData.companyInfo.website}
                        onChange={(e) => setChallengeData({ 
                          ...challengeData, 
                          companyInfo: { ...challengeData.companyInfo, website: e.target.value } 
                        })}
                        placeholder="https://example.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contact Email*</label>
                      <Input
                        type="email"
                        value={challengeData.companyInfo.contactEmail}
                        onChange={(e) => setChallengeData({ 
                          ...challengeData, 
                          companyInfo: { ...challengeData.companyInfo, contactEmail: e.target.value } 
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
                    
                    {challengeData.categories.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {challengeData.categories.map((category) => (
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
                    
                    {challengeData.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {challengeData.skills.map((skill) => (
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
                      value={challengeData.submissionFormat}
                      onChange={(e) => setChallengeData({ ...challengeData, submissionFormat: e.target.value })}
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
                      value={challengeData.maxParticipants}
                      onChange={(e) => setChallengeData({ ...challengeData, maxParticipants: e.target.value })}
                      placeholder="Leave blank for unlimited"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank for unlimited participants</p>
                  </div>
                  
                  {/* Evaluation Criteria */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Evaluation Criteria*</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-gray-200 p-2"
                      value={challengeData.evaluationCriteria}
                      onChange={(e) => setChallengeData({ ...challengeData, evaluationCriteria: e.target.value })}
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
                  value={challengeData.requirements}
                  onChange={(e) => setChallengeData({ ...challengeData, requirements: e.target.value })}
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
                
                {challengeData.resources.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No resources added yet</p>
                ) : (
                  <div className="space-y-3">
                    {challengeData.resources.map((resource, index) => (
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
                              const updatedResources = [...challengeData.resources];
                              updatedResources.splice(index, 1);
                              setChallengeData({ ...challengeData, resources: updatedResources });
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
                
                {challengeData.faq.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No FAQs added yet</p>
                ) : (
                  <div className="space-y-4">
                    {challengeData.faq.map((faq, index) => (
                      <div key={index} className="space-y-2 p-3 border border-gray-200 rounded-md">
                        <div className="flex justify-between">
                          <label className="block text-xs text-gray-500">Question</label>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={() => {
                              const updatedFaqs = [...challengeData.faq];
                              updatedFaqs.splice(index, 1);
                              setChallengeData({ ...challengeData, faq: updatedFaqs });
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
                  {challengeData.timeline.map((phase, index) => (
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
                
                {challengeData.judges.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No judges added yet</p>
                ) : (
                  <div className="space-y-3">
                    {challengeData.judges.map((judge, index) => (
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
                              const updatedJudges = [...challengeData.judges];
                              updatedJudges.splice(index, 1);
                              setChallengeData({ ...challengeData, judges: updatedJudges });
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
                          checked={challengeData.visibility === 'public'}
                          onChange={() => setChallengeData({ ...challengeData, visibility: 'public' })}
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
                          checked={challengeData.visibility === 'private'}
                          onChange={() => setChallengeData({ ...challengeData, visibility: 'private' })}
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
                          checked={challengeData.visibility === 'unlisted'}
                          onChange={() => setChallengeData({ ...challengeData, visibility: 'unlisted' })}
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
                        checked={challengeData.allowTeams}
                        onCheckedChange={(checked) => setChallengeData({ 
                          ...challengeData, 
                          allowTeams: checked === true 
                        })}
                      />
                      <label htmlFor="allow-teams" className="text-sm">Allow team participation</label>
                    </div>
                    
                    {challengeData.allowTeams && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Maximum Team Size</label>
                        <Input
                          type="number"
                          min="2"
                          max="20"
                          value={challengeData.maxTeamSize}
                          onChange={(e) => setChallengeData({ ...challengeData, maxTeamSize: parseInt(e.target.value, 10) || 0 })}
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
                      value={challengeData.termsAndConditions}
                      onChange={(e) => setChallengeData({ ...challengeData, termsAndConditions: e.target.value })}
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
                onClick={() => setActiveView('preview-challenge', { challenge: challengeData })}
                className="mr-2"
                disabled={isSubmitting}
              >
                Preview
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save as Draft'}
              </Button>
            </div>
            <div className="space-x-3">
              <Button 
                type="button" 
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary text-white"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (editMode ? 'Updating...' : 'Creating...')
                  : (editMode ? 'Update and Launch Challenge' : 'Create Challenge')}
              </Button>
            </div>
          </div>
        </form>
    </div>
  );
};