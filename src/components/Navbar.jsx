import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const Navbar = ({ currentLang, toggleLanguage, t }) => {
  return (
    <motion.nav 
      className="navbar glass"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="logo" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <span className="gradient-text">M.EM</span>
      </div>
      
      <ul className="nav-links">
        <li className="nav-item"><a href="#home">{t('nav.home')}</a></li>
        <li className="nav-item"><a href="#about">{t('nav.about')}</a></li>
        <li className="nav-item"><a href="#experience">{t('nav.experience')}</a></li>
        <li className="nav-item"><a href="#projects">{t('nav.projects')}</a></li>
        <li className="nav-item"><a href="#contact">{t('nav.contact')}</a></li>
      </ul>

      <button className="lang-toggle" onClick={toggleLanguage}>
        <Globe size={18} />
        {currentLang.toUpperCase()}
      </button>
    </motion.nav>
  );
};

export default Navbar;
