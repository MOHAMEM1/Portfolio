import React, { useState } from 'react';
import { fetchAPI } from '../services/api';
import { FileText, Lightbulb, Droplets, Smartphone, CheckCircle2, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BILL_PROVIDERS = [
  { id: 'EDM SA', name: 'EDM SA', desc: 'Facture d\'électricité', icon: Lightbulb, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
  { id: 'SOMAGEP', name: 'SOMAGEP', desc: 'Facture d\'eau', icon: Droplets, color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  { id: 'Orange Mali', name: 'Orange Mali', desc: 'Internet & Téléphone', icon: Smartphone, color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
  { id: 'Moov Africa', name: 'Moov Africa Malitel', desc: 'Internet & Téléphone', icon: Smartphone, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
];
const PayBills = () => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [billRef, setBillRef] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // Nouveaux états pour le flux de vérification
  const [isVerifying, setIsVerifying] = useState(false);
  const [fetchedAmount, setFetchedAmount] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

  const navigate = useNavigate();

  const resetForm = () => {
    setSelectedProvider(null);
    setBillRef('');
    setPinCode('');
    setFetchedAmount(null);
    setError('');
  };

  const handleScanOCR = async () => {
    setScanning(true);
    setError('');
    try {
      const res = await fetchAPI('/integrations/ocr/scan-bill', { method: 'POST' });
      // Remplir automatiquement
      setBillRef(res.bill_reference);
      setFetchedAmount(res.amount); // Assume l'OCR nous donne aussi le montant
    } catch (err: any) {
      setError("Échec de l'analyse OCR.");
    } finally {
      setScanning(false);
    }
  };

  const handleVerifyBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billRef) return;
    
    setError('');
    setIsVerifying(true);

    // Simuler un appel API pour vérifier la facture et récupérer le montant
    setTimeout(() => {
      // Générer un montant aléatoire entre 5000 et 25000 FCFA pour la démo
      const randomAmount = Math.floor(Math.random() * (25000 - 5000 + 1) + 5000);
      setFetchedAmount(randomAmount);
      setIsVerifying(false);
    }, 1500);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || fetchedAmount === null) return;
    
    setError('');
    setLoading(true);

    try {
      const res = await fetchAPI('/transactions/pay-bill', {
        method: 'POST',
        body: JSON.stringify({
          provider: selectedProvider,
          bill_reference: billRef,
          amount: fetchedAmount,
          pin_code: pinCode
        })
      });
      // Show receipt instead of navigating away
      setTransactionId(res.transaction_id || Math.random().toString(36).substr(2, 9).toUpperCase());
      setTransactionDate(new Date().toLocaleString());
      setShowReceipt(true);
    } catch (err: any) {
      setError(err.message || 'Le paiement a échoué');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    const amountStr = `-${fetchedAmount?.toLocaleString()} FCFA`;
    
    const receiptHtml = `
      <html>
        <head>
          <title>Reçu de Paiement - XAALISI</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #D4AF37; padding-bottom: 20px; }
            .logo { font-size: 28px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; }
            .title { font-size: 20px; margin-top: 10px; color: #555; }
            .amount { font-size: 32px; font-weight: bold; color: #EF4444; text-align: center; margin-bottom: 30px; }
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
            <div class="title">Reçu de Paiement</div>
          </div>
          <div class="amount">${amountStr}</div>
          <div class="details">
            <div class="row"><span class="label">Date</span><span class="value">${transactionDate}</span></div>
            <div class="row"><span class="label">ID Transaction</span><span class="value">${transactionId}</span></div>
            <div class="row"><span class="label">Fournisseur</span><span class="value">${selectedProvider}</span></div>
            <div class="row"><span class="label">Référence Facture</span><span class="value">${billRef}</span></div>
            <div class="row"><span class="label">Statut</span><span class="value">COMPLETED</span></div>
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Payer une Facture</h1>
        <p style={{ color: '#8B95A5', marginTop: '8px' }}>Réglez vos factures EDM, SOMAGEP ou autres</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {BILL_PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const isSelected = selectedProvider === provider.id;
          return (
            <button
              key={provider.id}
              className="card"
              onClick={() => {
                resetForm();
                setSelectedProvider(provider.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '16px',
                textAlign: 'left',
                borderColor: isSelected ? '#D4AF37' : 'rgba(212, 175, 55, 0.15)',
                boxShadow: isSelected ? '0 0 0 2px #D4AF37' : 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: provider.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon color={provider.color} size={24} />
                </div>
                {isSelected && <CheckCircle2 color="#D4AF37" size={24} />}
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FFF' }}>{provider.name}</h3>
                <p style={{ color: '#8B95A5', fontSize: '13px', marginTop: '4px' }}>{provider.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {selectedProvider && (
        <div className="card" style={{ position: 'relative' }}>
          <button 
            onClick={resetForm}
            style={{ position: 'absolute', top: '24px', right: '24px', color: '#555E6E', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#FFF' }}>
              Paiement - {selectedProvider}
            </h2>
            <button 
              type="button"
              onClick={handleScanOCR}
              disabled={scanning}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#8B5CF6', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >
              <Lightbulb size={18} />
              {scanning ? 'Analyse...' : '🪄 Scanner (OCR)'}
            </button>
          </div>

          {error && (
            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              {error}
            </div>
          )}

          {fetchedAmount === null ? (
            // ÉTAPE 1 : Saisie de la référence et Vérification
            <form onSubmit={handleVerifyBill} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {(selectedProvider === 'Orange Mali' || selectedProvider === 'Moov Africa') ? 'Numéro de téléphone' : 'Référence / Numéro de compte'}
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={billRef}
                  onChange={(e) => setBillRef(e.target.value)}
                  placeholder={(selectedProvider === 'Orange Mali' || selectedProvider === 'Moov Africa') ? 'Entrez le numéro de téléphone' : 'Entrez la référence de la facture'}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={isVerifying || !billRef} style={{ marginTop: '8px' }}>
                {isVerifying ? (
                  <>Recherche en cours...</>
                ) : (
                  <>
                    <Search size={20} />
                    Vérifier la facture
                  </>
                )}
              </button>
            </form>
          ) : (
            // ÉTAPE 2 : Affichage du montant et paiement
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.05)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#8B95A5', fontSize: '14px' }}>Référence</span>
                  <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{billRef}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#8B95A5', fontSize: '14px' }}>Montant à payer</span>
                  <span style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 800 }}>{fetchedAmount.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#8B95A5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Code PIN de sécurité</label>
                <input
                  type="password"
                  className="input-field"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="●●●●"
                  maxLength={4}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn" onClick={() => setFetchedAmount(null)} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading || !pinCode} style={{ flex: 2 }}>
                  <FileText size={20} />
                  {loading ? 'Traitement en cours...' : `Confirmer le paiement`}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ====== MODAL: SUCCESS RECEIPT ====== */}
      {showReceipt && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => navigate('/dashboard')}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '0', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '32px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 color="#10B981" size={28} />
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#10B981', marginBottom: '8px' }}>
                -{fetchedAmount?.toLocaleString()} FCFA
              </h2>
              <span style={{ fontSize: '13px', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 600 }}>Paiement Réussi</span>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Fournisseur</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{selectedProvider}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Référence Facture</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{billRef}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Date</span>
                <span style={{ color: '#FFF', fontSize: '14px', fontWeight: 600 }}>{transactionDate}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>ID Transaction</span>
                <span style={{ color: '#FFF', fontSize: '13px', fontFamily: 'monospace' }}>{transactionId}</span>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn" onClick={() => navigate('/dashboard')} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>
                  Accueil
                </button>
                <button className="btn" onClick={handleDownloadReceipt} style={{ flex: 1, backgroundColor: '#D4AF37', color: '#000', fontWeight: 'bold' }}>
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayBills;
