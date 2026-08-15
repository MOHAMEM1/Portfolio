import React, { useState } from 'react';
import { fetchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Send, Smartphone, Briefcase, Globe, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Transfer = () => {
  const { username } = useAuth();
  const [transferType, setTransferType] = useState('wallet');
  const [receiver, setReceiver] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [amount, setAmount] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Workflows
  const [isWorkflow, setIsWorkflow] = useState(false);
  const [approverName, setApproverName] = useState('manager_entreprise');

  const navigate = useNavigate();

  const handleTransfer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const headers: any = {};
      if (otpCode) headers['X-OTP-Code'] = otpCode;

      if (isWorkflow) {
        // Envoi pour approbation au manager
        const payloadStr = JSON.stringify({
          sender: username,
          receiver: transferType === 'wallet' ? receiver : bankCode + ' ' + receiver,
          amount: parseFloat(amount)
        });
        
        await fetchAPI('/workflows/', {
          method: 'POST',
          body: JSON.stringify({
            approver: approverName,
            action_type: 'TRANSFER_FUNDS',
            payload: payloadStr
          })
        });
        
        setSuccess('Demande de virement envoyée au manager pour approbation.');
        setTimeout(() => navigate('/workflows'), 2000);
        return;
      }

      if (transferType === 'bank') {
        await fetchAPI('/transactions/external', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            receiver_bank_code: bankCode,
            receiver_account: receiver,
            amount: parseFloat(amount),
            pin_code: pinCode
          })
        });
      } else if (transferType === 'diaspora') {
        // Diaspora transfer uses EUR amount which is converted to FCFA in the backend. 
        // We simulate hitting a diaspora specific endpoint or using standard transfer 
        await fetchAPI('/transactions/diaspora', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sender: username,
            receiver,
            amount_eur: parseFloat(amount),
            pin_code: pinCode
          })
        });
      } else {
        await fetchAPI('/transactions/transfer', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            sender: username,
            receiver,
            amount: parseFloat(amount),
            pin_code: pinCode
          })
        });
      }

      if (saveBeneficiary && receiver) {
        try {
          await fetchAPI('/digital-banking/beneficiaries', {
            method: 'POST',
            body: JSON.stringify({
              name: `Bénéficiaire ${receiver}`,
              account_number: receiver,
              bank_name: transferType === 'bank' ? bankCode : 'XAALISI'
            })
          });
        } catch (bErr) {
          console.error("Failed to save beneficiary", bErr);
        }
      }

      navigate('/dashboard');
    } catch (err: any) {
      if (err.message && err.message.includes('MFA_REQUIRED')) {
        try {
          await fetchAPI('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: username })
          });
          setOtpModalVisible(true);
        } catch (otpErr: any) {
          setError('Impossible d\'envoyer le code OTP.');
        }
      } else {
        setError(err.message || 'Transfer Failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpModalVisible(false);
    handleTransfer();
  };

  const getAmountLabel = () => {
    if (transferType === 'diaspora') return 'Montant (EUR)';
    return 'Montant (FCFA)';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)' }}>Envoyer de l'argent</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Transférez des fonds en toute sécurité</p>
      </div>

      <div className="card">
        {error && (
          <div style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { id: 'wallet', label: 'Wallet', icon: Smartphone },
            { id: 'bank', label: 'Banque', icon: Briefcase },
            { id: 'diaspora', label: 'Diaspora (EUR)', icon: Globe },
          ].map(type => {
            const Icon = type.icon;
            const isActive = transferType === type.id;
            return (
              <div 
                key={type.id} 
                onClick={() => setTransferType(type.id)}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: isActive ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? 'var(--gold-glow)' : 'var(--surface-hover)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={24} color={isActive ? 'var(--gold)' : 'var(--text-secondary)'} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--gold)' : 'var(--text-primary)' }}>{type.label}</span>
              </div>
            )
          })}
        </div>

        <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Destinataire
            </label>
            <input
              type="text"
              className="input-field"
              value={receiver}
              onChange={(e) => setReceiver(e.target.value)}
              placeholder={transferType === 'wallet' ? "Numéro XAALISI" : "IBAN / RIB"}
              required
            />
          </div>

          {transferType === 'bank' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code Banque</label>
              <input
                type="text"
                className="input-field"
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="ex: BOA, SGBS"
                required
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{getAmountLabel()}</label>
            <input
              type="number"
              className="input-field"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="1"
              required
            />
            {transferType === 'diaspora' && amount && (
              <p style={{ color: 'var(--success)', fontSize: '13px', marginTop: '8px', fontWeight: 600 }}>
                Le destinataire recevra: {(parseFloat(amount) * 655.95).toLocaleString()} FCFA
              </p>
            )}
          </div>

          <label onClick={() => setSaveBeneficiary(!saveBeneficiary)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '4px',
              border: saveBeneficiary ? 'none' : '1px solid var(--text-muted)',
              backgroundColor: saveBeneficiary ? 'var(--gold)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {saveBeneficiary && <Check size={14} color="#000" />}
            </div>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Enregistrer ce bénéficiaire</span>
          </label>

          {/* Workflow Option */}
          <div style={{ padding: '16px', backgroundColor: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <label onClick={() => setIsWorkflow(!isWorkflow)} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '4px',
                border: isWorkflow ? 'none' : '1px solid var(--text-muted)',
                backgroundColor: isWorkflow ? 'var(--gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {isWorkflow && <Check size={14} color="#000" />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--gold)' }}>Soumettre pour Approbation (Workflow Entreprise)</span>
            </label>
            
            {isWorkflow && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>ID du Manager Validateur</label>
                <input
                  type="text"
                  className="input-field"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  placeholder="manager_entreprise"
                  required
                />
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code PIN (4 chiffres)</label>
            <input
              type="password"
              className="input-field"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="****"
              maxLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <Send size={18} />
            {loading ? 'Traitement...' : 'Confirmer le transfert'}
          </button>
        </form>
      </div>

      {otpModalVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--gold)' }}>Validation OTP requise</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>Un code à 6 chiffres a été envoyé par SMS. Veuillez le saisir pour valider ce transfert.</p>
            <form onSubmit={handleOtpSubmit}>
              <input
                type="text"
                className="input-field"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Ex: 123456"
                maxLength={6}
                required
                style={{ marginBottom: '20px' }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="btn" onClick={() => setOtpModalVisible(false)} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Valider</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfer;
