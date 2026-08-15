import React, { useState } from 'react';
import { fetchAPI } from '../services/api';
import { Lock, Shield, CheckCircle } from 'lucide-react';

const Security = () => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (newPin !== confirmPin) {
      setError("Les nouveaux codes PIN ne correspondent pas.");
      return;
    }
    
    setLoading(true);
    try {
      await fetchAPI('/auth/pin', {
        method: 'PUT',
        body: JSON.stringify({
          current_pin: currentPin,
          new_pin: newPin
        })
      });
      setSuccess(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification du code PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Sécurité et Authentification</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Gérez votre code PIN et sécurisez votre compte XAALISI.</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--info-bg)', color: 'var(--info)', borderRadius: '12px' }}>
            <Shield size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Modifier le code PIN</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Votre code PIN est requis pour valider les transactions.</p>
          </div>
        </div>

        <div style={{ padding: '32px 24px' }}>
          {error && (
            <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: 'var(--danger)', fontSize: '14px', fontWeight: 500 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--success)' }}>
              <CheckCircle size={20} />
              <p style={{ fontWeight: 600, fontSize: '14px' }}>Votre code PIN a été mis à jour avec succès.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code PIN Actuel</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--gold)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '48px' }}
                  placeholder="Entrez votre code actuel"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Nouveau Code PIN</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--gold)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '48px' }}
                  placeholder="4 à 6 chiffres"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirmer le Nouveau Code PIN</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--gold)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '48px' }}
                  placeholder="Répétez le nouveau code"
                />
              </div>
            </div>

            <div style={{ paddingTop: '8px' }}>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? "Mise à jour..." : "Mettre à jour le code PIN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Security;
