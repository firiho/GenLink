import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Partners } from '@/components/Partners';
import { Footer } from '@/components/Footer';
import { ArrowRight} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
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

      {/* Call to Action Section */}
      <section className="relative py-24 bg-background overflow-hidden">
        {/* Minimal Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
          <div 
            className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div
            className="max-w-4xl mx-auto text-center"
          >
            <div
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium mb-8">
                Join the Innovation Revolution
              </span>
            </div>
            
            <h2 
              className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-balance"
            >
              <span className="gradient-text">Transform Ideas Into</span>
              <br />
              <span className="gradient-text-primary">Reality</span>
            </h2>
            
            <p 
              className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto text-pretty"
            >
              Connect with visionary minds, access cutting-edge resources, and build solutions 
              that shape the future of technology across Africa and beyond.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/signup">
                <div>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg px-8 py-4 rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                  >
                    Start Building Today
                    <ArrowRight className="ml-2 h-5 w-5" />
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