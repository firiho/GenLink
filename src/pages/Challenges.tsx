import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import PublicChallenges from '@/components/challenges/PublicChallenges';

const Challenges = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Enhanced Minimal Header */}
      <section className="pt-24 pb-12 relative overflow-hidden">
        {/* Subtle Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-primary/5" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                <span className="gradient-text">Challenges</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Find and join exciting challenges that push your limits
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <PublicChallenges />

      {/* Call to Action */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-balance">
              <span className="gradient-text">Ready to Take on a</span>
              <br />
              <span className="gradient-text-primary">Challenge?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              Join our community of innovators and start building solutions that matter
            </p>
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
              onClick={() => window.location.href = '/signup'}
            >
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