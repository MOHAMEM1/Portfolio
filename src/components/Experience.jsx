import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, GraduationCap, Calendar, MapPin } from 'lucide-react';

const Experience = ({ t }) => {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' or 'education'

  const experienceData = t('experience', { returnObjects: true });
  
  if (!experienceData || !experienceData.jobs) return null;

  const currentData = activeTab === 'jobs' ? experienceData.jobs : experienceData.education;

  return (
    <div>
      <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>
        <span className="gradient-text">03.</span> {experienceData.title}
      </h2>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '3rem', 
        background: 'rgba(255, 255, 255, 0.03)', 
        padding: '8px', 
        borderRadius: '40px', 
        width: 'fit-content',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <button 
          onClick={() => setActiveTab('jobs')}
          style={{
            background: activeTab === 'jobs' ? 'var(--accent-gradient)' : 'transparent',
            border: 'none',
            color: activeTab === 'jobs' ? 'white' : 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: activeTab === 'jobs' ? '600' : '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'jobs' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          <Briefcase size={18} />
          {experienceData.jobsTitle}
        </button>
        <button 
          onClick={() => setActiveTab('education')}
          style={{
            background: activeTab === 'education' ? 'var(--accent-gradient)' : 'transparent',
            border: 'none',
            color: activeTab === 'education' ? 'white' : 'var(--text-secondary)',
            fontSize: '1rem',
            fontWeight: activeTab === 'education' ? '600' : '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '30px',
            transition: 'all 0.3s ease',
            boxShadow: activeTab === 'education' ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none'
          }}
        >
          <GraduationCap size={18} />
          {experienceData.eduTitle}
        </button>
      </div>

      {/* Timeline */}
      <div className="timeline" style={{ position: 'relative', paddingLeft: '2rem' }}>
        {/* Ligne verticale de la timeline */}
        <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', background: 'var(--border-color)' }}></div>
        
        {currentData.map((item, index) => (
          <motion.div 
            key={index}
            style={{ position: 'relative', marginBottom: '2.5rem' }}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Point sur la timeline */}
            <div style={{ 
              position: 'absolute', 
              left: '-2rem', 
              top: '5px', 
              width: '16px', 
              height: '16px', 
              borderRadius: '50%', 
              background: 'var(--bg-primary)', 
              border: '2px solid var(--primary-color)',
              zIndex: 1
            }}></div>

            <div className="timeline-content glass" style={{ padding: '25px', borderRadius: 'var(--border-radius)' }}>
              <h3 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {activeTab === 'jobs' ? item.role : item.degree}
              </h3>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)' }}>
                  {activeTab === 'jobs' ? <Briefcase size={16} /> : <GraduationCap size={16} />}
                  {activeTab === 'jobs' ? item.company : item.school}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={16} />
                  {item.period}
                </span>
              </div>
              
              {item.description && (
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {item.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Experience;
