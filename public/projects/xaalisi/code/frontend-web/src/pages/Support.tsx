import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { HelpCircle, Plus, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface TicketItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority?: string;
  created_at: string;
}

const Support = () => {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTickets = async () => {
    try {
      const data = await fetchAPI('/crm/tickets');
      setTickets(data.tickets || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    try {
      await fetchAPI('/crm/tickets', {
        method: 'POST',
        body: JSON.stringify({ title: subject, description })
      });
      setSubject('');
      setDescription('');
      setPriority('MEDIUM');
      setShowForm(false);
      loadTickets();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du ticket');
    } finally {
      setFormLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return { bg: '#DBEAFE', color: '#D4AF37', icon: Clock };
      case 'EN_COURS': return { bg: '#FEF3C7', color: '#D4AF37', icon: Clock };
      case 'RESOLU': return { bg: '#D1FAE5', color: '#059669', icon: CheckCircle };
      default: return { bg: '#F3F4F6', color: '#8B95A5', icon: Clock };
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'URGENT': return '#DC2626';
      case 'HIGH': return '#F59E0B';
      case 'MEDIUM': return '#3B82F6';
      case 'LOW': return '#10B981';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', gap: '32px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Support & Réclamations</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px' }}>Gérez vos tickets de support et suivez leur résolution</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ padding: '12px 20px', fontSize: '14px' }}>
          <Plus size={18} />
          Nouveau Ticket
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Nouvelle Réclamation</h2>
          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>{error}</div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Objet *</label>
              <input type="text" className="input-field" value={subject} onChange={e => setSubject(e.target.value)} required placeholder="Ex: Problème de transfert" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Description *</label>
              <textarea className="input-field" value={description} onChange={e => setDescription(e.target.value)} required rows={4} placeholder="Décrivez votre problème en détail..." style={{ resize: 'vertical' }} />
            </div>
            <button type="submit" className="btn-primary" disabled={formLoading} style={{ alignSelf: 'flex-end' }}>
              {formLoading ? 'Envoi en cours...' : 'Envoyer la Réclamation'}
            </button>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8B95A5' }}>Chargement...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#8B95A5' }}>
            <HelpCircle size={48} color="#D1D5DB" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600 }}>Aucun ticket</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>Créez un ticket si vous avez besoin d'assistance.</p>
          </div>
        ) : (
          tickets.map((ticket, idx) => {
            const statusStyle = getStatusStyle(ticket.status);
            const StatusIcon = statusStyle.icon;
            return (
              <div key={ticket.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '20px 24px',
                borderBottom: idx < tickets.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: getPriorityDot(ticket.priority || 'MEDIUM'),
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>{ticket.title}</div>
                  <div style={{ color: '#8B95A5', fontSize: '13px', marginTop: '4px' }}>
                    {ticket.description.length > 80 ? ticket.description.substring(0, 80) + '...' : ticket.description}
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  <StatusIcon size={14} />
                  {ticket.status.replace('_', ' ')}
                </div>
                <span style={{ fontSize: '12px', color: '#555E6E', whiteSpace: 'nowrap' }}>
                  {new Date(ticket.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Support;
