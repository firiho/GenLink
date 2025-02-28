import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, ArrowRight, Sparkles, Calendar, MapPin, 
  MessageCircle, Award, Github, Twitter, Linkedin 
} from 'lucide-react';

const Community = () => {
  const members = [
    {
      name: "Sarah Mutesi",
      role: "Full Stack Developer",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      contributions: 45,
      projects: 8,
      badges: ["Top Contributor", "Mentor"],
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
    {
      name: "Jean-Paul Hakizimana",
      role: "AI Engineer",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      contributions: 38,
      projects: 5,
      badges: ["Innovation Leader"],
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
    {
      name: "Alice Uwase",
      role: "UX Designer",
      image: "/lovable-uploads/e2721391-268f-467e-a649-b1423b9e99d5.png",
      contributions: 32,
      projects: 6,
      badges: ["Design Expert"],
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com"
      }
    },
  ];

  const events = [
    {
      title: "Kigali Tech Meetup",
      date: "March 25, 2024",
      time: "2:00 PM",
      location: "Norrsken House Kigali",
      type: "In-Person",
      attendees: 120,
      description: "Monthly meetup for developers and tech enthusiasts in Kigali."
    },
    {
      title: "AI Workshop Series",
      date: "March 28, 2024",
      time: "3:00 PM",
      location: "Virtual",
      type: "Online",
      attendees: 250,
      description: "Learn about the latest developments in AI and machine learning."
    },
    {
      title: "Design Systems Workshop",
      date: "April 2, 2024",
      time: "10:00 AM",
      location: "Impact Hub Kigali",
      type: "Hybrid",
      attendees: 85,
      description: "Hands-on workshop about creating and maintaining design systems."
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
              Join Our Community
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Connect with Innovators
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Be part of Rwanda's growing tech community
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Members */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Community Leaders</h2>
            <p className="text-gray-600">Meet our most active community members</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {members.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {member.badges.map((badge) => (
                    <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary">
                      <Award className="w-3 h-3 mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-gray-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <span className="text-sm">{member.contributions} Contributions</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    <span className="text-sm">{member.projects} Projects</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  {Object.entries(member.social).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-primary transition-colors"
                    >
                      {platform === 'github' && <Github className="w-5 h-5" />}
                      {platform === 'twitter' && <Twitter className="w-5 h-5" />}
                      {platform === 'linkedin' && <Linkedin className="w-5 h-5" />}
                    </a>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-gray-600">Join our community events and workshops</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6"
              >
                <Badge 
                  variant="secondary" 
                  className={`mb-4 ${
                    event.type === 'In-Person' 
                      ? 'bg-green-100 text-green-700'
                      : event.type === 'Online'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {event.type}
                </Badge>
                <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{event.description}</p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{event.date} at {event.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.attendees} Attendees</span>
                  </div>
                </div>
                <Button className="w-full group">
                  Register Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              Join Our Growing Community
            </h2>
            <p className="text-gray-600 mb-8">
              Connect with fellow innovators, share your knowledge, and grow together
            </p>
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90">
              Become a Member
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community; 