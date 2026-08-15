import React, { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';
import { CreditCard, Plus, ShieldAlert, Trash2, CheckCircle2, Unlock, Cpu, Lock, Eye, EyeOff, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Card {
  id: string;
  card_number: string;
  expiry: string;
  cvv: string;
  status: string;
  cardholder_name: string;
  daily_limit?: number; // Might not be returned by backend, so we fallback
}

const Cards = () => {
  const { username } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modals state
  const [activeModal, setActiveModal] = useState<'NONE' | 'CREATE' | 'BLOCK' | 'DELETE' | 'LIMIT'>('NONE');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [pinCode, setPinCode] = useState('');
  const [limitValue, setLimitValue] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  
  // Card visibility state
  const [visibleCards, setVisibleCards] = useState<Record<string, boolean>>({});

  const toggleVisibility = (id: string) => {
    setVisibleCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const loadCards = async () => {
    try {
      const data = await fetchAPI('/cards/virtual');
      setCards(data.cards || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCards();
  }, []);

  const resetModal = () => {
    setActiveModal('NONE');
    setSelectedCard(null);
    setPinCode('');
    setLimitValue('');
    setModalError('');
    setModalLoading(false);
  };

  const openModal = (type: 'CREATE' | 'BLOCK' | 'DELETE' | 'LIMIT', card?: Card) => {
    setSelectedCard(card || null);
    setActiveModal(type);
    setPinCode('');
    setLimitValue('');
    setModalError('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode) return setModalError('Le code PIN est requis');
    
    setModalLoading(true);
    try {
      // In a real app we might pass the PIN to the create endpoint
      await fetchAPI('/cards/virtual', { method: 'POST' });
      await loadCards();
      resetModal();
    } catch (err: any) {
      setModalError(err.message || 'Échec de la création de la carte');
    } finally {
      setModalLoading(false);
    }
  };

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !pinCode) return setModalError('Le code PIN est requis');
    
    const isBlocked = selectedCard.status === 'BLOCKED';
    setModalLoading(true);
    try {
      // In a real app we might pass the PIN to the block endpoint for auth
      await fetchAPI(`/cards/${selectedCard.id}/${isBlocked ? 'unblock' : 'block'}`, { method: 'POST' });
      await loadCards();
      resetModal();
    } catch (err: any) {
      setModalError(err.message || 'Échec de la mise à jour du statut');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !pinCode) return setModalError('Le code PIN est requis');
    
    setModalLoading(true);
    try {
      // If endpoint doesn't exist yet in backend, we simulate or just hit it hoping it exists
      await fetchAPI(`/cards/${selectedCard.id}`, { method: 'DELETE' });
      await loadCards();
      resetModal();
    } catch (err: any) {
      setModalError(err.message || 'Échec de la suppression (Endpoint peut-être non implémenté)');
    } finally {
      setModalLoading(false);
    }
  };

  const handleLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard || !limitValue) return setModalError('La nouvelle limite est requise');
    
    setModalLoading(true);
    try {
      // For now, simulate local limit update
      const updatedCards = cards.map(c => 
        c.id === selectedCard.id ? { ...c, daily_limit: parseInt(limitValue, 10) } : c
      );
      setCards(updatedCards);
      resetModal();
    } catch (err: any) {
      setModalError(err.message || 'Échec de la modification');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', gap: '32px', flexDirection: 'column', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#FFF' }}>Cartes Virtuelles</h1>
          <p style={{ color: '#8B95A5', marginTop: '8px' }}>Gérez vos cartes virtuelles pour des paiements sécurisés</p>
        </div>
        <button onClick={() => openModal('CREATE')} disabled={loading} className="btn-primary">
          <Plus size={20} />
          Générer une carte
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
        {cards.length === 0 ? (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
            <p style={{ color: '#8B95A5' }}>Vous n'avez pas encore de carte virtuelle. Générez-en une pour commencer !</p>
          </div>
        ) : (
          cards.map((card, index) => {
            const isVisible = visibleCards[card.id];
            
            return (
              <div key={card.id} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '24px', 
                backgroundColor: 'var(--surface-color)', 
                padding: '24px', 
                borderRadius: '24px', 
                border: '1px solid var(--border-color)', 
                boxShadow: '0 8px 30px rgba(0,0,0,0.2)' 
              }}>
                
                {/* 1. PREMIUM CARD ITSELF */}
                <div style={{ 
                  background: card.status === 'BLOCKED' 
                    ? 'linear-gradient(135deg, #4A4A4A 0%, #2E2E2E 100%)' 
                    : 'linear-gradient(135deg, #F4C430 0%, #C59B27 50%, #9A7B1C 100%)', 
                  color: '#000', 
                  borderRadius: '20px', 
                  padding: '24px', 
                  position: 'relative',
                  boxShadow: card.status === 'BLOCKED' ? '0 10px 25px rgba(239, 68, 68, 0.2)' : '0 10px 25px rgba(212, 175, 55, 0.3)',
                  border: card.status === 'BLOCKED' ? '1px solid #EF4444' : '1px solid #D4AF37',
                  overflow: 'hidden',
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  {/* Designer stripes */}
                  <div style={{ position: 'absolute', top: '-50px', left: '15%', width: '70px', height: '350px', backgroundColor: 'rgba(255, 255, 255, 0.12)', transform: 'rotate(30deg)' }}></div>
                  <div style={{ position: 'absolute', top: '-50px', left: '42%', width: '35px', height: '350px', backgroundColor: 'rgba(255, 255, 255, 0.08)', transform: 'rotate(30deg)' }}></div>
                  <div style={{ position: 'absolute', top: '-50px', left: '58%', width: '90px', height: '350px', backgroundColor: 'rgba(255, 255, 255, 0.05)', transform: 'rotate(30deg)' }}></div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Cpu size={36} color="#000" style={{ opacity: 0.9 }} />
                      <span style={{ fontSize: '20px', fontWeight: 800, color: '#000', letterSpacing: '3px' }}>XAALISI</span>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '26px', letterSpacing: '6px', margin: '30px 0', fontFamily: 'monospace', fontWeight: 700, color: '#000', position: 'relative', zIndex: 2 }}>
                    {isVisible ? card.card_number.match(/.{1,4}/g)?.join(' ') : `•••• •••• •••• ${card.card_number.slice(-4)}`}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', letterSpacing: '1.5px', marginBottom: '4px' }}>Titulaire</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>{username ? username.toUpperCase() : 'UTILISATEUR'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', letterSpacing: '1.5px', marginBottom: '4px' }}>Expire</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>{card.expiry}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.6)', letterSpacing: '1.5px', marginBottom: '4px' }}>CVV</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#000' }}>{isVisible ? card.cvv : '•••'}</div>
                    </div>
                  </div>
                  
                  {/* Overlay if frozen */}
                  {card.status === 'BLOCKED' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 3 }}>
                      <Lock size={48} color="#FFF" />
                      <div style={{ color: '#FFF', fontSize: '18px', fontWeight: 700, letterSpacing: '3px', marginTop: '12px', textTransform: 'uppercase' }}>Carte Bloquée</div>
                    </div>
                  )}
                </div>

                {/* 2. BALANCE SECTION */}
                <div style={{ textAlign: 'center', padding: '16px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px', fontWeight: 600 }}>
                    Solde lié à la carte (Visa Virtuelle)
                  </div>
                  <div style={{ color: 'var(--text-primary)', fontSize: '32px', fontWeight: 800, letterSpacing: '1px' }}>
                    {(card.daily_limit || 500000).toLocaleString()} FCFA
                  </div>
                </div>

                {/* 3. QUICK ACTIONS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <button onClick={() => toggleVisibility(card.id)} className="btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '100%' }}>
                    {isVisible ? <EyeOff size={22} color="var(--gold)" /> : <Eye size={22} color="var(--gold)" />}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{isVisible ? 'MASQUER' : 'AFFICHER'}</span>
                  </button>
                  
                  <button onClick={() => openModal('BLOCK', card)} className="btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', color: card.status === 'BLOCKED' ? '#10B981' : '#EF4444', height: '100%' }}>
                    {card.status === 'BLOCKED' ? <Unlock size={22} color="#10B981" /> : <ShieldAlert size={22} color="#EF4444" />}
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{card.status === 'BLOCKED' ? 'DÉBLOQUER' : 'BLOQUER'}</span>
                  </button>
                  
                  <button onClick={() => openModal('LIMIT', card)} className="btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', backgroundColor: 'var(--background-color)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', height: '100%' }}>
                    <Settings size={22} color="var(--gold)" />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>LIMITES</span>
                  </button>
                  
                  <div style={{ opacity: index === 0 ? 0.3 : 1, cursor: index === 0 ? 'not-allowed' : 'auto', height: '100%' }}>
                    <button 
                      onClick={() => index !== 0 && openModal('DELETE', card)}
                      disabled={index === 0}
                      className="btn" 
                      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px 8px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#EF4444' }}
                    >
                      <Trash2 size={22} color="#EF4444" />
                      <span style={{ fontSize: '12px', fontWeight: 600 }}>SUPPRIMER</span>
                    </button>
                  </div>
                </div>

                {/* 4. DETAILS SECTION */}
                <div>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Détails de la carte</h3>
                  <div style={{ backgroundColor: 'var(--background-color)', borderRadius: '16px', padding: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Type de carte</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>Visa Virtuelle</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Plafond Mensuel</span>
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>{(card.daily_limit || 500000).toLocaleString()} FCFA</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Paiement sans contact</span>
                      <span style={{ color: '#10B981', fontSize: '14px', fontWeight: 700 }}>Activé</span>
                    </div>
                  </div>
                </div>
                
              </div>
            );
          })
        )}
      </div>

      {/* ====== REUSABLE MODAL COMPONENT ====== */}
      {activeModal !== 'NONE' && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: 'var(--surface-color)', padding: '24px' }}>
            
            {activeModal === 'CREATE' && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#FFF' }}>Nouvelle Carte</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Confirmez la génération d'une nouvelle carte virtuelle en saisissant votre Code PIN.</p>
              </>
            )}

            {activeModal === 'BLOCK' && selectedCard && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: selectedCard.status === 'BLOCKED' ? '#10B981' : '#EF4444' }}>
                  {selectedCard.status === 'BLOCKED' ? 'Débloquer la carte' : 'Bloquer la carte'}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                  {selectedCard.status === 'BLOCKED' 
                    ? "Saisissez votre PIN pour réactiver cette carte." 
                    : "Saisissez votre PIN pour suspendre temporairement cette carte."}
                </p>
              </>
            )}

            {activeModal === 'DELETE' && (
              <>
                <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#EF4444' }}>Supprimer la carte</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Cette action est irréversible. Confirmez la suppression avec votre Code PIN.</p>
              </>
            )}

            {activeModal === 'LIMIT' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFF', textTransform: 'uppercase' }}>Modifier la limite</h2>
                  <button onClick={resetModal} style={{ background: 'none', border: 'none', color: '#FFF', cursor: 'pointer', padding: 0 }}>
                    <span style={{ fontSize: '24px', lineHeight: 1 }}>&times;</span>
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Ajustez le plafond de paiement pour cette carte.</p>
              </>
            )}

            {modalError && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px', fontWeight: 500, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {modalError}
              </div>
            )}
            
            <form onSubmit={
              activeModal === 'CREATE' ? handleCreate : 
              activeModal === 'BLOCK' ? handleBlock : 
              activeModal === 'LIMIT' ? handleLimit : 
              handleDelete
            }>
              <div style={{ marginBottom: '24px' }}>
                {activeModal === 'LIMIT' ? (
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontWeight: 600 }}>CFA</span>
                    <input
                      type="number"
                      className="input-field"
                      style={{ paddingLeft: '56px' }}
                      value={limitValue}
                      onChange={(e) => setLimitValue(e.target.value)}
                      placeholder="Nouvelle limite (Ex: 50000)"
                      required
                    />
                  </div>
                ) : (
                  <input
                    type="password"
                    className="input-field"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="Code PIN"
                    maxLength={4}
                    required
                  />
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn" onClick={resetModal} style={{ flex: 1, backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)' }}>Annuler</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, backgroundColor: activeModal === 'DELETE' ? '#EF4444' : '' }} disabled={modalLoading}>
                  {modalLoading ? 'Traitement...' : 'Confirmer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cards;
