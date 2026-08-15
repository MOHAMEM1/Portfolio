import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { ArrowUpRight, ArrowDownRight, Clock, Search } from 'lucide-react';

const History = () => {
  const { username } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      if (!username) return;
      setLoading(true);
      try {
        const histRes = await fetchAPI(`/transactions/history/${username}?limit=100`);
        setTransactions(histRes.transactions || []);
      } catch (error) {
        console.error("Failed to load history data", error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [username]);

  const filteredTransactions = transactions.filter(tx => 
    (tx.description && tx.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.transaction_type && tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.status && tx.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Historique des Opérations</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Consultez toutes vos transactions passées</p>
        </div>
        
        <div style={{ position: 'relative', width: '250px' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '40px', height: '45px', marginBottom: 0 }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement de l'historique...</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Clock size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Aucune transaction trouvée</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Vous n'avez pas encore effectué de transaction correspondant à cette recherche.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredTransactions.map((tx, index) => {
              const isPositive = tx.receiver_id === username || tx.transaction_type === 'DEPOSIT' || tx.transaction_type === 'DIASPORA';
              const Icon = isPositive ? ArrowDownRight : ArrowUpRight;
              const title = tx.description || (isPositive ? `De ${tx.sender_id || 'System'}` : `Vers ${tx.receiver_id}`);
              const isLast = index === filteredTransactions.length - 1;

              return (
                <div key={tx.id} style={{ 
                  padding: '20px 24px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                  transition: 'background-color 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '46px', height: '46px', borderRadius: '12px', 
                      backgroundColor: isPositive ? 'var(--success-bg)' : 'var(--danger-bg)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      <Icon color={isPositive ? 'var(--success)' : 'var(--danger)'} size={20} />
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '4px' }}>{title}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{(tx.date || tx.created_at) ? new Date(tx.date || tx.created_at).toLocaleString() : 'Date Inconnue'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>•</span>
                        <span style={{ 
                          padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                          backgroundColor: tx.status === 'COMPLETED' ? 'var(--success-bg)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'var(--danger-bg)',
                          color: tx.status === 'COMPLETED' ? 'var(--success)' : tx.status === 'PENDING' ? '#F59E0B' : 'var(--danger)'
                        }}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 700, fontSize: '16px', color: isPositive ? 'var(--success)' : 'var(--danger)' }}>
                      {isPositive ? '+' : '-'} {tx.amount.toLocaleString()} FCFA
                    </p>
                    {tx.currency && tx.currency !== 'XOF' && (
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Taux appliqué</p>
                    )}
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

export default History;
