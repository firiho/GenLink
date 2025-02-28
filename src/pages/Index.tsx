import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Partners } from '@/components/Partners';
import { HackathonCard } from '@/components/HackathonCard';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, Calendar, Star, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const hackathons = [
    {
      title: "Rwanda Tech Innovation Challenge",
      organizer: "Rwanda ICT Chamber",
      prize: "$25,000",
      participants: 450,
      daysLeft: 14,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png"
    },
    {
      title: "East African FinTech Hackathon",
      organizer: "Bank of Kigali",
      prize: "$30,000",
      participants: 380,
      daysLeft: 21,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png"
    },
    {
      title: "Smart Cities Innovation Challenge",
      organizer: "City of Kigali",
      prize: "$20,000",
      participants: 290,
      daysLeft: 7,
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png"
    }
  ];

  const winners = [
    {
      name: "Team Innovate",
      project: "Smart Waste Management System",
      challenge: "Rwanda Tech Innovation Challenge",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      prize: "$25,000",
      achievement: "Grand Prize Winner"
    },
    {
      name: "Eco Warriors",
      project: "Sustainable Energy Solutions",
      challenge: "East African FinTech Hackathon",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      prize: "$30,000",
      achievement: "First Runner-Up"
    },
    {
      name: "City Planners",
      project: "Urban Mobility App",
      challenge: "Smart Cities Innovation Challenge",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      prize: "$20,000",
      achievement: "Second Runner-Up"
    }
  ];

  const stats = [
    { 
      icon: Trophy, 
      value: '150+', 
      label: 'Challenges Completed',
      color: 'bg-blue-500/10 text-blue-500'
    },
    { 
      icon: Users, 
      value: '2,500+', 
      label: 'Active Innovators',
      color: 'bg-purple-500/10 text-purple-500'
    },
    { 
      icon: Calendar, 
      value: '30+', 
      label: 'Monthly Events',
      color: 'bg-green-500/10 text-green-500'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      
      {/* Stats Section with Enhanced Design */} 
      <section className="relative -mt-20 z-10"> 
        <div className="container mx-auto px-4"> 
          <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mx-5 md:mx-0" > 
          {stats.map(({ icon: Icon, value, label, color }) => ( 
            <motion.div key={label} whileHover={{ scale: 1.02 }} 
                  className="flex items-center space-x-4 p-6 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className={`p-4 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">{value}</div>
                    <div className="text-sm text-gray-600">{label}</div>
                  </div>
                </motion.div>
                ))}
                </motion.div>
              </div>
            </section>

      <Partners />
      
      {/* Featured Hackathons Section with Enhanced Design */}
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
            {hackathons.map((hackathon, index) => (
              <motion.div
                key={hackathon.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <HackathonCard {...hackathon} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Project Winners Section with Enhanced Design */}
      <section className="py-24 bg-gray-50/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50/50 pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-12"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-primary" />
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Hall of Fame
                </Badge>
              </div>
              <h2 className="text-3xl font-bold mb-2">Previous Challenge Winners</h2>
              <p className="text-gray-600">Celebrating innovation excellence</p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 group"
              >
                <div className="relative mb-4">
                  <img 
                    src={winner.image} 
                    alt={winner.project} 
                    className="w-full h-48 object-cover rounded-lg group-hover:shadow-xl transition-shadow duration-300" 
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-white">
                      <Sparkles className="w-4 h-4 mr-1" />
                      {winner.achievement}
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {winner.project}
                </h3>
                <p className="text-gray-600 mb-1">by {winner.name}</p>
                <p className="text-sm text-gray-500 mb-4">{winner.challenge}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-primary border-primary">
                    Prize: {winner.prize}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Call to Action Section */}
      <section className="py-32 bg-gradient-to-r from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/50" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <Badge 
              variant="secondary" 
              className="bg-white/10 text-white border-white/20 mb-6 backdrop-blur-sm"
            >
              Join Our Community
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Start Your Innovation Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our community of innovators and start building the future today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-lg px-8"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/challenges">
                <Button 
                  size="lg" 
                  className="text-white border-white/20 hover:bg-white/10 text-lg px-8"
                >
                  Explore Challenges
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;