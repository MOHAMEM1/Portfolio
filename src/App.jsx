import React from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Footer from './components/Footer';

function App() {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <div className="app-container">
      <Navbar currentLang={i18n.language} toggleLanguage={toggleLanguage} t={t} />
      
      <main>
        <section id="home">
          <Hero t={t} />
        </section>
        
        <section id="about">
          <About t={t} />
        </section>

        <section id="skills">
          <Skills t={t} />
        </section>
        
        <section id="experience">
          <Experience t={t} />
        </section>
        
        <section id="projects">
          <Projects t={t} />
        </section>
      </main>

      <Footer t={t} />
    </div>
  );
}

export default App;
