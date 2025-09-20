import React from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';

// Clean marquee row with minimal styling
function MarqueeRow({ partners, speed = 20, reverse = false }) {
  // Triple the array for seamless effect
  const fullPartners = [...partners, ...partners, ...partners];

  // Animation direction
  const animationProps = reverse
    ? { x: ['-100%', '0%'] }
    : { x: ['0%', '-100%'] };

  return (
    <div className="relative overflow-hidden py-4">
      {/* Gradient masks */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent via-transparent to-background pointer-events-none z-20" />
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-20" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-20" />
      
      <motion.div
        className="flex gap-8 py-4"
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
        {fullPartners.map((partner, idx) => (
          <motion.div
            key={`${partner.name}-${idx}-${reverse ? 'reverse' : 'normal'}`}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex-shrink-0 group"
          >
            <div className="px-6 py-4 rounded-lg border border-border bg-card hover:bg-accent/5 transition-all duration-200 min-w-[200px] text-center">
              <div className="text-lg font-semibold text-foreground group-hover:text-accent transition-colors">
                {partner.name}
              </div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                {partner.type}
              </div>
            </div>
          </motion.div>
        ))}
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
      {/* Clean Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-tech-grid opacity-[0.01]" />
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 relative z-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-accent/10 text-accent border border-accent/20 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            Strategic Partners
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
            <span className="gradient-text">Powered by Africa's</span>
            <br />
            <span className="gradient-text-primary">Innovation Leaders</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            Collaborating with visionary organizations to build the future of technology across East Africa and beyond
          </p>
        </motion.div>
      </div>

      {/* Marquee */}
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
