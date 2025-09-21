import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users, ArrowRight, Sparkles, Calendar, MapPin,
  MessageCircle, Award, Github, Twitter, Linkedin,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import ProfileModal from '@/components/ProfileModal';

const Community = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  useEffect(() => {
    const fetchTopMembers = async () => {
      try {
        const profilesRef = collection(db, 'public_profiles');
        const q = query(
          profilesRef, 
          orderBy('contributions', 'desc'),
          limit(3)
        );
        
        const querySnapshot = await getDocs(q);
        const topMembers = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Anonymous User',
            role: data.title || 'Community Member',
            image: data.photo || '/placeholder user.svg',
            contributions: data.contributions || 0,
            projects_count: data.projectsCount || 0,
            badges: data.badges || [],
            social: data.social || {
              github: "",
              twitter: "",
              linkedin: "",
            },
            // Additional profile fields for the modal
            location: data.location || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            about: data.about || '',
            skills: data.skills || [],
            experience: data.experience || [],
            education: data.education || [],
            projects: data.projects || [],
            coverPhoto: data.coverPhoto || '',
          };
        });
        
        setMembers(topMembers);
      } catch (error) {
        console.error('Error fetching top members:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMembers();
  }, []);

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
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Community Hero Section */}
      <section className="pt-32 pb-24 relative overflow-hidden">
        {/* Social Network Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/3 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/20 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                  <span className="gradient-text">Rwanda's Tech</span>
                  <br />
                  <span className="gradient-text-primary">Community</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Connect with 10,000+ developers, entrepreneurs, and innovators building the future of East Africa
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                >
                  Join Now
                  <Users className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-accent/5 text-foreground hover:text-accent font-medium px-8 py-4 text-lg rounded-lg transition-all duration-200"
                >
                  Explore Events
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Right Side - Community Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-6"
            >
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                <div className="text-3xl font-bold text-accent mb-2">10K+</div>
                <div className="text-muted-foreground">Active Members</div>
              </div>
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border/50">
                <div className="text-3xl font-bold text-accent mb-2">500+</div>
                <div className="text-muted-foreground">Events Hosted</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Members */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">
              <span className="gradient-text">Community Leaders</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Meet the innovators driving Rwanda's tech ecosystem forward
            </p>
          </motion.div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((index) => (
                <div 
                  key={index} 
                  className="group relative h-full rounded-2xl border border-border bg-card overflow-hidden animate-pulse"
                >
                  {/* Header skeleton */}
                  <div className="h-32 bg-gradient-to-br from-accent/10 to-primary/10"></div>
                  
                  {/* Content skeleton */}
                  <div className="p-6 -mt-16 relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-full bg-muted mb-4 border-4 border-background"></div>
                      <div className="space-y-2 mb-4 w-full">
                        <div className="h-6 w-3/4 bg-muted rounded mx-auto"></div>
                        <div className="h-4 w-1/2 bg-muted rounded mx-auto"></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        <div className="h-6 w-20 bg-muted rounded-full"></div>
                        <div className="h-6 w-16 bg-muted rounded-full"></div>
                      </div>
                      <div className="flex justify-between w-full mb-4">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-4 w-20 bg-muted rounded"></div>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <div className="h-6 w-6 bg-muted rounded-full"></div>
                        <div className="h-6 w-6 bg-muted rounded-full"></div>
                        <div className="h-6 w-6 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {members.map((member, index) => (
                <motion.div
                  key={member.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative h-full cursor-pointer"
                  onClick={() => {
                    setSelectedMember(member);
                    setIsProfileOpen(true);
                  }}
                >
                  <div className="h-full rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl">
                    {/* Header with gradient background */}
                    <div className="h-32 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                          <Award className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 -mt-16 relative">
                      <div className="flex flex-col items-center text-center">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg mb-4 ring-2 ring-accent/20 dark:ring-accent/30">
                          {member.image ? (
                            <img 
                              src={member.image} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                              <span className="text-white text-2xl font-bold">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Name and Role */}
                        <h3 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">
                          {member.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4">{member.role}</p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-6 justify-center">
                          {member.badges && member.badges.slice(0, 2).map((badge) => (
                            <span key={badge} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">
                              {badge}
                            </span>
                          ))}
                          {member.badges && member.badges.length > 2 && (
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                              +{member.badges.length - 2} more
                            </span>
                          )}
                        </div>
                        
                        {/* Stats */}
                        <div className="flex justify-between w-full mb-6 px-4">
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-accent mb-1">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm font-semibold">{member.contributions}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Contributions</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="flex items-center text-accent mb-1">
                              <Users className="w-4 h-4 mr-1" />
                              <span className="text-sm font-semibold">{member.projects_count}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Projects</span>
                          </div>
                        </div>
                        
                        {/* Social Links */}
                        <div className="flex items-center justify-center space-x-4">
                          {member.social && Object.entries(member.social).map(([platform, url]) => (
                            url && (
                              <a
                                key={platform}
                                href={url.toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-card/50 hover:bg-accent/10 border border-border/50 hover:border-accent/30 flex items-center justify-center text-muted-foreground hover:text-accent transition-all duration-200 group"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {platform === 'github' && <Github className="w-5 h-5 group-hover:text-accent" />}
                                {platform === 'twitter' && <Twitter className="w-5 h-5 group-hover:text-accent" />}
                                {platform === 'linkedin' && <Linkedin className="w-5 h-5 group-hover:text-accent" />}
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-balance">
              <span className="gradient-text">Upcoming Events</span>
            </h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Join our community events and workshops to connect and learn
            </p>
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
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full group"
              >
                <div className="h-full rounded-2xl border border-border bg-card hover:bg-accent/5 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-xl">
                  {/* Event Header */}
                  <div className="h-40 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span 
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          event.type === 'In-Person' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : event.type === 'Online'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                        }`}
                      >
                        {event.type}
                      </span>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <div className="w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6 line-clamp-2">{event.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-3 text-accent" />
                        <span className="text-sm font-medium">{event.date} at {event.time}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-3 text-accent" />
                        <span className="text-sm">{event.location}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-3 text-accent" />
                        <span className="text-sm">{event.attendees} Attendees</span>
                      </div>
                    </div>
                    
                    <Button className="w-full group bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
                      Register Now
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
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-br from-accent/5 via-primary/5 to-accent/10 rounded-3xl p-12 border border-border/50">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
                <span className="gradient-text">Join Our Growing</span>
                <br />
                <span className="gradient-text-primary">Community</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
                Connect with fellow innovators, share your knowledge, and grow together in Rwanda's tech ecosystem
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-8 py-4 text-lg rounded-lg shadow-modern hover:shadow-lg transition-all duration-200"
                >
                  Become a Member
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-border hover:bg-accent/5 text-foreground hover:text-accent font-medium px-8 py-4 text-lg rounded-lg transition-all duration-200"
                >
                  View Events
                  <Calendar className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      {/* Member Profile Modal */}
      <ProfileModal selectedMember={selectedMember} isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen} />
    </div>
  );
};

export default Community;