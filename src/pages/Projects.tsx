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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Projects Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Portfolio Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-accent/5 to-transparent" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent/15 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/15 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h1 className="text-6xl md:text-7xl font-bold">
                  <span className="gradient-text">Innovation</span>
                  <br />
                  <span className="gradient-text-primary">Showcase</span>
                </h1>
                <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Explore groundbreaking projects that are shaping Rwanda's digital future
                </p>
              </div>

              {/* Featured Project Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card/50 backdrop-blur-sm rounded-3xl p-8 border border-border/50 max-w-2xl mx-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Featured Project</h3>
                      <p className="text-sm text-muted-foreground">Smart Waste Management</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    IoT
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  An IoT-based solution for efficient waste collection and management in Kigali
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>1.2K views</span>
                    <span>328 likes</span>
                    <span>5 contributors</span>
                  </div>
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Project
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                >
                  Submit Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-accent/5 text-foreground hover:text-accent font-medium px-8 py-4 text-lg rounded-lg transition-all duration-200"
                >
                  Browse All Projects
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">150+</div>
              <div className="text-muted-foreground">Projects Built</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Active Contributors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">25+</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">
              <span className="gradient-text">Featured Projects</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Discover innovative solutions built by Rwanda's tech community
            </p>
          </motion.div>
          
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative h-full"
              >
                <div className="h-full rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl">
                  {/* Project Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    
                    {/* Featured Badge */}
                    {project.featured && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-accent/90 text-accent-foreground text-xs font-medium backdrop-blur-sm">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </span>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-background/80 text-foreground text-xs font-medium backdrop-blur-sm">
                        {project.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Project Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors line-clamp-2">
                      {project.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      by <span className="font-medium text-foreground">{project.creator}</span>
                    </p>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">
                      {project.description}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4 text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1 text-accent" />
                          <span className="text-sm font-medium">{project.views}</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 mr-1 text-accent" />
                          <span className="text-sm font-medium">{project.likes}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-accent" />
                          <span className="text-sm font-medium">{project.contributors}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 border-border hover:bg-accent/5 text-foreground hover:text-accent"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        Code
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
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

      {/* Categories Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">
              <span className="gradient-text">Explore by Category</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Find projects that match your interests and expertise
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto"
          >
            {['IoT', 'FinTech', 'Smart City', 'AI/ML', 'Web3', 'HealthTech', 'EdTech', 'AgriTech', 'E-commerce', 'Mobile', 'Data Science', 'Cybersecurity'].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="group cursor-pointer"
              >
                <div className="p-4 rounded-xl border border-border bg-card hover:bg-accent/5 transition-all duration-200 text-center">
                  <div className="text-sm font-medium group-hover:text-accent transition-colors">
                    {category}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-br from-accent/5 via-primary/5 to-accent/10 rounded-3xl p-12 border border-border/50">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                <span className="gradient-text">Ready to Showcase</span>
                <br />
                <span className="gradient-text-primary">Your Project?</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                Join our community and share your innovative solutions with the world
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                >
                  Submit Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-accent/5 text-foreground hover:text-accent font-medium px-8 py-4 text-lg rounded-lg transition-all duration-200"
                >
                  Browse Projects
                  <Eye className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Projects; 