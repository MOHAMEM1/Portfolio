import React, { useState } from 'react';
import { Globe, Users, Mail, Phone, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = ({ t }) => {
  const [showToast, setShowToast] = useState(false);

  const handleCopyEmail = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText('mohamdlhfid8@gmail.com');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 6000);
  };

  return (
    <footer id="contact">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="section-title" style={{ justifyContent: 'center', margin: '0 auto 30px' }}>
          {t('contact.title')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: '1.6' }}>
          {t('contact.description')}
        </p>

        <div className="social-links">
          <a href="https://github.com/MOHAMEM1" target="_blank" rel="noopener noreferrer" className="social-link-wrapper" title={t('contact.github')}>
            <div className="social-link"><Globe size={24} color="currentColor" /></div>
            <span className="social-label">GitHub</span>
          </a>
          <a href="https://www.linkedin.com/in/mohamedelmahfoudi" target="_blank" rel="noopener noreferrer" className="social-link-wrapper" title={t('contact.linkedin')}>
            <div className="social-link"><Users size={24} color="currentColor" /></div>
            <span className="social-label">LinkedIn</span>
          </a>
          <a href="#" onClick={handleCopyEmail} className="social-link-wrapper" title="Email">
            <div className="social-link"><Mail size={24} color="currentColor" /></div>
            <span className="social-label">Email</span>
          </a>
          <a href="https://wa.me/212611638842" target="_blank" rel="noopener noreferrer" className="social-link-wrapper" title="WhatsApp">
            <div className="social-link"><Phone size={24} color="currentColor" /></div>
            <span className="social-label">WhatsApp</span>
          </a>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('footer.builtWith')}
        </p>
      </motion.div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="email-toast"
          >
            <Check size={24} color="#000" />
            <span>Email copié : mohamdlhfid8@gmail.com</span>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
};

export default Footer;
