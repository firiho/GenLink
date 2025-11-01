import { MapPin, Award, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PersonListItemProps {
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

export const PersonListItem = ({ 
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
}: PersonListItemProps) => {
  return (
    <div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group"
    >
      <div 
        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-border ring-2 ring-accent/10">
            {photo ? (
              <img 
                src={photo} 
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold group-hover:text-accent transition-colors truncate">
                {name}
              </h3>
              {title && (
                <p className="text-sm text-muted-foreground truncate">{title}</p>
              )}
            </div>
            
            {/* Contributions Badge */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-accent/10 text-accent flex-shrink-0">
              <Award className="w-3 h-3" />
              <span className="text-xs font-semibold">{contributions}</span>
            </div>
          </div>
          
          {/* Location */}
          {location && (
            <div className="flex items-center text-muted-foreground text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          
          {/* Skills */}
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {skills.slice(0, 4).map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
                  {skill}
                </Badge>
              ))}
              {skills.length > 4 && (
                <Badge variant="outline" className="text-xs px-2 py-0">
                  +{skills.length - 4}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Social Links */}
        {social && Object.values(social).some(url => url) && (
          <div className="flex items-center gap-1 flex-shrink-0">
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-md hover:bg-accent/10 border border-transparent hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
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
                className="w-8 h-8 rounded-md hover:bg-accent/10 border border-transparent hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
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
                className="w-8 h-8 rounded-md hover:bg-accent/10 border border-transparent hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

