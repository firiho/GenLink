import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';

// Single marquee row
function MarqueeRow({ partners, speed = 20, reverse = false }) {
  // Duplicate the array to ensure a seamless effect
  const fullPartners = [...partners, ...partners];

  // If reverse is true, we flip the direction
  // We basically go from 0 to -100% for normal,
  // and from -100% to 0 for reverse.
  const animationProps = reverse
    ? { x: ['-100%', '0%'] }
    : { x: ['0%', '-100%'] };

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-white pointer-events-none z-10" />
      <motion.div
        className="flex gap-8 py-4"
        animate={animationProps}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: speed, // Adjust speed to taste
            ease: 'linear',
          },
        }}
      >
        {fullPartners.map((partner, idx) => (
          <motion.div
            key={`${partner.name}-${idx}-${reverse ? 'reverse' : 'normal'}`}
            whileHover={{ y: -5 }}
            className="relative group"
          >
            <div className="w-60 bg-white rounded-2xl shadow-lg shadow-black/[0.03] border border-gray-100 
                            flex flex-col items-center justify-center px-4 py-3
                            hover:border-primary/20 transition-colors duration-300"
            >
              <span
                className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text 
                           text-transparent group-hover:from-primary group-hover:to-primary/80 
                           transition-all duration-300 truncate w-full text-center group-hover:translate-y--3"
                title={partner.name}
              >
                {partner.name}
              </span>
              <span
                className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 
                           transition-all duration-300 truncate w-full text-center absolute 
                           transform translate-y-2 group-hover:translate-y-2"
                title={partner.type}
              >
                {partner.type}
              </span>
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
    <section className="relative py-16 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />

      {/* Animated Dots Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-4 p-1.5 pl-2 pr-3 rounded-full bg-primary/5 text-primary">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium">Trusted Partners</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
            Backed by Rwanda's Leading Organizations
          </h2>
          <p className="text-gray-600 text-lg">
            Collaborating with top institutions to drive innovation across East Africa
          </p>
        </motion.div>

        {/* Marquee Rows */}
        <div className="space-y-4">
          <MarqueeRow partners={partners} speed={25} reverse={false} />
          <MarqueeRow partners={partners} speed={18} reverse={true} />
        </div>
      </div>
    </section>
  );
}
