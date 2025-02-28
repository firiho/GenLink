import { useState } from 'react';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { PencilIcon, CheckIcon, X } from 'lucide-react';

export default function ProfileTab({ user }) {
  const [isEditing, setIsEditing] = useState(false);
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
    certifications: user?.certifications || []
  });

  const handleSave = () => {
    // Here you would typically call an API to save the profile
    console.log('Saving profile:', profile);
    // Then exit edit mode
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Revert changes (would need to store original state)
    setIsEditing(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 mt-5">
    <div className="grid grid-rows-1 gap-1">
      <WelcomeSection title="Profile" subtitle="Your Public Profile" />
        <div>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PencilIcon className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button 
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <CheckIcon className="h-4 w-4 mr-2" /> Save
              </button>
              <button 
                onClick={handleCancel}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
                  // For demo purposes - would typically upload to server
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      setProfile({
                        ...profile, 
                        coverPhoto: event.target.result as string
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
                            href={profile.website} 
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
            
            {/* About Section (keeping this for context) */}
            <div className="mb-8">
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

          {/* Experience Section */}
          <div className="mb-8">
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
          <div className="mb-8">
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
          <div className="mb-8">
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
          <div className="mb-8">
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