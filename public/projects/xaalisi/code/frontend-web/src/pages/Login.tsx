import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: formData
      });
      
      login(data.access_token, username);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, #0B0E11 0%, #111820 100%)', padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Background decorative elements */}
      <div style={{ position: 'absolute', top: '-200px', right: '-200px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-150px', left: '-150px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '48px', position: 'relative', overflow: 'hidden' }}>
        
        {/* Decorative gold glow */}
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #E5C158 0%, #D4AF37 50%, #AA820A 100%)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)' }}>
            <Wallet color="#0B0E11" size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#D4AF37', letterSpacing: '1px' }}>XAALISI</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px', textAlign: 'center', fontSize: '14px' }}>Votre portefeuille numérique Premium</p>
        </div>

        {error && (
          <div className="animate-fade-in" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', zIndex: 1 }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Numéro de Téléphone</label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="+223 ••• •••"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code PIN de Sécurité</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="● ● ● ●"
              maxLength={4}
              required
              style={{ letterSpacing: '4px', fontFamily: 'monospace', fontSize: '20px' }}
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '16px', padding: '16px' }}>
            {loading ? 'Connexion en cours...' : 'Accéder au compte'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '14px', color: '#8B95A5' }}>
          Nouveau client ? <Link to="/signup" style={{ color: '#D4AF37', fontWeight: 700, marginLeft: '4px' }}>Ouvrir un compte</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
