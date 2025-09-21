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
      { label: 'Features', href: '/features', comment: '// /features - Features showcase page' },
      { label: 'Challenges', href: '/challenges', comment: '// /challenges - Existing challenges page' },
      { label: 'Enterprise', href: '/enterprise', comment: '// /enterprise - Enterprise solutions page' },
      { label: 'Success Stories', href: '/stories', comment: '// /stories - Success stories/case studies page' },
    ],
    company: [
      { label: 'About Us', href: '/about', comment: '// /about - About us page' },
      { label: 'Partners', href: '/partners', comment: '// /partners - Partners page' },
      { label: 'Contact', href: '/contact', comment: '// /contact - Contact us page' },
      { label: 'Admin Portal', href: '/admin/login', comment: '// /admin/login - Existing admin login page' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs', comment: '// /docs - API documentation page' },
      { label: 'Help Center', href: '/help', comment: '// /help - Help center/FAQ page' },
      { label: 'Community', href: '/community', comment: '// /community - Existing community page' },
      { label: 'Blog', href: '/blog', comment: '// /blog - Blog/news page' },
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
      {/* Modern Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
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
              className="flex items-center gap-4"
            >
              {socialLinks.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-card/50 backdrop-blur-sm text-muted-foreground hover:text-accent 
                    transition-all duration-200 hover:bg-accent/10 border border-border/50 hover:border-accent/30 
                    hover:shadow-lg hover:shadow-accent/10"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
              <div className="ml-2">
                <ThemeSwitcher />
              </div>
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
              className="space-y-4"
            >
              <h3 className="font-semibold text-foreground mb-4 text-base">
                {title.charAt(0).toUpperCase() + title.slice(1)}
              </h3>
              <ul className="space-y-3">
                {items.map((item, itemIndex) => {
                  // Check if the page exists (only /challenges, /community, and /admin/login exist)
                  const existingPages = ['/challenges', '/community', '/admin/login'];
                  const isExistingPage = existingPages.includes(item.href);
                  
                  return (
                    <motion.li
                      key={item.label}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * itemIndex }}
                    >
                      {isExistingPage ? (
                        <Link
                          to={item.href}
                          className="text-muted-foreground hover:text-foreground transition-all duration-200 inline-flex 
                            items-center group text-sm hover:translate-x-1"
                        >
                          {item.label}
                          <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 -translate-y-1 
                            group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                        </Link>
                      ) : (
                        <div className="text-muted-foreground/50 text-sm cursor-not-allowed">
                          {item.label}
                          {/* {item.comment} */}
                        </div>
                      )}
                    </motion.li>
                  );
                })}
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
          className="mt-12 pt-8"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-6" />
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-sm text-muted-foreground flex items-center">
              Made with <Heart className="h-4 w-4 mx-2 text-destructive hover:animate-pulse cursor-pointer" /> 
              in <span className="ml-1 font-semibold text-accent">Kigali, Rwanda</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                <div className="text-muted-foreground/50 cursor-not-allowed">
                  Privacy Policy
                  {/* // /privacy - Privacy policy page */}
                </div>
                <div className="text-muted-foreground/50 cursor-not-allowed">
                  Terms of Service
                  {/* // /terms - Terms of service page */}
                </div>
              </div>
              <div className="text-center sm:text-right">
                <span className="text-muted-foreground">
                  © {new Date().getFullYear()} <span className="font-semibold text-foreground">GenLink</span>. All rights reserved.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};