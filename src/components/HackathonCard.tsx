import { Badge } from './ui/badge';
import { Calendar, Users, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  const handleViewChallenge = () => {
    console.log(`Navigating to challenge with ID: ${challengeId}`);
    navigate(`/challenge/${challengeId}`);
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group h-full"
    >
      <div className="h-full rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 overflow-hidden">
        {/* Clean Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Time Badge */}
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-medium">
              <Calendar className="h-3 w-3 mr-1 inline" />
              {daysLeft} days left
            </span>
          </div>

          {/* Organizer Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="px-2 py-1 rounded-md bg-background/80 text-foreground text-xs font-medium">
              {organizer}
            </span>
          </div>
        </div>

        {/* Clean Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-accent transition-colors duration-200 line-clamp-2">
            {title}
          </h3>
          
          {/* Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{participants.toLocaleString()} participants</span>
            </div>
            <div className="flex items-center text-accent font-semibold">
              <Award className="h-4 w-4 mr-1" />
              <span className="text-sm">{prize}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            variant="outline" 
            className="w-full border-border hover:bg-accent/5 text-foreground hover:text-accent transition-all duration-200"
            onClick={handleViewChallenge}
          >
            View Challenge
            <ArrowUpRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};