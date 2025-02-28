import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, Users, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface HackathonCardProps {
  title: string;
  organizer: string;
  prize: string;
  participants: number;
  daysLeft: number;
  image: string;
}

export const HackathonCard = ({
  title,
  organizer,
  prize,
  participants,
  daysLeft,
  image
}: HackathonCardProps) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl overflow-hidden"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute top-4 right-4">
          <Badge className="bg-white/90 text-primary shadow-lg backdrop-blur-sm">
            {daysLeft} days left
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-gray-600">{organizer}</p>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              <span className="text-sm">{participants}</span>
            </div>
            <div className="flex items-center text-primary font-medium">
              <Award className="h-4 w-4 mr-1" />
              <span>{prize}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-primary/5 group/btn"
          >
            <span className="mr-2">View Challenge</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Button>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            <Calendar className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};