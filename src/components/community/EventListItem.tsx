import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EventListItemProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'In-Person' | 'Online' | 'Hybrid';
  attendees: number;
  maxAttendees?: number;
  category?: string;
  thumbnail?: string | null;
  onClick?: () => void;
  index?: number;
}

export const EventListItem = ({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  type, 
  attendees,
  maxAttendees,
  category,
  thumbnail,
  onClick,
  index = 0
}: EventListItemProps) => {
  const eventDate = new Date(date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  const getTypeColor = () => {
    switch (type) {
      case 'In-Person':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Online':
        return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'Hybrid':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      default:
        return '';
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="flex gap-3 py-4 px-2 hover:bg-accent/5 transition-all duration-200 rounded-md">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          {thumbnail && thumbnail.trim() ? (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img 
                src={thumbnail} 
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          ) : (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/10 dark:border-primary/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary/40 dark:text-slate-400" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title and Type */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                {title}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge 
                  className={`text-xs px-1.5 py-0.5 ${getTypeColor()}`}
                >
                  {type}
                </Badge>
                {category && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                    {category}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Key Info - Compact */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-300" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-300" />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-300 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground dark:text-slate-300" />
              <span className="font-medium">
                {attendees}{maxAttendees ? `/${maxAttendees}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
