import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, Eye, ArrowRight, Sparkles, Github, ExternalLink } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      title: "Smart Waste Management",
      creator: "Team Innovate",
      description: "An IoT-based solution for efficient waste collection and management in Kigali.",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "IoT",
      featured: true,
      views: 1250,
      likes: 328,
      contributors: 5,
      demoUrl: "https://demo.example.com",
      githubUrl: "https://github.com/example",
    },
    {
      title: "FinTech Payment Gateway",
      creator: "RwandaPay Team",
      description: "A secure and efficient payment processing system for East African markets.",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "FinTech",
      featured: true,
      views: 980,
      likes: 245,
      contributors: 4,
      demoUrl: "https://demo.example.com",
      githubUrl: "https://github.com/example",
    },
    {
      title: "Urban Mobility Tracker",
      creator: "City Solutions",
      description: "Real-time tracking and analytics for public transportation in Kigali.",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      category: "Smart City",
      featured: false,
      views: 756,
      likes: 189,
      contributors: 3,
      demoUrl: "https://demo.example.com",
      githubUrl: "https://github.com/example",
    },
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
              Innovation Showcase
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Discover Amazing Projects
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Explore innovative solutions built by Rwanda's tech community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-48 object-cover rounded-t-2xl"
                  />
                  {project.featured && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white">
                      <Star className="w-4 h-4 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">
                      {project.category}
                    </Badge>
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        <span className="text-sm">{project.views}</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        <span className="text-sm">{project.likes}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-2">
                    by {project.creator}
                  </p>
                  <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{project.contributors} Contributors</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" className="group">
                        <Github className="w-4 h-4 mr-1" />
                        Code
                      </Button>
                      <Button size="sm" className="group">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                    </div>
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
              Ready to Showcase Your Project?
            </h2>
            <p className="text-gray-600 mb-8">
              Join our community and share your innovative solutions with the world
            </p>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Submit Your Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects; 