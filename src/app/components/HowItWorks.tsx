'use client';

import { UserPlus, Link2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: UserPlus,
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: Link2,
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: TrendingUp,
      title: t('step3Title'),
      description: t('step3Desc'),
    },
  ];

  return (
    <section className="relative py-24">
      <div className="absolute bottom-0 left-1/2 h-px w-full max-w-4xl -translate-x-1/2" style={{ background: 'linear-gradient(90deg, transparent, rgba(171,81,197,0.4) 30%, rgba(171,81,197,0.6) 50%, rgba(171,81,197,0.4) 70%, transparent)' }} />
      <div className="container mx-auto px-6">
        <div className="mb-16 text-center">
          <motion.h2
            className="mb-4 bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="relative"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute left-1/2 top-16 hidden h-0.5 w-full origin-left bg-gradient-to-r from-[#AB51C5]/50 to-transparent md:block"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                />
              )}

              <motion.div
                className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-secondary to-secondary/50 p-8 text-center"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <motion.div
                  className="absolute -top-4 left-1/2 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-[#AB51C5] text-sm font-bold"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 + index * 0.2 }}
                >
                  {index + 1}
                </motion.div>

                <motion.div
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#AB51C5]/20"
                  initial={{ scale: 0, rotate: -30 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 + index * 0.2 }}
                >
                  <step.icon className="h-8 w-8 text-[#AB51C5]" />
                </motion.div>

                <motion.h3
                  className="mb-3 text-xl font-bold"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.2 }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.2 }}
                >
                  {step.description}
                </motion.p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
