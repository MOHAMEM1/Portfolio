import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { CheckCircle, XCircle, Clock, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface ApprovalRequest {
  id: number;
  initiator: string;
  approver: string;
  action_type: string;
  payload: string;
  status: string;
  created_at: string;
}

const Workflows = () => {
  const [pendingRequests, setPendingRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI('/workflows/pending');
      setPendingRequests(data);
    } catch (err: any) {
      setError("Impossible de charger les demandes d'approbation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleProcess = async (id: number, action: 'APPROVE' | 'REJECT') => {
    setProcessingId(id);
    setError('');
    setSuccess('');
    try {
      await fetchAPI(`/workflows/${id}/process`, {
        method: 'POST',
        body: JSON.stringify({ action })
      });
      setSuccess(`Demande ${action === 'APPROVE' ? 'approuvée' : 'rejetée'} avec succès.`);
      loadRequests();
    } catch (err: any) {
      setError(err.message || "Erreur lors du traitement de la demande.");
    } finally {
      setProcessingId(null);
    }
  };

  const parsePayload = (payloadStr: string) => {
    try {
      return JSON.parse(payloadStr);
    } catch {
      return {};
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck color="#D4AF37" size={32} />
          Validation des Opérations (Workflows)
        </h1>
        <p style={{ color: '#8B95A5', marginTop: '8px' }}>
          Espace dédié aux managers pour la validation des opérations initiées par les employés.
        </p>
      </div>

      {error && <div style={{ padding: '16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
      {success && <div style={{ padding: '16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}

      {/* Main Content */}
      <div className="card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="#D4AF37" />
          Demandes en Attente ({pendingRequests.length})
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8B95A5' }}>Chargement...</div>
        ) : pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
            <ShieldCheck size={48} color="#374151" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', color: '#FFF', marginBottom: '8px' }}>Aucune demande en attente</h3>
            <p style={{ color: '#8B95A5' }}>Toutes les opérations ont été traitées.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingRequests.map(req => {
              const payload = parsePayload(req.payload);
              
              return (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: '#141820', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  
                  {/* Info Section */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <span style={{ padding: '4px 10px', backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#D4AF37', borderRadius: '8px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                        {req.action_type === 'TRANSFER_FUNDS' ? 'VIREMENT B2B' : req.action_type}
                      </span>
                      <span style={{ color: '#555E6E', fontSize: '12px' }}>{new Date(req.created_at).toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                        <User size={16} color="#8B95A5" />
                        <span style={{ fontWeight: 600 }}>{req.initiator}</span>
                      </div>
                      
                      {req.action_type === 'TRANSFER_FUNDS' && (
                        <>
                          <ArrowRight size={16} color="#555E6E" />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
                            <span style={{ color: '#8B95A5', fontSize: '13px' }}>Vers:</span>
                            <span style={{ fontWeight: 600 }}>{payload.receiver}</span>
                          </div>
                          
                          <div style={{ marginLeft: 'auto', marginRight: '24px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: '#FFF' }}>
                              {parseFloat(payload.amount).toLocaleString()} <span style={{ fontSize: '14px', color: '#8B95A5' }}>FCFA</span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => handleProcess(req.id, 'REJECT')}
                      disabled={processingId === req.id}
                      style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', fontWeight: 600, cursor: processingId === req.id ? 'not-allowed' : 'pointer', opacity: processingId === req.id ? 0.5 : 1 }}
                    >
                      <XCircle size={18} /> Rejeter
                    </button>
                    
                    <button 
                      onClick={() => handleProcess(req.id, 'APPROVE')}
                      disabled={processingId === req.id}
                      style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#10B981', color: '#FFF', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: processingId === req.id ? 'not-allowed' : 'pointer', opacity: processingId === req.id ? 0.5 : 1 }}
                    >
                      <CheckCircle size={18} /> Approuver
                    </button>
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Workflows;
