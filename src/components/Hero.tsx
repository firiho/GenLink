import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';

const CountUpAnimation = ({ end, duration = 2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count}{suffix}</span>;
};

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
          <div
            className="absolute top-1/3 left-1/5 w-80 h-80 bg-gradient-to-br from-accent/12 to-accent/6 rounded-full blur-3xl animate-pulse"
          />
          <div
            className="absolute bottom-1/3 right-1/5 w-96 h-96 bg-gradient-to-br from-primary/10 to-primary/6 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-accent/8 to-primary/8 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '4s' }}
          />
        </div>
        
        {/* Subtle overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/8 to-background/15" />
      </div>
      
      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center pt-32 md:pt-40">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div
              className="space-y-12"
            >
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium"
              >
                <Zap className="w-4 h-4" />
                East Africa's Leading Innovation Platform
              </div>

              {/* Main Heading */}
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-balance leading-[0.9] tracking-tight"
              >
                <span className="gradient-text">Build the</span>
                <br />
                <span className="gradient-text-primary">future</span>
                <br />
                <span className="gradient-text">of tech</span>
              </h1>

              {/* Subtitle */}
              <p
                className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty"
              >
                Connect with Africa's most innovative minds. Tackle real-world challenges, 
                build cutting-edge solutions, and shape the future of technology.
              </p>

              {/* CTA Buttons */}
              <div
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
              </div>

              {/* Stats */}
              <div
                className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-12"
              >
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Terminal className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">
                      <CountUpAnimation end={50} duration={2} suffix="+" />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Challenges</div>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Code className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">
                      <CountUpAnimation end={10} duration={2} suffix="K+" />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Developers</div>
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 px-6 py-3 rounded-lg bg-card/50 border border-border/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-200"
                >
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-foreground">
                      $<CountUpAnimation end={2} duration={2} suffix="M+" />
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">Prizes</div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};