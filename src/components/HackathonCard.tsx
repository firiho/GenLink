import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ArrowRight, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HackathonCardProps {
  challengeId: string;
  title: string;
  organizer: string;
  prize: string;
  participants: number;
  daysLeft: number;
  image: string;
}

export const HackathonCard = ({
  challengeId,
  title,
  organizer,
  prize,
  participants,
  daysLeft,
  image
}: HackathonCardProps) => {
  return (
    <Link 
      to={`/challenge/${challengeId}`}
      className="group block h-full"
    >
      <div className="h-full rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-1 flex flex-col">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90" />
          
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-md border-white/10 text-xs font-medium shadow-sm">
              <Timer className="w-3 h-3 mr-1" />
              {daysLeft} days left
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow relative">
          {/* Organizer */}
          <div className="mb-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-[10px] font-bold text-accent border border-accent/20">
              {organizer.charAt(0)}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {organizer}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {title}
          </h3>

          <div className="mt-auto pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="w-3 h-3" /> Participants
              </span>
              <span className="font-semibold text-sm">{participants.toLocaleString()}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Prize Pool
              </span>
              <span className="font-semibold text-sm text-accent">{prize}</span>
            </div>
          </div>
          
          {/* Hover Indicator */}
          <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <ArrowRight className="w-5 h-5 text-accent" />
          </div>
        </div>
      </div>
    </Link>
  );
};