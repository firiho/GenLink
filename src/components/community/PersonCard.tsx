import { MapPin, Award, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PersonCardProps {
  id: string;
  name: string;
  title?: string;
  photo?: string;
  location?: string;
  badges?: string[];
  contributions?: number;
  skills?: string[];
  social?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
  onClick?: () => void;
  index?: number;
}

export const PersonCard = ({ 
  name, 
  title, 
  photo, 
  location, 
  badges = [], 
  contributions = 0,
  skills = [],
  social,
  onClick,
  index = 0
}: PersonCardProps) => {
  return (
    <div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="h-full rounded-xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        {/* Header */}
        <div className="h-24 bg-gradient-to-br from-accent/10 via-primary/5 to-accent/15 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        </div>
        
        {/* Content */}
        <div className="p-5 -mt-12 relative">
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-background shadow-lg mb-3 ring-2 ring-accent/20">
              {photo ? (
                <img 
                  src={photo} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <span className="text-white text-xl font-bold">
                    {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
            </div>
            
            {/* Name and Title */}
            <h3 className="text-lg font-bold mb-1 group-hover:text-accent transition-colors line-clamp-1">
              {name}
            </h3>
            {title && (
              <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{title}</p>
            )}
            
            {/* Location */}
            {location && (
              <div className="flex items-center text-muted-foreground text-xs mb-3">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{location}</span>
              </div>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center text-accent">
                <Award className="w-4 h-4 mr-1" />
                <span className="text-sm font-semibold">{contributions}</span>
              </div>
              <span className="text-xs text-muted-foreground">contributions</span>
            </div>
            
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3 justify-center">
                {skills.slice(0, 3).map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                    {skill}
                  </Badge>
                ))}
                {skills.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    +{skills.length - 3}
                  </Badge>
                )}
              </div>
            )}
            
            {/* Badges */}
            {badges && badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3 justify-center">
                {badges.slice(0, 2).map((badge, idx) => (
                  <span key={idx} className="px-2 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                    {badge}
                  </span>
                ))}
              </div>
            )}
            
            {/* Social Links */}
            {social && Object.values(social).some(url => url) && (
              <div className="flex items-center justify-center space-x-2 pt-2 border-t border-border/50 w-full">
                {social.github && (
                  <a
                    href={social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

