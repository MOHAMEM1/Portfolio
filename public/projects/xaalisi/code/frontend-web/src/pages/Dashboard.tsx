import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchAPI } from '../services/api';
import { Wallet, ArrowRight, ArrowDownRight, ArrowUpRight, TrendingUp, AlertCircle, FileText, Settings, CreditCard, Download, Send, Zap, Users, Landmark, FileBarChart, Clock, Eye, EyeOff, RefreshCw, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const { username } = useAuth();
  const { t } = useTranslation();
  const [balance, setBalance] = useState<number | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kycTier, setKycTier] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  // Modals state
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const [createAccountPin, setCreateAccountPin] = useState('');
  const [createAccountError, setCreateAccountError] = useState('');
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  // Delete Account Modals
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const dashboardRes = await fetchAPI(`/digital-banking/me/dashboard`);
      setBalance(dashboardRes.total_balance);
      setAccounts(dashboardRes.accounts || []);
      setKycTier(dashboardRes.kyc_tier || 1);

      const histRes = await fetchAPI(`/transactions/history/${username}?limit=5`);
      setTransactions(histRes.transactions || []);
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [username]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createAccountPin.length < 4) {
      setCreateAccountError('Veuillez entrer un code PIN à 4 chiffres.');
      return;
    }
    
    setCreateAccountError('');
    setIsCreatingAccount(true);
    
    try {
      await fetchAPI('/digital-banking/accounts', {
        method: 'POST',
        body: JSON.stringify({ 
          account_type: 'EPARGNE',
          pin_code: createAccountPin 
        })
      });
      setShowCreateAccountModal(false);
      setCreateAccountPin('');
      loadData();
    } catch (err: any) {
      setCreateAccountError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    try {
      setLoading(true);
      setShowDeleteModal(false);
      await fetchAPI(`/digital-banking/accounts/${accountToDelete}`, {
        method: 'DELETE'
      });
      loadData();
    } catch (err: any) {
      setLoading(false);
      setErrorMessage(err.message || 'Erreur lors de la suppression du compte');
      setShowErrorModal(true);
    }
  };

  const operations: Array<{name: string, icon: any, path: string, color: string, bg?: string}> = [
    { name: t('nav.transfer', 'Envoyer'), icon: Send, path: '/transfer', color: '#D4AF37' },
    { name: t('nav.bills', 'Factures'), icon: FileText, path: '/bills', color: '#D4AF37' },
    { name: t('nav.beneficiaries', 'Bénéficiaires'), icon: Users, path: '/beneficiaries', color: '#D4AF37' },
    { name: t('nav.cards', 'Cartes'), icon: CreditCard, path: '/cards', color: '#D4AF37' },
    { name: 'Darét (Tontines)', icon: Landmark, path: '/tontines', color: '#D4AF37' },
    { name: t('nav.statements', 'Relevés'), icon: FileBarChart, path: '/statements', color: '#D4AF37' },
  ];

  const handleDownloadReceipt = () => {
    if (!selectedTx) return;
    
    const isPositive = selectedTx.receiver_id === username || selectedTx.transaction_type === 'DEPOSIT';
    const amountStr = `${isPositive ? '+' : '-'}${selectedTx.amount.toLocaleString()} FCFA`;
    const dateStr = (selectedTx.date || selectedTx.created_at) ? new Date(selectedTx.date || selectedTx.created_at).toLocaleString() : 'Date Inconnue';
    
    const receiptHtml = `
      <html>
        <head>
          <title>Reçu de Transaction - XAALISI</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; }
            .title { font-size: 20px; margin-top: 10px; color: #555; }
            .amount { font-size: 32px; font-weight: bold; color: ${isPositive ? '#10B981' : '#EF4444'}; text-align: center; margin-bottom: 30px; }
            .details { background: #f9f9f9; padding: 20px; border-radius: 12px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .label { color: #666; font-size: 14px; }
            .value { font-weight: bold; font-size: 14px; text-transform: capitalize; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">XAALISI</div>
            <div class="title">Reçu de Transaction</div>
          </div>
          <div class="amount">${amountStr}</div>
          <div class="details">
            <div class="row"><span class="label">Date</span><span class="value">${dateStr}</span></div>
            <div class="row"><span class="label">ID Transaction</span><span class="value">${selectedTx.id}</span></div>
            <div class="row"><span class="label">Titre</span><span class="value">${selectedTx.title}</span></div>
            <div class="row"><span class="label">Type</span><span class="value">${selectedTx.transaction_type}</span></div>
            <div class="row"><span class="label">Frais</span><span class="value">${(selectedTx.fee || 0).toLocaleString()} FCFA</span></div>
            <div class="row"><span class="label">Statut</span><span class="value">${selectedTx.status}</span></div>
          </div>
          <div class="footer">
            Document généré le ${new Date().toLocaleString()}<br>
            XAALISI - Votre banque numérique
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', position: 'relative' }}>
      
      {/* ===== GOLD BALANCE HEADER (matching mobile app) ===== */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(229, 193, 88, 0.95) 0%, rgba(212, 175, 55, 0.88) 50%, rgba(170, 130, 10, 0.92) 100%)',
          borderRadius: '28px',
          padding: '36px 32px 52px',
          position: 'relative',
          overflow: 'hidden',
          border: '1.5px solid rgba(212, 175, 55, 0.3)',
        }}>
          {/* SVG Wave decorations — matching mobile */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.6 }} viewBox="0 0 800 350" preserveAspectRatio="none">
            <path d="M 300,-20 C 450,80 600,120 820,130" fill="none" stroke="rgba(212, 175, 55, 0.2)" strokeWidth="40" strokeLinecap="round" />
            <path d="M 380,-20 C 500,80 640,160 820,200" fill="none" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="20" strokeLinecap="round" />
            <path d="M 380,-20 C 500,80 640,160 820,200" fill="none" stroke="rgba(255, 255, 255, 0.12)" strokeWidth="8" strokeLinecap="round" />
            <path d="M 450,-20 C 550,100 680,220 820,280" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="3" strokeLinecap="round" />
            <path d="M -20,310 C 200,325 550,310 820,260" fill="none" stroke="rgba(212, 175, 55, 0.12)" strokeWidth="15" strokeLinecap="round" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#000' }}>Solde Principal</span>
                <button onClick={() => setShowBalance(!showBalance)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                  {showBalance ? <EyeOff size={18} color="#000" /> : <Eye size={18} color="#000" />}
                </button>
              </div>
              <button onClick={loadData} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #D4AF37', cursor: 'pointer' }}>
                <RefreshCw size={16} color="#D4AF37" className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <span style={{ color: '#000', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>FCFA</span>
              {showBalance ? (
                <span style={{ color: '#000', fontSize: '48px', fontWeight: 800, letterSpacing: '-2px', lineHeight: 1 }}>
                  {balance !== null ? balance.toLocaleString() : '---'}
                </span>
              ) : (
                <span style={{ color: '#000', fontSize: '40px', letterSpacing: '6px', lineHeight: 1 }}>••••••••</span>
              )}
            </div>
          </div>
        </div>

        {/* Overlap spending tag (like mobile app) moved outside hidden overflow */}
        <div style={{
          position: 'absolute',
          bottom: '-22px',
          left: '24px',
          right: '24px',
          height: '44px',
          borderRadius: '22px',
          backgroundColor: '#000',
          border: '1.5px solid #D4AF37',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
          zIndex: 5,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(212, 175, 55, 0.15)',
            padding: '6px 12px', borderRadius: '100px', border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <TrendingUp size={14} color="#D4AF37" />
            <span style={{ color: '#FFF', fontSize: '12px' }}>
              {t('dashboard.verified_wallet')} • <span style={{ color: '#D4AF37', fontWeight: 700 }}>{t('dashboard.kyc_level')} {kycTier}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ===== OPERATIONS GRID ===== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', letterSpacing: '-0.3px' }}>{t('dashboard.operations.title')}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {operations.map((op) => {
            const Icon = op.icon;
            return (
              <Link key={op.name} to={op.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  borderRadius: '16px',
                  border: '1.5px solid rgba(212, 175, 55, 0.25)',
                  overflow: 'hidden',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}>
                  <div style={{ height: '28px', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#D4AF37', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{op.name}</span>
                  </div>
                  <div style={{ height: '68px', backgroundColor: '#141820', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '50%',
                      backgroundColor: op.bg || 'rgba(212, 175, 55, 0.1)',
                      border: `1px solid ${op.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={22} color={op.bg ? '#000' : op.color} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ===== MES COMPTES ===== */}
      {accounts.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#FFF' }}>Mes Comptes ({accounts.length})</h2>
            {/* Show create button if less than 3 accounts to avoid unlimited creation */}
            {accounts.length < 3 && (
              <button 
                onClick={() => {
                  setCreateAccountPin('');
                  setCreateAccountError('');
                  setShowCreateAccountModal(true);
                }} 
                style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 600, background: 'none', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '20px', padding: '6px 16px', cursor: 'pointer' }}
              >
                + Compte Épargne
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {accounts.map(acc => (
              <div key={acc.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontWeight: 600, color: '#FFF', textTransform: 'capitalize', fontSize: '14px' }}>Compte {acc.type.toLowerCase()}</h4>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '12px', backgroundColor: acc.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(212, 175, 55, 0.1)', color: acc.status === 'ACTIVE' ? '#10B981' : '#D4AF37', fontWeight: 600, border: `1px solid ${acc.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : 'rgba(212,175,55,0.2)'}` }}>{acc.status}</span>
                    {acc.type !== 'COURANT' && (
                      <button onClick={(e) => {
                         e.stopPropagation();
                         setAccountToDelete(acc.id);
                         setShowDeleteModal(true);
                      }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px', fontSize: '16px', fontWeight: 'bold' }}>
                        &times;
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#FFF' }}>{acc.balance.toLocaleString()} <span style={{ fontSize: '14px', color: '#8B95A5' }}>FCFA</span></div>
                <div style={{ color: '#555E6E', fontSize: '11px', marginTop: '8px' }}>ID: {acc.id}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TRANSACTIONS RÉCENTES ===== */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF' }}>{t('dashboard.recent_activity')}</h2>
          <Link to="/history" style={{ color: '#D4AF37', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>{t('dashboard.see_all')}</Link>
        </div>
        
        {transactions.length === 0 ? (
          <div className="card" style={{ padding: '48px', textAlign: 'center', borderStyle: 'dashed' }}>
            <div style={{ color: '#555E6E', marginBottom: '8px', fontSize: '28px' }}>😴</div>
            <p style={{ color: '#8B95A5', fontSize: '14px' }}>{t('dashboard.no_activity')}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {transactions.map((txn) => {
              const isPositive = txn.receiver_id === username || txn.transaction_type === 'DEPOSIT';
              const title = txn.description || (isPositive ? `De ${txn.sender_id || 'System'}` : `Vers ${txn.receiver_id}`);
              
              return (
                <div 
                  key={txn.id} 
                  className="card" 
                  onClick={() => {
                    setSelectedTx({ ...txn, isPositive, title });
                    setShowTxModal(true);
                  }}
                  style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isPositive ? <ArrowDownRight color="#10B981" size={18} /> : <ArrowUpRight color="#EF4444" size={18} />}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 600, fontSize: '14px', color: '#FFF', marginBottom: '2px' }}>{title}</h4>
                      <p style={{ color: '#555E6E', fontSize: '12px' }}>
                        {(txn.date || txn.created_at) ? new Date(txn.date || txn.created_at).toLocaleDateString() : 'Date Inconnue'} • {txn.transaction_type}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: isPositive ? '#10B981' : '#EF4444' }}>
                      {isPositive ? '+' : '-'}{txn.amount.toLocaleString()} FCFA
                    </span>
                    <ChevronRight size={14} color="#555E6E" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ====== MODAL: CREATE ACCOUNT ====== */}
      {showCreateAccountModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>Nouveau Compte Épargne</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Veuillez entrer votre Code PIN à 4 chiffres pour confirmer l'ouverture du compte.</p>
            
            {createAccountError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {createAccountError}
              </div>
            )}
            
            <form onSubmit={handleCreateAccount}>
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="password"
                  className="input-field"
                  value={createAccountPin}
                  onChange={(e) => setCreateAccountPin(e.target.value)}
                  placeholder="Code PIN"
                  maxLength={4}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn" onClick={() => setShowCreateAccountModal(false)} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isCreatingAccount}>
                  {isCreatingAccount ? 'Création...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== MODAL: TRANSACTION DETAILS ====== */}
      {showTxModal && selectedTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowTxModal(false)}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: selectedTx.isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '32px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: selectedTx.isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {selectedTx.isPositive ? <ArrowDownRight color="#10B981" size={28} /> : <ArrowUpRight color="#EF4444" size={28} />}
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: selectedTx.isPositive ? '#10B981' : '#EF4444', marginBottom: '8px' }}>
                {selectedTx.isPositive ? '+' : '-'}{selectedTx.amount.toLocaleString()} FCFA
              </h2>
              <span style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', backgroundColor: selectedTx.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)', color: selectedTx.status === 'COMPLETED' ? '#10B981' : '#D4AF37', fontWeight: 600 }}>{selectedTx.status}</span>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Titre</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{selectedTx.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Date et Heure</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{(selectedTx.date || selectedTx.created_at) ? new Date(selectedTx.date || selectedTx.created_at).toLocaleString() : 'Date Inconnue'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>ID Transaction</span>
                <span style={{ color: '#FFF', fontSize: '13px', fontFamily: 'monospace' }}>{selectedTx.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Frais</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{(selectedTx.fee || 0).toLocaleString()} FCFA</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" onClick={() => setShowTxModal(false)} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
                  Fermer
                </button>
                <button className="btn" onClick={handleDownloadReceipt} style={{ flex: 1, backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold' }}>
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: DELETE CONFIRMATION ====== */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowDeleteModal(false)}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle color="#EF4444" size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#FFF' }}>Supprimer le compte ?</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              Êtes-vous sûr de vouloir supprimer ce compte épargne ? Cette action est irréversible.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn" onClick={() => setShowDeleteModal(false)} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>Annuler</button>
              <button className="btn" onClick={handleDeleteAccount} style={{ flex: 1, backgroundColor: '#EF4444', color: '#FFF', fontWeight: 'bold' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* ====== MODAL: ERROR ====== */}
      {showErrorModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setShowErrorModal(false)}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '24px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <AlertCircle color="#EF4444" size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#FFF' }}>Erreur</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
              {errorMessage}
            </p>
            <button className="btn" onClick={() => setShowErrorModal(false)} style={{ width: '100%', backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold' }}>Compris</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
