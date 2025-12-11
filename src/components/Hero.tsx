import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Code, Terminal, Zap } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { HeroBackground } from './ui/hero-background';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PublicStats } from '@/types/stats';

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
  const [publicStats, setPublicStats] = useState<PublicStats>({});
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const statsDocRef = doc(db, 'stats', 'public');
        const statsSnapshot = await getDoc(statsDocRef);
        
        if (statsSnapshot.exists()) {
          setPublicStats(statsSnapshot.data() as PublicStats);
        }
      } catch (err) {
        console.error('Error fetching public stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchPublicStats();
  }, []);

  // Get stat values with fallbacks
  const challengesCount = publicStats.challenges?.value ?? 0;
  const developersCount = publicStats.developers?.value ?? 0;
  const prizesCount = publicStats.prizes?.value ?? 0;

  // Format large numbers for display
  const formatDevelopers = (num: number) => {
    if (num >= 1000) return { value: Math.floor(num / 1000), suffix: 'K+' };
    return { value: num, suffix: '+' };
  };

  const formatPrizes = (num: number) => {
    if (num >= 1000000) return { value: Math.floor(num / 1000000), suffix: 'M+' };
    if (num >= 1000) return { value: Math.floor(num / 1000), suffix: 'K+' };
    return { value: num, suffix: '+' };
  };

  const devStats = formatDevelopers(developersCount);
  const prizeStats = formatPrizes(prizesCount);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <HeroBackground />
      
      {/* Content */}
      <div className="relative z-20 h-full flex items-center justify-center pt-32 md:pt-40 pointer-events-none">
        <div className="container mx-auto px-4 pointer-events-auto">
          <div className="max-w-5xl mx-auto text-center relative">
            {/* Text Backdrop for better readability against 3D background */}
            <div className="absolute inset-0 -m-20 bg-background/30 backdrop-blur-[2px] rounded-[3rem] -z-10 mask-radial-faded" />
            
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
                      <CountUpAnimation end={challengesCount} duration={2} suffix="+" />
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
                      <CountUpAnimation end={devStats.value} duration={2} suffix={devStats.suffix} />
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
                      $<CountUpAnimation end={prizeStats.value} duration={2} suffix={prizeStats.suffix} />
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