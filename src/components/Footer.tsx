import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Github, Twitter, Linkedin, Mail, 
  ArrowUpRight, Heart
} from 'lucide-react';
import Logo from './Logo';
import ThemeSwitcher from './ThemeSwitcher';

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
    <footer className="relative bg-background border-t border-border overflow-hidden">
      {/* Minimal Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-start"
            >
              <Logo class_name="transform hover:scale-105 transition-all duration-200" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-base leading-relaxed max-w-md text-pretty"
            >
              Empowering innovation across Africa through cutting-edge technology challenges. 
              Join us in building tomorrow's solutions today.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3"
            >
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-accent/5 text-muted-foreground hover:text-accent 
                    transition-all duration-200 hover:bg-accent/10 border border-border hover:border-accent/20"
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
              <ThemeSwitcher />
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(links).map(([title, items], sectionIndex) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * sectionIndex }}
            >
              <h3 className="font-semibold text-foreground mb-4 uppercase text-sm tracking-wide">
                {title}
              </h3>
              <ul className="space-y-3">
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
                      className="text-muted-foreground hover:text-foreground transition-all duration-200 inline-flex 
                        items-center group text-sm hover:translate-x-1"
                    >
                      {item.label}
                      <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 
                        group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-4 w-4 mx-2 text-destructive hover:animate-pulse cursor-pointer" /> 
              in <span className="ml-1 font-semibold text-accent">Kigali</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="hover:text-foreground transition-colors duration-200 hover:underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-foreground transition-colors duration-200 hover:underline">
                Terms of Service
              </Link>
              <span className="text-muted-foreground">
                © {new Date().getFullYear()} <span className="font-semibold text-foreground">GenLink</span>. All rights reserved.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};