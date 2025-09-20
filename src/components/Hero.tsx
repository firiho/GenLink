import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, ChevronDown, Trophy, Target, Users, Rocket, Code, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from './ui/badge';
import { useInView } from 'react-intersection-observer';

export const Hero = () => {
  const stats = [
    { 
      icon: Trophy,
      label: 'Innovation Challenges',
      value: '50+',
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20'
    },
    { 
      icon: Target,
      label: 'Total Prize Pool',
      value: '$2M+',
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20'
    },
    { 
      icon: Users,
      label: 'Tech Innovators',
      value: '10K+',
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20'
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 pb-48">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Tech Grid Pattern */}
        <div className="absolute inset-0 bg-tech-grid opacity-[0.02]" />
        
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
            className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/20 rounded-full blur-3xl"
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
                        className="absolute -right-1/4 -bottom-1/4 w-1/3 h-1/3 bg-accent/20 rounded-full blur-3xl"
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
      <div className="relative z-20 h-full flex items-center justify-center pt-40 md:pt-48">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight"
              >
                Build The
                <br />
                <span className="bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent">
                  Future
                </span>
                <br />
                Today
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4"
              >
                Join Africa's most innovative ecosystem. Connect with visionary minds, 
                tackle real-world challenges, and build solutions that matter.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center px-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mt-8 items-center">
                  <Link to="/signup">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300 w-full sm:w-auto"
                      >
                        Start Innovating
                        <Rocket className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/challenges">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="bg-transparent border-gray-600 hover:bg-white/5 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-xl backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
                      >
                        Explore Challenges
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      
      
      {/* Decorative floating elements - hidden on mobile */}
      <div className="absolute top-20 left-8 opacity-20 hidden md:block">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Code className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
      <div className="absolute top-40 right-12 opacity-20 hidden md:block">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Brain className="w-8 h-8 text-accent" />
        </motion.div>
      </div>
      
      {/* Additional Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={`accent-${i}`}
            className="absolute w-0.5 h-0.5 bg-accent/60 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.9, 0.3],
            }}
            transition={{
              duration: 6 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Tech Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="tech-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M0 100 L100 0 L200 100 L100 200 Z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <circle cx="100" cy="100" r="3" fill="currentColor" opacity="0.5"/>
              <path d="M50 50 L150 50 M50 150 L150 150" stroke="currentColor" strokeWidth="0.3" opacity="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tech-pattern)" className="text-white"/>
        </svg>
      </div>
    </div>
  );
};