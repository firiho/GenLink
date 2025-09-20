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
      whileHover={{ y: -8 }}
      className="group relative overflow-hidden h-full"
    >
      {/* Modern Dark Card Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500" />
      
      <div className="relative h-full rounded-2xl overflow-hidden">
        {/* Enhanced Image Container */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Floating Time Badge */}
          <motion.div 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-4 right-4"
          >
            <Badge className="bg-primary/90 text-white shadow-lg backdrop-blur-sm border-0 px-3 py-1 font-medium">
              <Calendar className="h-3 w-3 mr-1" />
              {daysLeft} days left
            </Badge>
          </motion.div>

          {/* Organizer Badge */}
          <div className="absolute bottom-4 left-4">
            <Badge variant="outline" className="bg-black/50 text-white border-white/20 backdrop-blur-sm">
              {organizer}
            </Badge>
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="p-6 relative">
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary transition-colors duration-300 line-clamp-2">
              {title}
            </h3>
          </div>
          
          {/* Stats Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-400 group-hover:text-gray-300 transition-colors">
                <Users className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{participants.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-primary font-semibold">
                <Award className="h-4 w-4 mr-1" />
                <span className="text-sm">{prize}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                className="text-primary hover:text-white hover:bg-primary/20 group/btn p-0 h-auto font-medium"
                onClick={handleViewChallenge}
              >
                <span className="mr-2">View Challenge</span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
              </Button>
            </motion.div>
            
            <Badge 
              variant="outline" 
              className="bg-green-500/10 text-green-400 border-green-500/30 backdrop-blur-sm px-3 py-1"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
              Active
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};