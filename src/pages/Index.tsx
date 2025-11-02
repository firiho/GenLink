import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Partners } from '@/components/Partners';
import { Footer } from '@/components/Footer';
import { ArrowRight, Trophy, Users, Calendar, Star, Award, Sparkles, Code, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import FeaturedChallenges from '@/components/FeaturedChallenges';
import FeaturedProjects from '@/components/FeaturedProjects';

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


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Partners />
      
      {/* Featured Hackathons Section with Enhanced Design */}
      <FeaturedChallenges />

      {/* Featured Projects Section */}
      <FeaturedProjects />

      {/* Innovation Champions Section */}
      <section className="py-24 relative">
        {/* Clean Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex justify-center items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-accent" />
              <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
                Hall of Fame
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              <span className="gradient-text">Innovation</span>
              <br />
              <span className="gradient-text-primary">Champions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
              Celebrating the visionaries who built tomorrow's solutions today
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner, index) => (
              <div
                key={winner.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group"
              >
                <div className="p-6 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 h-full">
                  <div className="relative mb-6 overflow-hidden rounded-lg">
                    <img 
                      src={winner.image} 
                      alt={winner.project} 
                      className="w-full h-48 object-cover transition-all duration-300 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 rounded-md bg-accent/90 text-accent-foreground text-xs font-medium">
                        {winner.achievement}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground group-hover:text-accent transition-colors duration-200">
                      {winner.project}
                    </h3>
                    <p className="text-muted-foreground">by <span className="font-semibold text-foreground">{winner.name}</span></p>
                    <p className="text-sm text-muted-foreground">{winner.challenge}</p>
                    
                    <div className="pt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-md bg-accent/10 text-accent text-sm font-medium">
                        Prize: {winner.prize}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 bg-background overflow-hidden">
        {/* Minimal Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
          <div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Join the Innovation Revolution
              </span>
            </div>
            
            <h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance"
            >
              <span className="gradient-text">Transform Ideas Into</span>
              <br />
              <span className="gradient-text-primary">Reality</span>
            </h2>
            
            <p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto text-pretty"
            >
              Connect with visionary minds, access cutting-edge resources, and build solutions 
              that shape the future of technology across Africa and beyond.
            </p>
            
            <div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg px-8 py-4 rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                  >
                    Start Building Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Link>
              <Link to="/challenges">
                <div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-border hover:bg-accent/5 text-foreground font-medium text-lg px-8 py-4 rounded-lg transition-all duration-200"
                  >
                    Explore Challenges
                    <Trophy className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;