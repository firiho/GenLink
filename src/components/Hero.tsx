import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronDown, Trophy, Target, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';

export const Hero = () => {
  const stats = [
    { 
      icon: Trophy,
      label: 'Innovation Challenges',
      value: '50+',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10'
    },
    { 
      icon: Target,
      label: 'Prize Pool',
      value: '$500K+',
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    { 
      icon: Users,
      label: 'Active Innovators',
      value: '2.5K+',
      color: 'text-green-500',
      bg: 'bg-green-500/10'
    }
  ];

  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-48">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute w-full h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.2, 1],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.1, 1],
              y: [0, 20, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
            className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"
          />
        </div>

        {/* Enhanced Grid Pattern */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Additional Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      </div>
      
      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center pt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Badge 
                  variant="secondary" 
                  className="bg-white/10 text-white border-white/20 mb-8 backdrop-blur-sm px-4 py-2"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Rwanda's Premier Innovation Platform
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
              >
                Transform Ideas into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/90 to-blue-500">
                  Innovation
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-300 max-w-3xl mx-auto"
              >
                Join East Africa's leading innovation challenges platform. 
                Collaborate with top organizations and bring your ideas to life.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mt-8 items-center">
                  <Link to="/signup">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        className="text-lg px-8 h-14 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 transition-all duration-300 group relative overflow-hidden shadow-xl shadow-primary/25"
                      >
                        <span className="relative z-10 flex items-center">
                          Get Started Now
                          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/challenges">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        className="text-lg px-8 h-14 text-white border-white/20 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                      >
                        Explore Challenges
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};