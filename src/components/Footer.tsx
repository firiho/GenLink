import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Github, Twitter, Linkedin, Mail, 
  ArrowUpRight, Heart
} from 'lucide-react';
import Logo from './Logo';

export const Footer = () => {
  const links = {
    platform: [
      { label: 'Features', href: '/features' },
      { label: 'Challenges', href: '/challenges' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'Success Stories', href: '/stories' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
      { label: 'Admin Portal', href: '/admin/login' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Blog', href: '/blog' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-neutral-900 to-neutral-950 overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.02]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/3 rounded-full blur-3xl" />
      </div>
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Top Border Gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Modern Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start"
            >
              <Logo class_name="transform hover:scale-105 transition-all duration-300 hover:drop-shadow-glow" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg leading-relaxed max-w-md"
            >
              Empowering innovation across Africa through cutting-edge technology challenges. 
              Join us in building tomorrow's solutions today.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ y: -6, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 rounded-2xl bg-white/5 text-gray-400 hover:text-primary 
                    transition-all duration-300 hover:shadow-glow hover:shadow-primary/20 
                    border border-white/10 hover:border-primary/30 backdrop-blur-sm
                    hover:bg-white/10"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Enhanced Links Sections */}
          {Object.entries(links).map(([title, items], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * sectionIndex }}
            >
              <h3 className="font-bold text-white mb-6 uppercase text-sm tracking-wider">
                {title}
              </h3>
              <ul className="space-y-4">
                {items.map((item, itemIndex) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.05 * itemIndex }}
                  >
                    <Link
                      to={item.href}
                      className="text-gray-400 hover:text-white transition-all duration-300 inline-flex 
                        items-center group text-sm hover:translate-x-1"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 
                        group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Modern Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-20 pt-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="text-sm text-gray-400 flex items-center">
              Made with <Heart className="h-4 w-4 mx-2 text-red-500 hover:animate-pulse cursor-pointer" /> 
              in <span className="ml-1 font-semibold text-primary">Kigali</span>
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-white transition-colors duration-300 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors duration-300 hover:underline">
                Terms of Service
              </Link>
              <span className="text-gray-500">
                © {new Date().getFullYear()} <span className="font-semibold">GenLink</span>. All rights reserved.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};