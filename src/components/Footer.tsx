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
    <footer className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-start">
              <Logo class_name="transform hover:scale-105 transition-transform duration-300" />
            </div>
            <p className="text-gray-600 text-base leading-relaxed max-w-md">
              Empowering innovation across East Africa through our cutting-edge 
              challenge platform. Join us in building the future, one solution at a time.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social, i) => (
          <motion.a
            key={i}
            href={social.href}
            aria-label={social.label}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-2xl bg-gray-50 text-gray-600 hover:text-primary 
              transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 border
              border-gray-100 hover:border-primary/20"
          >
            <social.icon className="h-5 w-5" />
          </motion.a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="font-semibold text-gray-900 mb-6 uppercase text-sm tracking-wider">
                {title}
              </h3>
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.href}
                      className="text-gray-600 hover:text-primary transition-colors inline-flex 
                        items-center group text-sm"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 
                        group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 flex items-center">
              Made with <Heart className="h-4 w-4 mx-1.5 text-red-500 hover:animate-pulse" /> in Kigali
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-400">© {new Date().getFullYear()} GenLink All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};