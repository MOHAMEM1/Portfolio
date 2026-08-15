import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Download } from 'lucide-react';

const Statements = () => {
  const { username } = useAuth();
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStatement = async () => {
      if (!username) return;
      try {
        const data = await fetchAPI(`/statements/${username}`);
        if (data.transactions) {
          setStatement(data);
        } else {
          setError(data.message || 'No statements available');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load statements');
      } finally {
        setLoading(false);
      }
    };
    loadStatement();
  }, [username]);

  const handleDownload = () => {
    if (!statement) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(statement, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `statement_${username}_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '32px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Account Statements</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px' }}>View and download your transaction history</p>
        </div>
        <button onClick={handleDownload} disabled={!statement} className="btn-primary" style={{ backgroundColor: '#10B981' }}>
          <Download size={20} />
          Download PDF / JSON
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8B95A5' }}>Loading statement data...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#8B95A5' }}>{error}</div>
        ) : statement ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(212,175,55,0.1)', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', color: '#8B95A5' }}>Account Holder</div>
                <div style={{ fontWeight: 600, fontSize: '18px' }}>{statement.owner}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: '#8B95A5' }}>Statement Date</div>
                <div style={{ fontWeight: 600 }}>{new Date(statement.generated_at).toLocaleDateString()}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', color: '#8B95A5', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 8px', color: '#8B95A5', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 8px', color: '#8B95A5', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px 8px', color: '#8B95A5', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {statement.transactions.map((tx: any) => (
                  <tr key={tx.transaction_id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px' }}>{new Date(tx.date).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 500 }}>{tx.description}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '12px', 
                        fontWeight: 600,
                        backgroundColor: tx.type === 'CREDIT' ? '#D1FAE5' : '#FEE2E2',
                        color: tx.type === 'CREDIT' ? '#10B981' : '#EF4444'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>
                      {tx.type === 'CREDIT' ? '+' : '-'}{tx.amount} FCFA
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Statements;
