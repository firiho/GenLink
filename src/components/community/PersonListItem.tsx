import { MapPin } from 'lucide-react';

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
  location, 
  onClick,
  index = 0
}: PersonListItemProps) => {
  return (
    <div className="group">
      <div 
        className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 cursor-pointer"
        onClick={onClick}
      >
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold group-hover:text-accent transition-colors truncate mb-1">
            {name}
          </h3>
          {title && (
            <p className="text-sm text-muted-foreground truncate mb-1">{title}</p>
          )}
          {location && (
            <div className="flex items-center text-muted-foreground text-xs">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

