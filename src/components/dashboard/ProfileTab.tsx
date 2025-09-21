import { useState, useEffect } from 'react';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import NotificationsDropdown from '@/components/dashboard/NotificationsDropdown';
import { PencilIcon, CheckIcon, X,
  Github, Twitter, Linkedin, Award, Layers as LayersIcon, MessageCircle
 } from 'lucide-react';
import { storage } from '@/lib/firebase';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export default function ProfileTab({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profile, setProfile] = useState({
    name: user?.fullName || '',
    title: user?.title || '',
    photo: user?.photo || '',
    coverPhoto: user?.coverPhoto || '',
    location: user?.location || '',
    email: user?.email || '',
    phone: user?.phone || '',
    website: user?.website || '',
    about: user?.about || '',
    experience: user?.experience || [],
    education: user?.education || [],
    skills: user?.skills || [],
    projects: user?.projects || [],
    certifications: user?.certifications || [],
    contributions: user?.contributions || 0,
    projectsCount: user?.projectsCount || 0,
    badges: user?.badges || [],
    social: user?.social || {
      github: '',
      twitter: '',
      linkedin: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.uid) return;
      
      try {
        setIsLoading(true);
        const profileRef = doc(db, 'public_profiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile({
            name: data.name || user?.fullName || '',
          title: data.title || user?.title || '',
          photo: data.photo || user?.photo || '/placeholder user.svg',
          coverPhoto: data.coverPhoto || user?.coverPhoto || '',
          location: data.location || user?.location || '',
          email: data.email || user?.email || '',
          phone: data.phone || user?.phone || '',
          website: data.website || user?.website || '',
          about: data.about || user?.about || '',
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          projects: data.projects || [],
          certifications: data.certifications || [],
          contributions: data.contributions || 0,
          projectsCount: data.projectsCount || 0,
          badges: data.badges || [],
          social: data.social || {
            github: '',
            twitter: '',
            linkedin: ''
          }
        });
        } else {
          // If no public profile exists yet, create one with user data
          setDoc(profileRef, {
            name: user?.fullName || '',
            email: user?.email || '',
            userId: user.uid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProfileData();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) {
      toast.error("You must be logged in to update your profile");
      return;
    }
    
    setIsLoading(true);
    
    try {
      let updatedProfile = {...profile};
      
      // Handle photo uploads if they are data URLs (from new uploads)
      // if (profile.photo && profile.photo.startsWith('data:')) {
      //   const photoRef = ref(storage, `profiles/${user.uid}/profile-photo`);
      //   await uploadString(photoRef, profile.photo, 'data_url');
      //   const photoURL = await getDownloadURL(photoRef);
      //   updatedProfile.photo = photoURL;
      // }
      
      // if (profile.coverPhoto && profile.coverPhoto.startsWith('data:')) {
      //   const coverRef = ref(storage, `profiles/${user.uid}/cover-photo`);
      //   await uploadString(coverRef, profile.coverPhoto, 'data_url');
      //   const coverURL = await getDownloadURL(coverRef);
      //   updatedProfile.coverPhoto = coverURL;
      // }
      
      // Save to Firebase
      const profileRef = doc(db, 'public_profiles', user.uid);
      await setDoc(profileRef, {
        ...updatedProfile,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      // Update the name in the user profile if changed
      if (profile.name && profile.name !== user?.fullName) {
        const userProfileRef = doc(db, 'profiles', user.uid);
        await setDoc(userProfileRef, {
          full_name: profile.name
        }, { merge: true });
      }
      
      setOriginalProfile(null);
      toast.success("Profile updated successfully");
      setIsEditing(false);
      
      // Update local state with the URLs from Firebase Storage
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Revert to original profile if we have one
    if (originalProfile) {
      setProfile(originalProfile);
    }
    setIsEditing(false);
  };

  const startEditing = () => {
    // Store current profile before editing
    setOriginalProfile({...profile});
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 mt-5">
        <WelcomeSection title="Profile" subtitle="Your Public Profile" />
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
          <div className="w-full max-w-md mt-8">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
              Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base font-medium max-w-2xl">
              Manage your public profile and showcase your work
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="block sm:hidden lg:block">
              <NotificationsDropdown />
            </div>
            <div className="flex-shrink-0">
          {!isEditing ? (
            <button 
              onClick={startEditing}
              className="flex items-center px-6 py-3 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl transition-all duration-200 hover:shadow-lg"
            >
              <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed bg-slate-400' 
                    : 'bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <CheckIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className={`flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl transition-all duration-200 ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'bg-slate-600 hover:bg-slate-700 hover:shadow-lg'
                } text-white`}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </button>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover Photo Section */}
        <div className="relative">
          {isEditing ? (
            <label className="cursor-pointer relative block group">
              <div className="h-48 relative overflow-hidden">
                {profile.coverPhoto ? (
                  <img 
                    src={profile.coverPhoto} 
                    alt="Cover" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-48 bg-slate-100 dark:bg-slate-700 w-full flex items-center justify-center">
                    <span className="text-slate-400 dark:text-slate-500 text-sm">Add cover photo</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
                  <div className="bg-white dark:bg-slate-900 rounded-lg px-4 py-2 flex items-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <PencilIcon className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Change Cover Photo</span>
                  </div>
                </div>
              </div>
              <input 
                type="file" 
                className="hidden" 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files[0]) {
                    const fileSize = e.target.files[0].size / 1024 / 1024;
                    if (fileSize > 2) {
                      toast.error("File size should not exceed 2MB");
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      if (event.target?.result) {
                        setProfile({
                          ...profile, 
                          coverPhoto: event.target.result as string
                        });
                      }
                    };
                    reader.onerror = () => {
                      toast.error("Failed to read file");
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }}
                accept="image/*"
              />
            </label>
          ) : (
            <div className="h-48 relative overflow-hidden">
              {profile.coverPhoto ? (
                <img 
                  src={profile.coverPhoto} 
                  alt="Cover" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-48 bg-slate-100 dark:bg-slate-700 w-full flex items-center justify-center">
                  <span className="text-slate-400 dark:text-slate-500 text-sm">No cover photo</span>
                </div>
              )}
            </div>
          )}
          
          {/* Profile Photo */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="rounded-full h-24 w-24 bg-white dark:bg-slate-900 p-1 shadow-lg border-2 border-white dark:border-slate-800">
              {isEditing ? (
                <label className="cursor-pointer group">
                  <div className="rounded-full h-full w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">
                    {profile.photo ? (
                      <img 
                        src={profile.photo} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                        <span className="text-slate-600 dark:text-slate-300 text-xl font-semibold">
                          {profile.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all duration-200">
                      <PencilIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <input type="file" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (event.target?.result) {
                            setProfile({
                              ...profile, 
                              photo: event.target.result as string
                            });
                          }
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    accept="image/*"
                    />
                </label>
              ) : (
                <div className="rounded-full h-full w-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center relative overflow-hidden">
                  { profile.photo ? (
                  <img 
                    src={profile.photo} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                <div className="h-full w-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
                    <span className="text-slate-600 dark:text-slate-300 text-xl font-semibold">
                      {profile.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                )
                }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-20 px-8 pb-8">
          {/* Basic Details */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:justify-between gap-8">
              <div className="lg:w-2/3">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="w-full text-2xl font-bold bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none pb-2"
                        placeholder='Enter your full name'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Job Title</label>
                      <input
                        type="text"
                        value={profile.title}
                        onChange={(e) => setProfile({...profile, title: e.target.value})}
                        className="w-full text-lg text-slate-600 dark:text-slate-400 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none pb-2"
                        placeholder='Enter your job title'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        className="w-full text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none pb-2"
                        placeholder='City, Country'
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Website</label>
                      <input
                        type="url"
                        value={profile.website}
                        onChange={(e) => setProfile({...profile, website: e.target.value})}
                        className="w-full text-sm text-slate-500 dark:text-slate-400 bg-transparent border-b-2 border-slate-200 dark:border-slate-600 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none pb-2"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name || 'Your Name'}</h2>
                    <p className="text-xl text-slate-600 dark:text-slate-400">{profile.title || 'Your Title'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{profile.location || 'Your Location'}</p>
                    {profile.website && (
                      <div className="flex items-center mt-2">
                        <span className="text-slate-500 dark:text-slate-400 text-sm mr-2">Website:</span>
                        <a 
                          href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline"
                        >
                          {profile.website.replace(/(https?:\/\/)?(www\.)?/i, '')}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {(profile.email || profile.phone || isEditing) && (
                <div className="lg:w-1/3">
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                    <h4 className="text-slate-700 dark:text-slate-300 font-semibold text-sm uppercase tracking-wide mb-4">Contact Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            placeholder="your@email.com"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{profile.email || 'Not provided'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            placeholder="+1 (555) 123-4567"
                          />
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{profile.phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Social Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Github className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.social.github}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: {...profile.social, github: e.target.value}
                      })}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                      placeholder="GitHub profile URL"
                    />
                  ) : (
                    profile.social.github ? (
                      <a 
                        href={profile.social.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline text-sm"
                      >
                        {profile.social.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                      </a>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 italic text-sm">Not provided</span>
                    )
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Twitter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.social.twitter}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: {...profile.social, twitter: e.target.value}
                      })}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                      placeholder="Twitter/X profile URL"
                    />
                  ) : (
                    profile.social.twitter ? (
                      <a 
                        href={profile.social.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline text-sm"
                      >
                        {profile.social.twitter.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@')}
                      </a>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 italic text-sm">Not provided</span>
                    )
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <Linkedin className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.social.linkedin}
                      onChange={(e) => setProfile({
                        ...profile,
                        social: {...profile.social, linkedin: e.target.value}
                      })}
                      className="w-full text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                      placeholder="LinkedIn profile URL"
                    />
                  ) : (
                    profile.social.linkedin ? (
                      <a 
                        href={profile.social.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline text-sm"
                      >
                        {profile.social.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, '')}
                      </a>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 italic text-sm">Not provided</span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About</h3>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tell us about yourself</label>
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile({...profile, about: e.target.value})}
                  className="w-full h-32 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none resize-none"
                  placeholder="Tell us about yourself, your interests, and what drives you..."
                />
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                {profile.about ? (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{profile.about}</p>
                ) : (
                  <p className="text-slate-500 dark:text-slate-400 italic">Tell us about yourself!</p>
                )}
              </div>
            )}
          </div>

          {/* Community Profile Section */}
          {!isEditing && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Community Involvement</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">Activity Stats</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center">
                        <MessageCircle className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-3" />
                        <span className="text-slate-700 dark:text-slate-300">Contributions</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-lg">{profile.contributions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center">
                        <LayersIcon className="h-5 w-5 text-slate-600 dark:text-slate-400 mr-3" />
                        <span className="text-slate-700 dark:text-slate-300">Genlink Projects</span>
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white text-lg">{profile.projectsCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                  <h4 className="text-md font-semibold text-slate-900 dark:text-white mb-4">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 italic text-sm">No badges earned yet.</p>
                    ) : (
                      profile.badges.map((badge, index) => (
                        <div key={index} className="flex items-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1">
                          <Award className="h-3 w-3 mr-1" />
                          <span className="text-sm font-medium">{badge}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Experience Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Experience</h3>
              {isEditing && (
                <button 
                  className="text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white font-medium"
                  onClick={() => setProfile({
                    ...profile,
                    experience: [...profile.experience, { 
                      id: Date.now(), 
                      title: '', 
                      company: '',
                      location: '',
                      startDate: '',
                      endDate: '',
                      description: '' 
                    }]
                  })}
                >
                  + Add Experience
                </button>
              )}
            </div>
            
            {profile.experience.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 italic">No experience added yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.experience.map((exp, index) => (
                  <div key={exp.id || index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Position Title</label>
                            <input
                              type="text"
                              value={exp.title}
                              onChange={(e) => {
                                const updatedExperience = [...profile.experience];
                                updatedExperience[index].title = e.target.value;
                                setProfile({...profile, experience: updatedExperience});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="Position Title"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                experience: profile.experience.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700 ml-4 p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Name</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const updatedExperience = [...profile.experience];
                              updatedExperience[index].company = e.target.value;
                              setProfile({...profile, experience: updatedExperience});
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            placeholder="Company Name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                                const updatedExperience = [...profile.experience];
                                updatedExperience[index].startDate = e.target.value;
                                setProfile({...profile, experience: updatedExperience});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Date</label>
                            <input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => {
                                const updatedExperience = [...profile.experience];
                                updatedExperience[index].endDate = e.target.value;
                                setProfile({...profile, experience: updatedExperience});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => {
                              const updatedExperience = [...profile.experience];
                              updatedExperience[index].description = e.target.value;
                              setProfile({...profile, experience: updatedExperience});
                            }}
                            className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none resize-none"
                            placeholder="Describe your role and achievements..."
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{exp.title}</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{exp.company}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{exp.startDate} - {exp.endDate}</p>
                        {exp.description && (
                          <p className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">{exp.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Education</h3>
              {isEditing && (
                <button 
                  className="text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white font-medium"
                  onClick={() => setProfile({
                    ...profile,
                    education: [...profile.education, { 
                      id: Date.now(), 
                      school: '', 
                      degree: '',
                      field: '',
                      startYear: '',
                      endYear: ''
                    }]
                  })}
                >
                  + Add Education
                </button>
              )}
            </div>
            
            {profile.education.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 italic">No education added yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.education.map((edu, index) => (
                  <div key={edu.id || index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">School/University</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => {
                                const updatedEducation = [...profile.education];
                                updatedEducation[index].school = e.target.value;
                                setProfile({...profile, education: updatedEducation});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="School/University Name"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                education: profile.education.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700 ml-4 p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const updatedEducation = [...profile.education];
                              updatedEducation[index].degree = e.target.value;
                              setProfile({...profile, education: updatedEducation});
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            placeholder="Degree"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => {
                              const updatedEducation = [...profile.education];
                              updatedEducation[index].field = e.target.value;
                              setProfile({...profile, education: updatedEducation});
                            }}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                            placeholder="Field of Study"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Start Year</label>
                            <input
                              type="text"
                              value={edu.startYear}
                              onChange={(e) => {
                                const updatedEducation = [...profile.education];
                                updatedEducation[index].startYear = e.target.value;
                                setProfile({...profile, education: updatedEducation});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="Start Year"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">End Year</label>
                            <input
                              type="text"
                              value={edu.endYear}
                              onChange={(e) => {
                                const updatedEducation = [...profile.education];
                                updatedEducation[index].endYear = e.target.value;
                                setProfile({...profile, education: updatedEducation});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="End Year"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{edu.school}</h4>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{edu.degree}, {edu.field}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{edu.startYear} - {edu.endYear}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Skills</h3>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-600 focus-within:border-slate-400 dark:focus-within:border-slate-400">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full px-3 py-1.5 text-sm font-medium">
                        <span>{skill}</span>
                        <button
                          onClick={() => {
                            const newSkills = profile.skills.filter((_, i) => i !== index);
                            setProfile({ ...profile, skills: newSkills });
                          }}
                          className="ml-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      className="flex-1 min-w-[200px] bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300 placeholder-slate-500 dark:placeholder-slate-400"
                    placeholder="Type a skill and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        e.preventDefault();
                        const newSkill = e.currentTarget.value.trim();
                        if (!profile.skills.includes(newSkill)) {
                          setProfile({
                            ...profile,
                            skills: [...profile.skills, newSkill]
                          });
                        }
                        e.currentTarget.value = '';
                      }
                    }}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Press Enter to add a new skill</p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 italic">No skills added yet.</p>
                  ) : (
                    profile.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Projects</h3>
              {isEditing && (
                <button 
                  className="text-slate-600 dark:text-slate-400 text-sm hover:text-slate-900 dark:hover:text-white font-medium"
                  onClick={() => setProfile({
                    ...profile,
                    projects: [...profile.projects, { 
                      id: Date.now(), 
                      name: '', 
                      description: '',
                      link: 'https://',
                      public: false,
                      year: ''
                    }]
                  })}
                >
                  + Add Project
                </button>
              )}
            </div>
            
            {profile.projects.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8 text-center">
                <p className="text-slate-500 dark:text-slate-400 italic">No projects added yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.projects.map((project, index) => (
                  <div key={project.id || index} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => {
                                const updatedProjects = [...profile.projects];
                                updatedProjects[index].name = e.target.value;
                                setProfile({...profile, projects: updatedProjects});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="Project Name"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                projects: profile.projects.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700 ml-4 p-2"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => {
                              const updatedProjects = [...profile.projects];
                              updatedProjects[index].description = e.target.value;
                              setProfile({...profile, projects: updatedProjects});
                            }}
                            className="w-full h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none resize-none"
                            placeholder="Describe your project..."
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project URL</label>
                            <input
                              type="text"
                              value={project.link}
                              onChange={(e) => {
                                const updatedProjects = [...profile.projects];
                                updatedProjects[index].link = e.target.value;
                                setProfile({...profile, projects: updatedProjects});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="https://yourproject.com"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Year</label>
                            <input
                              type="text"
                              value={project.year}
                              onChange={(e) => {
                                const updatedProjects = [...profile.projects];
                                updatedProjects[index].year = e.target.value;
                                setProfile({...profile, projects: updatedProjects});
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 focus:border-slate-400 dark:focus:border-slate-400 focus:outline-none"
                              placeholder="2024"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Visibility</label>
                            <label className="flex items-center cursor-pointer">
                              <div className="relative">
                                <input
                                  type="checkbox"
                                  className="sr-only"
                                  checked={project.public}
                                  onChange={(e) => {
                                    const updatedProjects = [...profile.projects];
                                    updatedProjects[index].public = e.target.checked;
                                    setProfile({...profile, projects: updatedProjects});
                                  }}
                                />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${project.public ? 'bg-slate-600 dark:bg-slate-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                <div className={`absolute left-1 top-1 bg-white dark:bg-slate-200 w-4 h-4 rounded-full transition transform ${project.public ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                              <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">{project.public ? 'Public' : 'Private'}</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-slate-900 dark:text-white text-lg">{project.name}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${project.public ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                            {project.public ? 'Public' : 'Private'}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                          <span>{project.year}</span>
                        </div>
                        {project.description && (
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{project.description}</p>
                        )}
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline text-sm font-medium"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
  );
}