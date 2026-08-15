import React from 'react';
import { motion } from 'framer-motion';
import { Server, Smartphone, Cloud, Briefcase } from 'lucide-react';

const Skills = ({ t }) => {
  const skillsData = t('about.skills', { returnObjects: true });
  
  // Mappage des icônes par clé de catégorie
  const icons = {
    backend: <Server className="skill-category-icon" size={24} />,
    frontend: <Smartphone className="skill-category-icon" size={24} />,
    devops: <Cloud className="skill-category-icon" size={24} />,
    business: <Briefcase className="skill-category-icon" size={24} />
  };

  return (
    <div>
      <h2 className="section-title">
        <span className="gradient-text">02.</span> {t('about.skillsTitle')}
      </h2>
      
      <div className="skills-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {skillsData && Object.entries(skillsData).map(([key, category], index) => (
          <motion.div
            key={key}
            className="skill-category-card glass"
            style={{ padding: '25px', borderRadius: 'var(--border-radius)', display: 'flex', flexDirection: 'column', gap: '15px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary-color)' }}>
              {icons[key]}
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-primary)' }}>{category.title}</h3>
            </div>
            
            <div className="skills-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
              {category.items.map((item, idx) => (
                <div key={idx} className="skill-tag" style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '5px 12px',
                  borderRadius: '15px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Skills;
