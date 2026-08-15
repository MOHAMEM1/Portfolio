import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { Code, Key, Link as LinkIcon, ShieldAlert } from 'lucide-react';

const Developer = () => {
  const { username } = useAuth();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<{client_id: string, client_secret: string} | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateKeys = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI('/open-banking/credentials', { method: 'POST' });
      setCredentials(res);
    } catch (err: any) {
      setError("Erreur : Seules les Entreprises et Marchands peuvent générer des clés API.");
    } finally {
      setLoading(false);
    }
  };

  const registerWebhook = async () => {
    if (!webhookUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAPI('/open-banking/webhooks', {
        method: 'POST',
        body: JSON.stringify({ event_type: 'PAYMENT_RECEIVED', target_url: webhookUrl })
      });
      setWebhookStatus(`Webhook enregistré ! Secret: ${res.secret_key}`);
    } catch (err: any) {
      setError("Erreur lors de l'enregistrement du webhook.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '800px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Code color="#2563EB" />
          Portail Développeur
        </h1>
        <p style={{ color: '#8B95A5', marginTop: '8px' }}>
          Gérez vos clés API et vos Webhooks pour l'intégration Open Banking (B2B).
        </p>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#EF4444', padding: '16px', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <ShieldAlert size={20} />
          {error}
        </div>
      )}

      {/* Clés API */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Key size={20} color="#10B981" />
          Accès API (OAuth2)
        </h3>
        <p style={{ color: '#8B95A5', marginBottom: '24px', fontSize: '14px' }}>
          Générez un Client ID et un Client Secret pour obtenir des jetons d'accès (B2B) et automatiser vos transactions.
        </p>

        {!credentials ? (
          <button 
            onClick={generateKeys}
            disabled={loading}
            style={{ backgroundColor: '#10B981', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Génération...' : 'Générer mes clés API'}
          </button>
        ) : (
          <div style={{ backgroundColor: '#141820', padding: '20px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)' }}>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#8B95A5', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Client ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.15)' }}>
                {credentials.client_id}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#8B95A5', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Client Secret (Ne le partagez jamais)</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px', backgroundColor: 'rgba(239,68,68,0.08)', color: '#B91C1C', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #FCA5A5' }}>
                {credentials.client_secret}
              </div>
            </div>
            <p style={{ color: '#D4AF37', fontSize: '12px', marginTop: '12px', fontWeight: 500 }}>
              ⚠️ Ce secret ne sera plus jamais affiché. Copiez-le maintenant.
            </p>
          </div>
        )}
      </div>

      {/* Webhooks */}
      <div className="card">
        <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <LinkIcon size={20} color="#8B5CF6" />
          Webhooks (Temps réel)
        </h3>
        <p style={{ color: '#8B95A5', marginBottom: '24px', fontSize: '14px' }}>
          Configurez une URL pour recevoir des notifications HTTPS lorsqu'un événement se produit (ex: paiement reçu).
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="url"
            placeholder="https://votre-serveur.com/webhook"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.15)', outline: 'none' }}
          />
          <button 
            onClick={registerWebhook}
            disabled={loading || !webhookUrl}
            style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '0 24px', borderRadius: '12px', fontWeight: 600, border: 'none', cursor: webhookUrl ? 'pointer' : 'not-allowed', opacity: webhookUrl ? 1 : 0.5 }}
          >
            Enregistrer
          </button>
        </div>

        {webhookStatus && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'rgba(16,185,129,0.08)', color: '#047857', borderRadius: '8px', fontSize: '14px', fontWeight: 500 }}>
            {webhookStatus}
          </div>
        )}
      </div>

    </div>
  );
};

export default Developer;
