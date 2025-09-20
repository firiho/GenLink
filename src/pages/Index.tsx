import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Partners } from '@/components/Partners';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowRight, Trophy, Users, Calendar, Star, Award, Sparkles, Code, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import FeaturedChallenges from '@/components/FeaturedChallenges';

const Index = () => {
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
      value: '50+', 
      label: 'Innovation Challenges'
    },
    { 
      icon: Users, 
      value: '10K+', 
      label: 'Tech Innovators'
    },
    { 
      icon: Calendar, 
      value: '$2M+', 
      label: 'Total Prize Pool'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <Header />
      <Hero />
      
      {/* Modern Stats Section */} 
      <section className="relative -mt-24 z-10"> 
        <div className="container mx-auto px-4"> 
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mx-4 md:mx-0" 
          > 
            {stats.map(({ icon: Icon, value, label }, index) => ( 
              <motion.div 
                key={label} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02, y: -5 }} 
                className="relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-2xl backdrop-blur-md border border-white/10" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-6 md:p-8 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2 font-mono tracking-tight">{value}</div>
                  <div className="text-sm text-gray-400 font-medium">{label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Partners />
      
      {/* Featured Hackathons Section with Enhanced Design */}
      <FeaturedChallenges />

      {/* Project Winners Section with Modern Dark Design */}
      <section className="py-24 bg-gradient-to-b from-neutral-950 to-neutral-900 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-tech-grid opacity-[0.02]" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex justify-center items-center gap-2 mb-4">
              <Award className="w-6 h-6 text-primary" />
              <Badge variant="secondary" className="bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
                Hall of Fame
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Innovation Champions
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Celebrating the visionaries who built tomorrow's solutions today
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {winners.map((winner, index) => (
              <motion.div
                key={winner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative overflow-hidden"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/0 backdrop-blur-md border border-white/10 rounded-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Card Content */}
                <div className="relative p-6 h-full">
                  <div className="relative mb-6 overflow-hidden rounded-xl">
                    <img 
                      src={winner.image} 
                      alt={winner.project} 
                      className="w-full h-48 object-cover transition-all duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/90 text-white border-0 backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {winner.achievement}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                      {winner.project}
                    </h3>
                    <p className="text-gray-300">by <span className="font-semibold">{winner.name}</span></p>
                    <p className="text-sm text-gray-400">{winner.challenge}</p>
                    
                    <div className="pt-4">
                      <Badge variant="outline" className="text-primary border-primary/50 bg-primary/5 backdrop-blur-sm">
                        Prize: {winner.prize}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultra-Modern Call to Action Section */}
      <section className="relative py-32 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden">
        {/* Advanced Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.03]" />
          <motion.div 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-primary/10 via-transparent to-accent/10 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              rotate: [360, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-accent/10 via-transparent to-primary/10 rounded-full blur-3xl"
          />
        </div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          
          {/* Tech Icons Floating */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`tech-${i}`}
              className="absolute text-primary/10 opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                rotate: [0, 360],
                y: [0, -10, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              {i % 3 === 0 && <Code className="w-4 h-4" />}
              {i % 3 === 1 && <Brain className="w-5 h-5" />}
              {i % 3 === 2 && <Sparkles className="w-4 h-4" />}
            </motion.div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge 
                variant="secondary" 
                className="bg-white/5 text-white border-white/10 mb-8 backdrop-blur-md px-6 py-2 text-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Join the Innovation Revolution
              </Badge>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                Transform Ideas Into
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent">
                Reality
              </span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Connect with visionary minds, access cutting-edge resources, and build solutions 
              that shape the future of technology across Africa and beyond.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link to="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-glow hover:shadow-glow-lg transition-all duration-300"
                  >
                    Start Building Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
              <Link to="/challenges">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="bg-transparent border-gray-600 hover:bg-white/5 text-white font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-300"
                  >
                    Explore Challenges
                    <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;