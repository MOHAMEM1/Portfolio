import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Shield, CheckCircle, Star, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Limits = () => {
  const [kycTier, setKycTier] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKyc = async () => {
      try {
        const dashboardRes = await fetchAPI(`/digital-banking/me/dashboard`);
        setKycTier(dashboardRes.kyc_tier || 1);
      } catch (error) {
        console.error("Failed to fetch KYC", error);
      } finally {
        setLoading(false);
      }
    };
    loadKyc();
  }, []);

  const limits = [
    {
      level: 'Niveau 1',
      title: 'Plafond Initial',
      amount: '200,000 FCFA',
      desc: 'Solde maximum autorisé sans pièce d\'identité.',
      icon: Shield,
      color: 'var(--text-secondary)',
      bgColor: 'var(--surface-hover)',
      active: kycTier === 1
    },
    {
      level: 'Niveau 2',
      title: 'Plafond Standard',
      amount: '2,000,000 FCFA',
      desc: 'Solde maximum après vérification d\'identité (CNI/Passeport).',
      icon: CheckCircle,
      color: 'var(--info)',
      bgColor: 'var(--info-bg)',
      active: kycTier === 2
    },
    {
      level: 'Niveau 3',
      title: 'Plafond Premium',
      amount: '10,000,000 FCFA',
      desc: 'Solde maximum avec justificatif de domicile et de revenus.',
      icon: Star,
      color: 'var(--gold)',
      bgColor: 'var(--gold-glow)',
      active: kycTier >= 3
    }
  ];

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Limites de Transaction (KYC)</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Conformément à la réglementation de la BCEAO, vos limites de transaction dépendent de votre niveau de vérification.</p>
      </div>

      <div style={{ 
        backgroundColor: 'rgba(245, 158, 11, 0.1)', 
        border: '1px solid rgba(245, 158, 11, 0.2)', 
        borderRadius: '12px', 
        padding: '16px 20px', 
        display: 'flex', 
        gap: '16px', 
        alignItems: 'flex-start',
        marginBottom: '32px'
      }}>
        <AlertTriangle color="#F59E0B" size={24} style={{ flexShrink: 0 }} />
        <div>
          <h3 style={{ fontWeight: 600, color: '#F59E0B', marginBottom: '4px' }}>Important</h3>
          <p style={{ fontSize: '14px', color: 'rgba(245, 158, 11, 0.8)', lineHeight: '1.5' }}>Pour des raisons de sécurité et de conformité, tout dépassement de vos limites actuelles bloquera la transaction. Augmentez votre niveau pour lever ces restrictions.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {limits.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="card" style={{ 
              position: 'relative', 
              padding: '32px 24px', 
              border: item.active ? '2px solid var(--gold)' : '2px solid transparent',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {item.active && (
                <div style={{ 
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: 'var(--gold)', color: '#000', padding: '4px 12px', borderRadius: '100px',
                  fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px'
                }}>
                  Niveau Actuel
                </div>
              )}
              
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '50%', 
                backgroundColor: item.bgColor, color: item.color, 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px'
              }}>
                <Icon size={32} />
              </div>
              
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '8px' }}>{item.level}</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>{item.title}</h3>
              <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', color: item.active ? 'var(--gold)' : 'var(--text-primary)' }}>
                {item.amount}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '24px', flex: 1 }}>
                {item.desc}
              </p>
              
              {!item.active && (
                <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  Débloquer <ArrowRight size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: '40px', textAlign: 'center', marginTop: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Besoin de limites personnalisées ?</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Si vous êtes une entreprise ou un grand compte, contactez notre service client pour une étude de dossier.</p>
        <Link to="/support" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0 32px' }}>
          Contacter le Support
        </Link>
      </div>
    </div>
  );
};

export default Limits;
