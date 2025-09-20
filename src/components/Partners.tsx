import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

// Single marquee row with ultra-modern dark styling and unique card designs
function MarqueeRow({ partners, speed = 20, reverse = false }) {
  // Triple the array for ultra-smooth seamless effect
  const fullPartners = [...partners, ...partners, ...partners];

  // Animation direction
  const animationProps = reverse
    ? { x: ['-100%', '0%'] }
    : { x: ['0%', '-100%'] };

  // Different card styles for each partner type
  const getCardStyle = (type, index) => {
    const styles = {
      'Financial Partner': {
        bg: 'bg-gradient-to-br from-emerald-500/10 via-green-400/5 to-transparent',
        border: 'border-emerald-400/20',
        textGradient: 'group-hover:from-emerald-400 group-hover:via-green-300 group-hover:to-emerald-500',
        glow: 'from-emerald-400/15 via-green-400/10 to-emerald-400/15'
      },
      'Technology Partner': {
        bg: 'bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent',
        border: 'border-primary/20',
        textGradient: 'group-hover:from-primary group-hover:via-blue-300 group-hover:to-blue-500',
        glow: 'from-primary/15 via-blue-400/10 to-primary/15'
      },
      'Innovation Hub': {
        bg: 'bg-gradient-to-br from-purple-500/10 via-violet-400/5 to-transparent',
        border: 'border-purple-400/20',
        textGradient: 'group-hover:from-purple-400 group-hover:via-violet-300 group-hover:to-purple-500',
        glow: 'from-purple-400/15 via-violet-400/10 to-purple-400/15'
      },
      'Development Partner': {
        bg: 'bg-gradient-to-br from-orange-500/10 via-accent/5 to-transparent',
        border: 'border-accent/20',
        textGradient: 'group-hover:from-accent group-hover:via-orange-300 group-hover:to-orange-500',
        glow: 'from-accent/15 via-orange-400/10 to-accent/15'
      },
      'Innovation Partner': {
        bg: 'bg-gradient-to-br from-cyan-500/10 via-teal-400/5 to-transparent',
        border: 'border-cyan-400/20',
        textGradient: 'group-hover:from-cyan-400 group-hover:via-teal-300 group-hover:to-cyan-500',
        glow: 'from-cyan-400/15 via-teal-400/10 to-cyan-400/15'
      }
    };
    
    // Fallback to a rotating style if type not found
    const fallbackStyles = [
      styles['Technology Partner'],
      styles['Innovation Hub'],
      styles['Financial Partner'],
      styles['Development Partner'],
      styles['Innovation Partner']
    ];
    
    return styles[type] || fallbackStyles[index % fallbackStyles.length];
  };

  return (
    <div className="relative overflow-hidden py-2 -mx-4">
      {/* Full-width enhanced gradient masks with stronger blur */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-transparent via-transparent to-neutral-950 pointer-events-none z-20" />
      <div className="absolute left-0 top-0 bottom-0 w-48 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none z-20" />
      
      <motion.div
        className="flex gap-8 py-6 px-8"
        animate={animationProps}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed,
            ease: 'linear',
          },
        }}
      >
        {fullPartners.map((partner, idx) => {
          const style = getCardStyle(partner.type, idx);
          
          return (
            <motion.div
              key={`${partner.name}-${idx}-${reverse ? 'reverse' : 'normal'}`}
              whileHover={{ y: -12, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="relative group flex-shrink-0"
            >
              <div className="relative overflow-hidden">
                {/* Unique card background based on partner type */}
                <div className={`absolute inset-0 ${style.bg} backdrop-blur-xl border ${style.border} rounded-2xl`} />
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-white/1 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                
                {/* Unique glow effect per card type */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${style.glow} rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-700`} />
                
                {/* Subtle inner glow with type-specific color */}
                <div className={`absolute inset-0 rounded-2xl shadow-inner shadow-white/5 group-hover:shadow-white/10 transition-all duration-500`} />
                
                <div className="relative w-72 h-20 flex flex-col items-center justify-center px-8 py-5">
                  <span
                    className={`text-xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text 
                               text-transparent ${style.textGradient}
                               transition-all duration-500 truncate w-full text-center tracking-tight`}
                    title={partner.name}
                  >
                    {partner.name}
                  </span>
                  <span
                    className="text-xs text-gray-400 mt-1 opacity-60 group-hover:opacity-100 group-hover:text-gray-300
                               transition-all duration-500 truncate w-full text-center font-medium tracking-wide uppercase"
                    title={partner.type}
                  >
                    {partner.type}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

export function Partners() {
  const partners = [
    { name: 'Bank of Kigali', type: 'Financial Partner', logo: '/logos/bk.svg' },
    { name: 'MTN Rwanda', type: 'Technology Partner', logo: '/logos/mtn.svg' },
    { name: 'Kigali Innovation City', type: 'Innovation Hub', logo: '/logos/kic.svg' },
    { name: 'AC Group', type: 'Technology Partner', logo: '/logos/ac.svg' },
    { name: 'Inkomoko', type: 'Development Partner', logo: '/logos/inkomoko.svg' },
    { name: 'BK Tech House', type: 'Technology Partner', logo: '/logos/bktech.svg' },
    { name: 'Zipline Rwanda', type: 'Innovation Partner', logo: '/logos/zipline.svg' },
  ];

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Advanced Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.02]" />
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Floating Network Nodes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -25, 0],
                x: [0, 15, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-8 h-0.5 bg-gradient-to-r from-primary/10 to-transparent transform -translate-y-1/2" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Enhanced Dots Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, white 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Header with container constraint */}
      <div className="container mx-auto px-4 relative z-10 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-3 mb-6 p-2 pl-3 pr-4 rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-semibold">Strategic Partners</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
            Powered by Africa's
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-accent bg-clip-text text-transparent">
              Innovation Leaders
            </span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Collaborating with visionary organizations to build the future of technology across East Africa and beyond
          </p>
        </motion.div>
      </div>

      {/* Full-width marquee without container constraint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10"
      >
        <MarqueeRow partners={partners} speed={45} reverse={false} />
      </motion.div>
    </section>
  );
}
