import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
  } from '@/components/ui/dialog';
import {
    Award, Github, Twitter, Linkedin,
    Mail, Globe, MapPinIcon, Phone
  } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { set } from 'date-fns';

export default function ProfileModal({ isProfileOpen, setIsProfileOpen, selectedMember }) {

  const [projects, setProjects] = useState([]);
  useEffect(() => {
    if (selectedMember?.projects) {
      const publicProjects = selectedMember.projects.filter(project => project.public === true);
      setProjects(publicProjects);
    }
  }, [selectedMember]);

  return (
    <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="w-[95%] max-w-4xl max-h-[90vh] mt-10 overflow-y-auto scrollbar-hide fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          {selectedMember && (
            <div className="mt-4 overflow-y-auto max-h-[80vh]">
              {/* Cover Photo */}
              <div className="relative">
                <div className="h-40 relative">
                  {selectedMember.coverPhoto ? (
                    <img 
                      src={selectedMember.coverPhoto} 
                      alt="Cover" 
                      className="h-full w-full object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 w-full rounded-t-lg"></div>
                  )}
                </div>
                
                {/* Profile Photo */}
                <div className="absolute bottom-0 left-8 transform translate-y-1/2">
                  <div className="rounded-full h-24 w-24 bg-white p-1 shadow">
                    <div className="rounded-full h-full w-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                      {selectedMember.image ? (
                        <img 
                          src={selectedMember.image} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xl font-semibold">
                            {selectedMember.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="pt-16 px-6 pb-6">
                {/* Basic Details */}
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:justify-between">
                    <div className="md:w-2/3">
                      <h2 className="text-2xl font-bold mb-1">{selectedMember.name}</h2>
                      <p className="text-lg text-gray-600 mb-2">{selectedMember.role}</p>
                      {selectedMember.location && (
                        <p className="text-sm text-gray-500 flex items-center mb-2">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {selectedMember.location}
                        </p>
                      )}
                    </div>
                    
                    {(selectedMember.email || selectedMember.phone || selectedMember.website) && (
                      <div className="md:w-1/3 mt-4 md:mt-0 space-y-2">
                        {selectedMember.email && (
                          <a 
                            href={`mailto:${selectedMember.email}`}
                            className="flex items-center text-gray-600 hover:text-primary transition-colors"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {selectedMember.email}
                          </a>
                        )}
                        
                        {selectedMember.phone && (
                          <a 
                            href={`tel:${selectedMember.phone}`}
                            className="flex items-center text-gray-600 hover:text-primary transition-colors"
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            {selectedMember.phone}
                          </a>
                        )}
                        
                        {selectedMember.website && (
                          <a 
                            href={selectedMember.website}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="flex items-center text-gray-600 hover:text-primary transition-colors"
                          >
                            <Globe className="h-4 w-4 mr-2" />
                            Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Social Links */}
                {selectedMember.social && Object.values(selectedMember.social).some(v => v) && (
                  <div className="mb-8">
                    <h4 className="text-md font-medium mb-3">Social Media</h4>
                    <div className="flex items-center space-x-4">
                      {selectedMember.social.github && (
                        <a 
                          href={selectedMember.social.github} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary transition-colors"
                        >
                          <Github className="h-5 w-5" />
                        </a>
                      )}
                      
                      {selectedMember.social.twitter && (
                        <a 
                          href={selectedMember.social.twitter} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary transition-colors"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      
                      {selectedMember.social.linkedin && (
                        <a 
                          href={selectedMember.social.linkedin} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-primary transition-colors"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* About Section */}
                {selectedMember.about && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">About</h3>
                    <p className="text-gray-700">{selectedMember.about}</p>
                  </div>
                )}
                
                {/* Community Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Community Stats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-500">Contributions</p>
                      <p className="text-2xl font-bold text-primary">{selectedMember.contributions}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-500">Genlink Projects</p>
                      <p className="text-2xl font-bold text-primary">{selectedMember.projects_count}</p>
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                {selectedMember.badges && selectedMember.badges.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.badges.map(badge => (
                        <Badge key={badge} className="bg-primary/10 text-primary px-3 py-1">
                          <Award className="w-4 h-4 mr-2" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Skills */}
                {selectedMember.skills && selectedMember.skills.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Experience */}
                {selectedMember.experience && selectedMember.experience.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">Experience</h3>
                    <div className="space-y-4">
                      {selectedMember.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-4">
                          <h4 className="font-medium">{exp.role}</h4>
                          <p className="text-sm text-gray-600">{exp.company}</p>
                          <p className="text-sm text-gray-500">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {selectedMember.education && selectedMember.education.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-3 border-b pb-2">Education</h3>
                    <div className="space-y-4">
                      {selectedMember.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-primary/30 pl-4">
                          <h4 className="font-medium">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Projects */}
              {projects && projects.length > 0 && (
                <div className="mb-8 px-6">
                  <h3 className="text-lg font-semibold mb-3 border-b pb-2">Projects</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((project) => (
                      <div key={project.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-primary">{project.name}</h4>
                          <span className="text-xs bg-gray-200 rounded px-2 py-1">{project.year}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                        {project.link && (
                          <a 
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="mt-3 inline-block text-sm text-primary hover:underline"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          )}
        </DialogContent>
      </Dialog>
  )
}
