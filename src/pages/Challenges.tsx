import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Calendar, ArrowRight, Sparkles, Timer } from 'lucide-react';

const Challenges = () => {
  const challenges = [
    {
      title: "Rwanda Tech Innovation Challenge",
      organizer: "Rwanda ICT Chamber",
      prize: "$25,000",
      participants: 450,
      daysLeft: 14,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "Technology",
      featured: true,
    },
    {
      title: "East African FinTech Hackathon",
      organizer: "Bank of Kigali",
      prize: "$30,000",
      participants: 380,
      daysLeft: 21,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "FinTech",
      featured: true,
    },
    {
      title: "Smart Cities Innovation Challenge",
      organizer: "City of Kigali",
      prize: "$20,000",
      participants: 290,
      daysLeft: 7,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "Smart City",
      featured: false,
    },
    // Add more challenges as needed
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="absolute -left-1/4 -top-1/4 w-1/2 h-1/2 bg-primary/30 rounded-full blur-3xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="absolute -right-1/4 -bottom-1/4 w-1/2 h-1/2 bg-blue-500/20 rounded-full blur-3xl"
            />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 backdrop-blur-sm mb-6"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Innovation Challenges
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Exciting Challenges
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Join innovative challenges, showcase your skills, and win amazing prizes
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img 
                    src={challenge.image} 
                    alt={challenge.title}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                  {challenge.featured && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white">
                      <Trophy className="w-4 h-4 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <Badge variant="secondary" className="mb-4">
                    {challenge.category}
                  </Badge>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {challenge.organizer}
                  </p>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{challenge.participants} Participants</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Timer className="w-4 h-4 mr-1" />
                      <span className="text-sm">{challenge.daysLeft} Days Left</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-primary font-semibold">
                      {challenge.prize}
                    </div>
                    <Button className="group">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              Ready to Take on a Challenge?
            </h2>
            <p className="text-gray-600 mb-8">
              Join our community of innovators and start building solutions that matter
            </p>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Challenges; 