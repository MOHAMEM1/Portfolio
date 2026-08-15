import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { Wallet } from 'lucide-react';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: password,
          pin_code: pinCode
        })
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #0B0E11 0%, #111820 100%)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '-200px', left: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '36px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #AA820A 100%)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)' }}>
            <Wallet color="#0B0E11" size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>Créer un compte</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px', fontSize: '14px' }}>Rejoignez XAALISI dès aujourd'hui</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro de Téléphone</label>
            <input type="text" className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex. 770000000" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mot de passe</label>
            <input type="password" className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Votre mot de passe" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code PIN (4 chiffres)</label>
            <input type="password" className="input-field" value={pinCode} onChange={(e) => setPinCode(e.target.value)} placeholder="●●●●" maxLength={4} required style={{ letterSpacing: '6px', fontFamily: 'monospace', fontSize: '18px' }} />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '10px', padding: '16px' }}>
            {loading ? 'Création en cours...' : 'Créer le compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '14px', color: '#8B95A5' }}>
          Déjà un compte ? <Link to="/login" style={{ color: '#D4AF37', fontWeight: 700 }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
