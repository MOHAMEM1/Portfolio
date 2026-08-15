import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Wallet, Plus, Trash2 } from 'lucide-react';

interface Beneficiary {
  id: number;
  beneficiary_account: string;
  bank_code: string | null;
  alias: string | null;
}

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [account, setAccount] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [alias, setAlias] = useState('');

  const loadBeneficiaries = async () => {
    try {
      const data = await fetchAPI('/beneficiaries/');
      setBeneficiaries(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await fetchAPI('/beneficiaries/', {
        method: 'POST',
        body: JSON.stringify({
          beneficiary_account: account,
          bank_code: bankCode || null,
          alias: alias || null
        })
      });
      setAccount('');
      setBankCode('');
      setAlias('');
      loadBeneficiaries();
    } catch (err: any) {
      setError(err.message || 'Failed to add beneficiary');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this beneficiary?')) return;
    try {
      await fetchAPI(`/beneficiaries/${id}`, { method: 'DELETE' });
      loadBeneficiaries();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '32px', flexDirection: 'column' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Beneficiaries</h1>
        <p style={{ color: '#8B95A5', marginTop: '8px' }}>Manage your saved contacts for quick transfers</p>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Add New Beneficiary</h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: 500 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Account/Phone Number *</label>
            <input type="text" className="input-field" value={account} onChange={e => setAccount(e.target.value)} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Alias (Optional)</label>
            <input type="text" className="input-field" value={alias} onChange={e => setAlias(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Bank Code (External only)</label>
            <input type="text" className="input-field" value={bankCode} onChange={e => setBankCode(e.target.value)} placeholder="e.g. BOA, SGBS" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', height: '50px' }}>
              <Plus size={20} />
              {loading ? 'Adding...' : 'Add Beneficiary'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Saved Beneficiaries</h2>
        {beneficiaries.length === 0 ? (
          <p style={{ color: '#8B95A5', textAlign: 'center', padding: '20px' }}>No beneficiaries saved yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {beneficiaries.map(b => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '40px', height: '40px', backgroundColor: '#141820', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Wallet size={20} color="#4B5563" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.alias || b.beneficiary_account}</div>
                    <div style={{ fontSize: '14px', color: '#8B95A5' }}>
                      {b.beneficiary_account} {b.bank_code ? `• Bank: ${b.bank_code}` : '• XAALISI Internal'}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(b.id)} style={{ color: '#EF4444', padding: '8px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Beneficiaries;
