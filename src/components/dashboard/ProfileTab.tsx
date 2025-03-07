import { useState, useEffect } from 'react';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
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
          photo: data.photo || user?.photo || '',
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
          projectsCount: data.projectsCount || (data.projects?.length || 0),
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
    <div className="space-y-4 sm:space-y-6 mt-5">
      <div className="grid grid-rows-1 gap-1">
        <WelcomeSection title="Profile" subtitle="Your Public Profile" />
        <div>
          {!isEditing ? (
            <button 
              onClick={startEditing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 bg-green-600 text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
              >
                {isLoading ? (
                  <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <CheckIcon className="h-4 w-4 mr-2" />
                )}
                {isLoading ? 'Saving...' : 'Save'}
              </button>
              <button 
                onClick={handleCancel}
                disabled={isLoading}
                className={`flex items-center px-4 py-2 bg-gray-600 text-white rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}`}
              >
                <X className="h-4 w-4 mr-2" /> Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Basic Info Section */}
        <div className="relative">
        {/* Cover Photo */}
        {isEditing ? (
          <label className="cursor-pointer relative block">
            <div className="h-32 relative">
              {profile.coverPhoto ? (
                <img 
                  src={profile.coverPhoto} 
                  alt="Cover" 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="bg-white rounded-md px-3 py-2 flex items-center shadow">
                  <PencilIcon className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-800">Change Cover Photo</span>
                </div>
              </div>
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files[0]) {
                  // Validate file size (limit to 2MB)
                  const fileSize = e.target.files[0].size / 1024 / 1024; // in MB
                  if (fileSize > 2) {
                    toast.error("File size should not exceed 2MB");
                    return;
                  }
                  
                  // For demo purposes - would typically upload to Firebase Storage
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
          <div className="h-32 relative">
            {profile.coverPhoto ? (
              <img 
                src={profile.coverPhoto} 
                alt="Cover" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"></div>
            )}
          </div>
        )}
          
          {/* Profile Photo */}
          <div className="absolute bottom-0 left-8 transform translate-y-1/2">
            <div className="rounded-full h-24 w-24 bg-white p-1 shadow">
              {isEditing ? (
                <label className="cursor-pointer">
                  <div className="rounded-full h-full w-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {profile.photo ? (
                      <img 
                        src={profile.photo} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xl font-semibold">
                          {profile.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <PencilIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <input type="file" className="hidden" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files && e.target.files[0]) {
                        // For demo purposes - would typically upload to server
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
                <div className="rounded-full h-full w-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                  { profile.photo ? (
                  <img 
                    src={profile.photo} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
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
        <div className="pt-16 px-8 pb-8">
        {/* Basic Details */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:justify-between">
                <div className="md:w-2/3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        className="text-2xl font-bold mb-1 block border-b border-white focus:border-blue-500 focus:outline-none"
                        placeholder='Full Name'
                      />
                      <input
                        type="text"
                        value={profile.title}
                        onChange={(e) => setProfile({...profile, title: e.target.value})}
                        className="text-lg text-gray-600 mb-2 p-1 block border-b border-white focus:border-blue-500 focus:outline-none"
                        placeholder='Job Title'
                      />
                      <input
                        type="text"
                        value={profile.location}
                        onChange={(e) => setProfile({...profile, location: e.target.value})}
                        className="text-sm text-gray-500 block p-1 border-b border-white focus:border-blue-500 focus:outline-none mb-2"
                        placeholder='City, Country'
                      />
                      <div className="flex items-center p-1 mt-2">
                        <span className="text-gray-500 text-sm mr-2">Website:</span>
                        <input
                          type="url"
                          value={profile.website}
                          onChange={(e) => setProfile({...profile, website: e.target.value})}
                          className="border-b border-white focus:border-blue-500 focus:outline-none"
                          placeholder="https://"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-1">{profile.name}</h2>
                      <p className="text-lg text-gray-600 mb-2">{profile.title}</p>
                      <p className="text-sm text-gray-500 mb-2">{profile.location}</p>
                      {profile.website && (
                        <div className="flex items-center mt-1">
                          <span className="text-gray-500 text-sm mr-2">Website:</span>
                            <a 
                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            >
                            {profile.website.replace(/(https?:\/\/)?(www\.)?/i, '')}
                            </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
                {(profile.email || profile.phone) && (
                <div className="md:w-1/3 mt-4 md:mt-0 space-y-2">
                  {/* Contact Information */}
                  <h4 className="text-gray-600 font-medium border-b pb-1 mb-2">Contact</h4>
                  
                  <div className="flex items-center">
                  {(profile.email || isEditing) && (
                    <span className="text-gray-500 text-sm w-12">Email:</span>
                    )}
                    {isEditing ? (
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm">{profile.email}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    {(profile.phone || isEditing) && (
                    <span className="text-gray-500 text-sm w-12">Phone:</span>
                    )}
                    {isEditing ? (
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="flex-1 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <p className="text-sm">{profile.phone}</p>
                    )}
                  </div>
                    
                </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <h4 className="text-md font-medium mb-3">Social Media</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Github className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.social.github}
                    onChange={(e) => setProfile({
                      ...profile,
                      social: {...profile.social, github: e.target.value}
                    })}
                    className="p-2 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="GitHub profile URL"
                  />
                ) : (
                  profile.social.github ? (
                    <a 
                      href={profile.social.github} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.social.github.replace(/^https?:\/\/(www\.)?github\.com\//, '')}
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Twitter className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.social.twitter}
                    onChange={(e) => setProfile({
                      ...profile,
                      social: {...profile.social, twitter: e.target.value}
                    })}
                    className="p-2 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Twitter/X profile URL"
                  />
                ) : (
                  profile.social.twitter ? (
                    <a 
                      href={profile.social.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.social.twitter.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@')}
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                <Linkedin className="h-5 w-5" />
                {isEditing ? (
                  <input
                    type="url"
                    value={profile.social.linkedin}
                    onChange={(e) => setProfile({
                      ...profile,
                      social: {...profile.social, linkedin: e.target.value}
                    })}
                    className="p-2 border rounded focus:border-blue-500 focus:outline-none"
                    placeholder="LinkedIn profile URL"
                  />
                ) : (
                  profile.social.linkedin ? (
                    <a 
                      href={profile.social.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.social.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, '')}
                    </a>
                  ) : (
                    <span className="text-gray-500 italic">Not provided</span>
                  )
                )}
              </div>
            </div>

            
            {/* About Section (keeping this for context) */}
            <div className="mb-8 mt-10">
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">About</h3>
              {isEditing ? (
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile({...profile, about: e.target.value})}
                  className="w-full h-32 p-2 border rounded-md focus:border-blue-500 focus:outline-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                profile.about ? (
                  <p className="text-gray-700">{profile.about}</p>
                ) : (
                  <p className="text-gray-500 italic">Tell us about yourself!</p>
                )
              )}
            </div>

            

          {/* Community Profile Section */}
          {!isEditing && (
            <>
            <div className="flex justify-between items-center mb-3 mt-10 border-b pb-2">
              <h3 className="text-lg font-semibold">Community Involvement</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-md font-medium mb-3">Activity Stats</h4>
                <div className="flex items-center justify-between mb-2 p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <MessageCircle className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Contributions</span>
                  </div>
                    <span className="font-semibold">{profile.contributions}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <LayersIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <span>Projects</span>
                  </div>
                    <span className="font-semibold">{profile.projectsCount}</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-3">Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.length === 0 ? (
                      <p className="text-gray-500 italic">No badges earned yet.</p>
                    ) : (
                      profile.badges.map((badge, index) => (
                        <div key={index} className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1">
                          <Award className="h-3 w-3 mr-1" />
                          <span className="text-sm">{badge}</span>
                        </div>
                      ))
                    )}
                  </div>
              </div>
            </div>
            </>
          )}

          {/* Experience Section */}
          <div className="mb-8 mt-10">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold">Experience</h3>
              {isEditing && (
                <button 
                  className="text-blue-600 text-sm hover:text-blue-800"
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
              <p className="text-gray-500 italic">No experience added yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.experience.map((exp, index) => (
                  <div key={exp.id || index} className="border-b pb-4 last:border-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const updatedExperience = [...profile.experience];
                              updatedExperience[index].title = e.target.value;
                              setProfile({...profile, experience: updatedExperience});
                            }}
                            className="font-medium block border-b p-1 border-white focus:border-blue-500 focus:outline-none"
                            placeholder="Position Title"
                          />
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                experience: profile.experience.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updatedExperience = [...profile.experience];
                            updatedExperience[index].company = e.target.value;
                            setProfile({...profile, experience: updatedExperience});
                          }}
                          className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                          placeholder="Company Name"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-sm text-gray-500">Start Date</label>
                            <input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) => {
                                const updatedExperience = [...profile.experience];
                                updatedExperience[index].startDate = e.target.value;
                                setProfile({...profile, experience: updatedExperience});
                              }}
                              className="block w-full p-2 border rounded p-1 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">End Date</label>
                            <input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) => {
                                const updatedExperience = [...profile.experience];
                                updatedExperience[index].endDate = e.target.value;
                                setProfile({...profile, experience: updatedExperience});
                              }}
                              className="block w-full p-2 border rounded p-1 focus:border-blue-500 focus:outline-none"
                            />
                          </div>
                        </div>
                        <textarea
                          value={exp.description}
                          onChange={(e) => {
                            const updatedExperience = [...profile.experience];
                            updatedExperience[index].description = e.target.value;
                            setProfile({...profile, experience: updatedExperience});
                          }}
                          className="w-full h-24 p-2 border rounded-md focus:border-blue-500 focus:outline-none"
                          placeholder="Description"
                        />
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium">{exp.title}</h4>
                        <p className="text-gray-700">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate}</p>
                        <p className="mt-2 text-gray-600">{exp.description}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="mb-8 mt-10">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold">Education</h3>
              {isEditing && (
                <button 
                  className="text-blue-600 text-sm hover:text-blue-800"
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
              <p className="text-gray-500 italic">No education added yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.education.map((edu, index) => (
                  <div key={edu.id || index} className="border-b pb-4 last:border-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => {
                              const updatedEducation = [...profile.education];
                              updatedEducation[index].school = e.target.value;
                              setProfile({...profile, education: updatedEducation});
                            }}
                            className="font-medium block border-b p-1 border-white focus:border-blue-500 focus:outline-none"
                            placeholder="School/University Name"
                          />
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                education: profile.education.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].degree = e.target.value;
                            setProfile({...profile, education: updatedEducation});
                          }}
                          className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                          placeholder="Degree"
                        />
                        <input
                          type="text"
                          value={edu.field}
                          onChange={(e) => {
                            const updatedEducation = [...profile.education];
                            updatedEducation[index].field = e.target.value;
                            setProfile({...profile, education: updatedEducation});
                          }}
                          className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                          placeholder="Field of Study"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={edu.startYear}
                            onChange={(e) => {
                              const updatedEducation = [...profile.education];
                              updatedEducation[index].startYear = e.target.value;
                              setProfile({...profile, education: updatedEducation});
                            }}
                            className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                            placeholder="Start Year"
                          />
                          <input
                            type="text"
                            value={edu.endYear}
                            onChange={(e) => {
                              const updatedEducation = [...profile.education];
                              updatedEducation[index].endYear = e.target.value;
                              setProfile({...profile, education: updatedEducation});
                            }}
                            className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                            placeholder="End Year"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium">{edu.school}</h4>
                        <p className="text-gray-700">{edu.degree}, {edu.field}</p>
                        <p className="text-sm text-gray-500">{edu.startYear} - {edu.endYear}</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills Section */}
          <div className="mb-8 mt-10">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold">Skills</h3>
            </div>
            
            {isEditing ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 p-2 border rounded-md focus-within:border-blue-500">
                  {profile.skills.map((skill, index) => (
                    <div key={index} className="flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                      <span className="text-sm">{skill}</span>
                      <button
                        onClick={() => {
                          const newSkills = profile.skills.filter((_, i) => i !== index);
                          setProfile({ ...profile, skills: newSkills });
                        }}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    className="flex-1 min-w-[150px] outline-none text-sm"
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
                <p className="text-sm text-gray-500">Press Enter to add a new skill</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.skills.length === 0 ? (
                  <p className="text-gray-500 italic">No skills added yet.</p>
                ) : (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Projects Section */}
          <div className="mb-8 mt-10">
            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-semibold">Projects</h3>
              {isEditing && (
                <button 
                  className="text-blue-600 text-sm hover:text-blue-800"
                  onClick={() => setProfile({
                    ...profile,
                    projects: [...profile.projects, { 
                      id: Date.now(), 
                      name: '', 
                      description: '',
                      link: 'https://',
                      year: ''
                    }]
                  })}
                >
                  + Add Project
                </button>
              )}
            </div>
            
            {profile.projects.length === 0 ? (
              <p className="text-gray-500 italic">No projects added yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.projects.map((project, index) => (
                  <div key={project.id || index} className="border-b pb-4 last:border-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <input
                            type="text"
                            value={project.name}
                            onChange={(e) => {
                              const updatedProjects = [...profile.projects];
                              updatedProjects[index].name = e.target.value;
                              setProfile({...profile, projects: updatedProjects});
                            }}
                            className="font-medium block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                            placeholder="Project Name"
                          />
                          <button 
                            onClick={() => {
                              setProfile({
                                ...profile,
                                projects: profile.projects.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          value={project.description}
                          onChange={(e) => {
                            const updatedProjects = [...profile.projects];
                            updatedProjects[index].description = e.target.value;
                            setProfile({...profile, projects: updatedProjects});
                          }}
                          className="w-full h-24 p-2 border rounded-md focus:border-blue-500 focus:outline-none"
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={project.link}
                            onChange={(e) => {
                              const updatedProjects = [...profile.projects];
                              updatedProjects[index].link = e.target.value;
                              setProfile({...profile, projects: updatedProjects});
                            }}
                            className="block border-b border-whiten p-1 focus:border-blue-500 focus:outline-none"
                            placeholder="Project URL"
                          />
                          <input
                            type="text"
                            value={project.year}
                            onChange={(e) => {
                              const updatedProjects = [...profile.projects];
                              updatedProjects[index].year = e.target.value;
                              setProfile({...profile, projects: updatedProjects});
                            }}
                            className="block border-b border-white p-1 focus:border-blue-500 focus:outline-none"
                            placeholder="Year"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.year}</p>
                        <p className="mt-2 text-gray-600">{project.description}</p>
                        {project.link && (
                          <a 
                            href={project.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm mt-1 inline-block"
                          >
                            View Project →
                          </a>
                        )}
                      </>
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