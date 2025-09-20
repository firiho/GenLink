import React from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const Hero = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      {/* Enhanced Subtle Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Enhanced Grid Pattern */}
        <div className="absolute inset-0 bg-tech-grid opacity-[0.03]" />
        
        {/* Multi-layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/6 via-transparent to-primary/6" />
        <div className="absolute inset-0 bg-gradient-to-tl from-transparent via-accent/4 to-transparent" />
        
        {/* Floating gradient orbs with subtle animation */}
        <div className="absolute w-full h-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.12, 0.25, 0.12],
              scale: [1, 1.1, 1],
              x: [0, 30, 0],
              y: [0, -20, 0]
            }}
            transition={{ 
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-accent/12 to-accent/6 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.08, 1],
              x: [0, -35, 0],
              y: [0, 25, 0]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/6 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0.08, 0.15, 0.08],
              scale: [1, 1.05, 1],
              x: [0, 20, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-accent/8 to-primary/8 rounded-full blur-3xl"
          />
        </div>
        
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/8 to-background/15" />
      </div>
      
      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center pt-32 md:pt-40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium"
              >
                <Zap className="w-4 h-4" />
                East Africa's Leading Innovation Platform
              </motion.div>

              {/* Main Heading */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-balance leading-[0.9] tracking-tight"
              >
                <span className="gradient-text">Build the</span>
                <br />
                <span className="gradient-text-primary">future</span>
                <br />
                <span className="gradient-text">of tech</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty"
              >
                Connect with Africa's most innovative minds. Tackle real-world challenges, 
                build cutting-edge solutions, and shape the future of technology.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/challenges">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-border hover:bg-accent/5 text-foreground font-medium px-8 py-4 text-lg rounded-lg transition-all duration-200"
                  >
                    <Code className="mr-2 h-5 w-5" />
                    View Challenges
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-12"
              >
                <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Terminal className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">50+</div>
                    <div className="text-sm text-muted-foreground font-medium">Challenges</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Code className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">10K+</div>
                    <div className="text-sm text-muted-foreground font-medium">Developers</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">$2M+</div>
                    <div className="text-sm text-muted-foreground font-medium">Prizes</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};