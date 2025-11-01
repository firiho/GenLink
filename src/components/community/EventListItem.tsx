import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  imageUrl?: string;
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
  onClick,
  index = 0
}: EventListItemProps) => {
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
        {/* Event Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 flex items-center justify-center shadow-sm">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-base font-semibold group-hover:text-accent transition-colors line-clamp-1">
                  {title}
                </h3>
                <Badge 
                  className={`text-xs flex-shrink-0 ${
                    type === 'In-Person' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
                      : type === 'Online'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
                  }`}
                >
                  {type}
                </Badge>
                {category && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {category}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {description}
              </p>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-accent flex-shrink-0" />
                  <span>{date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent flex-shrink-0" />
                  <span>{time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-accent flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Attendees and Action */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* Attendees */}
          <div className="text-right">
            <div className="flex items-center gap-1 text-accent">
              <Users className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {attendees}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {maxAttendees ? `/ ${maxAttendees}` : 'attendees'}
            </div>
          </div>
          
          {/* Register Button */}
          <Button 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Register
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

