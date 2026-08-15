import React from 'react';
import { motion } from 'framer-motion';

const About = ({ t }) => {
  return (
    <div>
      <h2 className="section-title">
        <span className="gradient-text">01.</span> {t('about.title')}
      </h2>
      <motion.div
        className="about-content glass"
        style={{ padding: '30px', borderRadius: 'var(--border-radius)' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p>{t('about.description')}</p>
      </motion.div>
    </div>
  );
};

export default About;
