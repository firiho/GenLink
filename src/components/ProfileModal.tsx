import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
  } from '@/components/ui/dialog';
import {
    Award, Github, Twitter, Linkedin,
    Mail, Globe, MapPinIcon, Phone, X
  } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        <DialogContent className="w-[95%] max-w-4xl max-h-[85vh] p-0 overflow-hidden sm:max-w-5xl sm:max-h-[80vh] mt-16 sm:mt-20 !translate-y-0 !top-16 sm:!top-20">
          {selectedMember && (
            <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh] relative">
              {/* Custom Close Button */}
              <button
                onClick={() => setIsProfileOpen(false)}
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-background/90 backdrop-blur-sm border border-border/50 flex items-center justify-center text-foreground hover:bg-accent/10 hover:border-accent/30 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
              
              {/* Cover Photo */}
              <div className="relative h-40 sm:h-56 flex-shrink-0">
                {selectedMember.coverPhoto ? (
                  <img 
                    src={selectedMember.coverPhoto} 
                    alt="Cover" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30"></div>
                )}
                
                {/* Profile Photo */}
                <div className="absolute -bottom-10 left-4 sm:-bottom-12 sm:left-8">
                  <div className="rounded-full h-24 w-24 sm:h-28 sm:w-28 bg-background p-1 shadow-lg ring-4 ring-background">
                    <div className="rounded-full h-full w-full bg-muted flex items-center justify-center relative overflow-hidden">
                      {selectedMember.image ? (
                        <img 
                          src={selectedMember.image} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                          <span className="text-white text-xl sm:text-2xl font-bold">
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
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 min-h-0">
                {/* Basic Details */}
                <div className="pt-14 sm:pt-16 mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">{selectedMember.name}</h2>
                      <p className="text-lg text-muted-foreground mb-3">{selectedMember.role}</p>
                      {selectedMember.location && (
                        <p className="text-sm text-muted-foreground flex items-center mb-4">
                          <MapPinIcon className="h-4 w-4 mr-2 text-accent" />
                          {selectedMember.location}
                        </p>
                      )}
                    </div>
                    
                    {/* Contact Info */}
                    {(selectedMember.email || selectedMember.phone || selectedMember.website) && (
                      <div className="flex flex-col sm:items-end space-y-2">
                        {selectedMember.email && (
                          <a 
                            href={`mailto:${selectedMember.email}`}
                            className="flex items-center text-muted-foreground hover:text-accent transition-colors text-sm"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {selectedMember.email}
                          </a>
                        )}
                        
                        {selectedMember.phone && (
                          <a 
                            href={`tel:${selectedMember.phone}`}
                            className="flex items-center text-muted-foreground hover:text-accent transition-colors text-sm"
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
                            className="flex items-center text-muted-foreground hover:text-accent transition-colors text-sm"
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
                    <h4 className="text-lg font-semibold mb-4 text-foreground">Social Media</h4>
                    <div className="flex items-center space-x-4">
                      {selectedMember.social.github && (
                        <a 
                          href={selectedMember.social.github} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200 group"
                        >
                          <Github className="h-5 w-5 group-hover:text-accent" />
                        </a>
                      )}
                      
                      {selectedMember.social.twitter && (
                        <a 
                          href={selectedMember.social.twitter} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200 group"
                        >
                          <Twitter className="h-5 w-5 group-hover:text-accent" />
                        </a>
                      )}
                      
                      {selectedMember.social.linkedin && (
                        <a 
                          href={selectedMember.social.linkedin} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200 group"
                        >
                          <Linkedin className="h-5 w-5 group-hover:text-accent" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
                
                {/* About Section */}
                {selectedMember.about && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">About</h3>
                    <p className="text-muted-foreground leading-relaxed">{selectedMember.about}</p>
                  </div>
                )}
                
                {/* Community Stats */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Community Stats</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                      <p className="text-muted-foreground text-sm">Contributions</p>
                      <p className="text-2xl font-bold text-accent">{selectedMember.contributions}</p>
                    </div>
                    <div className="bg-card/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
                      <p className="text-muted-foreground text-sm">Genlink Projects</p>
                      <p className="text-2xl font-bold text-accent">{selectedMember.projects_count}</p>
                    </div>
                  </div>
                </div>
                
                {/* Badges */}
                {selectedMember.badges && selectedMember.badges.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.badges.map(badge => (
                        <Badge key={badge} className="bg-accent/10 text-accent px-3 py-1 border border-accent/20">
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
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-card/50 text-foreground border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-colors">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Experience */}
                {selectedMember.experience && selectedMember.experience.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Experience</h3>
                    <div className="space-y-4">
                      {selectedMember.experience.map((exp, index) => (
                        <div key={index} className="border-l-2 border-accent/30 pl-4">
                          <h4 className="font-medium text-foreground">{exp.role}</h4>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                          {exp.description && (
                            <p className="text-sm text-muted-foreground mt-2">{exp.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Education */}
                {selectedMember.education && selectedMember.education.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Education</h3>
                    <div className="space-y-4">
                      {selectedMember.education.map((edu, index) => (
                        <div key={index} className="border-l-2 border-accent/30 pl-4">
                          <h4 className="font-medium text-foreground">{edu.degree}</h4>
                          <p className="text-sm text-muted-foreground">{edu.institution}</p>
                          <p className="text-sm text-muted-foreground">
                            {edu.startDate} - {edu.endDate || 'Present'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Projects */}
                {projects && projects.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 text-foreground border-b border-border pb-2">Projects</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projects.map((project) => (
                        <div key={project.id} className="bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-foreground">{project.name}</h4>
                            <span className="text-xs bg-card/80 text-foreground border border-border/50 rounded px-2 py-1">{project.year}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{project.description}</p>
                          {project.link && (
                            <a 
                              href={project.link}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="inline-block text-sm text-accent hover:text-accent/80 transition-colors"
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
            </div>
          )}
        </DialogContent>
      </Dialog>
  )
}
