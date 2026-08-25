import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Code, QrCode, Award, Users, Calendar, FolderOpen, Play } from 'lucide-react';

const Projects = ({ t }) => {
  const githubRepos = [
    'boilerplate-npm',
    'Projet_Essaouira',
    'Projet-Villes-Maroc',
    '25-5-clock',
    'javascript-calculator',
    'drum-machine',
    'markdown-previewer',
    'random-quote-machine'
  ];

  const projects = [
    {
      id: 'xaalisi',
      tags: t('projects.xaalisi.tags', { returnObjects: true }),
      hasLive: true,
      hasCode: true,
      hasVideo: true,
      videoUrl: '/projects/xaalisi/demo.html',
      liveUrl: '/projects/xaalisi/site/index.html',
      appUrl: 'https://expo.dev/accounts/mohamedm1s-team/projects/xaalisi/builds/b29257c8-8105-4119-b6f1-2a85f247d3de',
      codeUrl: '/projects/xaalisi/code.html',
      featured: true,
      highlights: [
        { icon: <Award size={16} />, text: 'Moteur Financier Ledger ACID' },
        { icon: <Code size={16} />, text: 'Architecture Monorepo & Microservices' },
        { icon: <Users size={16} />, text: 'Passerelle USSD & Tontines Digitales' },
        { icon: <FolderOpen size={16} />, text: 'Déploiement Dockerisé' }
      ]
    },
    {
      id: 'indh',
      tags: t('projects.indh.tags', { returnObjects: true }),
      hasCode: true,
      hasLive: true,
      hasGallery: true,
      liveUrl: '/projects/indh/site_live/index.html',
      galleryUrl: '/projects/indh/gallery.html',
      codeUrl: '/projects/indh/code.html',
      featured: true,
      highlights: [
        { icon: <Award size={16} />, text: '1er Prix Compétition Nationale (20 Ans INDH)' },
        { icon: <Users size={16} />, text: 'Équipe IMPACT (5 Membres)' },
        { icon: <FolderOpen size={16} />, text: 'Encadré par Web4Jobs (Témara)' }
      ]
    },
    {
      id: 'bdanow',
      tags: t('projects.bdanow.tags', { returnObjects: true }),
      hasCode: true,
      hasLive: true,
      liveUrl: '/projects/bdanow/index.html',
      codeUrl: '/projects/bdanow/code.html',
      logo: '/projects/bdanow/logo.png',
      featured: true,
      highlights: [
        { icon: <Award size={16} />, text: 'FSJES Souissi — Université Mohammed V' },
        { icon: <Calendar size={16} />, text: '3 mois de développement' },
        { icon: <Users size={16} />, text: 'Chef de Projet + Dev Full-Stack' },
        { icon: <FolderOpen size={16} />, text: '100% fonctionnelle & déployée (Netlify)' }
      ]
    },
    {
      id: 'web4job',
      tags: t('projects.web4job.tags', { returnObjects: true }),
      hasCode: true
    },
    {
      id: 'wordpress',
      tags: t('projects.wordpress.tags', { returnObjects: true }),
      hasLive: true,
      liveUrl: '/projects/wordpress/certificate.png',
      highlights: [
        { icon: <Award size={16} />, text: 'Attestation CMS WordPress (Shop Digital)' },
        { icon: <Calendar size={16} />, text: '3 mois (Nov 2025 - Jan 2026)' },
        { icon: <Users size={16} />, text: 'Encadré par Pr. A. Chakor & Pr. H. El Hamdaoui' }
      ]
    }
  ];

  return (
    <div>
      <h2 className="section-title">
        <span className="gradient-text">04.</span> {t('projects.title')}
      </h2>
      <div className="projects-grid">
        {projects.map((proj, index) => {
          if (proj.id === 'web4job') {
            return (
              <motion.div 
                key="web4job"
                className="project-card glass"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="project-header">
                  <div>
                    <h3 className="project-title">{t(`projects.${proj.id}.title`)}</h3>
                    <div className="project-role">{t(`projects.${proj.id}.role`)}</div>
                  </div>
                </div>
                <p className="project-description" dangerouslySetInnerHTML={{ __html: t(`projects.${proj.id}.description`) }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '30px' }}>
                  {githubRepos.map((repo, i) => (
                    <motion.div
                      key={repo}
                      className="project-card glass"
                      style={{ padding: '20px', minHeight: 'auto' }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                    >
                      <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--accent-color)', wordBreak: 'break-all' }}>{repo}</h4>
                      <div className="project-links">
                        <button 
                          onClick={() => window.open(`https://github.com/MOHAMEM1/${repo}`, '_blank')} 
                          className="btn-secondary" 
                          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }}
                        >
                          <Code size={14} /> Code
                        </button>
                        <button 
                          onClick={() => {
                            if (repo === '25-5-clock') {
                              window.open('/projects/25-5-clock/index.html', '_blank');
                            } else if (repo === 'javascript-calculator') {
                              window.open('/projects/javascript-calculator/index.html', '_blank');
                            } else if (repo === 'markdown-previewer') {
                              window.open('/projects/markdown-previewer/index.html', '_blank');
                            } else if (repo === 'random-quote-machine') {
                              window.open('/projects/random-quote-machine/index.html', '_blank');
                            } else {
                              window.open(`https://mohamem1.github.io/${repo}`, '_blank');
                            }
                          }} 
                          className="btn-secondary btn-live" 
                          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1, justifyContent: 'center' }}
                        >
                          <ExternalLink size={14} /> Live Demo
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          }

          return (
          <motion.div
            key={proj.id}
            className={`project-card glass ${proj.featured ? 'project-featured' : ''}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {proj.logo && (
              <div className="project-logo-container">
                <img src={proj.logo} alt={`${proj.id} logo`} className="project-logo" />
              </div>
            )}

            <div className="project-header">
              <div>
                <h3 className="project-title">{t(`projects.${proj.id}.title`)}</h3>
                <div className="project-role">{t(`projects.${proj.id}.role`)}</div>
              </div>
            </div>
            
            <p className="project-description" dangerouslySetInnerHTML={{ __html: t(`projects.${proj.id}.description`) }} />

            {proj.highlights && (
              <div className="project-highlights">
                {proj.highlights.map((h, i) => (
                  <div key={i} className="highlight-item">
                    {h.icon}
                    <span>{h.text}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="project-tags">
              {Array.isArray(proj.tags) && proj.tags.map((tag, i) => (
                <span key={i} className="project-tag">{tag}</span>
              ))}
            </div>

            <div className="project-links">
              {proj.hasCode && (
                <button
                  onClick={() => window.open(proj.codeUrl || '#', '_blank')}
                  className="btn-secondary"
                >
                  <Code size={16} />
                  {t(`projects.${proj.id}.code`)}
                </button>
              )}
              {proj.hasLive && (
                <button
                  onClick={() => window.open(proj.liveUrl || '#', '_blank')}
                  className="btn-secondary btn-live"
                >
                  <ExternalLink size={16} />
                  {t(`projects.${proj.id}.live`) || 'Live'}
                </button>
              )}
              {proj.hasVideo && (
                <button
                  onClick={() => window.open(proj.videoUrl || '#', '_blank')}
                  className="btn-secondary btn-live"
                  style={{ background: 'linear-gradient(45deg, #FF0000, #990000)', border: 'none' }}
                >
                  <Play size={16} fill="currentColor" />
                  Vidéo App Xaalisi
                </button>
              )}
              {proj.hasGallery && (
                <button
                  onClick={() => window.open(proj.galleryUrl || '#', '_blank')}
                  className="btn-secondary"
                >
                  <Award size={16} />
                  Galerie Photos
                </button>
              )}
            </div>
            
            {proj.appUrl && (
              <div className="project-links" style={{ marginTop: '15px' }}>
                <button
                  onClick={() => window.open(proj.appUrl, '_blank')}
                  className="btn-primary"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                  <QrCode size={18} />
                  {t(`projects.${proj.id}.qr`)}
                </button>
              </div>
            )}
          </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;
