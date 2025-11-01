import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, MapPin, Briefcase, Code, Linkedin, Github, Twitter,
  ArrowRight, ArrowLeft, CheckCircle2, X, GraduationCap, Building2, AtSign, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { db, auth, functions } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const navigate = useNavigate();

  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    // Step 0: Username
    username: '',
    
    // Step 1: Basic Info
    title: '',
    location: '',
    phone: '',
    
    // Step 2: About You
    about: '',
    fieldType: '',
    
    // Step 3: Skills
    skills: [] as string[],
    skillInput: '',
    
    // Step 4: Experience (Optional)
    experience: [] as Array<{
      role: string;
      company: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string;
    }>,
    experienceForm: {
      role: '',
      company: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
    
    // Step 5: Education (Optional)
    education: [] as Array<{
      degree: string;
      institution: string;
      field: string;
      startDate: string;
      endDate: string;
      current: boolean;
    }>,
    educationForm: {
      degree: '',
      institution: '',
      field: '',
      startDate: '',
      endDate: '',
      current: false,
    },
    
    // Step 6: Social Links
    social: {
      linkedin: '',
      github: '',
      twitter: '',
    },
  });

  const steps = [
    { 
      id: 0, 
      title: 'Username', 
      subtitle: 'Choose your unique username',
      icon: AtSign 
    },
    { 
      id: 1, 
      title: 'Basic Info', 
      subtitle: 'Tell us a bit about yourself',
      icon: User 
    },
    { 
      id: 2, 
      title: 'About You', 
      subtitle: 'What do you do?',
      icon: Briefcase 
    },
    { 
      id: 3, 
      title: 'Your Skills', 
      subtitle: 'What are you good at?',
      icon: Code 
    },
    { 
      id: 4, 
      title: 'Experience', 
      subtitle: 'Your work history (Optional)',
      icon: Building2 
    },
    { 
      id: 5, 
      title: 'Education', 
      subtitle: 'Your academic background (Optional)',
      icon: GraduationCap 
    },
    { 
      id: 6, 
      title: 'Connect', 
      subtitle: 'Link your profiles',
      icon: Linkedin 
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Load existing profile data on mount
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setIsLoadingProfile(false);
          return;
        }

        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setFormData(prev => ({
            ...prev,
            username: data.username || '',
            title: data.title || '',
            location: data.location || '',
            phone: data.phone || '',
            about: data.about || '',
            fieldType: data.fieldType || '',
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            social: {
              linkedin: data.social?.linkedin || '',
              github: data.social?.github || '',
              twitter: data.social?.twitter || '',
            },
          }));
          
          // If username exists, mark as available
          if (data.username) {
            setUsernameStatus('available');
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        toast.error('Failed to load existing profile data');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, []);

  // Username validation with debouncing
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      if (!formData.username || formData.username.length < 3) {
        setUsernameStatus('idle');
        setUsernameError('');
        return;
      }

      setUsernameStatus('checking');
      setUsernameError('');

      try {
        const checkUsernameFunction = httpsCallable(functions, 'checkUsername');
        const result = await checkUsernameFunction({ username: formData.username });
        const data = result.data as { success: boolean; available: boolean; error?: string };

        if (data.success && data.available) {
          setUsernameStatus('available');
          setUsernameError('');
        } else if (data.error) {
          setUsernameStatus('invalid');
          setUsernameError(data.error);
        } else {
          setUsernameStatus('taken');
          setUsernameError('Username is already taken');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('invalid');
        setUsernameError('Failed to check username availability');
      }
    };

    const debounce = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(debounce);
  }, [formData.username]);

  // Fetch username suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profileRef = doc(db, 'profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          const firstName = data.firstName || '';
          const lastName = data.lastName || '';

          if (firstName || lastName) {
            const suggestFunction = httpsCallable(functions, 'suggestUsernames');
            const result = await suggestFunction({ firstName, lastName });
            const suggestionData = result.data as { success: boolean; suggestions: string[] };
            
            if (suggestionData.success) {
              setUsernameSuggestions(suggestionData.suggestions);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching username suggestions:', error);
      }
    };

    if (currentStep === 0 && usernameSuggestions.length === 0) {
      fetchSuggestions();
    }
  }, [currentStep, usernameSuggestions.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        social: { ...prev.social, [socialField]: value }
      }));
    } else if (name.startsWith('experienceForm.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        experienceForm: { ...prev.experienceForm, [field]: value }
      }));
    } else if (name.startsWith('educationForm.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        educationForm: { ...prev.educationForm, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddSkill = () => {
    if (formData.skillInput.trim() && formData.skills.length < 10) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillInput.trim()],
        skillInput: ''
      }));
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  const handleAddExperience = () => {
    const { role, company, startDate } = formData.experienceForm;
    if (role.trim() && company.trim() && startDate) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...prev.experienceForm }],
        experienceForm: {
          role: '',
          company: '',
          startDate: '',
          endDate: '',
          current: false,
          description: '',
        }
      }));
    }
  };

  const handleRemoveExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleAddEducation = () => {
    const { degree, institution, startDate } = formData.educationForm;
    if (degree.trim() && institution.trim() && startDate) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...prev.educationForm }],
        educationForm: {
          degree: '',
          institution: '',
          field: '',
          startDate: '',
          endDate: '',
          current: false,
        }
      }));
    }
  };

  const handleRemoveEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        // Username validation
        if (!formData.username) {
          toast.error('Please choose a username');
          return false;
        }
        if (usernameStatus === 'checking') {
          toast.error('Please wait while we check username availability');
          return false;
        }
        if (usernameStatus !== 'available') {
          toast.error('Please choose a valid and available username');
          return false;
        }
        return true;
      case 1:
        // Basic Info
        if (!formData.title || !formData.location) {
          toast.error('Please fill in your title and location');
          return false;
        }
        return true;
      case 2:
        // About You
        if (!formData.about || formData.about.length < 20) {
          toast.error('Please tell us a bit about yourself (at least 20 characters)');
          return false;
        }
        if (!formData.fieldType) {
          toast.error('Please select your field');
          return false;
        }
        return true;
      case 3:
        // Skills
        if (formData.skills.length < 3) {
          toast.error('Please add at least 3 skills');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user found');

      // Reserve username first
      if (formData.username && usernameStatus === 'available') {
        const reserveUsernameFunction = httpsCallable(functions, 'reserveUsername');
        await reserveUsernameFunction({ username: formData.username });
      }

      const profileRef = doc(db, 'profiles', user.uid);
      await updateDoc(profileRef, {
        username: formData.username,
        title: formData.title,
        location: formData.location,
        phone: formData.phone || '',
        about: formData.about,
        fieldType: formData.fieldType,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        social: formData.social,
        updatedAt: new Date().toISOString(),
      });

      // Mark onboarding as complete
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        onboardingComplete: true,
        updated_at: new Date().toISOString(),
      });

      toast.success('Welcome to GenLink! 🎉');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      if (error?.message?.includes('already-exists')) {
        toast.error('Username is no longer available. Please choose another one.');
        setCurrentStep(0);
      } else {
        toast.error('Failed to complete onboarding. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fieldTypes = [
    'Software Development',
    'Data Science',
    'Design (UI/UX)',
    'Product Management',
    'Business Development',
    'Marketing',
    'Engineering',
    'Research',
    'Other',
  ];

  // Show loading state while fetching profile
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm md:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle animated background blobs */}
      <motion.div
        className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-accent/5 dark:bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        {/* Compact Header */}
        <div className="max-w-3xl mx-auto mb-6 md:mb-8">
          <div className="flex justify-center mb-4">
            <Logo class_name="scale-75 md:scale-100" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
              Welcome! Let's set up your profile
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Tell us about yourself so we can personalize your experience
            </p>
          </motion.div>

          {/* Compact Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs md:text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span className="hidden sm:inline">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Compact Steps indicator */}
          <div className="flex justify-between mt-4 md:mt-6 gap-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <motion.div
                    className={cn(
                      "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center mb-1.5 md:mb-2 border-2 transition-colors",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "bg-accent border-accent text-accent-foreground",
                      !isCompleted && !isCurrent && "bg-muted border-muted-foreground/20 text-muted-foreground"
                    )}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] md:text-xs font-medium text-center",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground"
                  )}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Compact Form content */}
        <motion.div
          className="max-w-2xl mx-auto bg-card border border-border rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 lg:p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 md:space-y-5"
            >
              {/* Step 0: Username */}
              {currentStep === 0 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[0].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[0].subtitle}</p>
                  </div>

                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <Label htmlFor="username" className="text-sm">Choose your username *</Label>
                      <div className="relative mt-1.5">
                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          placeholder="your_username"
                          className={cn(
                            "pl-10 h-9 md:h-10",
                            usernameStatus === 'available' && 'border-green-500 focus-visible:ring-green-500',
                            usernameStatus === 'taken' && 'border-red-500 focus-visible:ring-red-500',
                            usernameStatus === 'invalid' && 'border-amber-500 focus-visible:ring-amber-500'
                          )}
                        />
                        {usernameStatus === 'checking' && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        )}
                        {usernameStatus === 'available' && (
                          <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                        )}
                        {usernameStatus === 'taken' && (
                          <X className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
                        )}
                      </div>
                      {usernameError && (
                        <p className="text-xs text-red-500 mt-1.5">{usernameError}</p>
                      )}
                      {usernameStatus === 'available' && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1.5">
                          ✓ Username is available!
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        3-20 characters. Letters, numbers, underscores, and hyphens only.
                      </p>
                    </div>

                    {/* Username Suggestions */}
                    {usernameSuggestions.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Suggestions:</Label>
                        <div className="flex flex-wrap gap-2">
                          {usernameSuggestions.slice(0, 6).map((suggestion) => (
                            <Badge
                              key={suggestion}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent hover:border-primary transition-colors"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, username: suggestion }));
                              }}
                            >
                              @{suggestion}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[1].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[1].subtitle}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm">Your Title / Role *</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Full Stack Developer"
                        className="mt-1.5 h-9 md:h-10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location" className="text-sm">Location *</Label>
                      <div className="relative mt-1.5">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="e.g., Kigali, Rwanda"
                          className="pl-10 h-9 md:h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm">Phone Number (Optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+250 XXX XXX XXX"
                        className="mt-1.5 h-9 md:h-10"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: About You */}
              {currentStep === 2 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[2].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[2].subtitle}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label htmlFor="about" className="text-sm">Tell us about yourself *</Label>
                      <Textarea
                        id="about"
                        name="about"
                        value={formData.about}
                        onChange={handleInputChange}
                        placeholder="A brief description... e.g., I'm a developer passionate about building innovative solutions"
                        className="mt-1.5 min-h-[80px] md:min-h-[100px] text-sm"
                        maxLength={300}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formData.about.length}/300 characters
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="fieldType" className="text-sm">Your Field *</Label>
                      <select
                        id="fieldType"
                        name="fieldType"
                        value={formData.fieldType}
                        onChange={(e) => handleInputChange(e as any)}
                        className="w-full mt-1.5 px-3 py-2 h-9 md:h-10 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select your field...</option>
                        {fieldTypes.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Skills */}
              {currentStep === 3 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[3].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[3].subtitle}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label htmlFor="skillInput" className="text-sm">Add Your Skills *</Label>
                      <div className="flex gap-2 mt-1.5">
                        <Input
                          id="skillInput"
                          name="skillInput"
                          value={formData.skillInput}
                          onChange={handleInputChange}
                          placeholder="e.g., React, Python, UI Design"
                          className="h-9 md:h-10 text-sm"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          onClick={handleAddSkill}
                          disabled={!formData.skillInput.trim()}
                          className="h-9 md:h-10 text-sm"
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Press Enter or click Add to add each skill
                      </p>
                    </div>

                    {formData.skills.length > 0 && (
                      <div>
                        <Label className="text-sm">Your Skills ({formData.skills.length})</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.skills.map((skill, index) => (
                            <Badge key={index} className="py-1 px-3 text-sm">
                              {skill}
                              <button
                                onClick={() => handleRemoveSkill(index)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 4: Experience */}
              {currentStep === 4 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[4].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[4].subtitle}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="experienceForm.role" className="text-sm">Role/Position</Label>
                        <Input
                          id="experienceForm.role"
                          name="experienceForm.role"
                          value={formData.experienceForm.role}
                          onChange={handleInputChange}
                          placeholder="e.g., Software Engineer"
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="experienceForm.company" className="text-sm">Company</Label>
                        <Input
                          id="experienceForm.company"
                          name="experienceForm.company"
                          value={formData.experienceForm.company}
                          onChange={handleInputChange}
                          placeholder="e.g., Tech Corp"
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="experienceForm.startDate" className="text-sm">Start Date</Label>
                        <Input
                          id="experienceForm.startDate"
                          name="experienceForm.startDate"
                          type="month"
                          value={formData.experienceForm.startDate}
                          onChange={handleInputChange}
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="experienceForm.endDate" className="text-sm">
                          End Date {formData.experienceForm.current && '(Current)'}
                        </Label>
                        <Input
                          id="experienceForm.endDate"
                          name="experienceForm.endDate"
                          type="month"
                          value={formData.experienceForm.endDate}
                          onChange={handleInputChange}
                          disabled={formData.experienceForm.current}
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="experienceForm.current"
                        checked={formData.experienceForm.current}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          experienceForm: {
                            ...prev.experienceForm,
                            current: e.target.checked,
                            endDate: e.target.checked ? '' : prev.experienceForm.endDate
                          }
                        }))}
                        className="w-4 h-4 rounded border-input"
                      />
                      <Label htmlFor="experienceForm.current" className="text-sm cursor-pointer">
                        I currently work here
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="experienceForm.description" className="text-sm">Description (Optional)</Label>
                      <Textarea
                        id="experienceForm.description"
                        name="experienceForm.description"
                        value={formData.experienceForm.description}
                        onChange={handleInputChange}
                        placeholder="Brief description of your role and achievements..."
                        className="mt-1.5 min-h-[60px] md:min-h-[80px] text-sm"
                        maxLength={200}
                      />
                    </div>

                    <Button 
                      type="button" 
                      onClick={handleAddExperience}
                      disabled={!formData.experienceForm.role.trim() || !formData.experienceForm.company.trim() || !formData.experienceForm.startDate}
                      className="w-full h-9 md:h-10 text-sm"
                      variant="outline"
                    >
                      Add Experience
                    </Button>

                    {formData.experience.length > 0 && (
                      <div>
                        <Label className="text-sm">Added Experience</Label>
                        <div className="space-y-2 mt-2">
                          {formData.experience.map((exp, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="border border-border rounded-lg p-3 bg-card/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{exp.role}</h4>
                                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                  </p>
                                  {exp.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleRemoveExperience(index)}
                                  className="text-muted-foreground hover:text-destructive ml-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 5: Education */}
              {currentStep === 5 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[5].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[5].subtitle}</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="educationForm.degree" className="text-sm">Degree</Label>
                        <Input
                          id="educationForm.degree"
                          name="educationForm.degree"
                          value={formData.educationForm.degree}
                          onChange={handleInputChange}
                          placeholder="e.g., Bachelor of Science"
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="educationForm.field" className="text-sm">Field of Study</Label>
                        <Input
                          id="educationForm.field"
                          name="educationForm.field"
                          value={formData.educationForm.field}
                          onChange={handleInputChange}
                          placeholder="e.g., Computer Science"
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="educationForm.institution" className="text-sm">Institution</Label>
                      <Input
                        id="educationForm.institution"
                        name="educationForm.institution"
                        value={formData.educationForm.institution}
                        onChange={handleInputChange}
                        placeholder="e.g., University of Rwanda"
                        className="mt-1.5 h-9 md:h-10 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="educationForm.startDate" className="text-sm">Start Date</Label>
                        <Input
                          id="educationForm.startDate"
                          name="educationForm.startDate"
                          type="month"
                          value={formData.educationForm.startDate}
                          onChange={handleInputChange}
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>

                      <div>
                        <Label htmlFor="educationForm.endDate" className="text-sm">
                          End Date {formData.educationForm.current && '(Current)'}
                        </Label>
                        <Input
                          id="educationForm.endDate"
                          name="educationForm.endDate"
                          type="month"
                          value={formData.educationForm.endDate}
                          onChange={handleInputChange}
                          disabled={formData.educationForm.current}
                          className="mt-1.5 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="educationForm.current"
                        checked={formData.educationForm.current}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          educationForm: {
                            ...prev.educationForm,
                            current: e.target.checked,
                            endDate: e.target.checked ? '' : prev.educationForm.endDate
                          }
                        }))}
                        className="w-4 h-4 rounded border-input"
                      />
                      <Label htmlFor="educationForm.current" className="text-sm cursor-pointer">
                        I currently study here
                      </Label>
                    </div>

                    <Button 
                      type="button" 
                      onClick={handleAddEducation}
                      disabled={!formData.educationForm.degree.trim() || !formData.educationForm.institution.trim() || !formData.educationForm.startDate}
                      className="w-full h-9 md:h-10 text-sm"
                      variant="outline"
                    >
                      Add Education
                    </Button>

                    {formData.education.length > 0 && (
                      <div>
                        <Label className="text-sm">Added Education</Label>
                        <div className="space-y-2 mt-2">
                          {formData.education.map((edu, index) => (
                            <motion.div
                              key={index}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="border border-border rounded-lg p-3 bg-card/50"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{edu.degree}</h4>
                                  {edu.field && <p className="text-xs text-muted-foreground">{edu.field}</p>}
                                  <p className="text-xs text-muted-foreground">{edu.institution}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {edu.startDate} - {edu.current ? 'Present' : edu.endDate}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleRemoveEducation(index)}
                                  className="text-muted-foreground hover:text-destructive ml-2"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Step 6: Social Links */}
              {currentStep === 6 && (
                <>
                  <div className="text-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-bold mb-2">{steps[6].title}</h2>
                    <p className="text-muted-foreground text-sm md:text-base">{steps[6].subtitle} (Optional)</p>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <Label htmlFor="social.linkedin" className="text-sm">LinkedIn Profile</Label>
                      <div className="relative mt-1.5">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="social.linkedin"
                          name="social.linkedin"
                          value={formData.social.linkedin}
                          onChange={handleInputChange}
                          placeholder="https://linkedin.com/in/yourname"
                          className="pl-10 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="social.github" className="text-sm">GitHub Profile</Label>
                      <div className="relative mt-1.5">
                        <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="social.github"
                          name="social.github"
                          value={formData.social.github}
                          onChange={handleInputChange}
                          placeholder="https://github.com/yourname"
                          className="pl-10 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="social.twitter" className="text-sm">Twitter/X Profile</Label>
                      <div className="relative mt-1.5">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          id="social.twitter"
                          name="social.twitter"
                          value={formData.social.twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/yourname"
                          className="pl-10 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Compact Navigation buttons */}
          <div className="flex justify-between mt-6 md:mt-8 pt-4 md:pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
              className="h-9 md:h-10 text-sm"
            >
              <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext} disabled={isLoading} className="h-9 md:h-10 text-sm">
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 h-9 md:h-10 text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-3 h-3 md:w-4 md:h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-1.5 md:mr-2" />
                    <span className="hidden sm:inline">Completing...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Complete Setup</span>
                    <span className="sm:hidden">Complete</span>
                    <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 ml-1.5 md:ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Onboarding;

