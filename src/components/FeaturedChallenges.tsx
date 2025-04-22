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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-between items-center mb-12"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between items-center w-full gap-4 mt-4 sm:mt-0">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-yellow-500" />
                <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                  Featured
                </Badge>
              </div>
              <h2 className="text-3xl font-bold mb-2">Featured Challenges</h2>
              <p className="text-gray-600">Explore our most popular innovation challenges</p>
            </div>
            <Link to="/challenges" className="w-full sm:w-auto">
              <Button variant="ghost" className="group w-full sm:w-auto">
                View all challenges
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {loading ? (
            // Loading skeletons
            [...Array(3)].map((_, index) => (
              <motion.div
                key={`skeleton-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                  <Skeleton className="h-48 w-full rounded-md mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <div className="flex justify-between items-center mt-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
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