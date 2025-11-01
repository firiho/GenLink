import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface EventCardProps {
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

export const EventCard = ({ 
  title, 
  description, 
  date, 
  time, 
  location, 
  type, 
  attendees,
  maxAttendees,
  category,
  imageUrl,
  onClick,
  index = 0
}: EventCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="h-full rounded-xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md">
        {/* Event Image/Header */}
        <div className="h-40 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 relative overflow-hidden">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3">
            <Badge 
              className={`${
                type === 'In-Person' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800'
                  : type === 'Online'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 border-purple-200 dark:border-purple-800'
              }`}
            >
              {type}
            </Badge>
          </div>
          
          {/* Category Badge */}
          {category && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                {category}
              </Badge>
            </div>
          )}
          
          {/* Calendar Icon */}
          <div className="absolute bottom-3 right-3">
            <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors line-clamp-1">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {description}
          </p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-3 text-accent flex-shrink-0" />
              <span className="text-sm font-medium">{date}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-3 text-accent flex-shrink-0" />
              <span className="text-sm">{time}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-3 text-accent flex-shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Users className="w-4 h-4 mr-3 text-accent flex-shrink-0" />
              <span className="text-sm">
                {attendees} {maxAttendees && `/ ${maxAttendees}`} Attendees
              </span>
            </div>
          </div>
          
          <Button 
            className="w-full group/btn bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            Register Now
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

