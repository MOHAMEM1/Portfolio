import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { Users, Plus, Loader, CheckCircle, Search } from 'lucide-react';

interface Tontine {
  id: number;
  name: string;
  creator_id: string;
  contribution_amount: number;
  frequency: string;
  status: string;
  created_at: string;
}

const Tontines = () => {
  const [activeTab, setActiveTab] = useState<'MY' | 'AVAILABLE'>('MY');
  const [tontines, setTontines] = useState<Tontine[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Create form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadTontines = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'MY' ? '/tontines/my' : '/tontines/available';
      const data = await fetchAPI(endpoint);
      setTontines(data || []);
    } catch (err: any) {
      setError("Impossible de charger les tontines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showCreateForm) {
      loadTontines();
    }
  }, [activeTab, showCreateForm]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    
    setSubmitting(true);
    setError('');
    try {
      await fetchAPI('/tontines/create', {
        method: 'POST',
        body: JSON.stringify({
          name,
          contribution_amount: parseFloat(amount),
          frequency
        })
      });
      
      setSuccess('Tontine créée avec succès !');
      setTimeout(() => {
        setSuccess('');
        setShowCreateForm(false);
        setName('');
        setAmount('');
        setActiveTab('MY');
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (id: number) => {
    try {
      await fetchAPI(`/tontines/${id}/join`, { method: 'POST' });
      setSuccess('Vous avez rejoint cette Tontine avec succès !');
      setTimeout(() => {
        setSuccess('');
        setActiveTab('MY');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Impossible de rejoindre la tontine.');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Users color="#D4AF37" size={32} />
            Darét (Tontines Digitales)
          </h1>
          <p style={{ color: '#8B95A5', marginTop: '8px' }}>
            Créez ou rejoignez des groupes d'épargne rotative en toute sécurité.
          </p>
        </div>
        
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: showCreateForm ? '#374151' : '#D4AF37', color: showCreateForm ? '#FFF' : '#000', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {showCreateForm ? 'Retour' : <><Plus size={20} /> Créer un Groupe</>}
        </button>
      </div>

      {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
      {success && <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}

      {showCreateForm ? (
        <div className="card" style={{ padding: '32px', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFF', marginBottom: '24px' }}>Nouveau Groupe d'Épargne</h2>
          
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5' }}>Nom du Groupe</label>
              <input
                type="text"
                className="input-field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Tontine Famille"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5' }}>Cotisation par tour (FCFA)</label>
              <input
                type="number"
                className="input-field"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                required
                min="1000"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5' }}>Fréquence</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {['DAILY', 'WEEKLY', 'MONTHLY'].map(freq => (
                  <div 
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: frequency === freq ? '2px solid #D4AF37' : '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: frequency === freq ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      color: frequency === freq ? '#D4AF37' : '#FFF',
                      fontWeight: 600,
                      fontSize: '13px'
                    }}
                  >
                    {freq === 'DAILY' ? 'JOURNALIER' : freq === 'WEEKLY' ? 'HEBDO' : 'MENSUEL'}
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {submitting ? <Loader size={20} className="animate-spin" /> : <CheckCircle size={20} />}
              {submitting ? 'Création...' : 'Valider la création'}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ padding: '0' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              onClick={() => setActiveTab('MY')}
              style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'MY' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'MY' ? '#D4AF37' : '#8B95A5', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
            >
              Mes Groupes
            </button>
            <button 
              onClick={() => setActiveTab('AVAILABLE')}
              style={{ flex: 1, padding: '16px', background: 'none', border: 'none', borderBottom: activeTab === 'AVAILABLE' ? '2px solid #D4AF37' : '2px solid transparent', color: activeTab === 'AVAILABLE' ? '#D4AF37' : '#8B95A5', fontWeight: 600, cursor: 'pointer', fontSize: '15px' }}
            >
              Groupes Publics
            </button>
          </div>

          {/* List */}
          <div style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8B95A5' }}>Chargement...</div>
            ) : tontines.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                <Search size={48} color="#374151" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', color: '#FFF', marginBottom: '8px' }}>Aucune tontine trouvée</h3>
                <p style={{ color: '#8B95A5' }}>{activeTab === 'MY' ? "Vous n'avez rejoint aucun groupe d'épargne." : "Aucun groupe public n'est disponible pour le moment."}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {tontines.map(t => (
                  <div key={t.id} style={{ padding: '20px', backgroundColor: '#141820', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{t.name}</h3>
                        <p style={{ fontSize: '12px', color: '#8B95A5', marginTop: '4px' }}>Par {t.creator_id}</p>
                      </div>
                      <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '8px', backgroundColor: t.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: t.status === 'PENDING' ? '#F59E0B' : '#10B981', fontWeight: 700 }}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#8B95A5', textTransform: 'uppercase', marginBottom: '4px' }}>Cotisation</div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{t.contribution_amount.toLocaleString()} FCFA</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#8B95A5', textTransform: 'uppercase', marginBottom: '4px' }}>Fréquence</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#FFF' }}>{t.frequency}</div>
                      </div>
                    </div>

                    {activeTab === 'AVAILABLE' && (
                      <button 
                        onClick={() => handleJoin(t.id)}
                        style={{ marginTop: '20px', padding: '10px', width: '100%', backgroundColor: 'transparent', color: '#D4AF37', border: '1px solid #D4AF37', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        Rejoindre ce groupe
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tontines;
