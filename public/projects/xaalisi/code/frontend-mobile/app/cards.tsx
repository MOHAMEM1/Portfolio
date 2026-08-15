import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, Modal, ActivityIndicator, TextInput, Alert, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import AppAlert from '@/components/AppAlert';
import { useAppAlert } from '@/hooks/useAppAlert';

export default function CardsScreen() {
  const { width } = useWindowDimensions();
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  const { t } = useTranslation();
  const { alertState, showAlert, hideAlert } = useAppAlert();
  
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [addCardModalVisible, setAddCardModalVisible] = useState(false);
  const [newCardType, setNewCardType] = useState<'virtual' | 'physical'>('virtual');
  
  const [limitsModalVisible, setLimitsModalVisible] = useState(false);
  const [newLimit, setNewLimit] = useState('');

  // PIN Security Modal
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinAction, setPinAction] = useState<'create' | 'delete' | 'block'>('create');
  const pinLength = 4;

  // Dynamic state for cards list
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const loadCards = async () => {
      try {
        const res = await fetchAPI('/cards/virtual');
        if (res && res.cards) {
          const mappedCards = res.cards.map((c: any) => ({
            id: c.id,
            type: c.card_type === 'physical' ? 'Visa Physique' : 'Visa Virtuelle',
            number: `•••• •••• •••• ${c.card_number.slice(-4)}`,
            fullNumber: c.card_number,
            expiry: c.expiry,
            cvv: c.cvv,
            balance: c.daily_limit,
            isFrozen: c.status === 'BLOCKED',
          }));
          setCards(mappedCards);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadCards();
  }, []);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const currentCard = cards[activeCardIndex] || cards[0];

  const handleScroll = (event: any) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / (width - 30));
    if (index >= 0 && index < cards.length) {
      setActiveCardIndex(index);
    }
  };

  // Attempt to add card — check max 2 first, then show PIN
  const handleAddCardRequest = () => {
    const realCards = cards.filter(c => c.id !== 'virtual-1');
    if (realCards.length >= 2) {
      showAlert(t('cards.max_cards'), t('cards.max_cards_msg'), { type: 'warning' });
      return;
    }
    setAddCardModalVisible(true);
  };

  // After selecting card type, ask for PIN
  const handleAddCardWithPin = () => {
    setAddCardModalVisible(false);
    setPinAction('create');
    setPinCode('');
    setPinModalVisible(true);
  };

  const handleAddCardSubmit = async () => {
    try {
      const endpoint = newCardType === 'physical' ? '/cards/physical' : '/cards/virtual';
      const res = await fetchAPI(endpoint, { method: 'POST' });
      const newCardRes = res.card;
      const newCard = {
        id: newCardRes.id || Math.random().toString(),
        type: newCardType === 'physical' ? 'Visa Physique' : 'Visa Virtuelle',
        number: `•••• •••• •••• ${newCardRes.card_number.slice(-4)}`,
        fullNumber: newCardRes.card_number,
        expiry: newCardRes.expiry,
        cvv: newCardRes.cvv,
        balance: newCardRes.daily_limit,
        isFrozen: newCardRes.status === 'BLOCKED',
      };
      if (cards.length === 1 && cards[0].id === 'virtual-1') {
        setCards([newCard]);
      } else {
        setCards([...cards, newCard]);
      }
      setPinModalVisible(false);
      setPinCode('');
      showAlert(t('cards.created_title'), t('cards.created_msg'), { type: 'success' });
    } catch (error) {
      showAlert(t('cards.error'), t('cards.error_create'), { type: 'error' });
    }
  };

  // Delete card flow
  const handleDeleteCardRequest = () => {
    if (!currentCard) return;
    // Can't delete if it's the only card
    if (cards.length <= 1 || activeCardIndex === 0) {
      showAlert(t('cards.cant_delete_primary'), t('cards.cant_delete_primary_msg'), { type: 'error' });
      return;
    }

    showAlert(
      t('cards.delete_confirm_title'),
      t('cards.delete_confirm_msg'),
      {
        type: 'warning',
        buttons: [
          { text: t('cards.delete_cancel'), style: 'cancel' },
          { text: t('cards.delete_ok'), style: 'destructive', onPress: () => {
            hideAlert();
            setPinAction('delete');
            setPinCode('');
            setPinModalVisible(true);
          }}
        ]
      }
    );
  };

  const handleDeleteCardSubmit = async () => {
    try {
      await fetchAPI(`/cards/${currentCard.id}`, { method: 'DELETE' });
      const updatedCards = cards.filter((_, i) => i !== activeCardIndex);
      setCards(updatedCards);
      setActiveCardIndex(0);
      setPinModalVisible(false);
      setPinCode('');
      showAlert(t('cards.deleted_title'), t('cards.deleted_msg'), { type: 'success' });
    } catch (error) {
      showAlert(t('cards.error'), t('cards.error_status'), { type: 'error' });
    }
  };

  // PIN pad handler
  const handlePinDigit = (digit: string) => {
    if (pinCode.length < pinLength) {
      const newPin = pinCode + digit;
      setPinCode(newPin);
      if (newPin.length === pinLength) {
        setTimeout(() => {
          if (pinAction === 'create') handleAddCardSubmit();
          else if (pinAction === 'block') toggleFreezeActiveCardSubmit();
          else handleDeleteCardSubmit();
        }, 300);
      }
    }
  };
  const handlePinDelete = () => setPinCode(pinCode.slice(0, -1));

  const toggleFreezeActiveCard = () => {
    if (!currentCard) return;
    setPinAction('block');
    setPinCode('');
    setPinModalVisible(true);
  };

  const toggleFreezeActiveCardSubmit = async () => {
    if (!currentCard) return;
    try {
        if (currentCard.isFrozen) {
          await fetchAPI(`/cards/${currentCard.id}/unblock`, { method: 'POST' });
        } else {
          await fetchAPI(`/cards/${currentCard.id}/block`, { method: 'POST' });
        }
      const updatedCards = [...cards];
      updatedCards[activeCardIndex].isFrozen = !updatedCards[activeCardIndex].isFrozen;
      setCards(updatedCards);
      setPinModalVisible(false);
      setPinCode('');
    } catch (error) {
      showAlert(t('cards.error'), t('cards.error_status'), { type: 'error' });
      setPinModalVisible(false);
      setPinCode('');
    }
  };

  const handleUpdateLimit = async () => {
    if (!currentCard || !newLimit) return;
    try {
      const updatedCards = [...cards];
      updatedCards[activeCardIndex].balance = parseInt(newLimit, 10);
      setCards(updatedCards);
      setLimitsModalVisible(false);
      setNewLimit('');
      // In a real app, send API request here
      // await fetchAPI(`/cards/${currentCard.id}/limit`, { method: 'POST', body: { limit: newLimit }});
    } catch (error) {
      console.error(error);
    }
  };

  const CardAction = ({ icon, label, onPress, danger }: any) => (
    <TouchableOpacity 
      style={[styles.cardActionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]} 
      onPress={onPress}
    >
      <Feather name={icon} size={20} color={danger ? theme.danger : theme.primary} style={{ marginBottom: 8 }} />
      <Text style={[styles.cardActionLabel, { color: danger ? theme.danger : theme.textPrimary, fontFamily: theme.fontFamily }]}>{label}</Text>
    </TouchableOpacity>
  );

  if (loading || !currentCard) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1a1500', '#000000', '#0a0a0a'] : ['#FFFDF5', '#FFFFFF', '#F8F9FA']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'transparent' }]} />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface, borderColor: theme.border }]} onPress={() => { if(router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.title')}</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        {/* Carousel of Cards */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={width - 40}
          snapToAlignment="start"
          decelerationRate="fast"
          contentContainerStyle={styles.cardCarousel}
        >
          {cards.map((card) => {
            const currentCardNumber = showCardDetails ? card.fullNumber : card.number;
            const currentCvv = showCardDetails ? card.cvv : '•••';

            return (
              <View key={card.id} style={{ width: width - 50, marginRight: 10 }}>
                <View style={styles.cardWrapper}>
                  <View style={[styles.glowShadow, { shadowColor: card.isFrozen ? theme.danger : '#D4AF37' }]} />
                  
                  {/* Premium Gold Card with transparent designer stripes */}
                  <LinearGradient 
                    colors={card.isFrozen ? ['#4A4A4A', '#2E2E2E'] : ['#F4C430', '#C59B27', '#9A7B1C']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.creditCard, { borderColor: card.isFrozen ? theme.danger : '#D4AF37', borderWidth: 1 }]}
                  >
                    {/* Transparent designer stripes */}
                    <View style={styles.stripe1} />
                    <View style={styles.stripe2} />
                    <View style={styles.stripe3} />
                    
                    <View style={styles.cardHeader}>
                      <Feather name="cpu" size={32} color="#000" style={{ opacity: 0.9 }} />
                      <Text style={[styles.cardBrand, { color: '#000', fontFamily: theme.fontFamily }]}>XAALISI</Text>
                    </View>

                    <View style={styles.cardNumberBox}>
                      <Text style={[styles.cardNumber, { color: '#000', fontFamily: theme.fontFamily, fontWeight: '700' }]}>{currentCardNumber}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={[styles.cardLabel, { color: 'rgba(0,0,0,0.6)', fontFamily: theme.fontFamily }]}>{t('cards.holder')}</Text>
                        <Text style={[styles.cardValue, { color: '#000', fontFamily: theme.fontFamily, fontWeight: '600' }]}>{username ? username.toUpperCase() : 'UTILISATEUR'}</Text>
                      </View>
                      <View style={{ alignItems: 'center' }}>
                        <Text style={[styles.cardLabel, { color: 'rgba(0,0,0,0.6)', fontFamily: theme.fontFamily }]}>{t('cards.expires')}</Text>
                        <Text style={[styles.cardValue, { color: '#000', fontFamily: theme.fontFamily, fontWeight: '600' }]}>{card.expiry}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.cardLabel, { color: 'rgba(0,0,0,0.6)', fontFamily: theme.fontFamily }]}>CVV</Text>
                        <Text style={[styles.cardValue, { color: '#000', fontFamily: theme.fontFamily, fontWeight: '600' }]}>{currentCvv}</Text>
                      </View>
                    </View>

                    {card.isFrozen && (
                      <View style={[StyleSheet.absoluteFillObject, styles.frozenOverlay]}>
                        <Feather name="lock" size={40} color="#FFF" />
                        <Text style={[styles.frozenText, { fontFamily: theme.fontFamily }]}>{t('cards.frozen_label')}</Text>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              </View>
            );
          })}

          {/* Ajouter une carte placeholder */}
          <TouchableOpacity 
            style={[styles.addCardPlaceholder, { width: width - 50, borderColor: isDark ? '#444' : '#D0D0D0' }]} 
            onPress={handleAddCardRequest}
            activeOpacity={0.8}
          >
            <View style={[styles.addCardIconBox, { borderColor: theme.primary }]}>
              <Feather name="plus" size={32} color={theme.primary} />
            </View>
            <Text style={[styles.addCardText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.add_card')}</Text>
          </TouchableOpacity>
        </ScrollView>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInUp.duration(600).delay(200)}>
            
            <View style={styles.balanceBox}>
              <Text style={[styles.balanceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('cards.balance_label')} ({currentCard.type})</Text>
              <Text style={[styles.balanceValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{currentCard.balance.toLocaleString()} FCFA</Text>
            </View>

            {/* Quick Actions for Cards */}
            <View style={styles.actionGrid}>
              <CardAction 
                icon={showCardDetails ? "eye-off" : "eye"} 
                label={showCardDetails ? t('cards.hide') : t('cards.show')} 
                onPress={() => setShowCardDetails(!showCardDetails)} 
              />
              <CardAction 
                icon={currentCard.isFrozen ? "unlock" : "lock"} 
                label={currentCard.isFrozen ? t('cards.unblock') : t('cards.block')} 
                onPress={toggleFreezeActiveCard} 
                danger={!currentCard.isFrozen}
              />
              <CardAction 
                icon="settings" 
                label={t('cards.limits')} 
                onPress={() => setLimitsModalVisible(true)} 
              />
              {cards.length > 1 && activeCardIndex > 0 && (
                <CardAction 
                  icon="trash-2" 
                  label={t('cards.delete')} 
                  onPress={handleDeleteCardRequest} 
                  danger
                />
              )}
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.details_title')}</Text>
              <View style={[styles.infoCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('cards.card_type')}</Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{currentCard.type}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('cards.monthly_limit')}</Text>
                  <Text style={[styles.infoValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>500,000 FCFA</Text>
                </View>
                <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('cards.contactless')}</Text>
                  <Text style={[styles.infoValue, { color: theme.success, fontFamily: theme.fontFamily }]}>{t('cards.active')}</Text>
                </View>
              </View>
            </View>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Limits Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={limitsModalVisible}
        onRequestClose={() => setLimitsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.modify_limit', 'Modifier la Limite')}</Text>
              <TouchableOpacity onPress={() => setLimitsModalVisible(false)}>
                <Feather name="x" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily, marginBottom: 20 }]}>
              {t('cards.adjust_limit', 'Ajustez le plafond de paiement pour cette carte.')}
            </Text>
            
            <View style={[styles.inputWrapper, { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderColor: theme.border, marginBottom: 20, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1 }]}>
              <Text style={[styles.currencyPrefix, { color: theme.primary, fontFamily: theme.fontFamily, marginRight: 10 }]}>CFA</Text>
              <TextInput
                style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily, flex: 1, height: 50 }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder={t('cards.new_limit', 'Nouvelle limite (Ex: 50000)')}
                placeholderTextColor={theme.inactiveToken}
                keyboardType="numeric"
                value={newLimit}
                onChangeText={setNewLimit}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleUpdateLimit}
            >
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '700', fontFamily: theme.fontFamily }}>{t('cards.confirm', 'Confirmer')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        visible={addCardModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddCardModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.add_card_title')}</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => setAddCardModalVisible(false)}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formInputGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily, marginBottom: 12 }]}>{t('cards.card_type_label')}</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.modalTabBtn, newCardType === 'virtual' && { backgroundColor: theme.primary }]}
                  onPress={() => setNewCardType('virtual')}
                >
                  <Text style={{ color: newCardType === 'virtual' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily, fontWeight: '700' }}>{t('cards.virtual')}</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalTabBtn, newCardType === 'physical' && { backgroundColor: theme.primary }]}
                  onPress={() => setNewCardType('physical')}
                >
                  <Text style={{ color: newCardType === 'physical' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily, fontWeight: '700' }}>{t('cards.physical')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleAddCardWithPin}
            >
              <Text style={{ color: '#000', fontSize: 14, fontWeight: '700', fontFamily: theme.fontFamily }}>{t('cards.create_card')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* PIN Security Modal */}
      <Modal
        visible={pinModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setPinModalVisible(false); setPinCode(''); }}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('cards.pin_required')}</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => { setPinModalVisible(false); setPinCode(''); }}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily, marginBottom: 25, textAlign: 'center' }]}>
              {pinAction === 'create' ? t('cards.pin_create') : t('cards.pin_delete')}
            </Text>

            {/* PIN Dots */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 30 }}>
              {[...Array(pinLength)].map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 18, height: 18, borderRadius: 9,
                    backgroundColor: i < pinCode.length ? theme.primary : 'transparent',
                    borderWidth: 2, borderColor: theme.primary,
                  }}
                />
              ))}
            </View>

            {/* PIN Keypad */}
            <View style={{ alignItems: 'center' }}>
              {[[1,2,3],[4,5,6],[7,8,9],['',0,'del']].map((row, ri) => (
                <View key={ri} style={{ flexDirection: 'row', gap: 20, marginBottom: 15 }}>
                  {row.map((digit, di) => {
                    if (digit === '') return <View key={di} style={{ width: 70, height: 52 }} />;
                    if (digit === 'del') return (
                      <TouchableOpacity key={di} style={{ width: 70, height: 52, justifyContent: 'center', alignItems: 'center' }} onPress={handlePinDelete}>
                        <Feather name="delete" size={24} color={theme.textPrimary} />
                      </TouchableOpacity>
                    );
                    return (
                      <TouchableOpacity
                        key={di}
                        style={{ width: 70, height: 52, borderRadius: 14, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border }}
                        onPress={() => handlePinDigit(String(digit))}
                      >
                        <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '600', fontFamily: theme.fontFamily }}>{digit}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
      <AppAlert {...alertState} onDismiss={hideAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    zIndex: 10,
  },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22, borderWidth: 1 },
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 },

  cardCarousel: { 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    minHeight: 250,
  },

  cardWrapper: { position: 'relative' },
  glowShadow: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: -10,
    borderRadius: 24,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 20,
    backgroundColor: 'transparent',
  },
  creditCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  
  // Diagonal transparent designer stripes
  stripe1: {
    position: 'absolute',
    top: -50,
    left: '15%',
    width: 70,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ rotate: '30deg' }],
  },
  stripe2: {
    position: 'absolute',
    top: -50,
    left: '42%',
    width: 35,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ rotate: '30deg' }],
  },
  stripe3: {
    position: 'absolute',
    top: -50,
    left: '58%',
    width: 90,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '30deg' }],
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardBrand: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
  cardNumberBox: { marginVertical: 20 },
  cardNumber: { fontSize: 22, letterSpacing: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  cardLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  cardValue: { fontSize: 14, letterSpacing: 1 },

  addCardPlaceholder: {
    height: 220,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  addCardIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCardText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
  },

  frozenOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  frozenText: { color: '#FFF', fontSize: 16, letterSpacing: 2, marginTop: 10 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  balanceBox: { alignItems: 'center', marginBottom: 30 },
  balanceLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  balanceValue: { fontSize: 28, letterSpacing: 0.5 },

  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  cardActionBtn: { flex: 1, height: 80, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginHorizontal: 5 },
  cardActionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },

  infoSection: { marginBottom: 30 },
  infoTitle: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  infoCard: { borderRadius: 20, borderWidth: 1, padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.2)' },
  infoLabel: { fontSize: 13 },
  infoValue: { fontSize: 13, fontWeight: 'bold' },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 35, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  modalSubtitle: { fontSize: 12, marginBottom: 20 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1 },
  currencyPrefix: { fontSize: 16, fontWeight: '700', marginRight: 10 },
  input: { flex: 1, height: 50, fontSize: 16 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  formInputGroup: { marginBottom: 18 },
  formLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  modalTabBtn: { flex: 1, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#333' },
  submitBtn: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 25 },
});
