import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { HackathonCard } from '@/components/HackathonCard';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedChallenges() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedChallenges = async () => {
      try {
        const challengesRef = collection(db, 'challenges');
        const featuredQuery = query(
          challengesRef,
          orderBy('participants', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(featuredQuery);
        const featuredHackathons = querySnapshot.docs.map(doc => {
          const data = doc.data();
          
          // Calculate days left based on deadline
          const deadline = data.deadline ? new Date(data.deadline) : null;
          const today = new Date();
          const daysLeft = deadline ? 
            Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) : 
            30; // Default if no deadline
          
          return {
            id: doc.id,
            challengeId: doc.id,
            title: data.title || 'Unnamed Challenge',
            organizer: data.companyInfo?.name || 'Unknown Organization',
            prize: data.total_prize ? `$${data.total_prize.toLocaleString()}` : 'No prize',
            participants: data.participants || 0,
            daysLeft: daysLeft,
            image: data.coverImageUrl || '/placeholder-challenge.jpg'
          };
        });
        
        setHackathons(featuredHackathons);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured challenges:', error);
        setLoading(false);
      }
    };

    fetchFeaturedChallenges();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-neutral-900 to-neutral-950 relative overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.02]" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Floating Code Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-primary/10 font-mono text-xs select-none"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -15, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              {['{ }', '< >', '[ ]', '=> ', 'fn()', 'API', 'HTTP', 'JSON'][i]}
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-16 text-center lg:text-left"
        >
          <div className="flex-1 mb-8 lg:mb-0">
            <div className="flex justify-center lg:justify-start items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm px-4 py-1">
                Featured Challenges
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Innovation at Its Peak
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl">
              Join the most exciting challenges where visionary minds compete to build tomorrow's solutions
            </p>
          </div>
          <Link to="/challenges" className="w-full lg:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline"
                className="bg-transparent border-gray-600 hover:bg-white/5 text-white font-medium px-6 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 group w-full lg:w-auto"
              >
                Explore All Challenges
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            // Modern Loading Skeletons with Dark Theme
            [...Array(3)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-2xl" />
                <div className="relative p-6">
                  <Skeleton className="h-48 w-full rounded-xl mb-6 bg-gray-700/50" />
                  <Skeleton className="h-6 w-3/4 mb-3 bg-gray-700/50" />
                  <Skeleton className="h-4 w-1/2 mb-6 bg-gray-700/50" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-gray-700/50" />
                    <Skeleton className="h-4 w-24 bg-gray-700/50" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="transform transition-all duration-300"
              >
                <HackathonCard {...hackathon} />
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}