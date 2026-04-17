'use client';

import { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureSectionProps {
  title: string;
  description: string;
  highlights: string[];
  visual: ReactNode;
  reversed?: boolean;
}

export function FeatureSection({ title, description, highlights, visual, reversed = false }: FeatureSectionProps) {
  return (
    <section className="relative py-24">
      <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(171,81,197,0.4) 30%, rgba(171,81,197,0.6) 50%, rgba(171,81,197,0.4) 70%, transparent)' }} />
      <div className="container mx-auto px-6">
        <div className={`grid grid-cols-1 items-start gap-12 lg:grid-cols-2 ${reversed ? 'lg:grid-flow-dense' : ''}`}>
          {/* Text Content */}
          <motion.div
            className={reversed ? 'lg:col-start-2' : ''}
            initial={{ opacity: 0, x: reversed ? 60 : -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <motion.h2
              className="mb-4 mx-auto max-w-4xl bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold leading-tight text-transparent sm:text-4xl md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {title}
            </motion.h2>
            <motion.p
              className="mb-6 text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {description}
            </motion.p>

            {/* Highlights */}
            <div className="space-y-3">
              {highlights.map((highlight, i) => (
                <motion.div
                  key={highlight}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                >
                  <motion.div
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#AB51C5]/20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.35 + i * 0.1 }}
                  >
                    <Check className="h-4 w-4 text-[#AB51C5]" />
                  </motion.div>
                  <span className="text-foreground">{highlight}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            className={reversed ? 'lg:col-start-1 lg:row-start-1' : ''}
            initial={{ opacity: 0, x: reversed ? -60 : 60, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-[#AB51C5]/20 via-[#AB51C5]/10 to-transparent blur-3xl"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              />
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-secondary/80 shadow-2xl"
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                {visual}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
