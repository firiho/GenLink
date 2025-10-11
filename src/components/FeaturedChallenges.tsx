import { motion } from 'framer-motion';
import { ArrowRight, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { HackathonCard } from '@/components/HackathonCard';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function FeaturedChallenges() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedChallenges = async () => {
      try {
        const challengesRef = collection(db, 'challenges');
        // Fetch only active and public challenges
        const featuredQuery = query(
          challengesRef,
          where('status', '==', 'active'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(featuredQuery);
        const allChallenges = querySnapshot.docs.map(doc => {
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
            image: data.coverImageUrl || '/placeholder-challenge.jpg',
            deadline: deadline,
            hasDeadlinePassed: deadline ? deadline < today : false
          };
        });

        // Filter out challenges where deadline has passed, then sort by participants and take top 3
        const activeChallenges = allChallenges.filter(challenge => !challenge.hasDeadlinePassed);
        const featuredHackathons = activeChallenges
          .sort((a, b) => b.participants - a.participants)
          .slice(0, 3);
        
        setHackathons(featuredHackathons);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching featured challenges:', error);
        setLoading(false);
      }
    };

    fetchFeaturedChallenges();
  }, []);

  // Don't render section if there are no challenges and loading is complete
  if (!loading && hackathons.length === 0) {
    return null;
  }

  return (
    <section className="py-24 bg-background relative">
      {/* Minimal Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
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
            <div className="flex justify-center lg:justify-start items-center gap-2 mb-6">
              <Code className="w-5 h-5 text-accent" />
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
                Featured Challenges
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              <span className="gradient-text">Innovation at Its</span>
              <br />
              <span className="gradient-text-primary">Peak</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
              Join the most exciting challenges where visionary minds compete to build tomorrow's solutions
            </p>
          </div>
          <Link to="/challenges" className="w-full lg:w-auto">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline"
                className="border-border hover:bg-accent/5 text-foreground font-medium px-6 py-3 rounded-lg transition-all duration-200 group w-full lg:w-auto"
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {loading ? (
            // Clean Loading Skeletons
            [...Array(3)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                className="group relative"
              >
                <div className="p-6 rounded-lg border border-border bg-card">
                  <Skeleton className="h-48 w-full rounded-lg mb-6 bg-muted" />
                  <Skeleton className="h-6 w-3/4 mb-3 bg-muted" />
                  <Skeleton className="h-4 w-1/2 mb-6 bg-muted" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
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
                whileHover={{ y: -4, scale: 1.02 }}
                className="transform transition-all duration-200"
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