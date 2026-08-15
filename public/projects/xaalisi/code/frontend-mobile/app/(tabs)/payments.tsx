import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Dimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { useCeilingCheck } from '@/hooks/useCeilingCheck';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const containerWidth = width - 40; // 20 padding on each side
const gapSize = 10;
const cardWidth = (containerWidth - (gapSize * 2)) / 3;

// Map company IDs to downloaded brand logo assets
const COMPANY_LOGOS: { [key: string]: any } = {
  edm: require('@/assets/images/edm.png'),
  isago: require('@/assets/images/edm.png'),
  somagep: require('@/assets/images/somagep.png'),
  orange: require('@/assets/images/orange.png'),
  malitel: require('@/assets/images/moov.png'),
  telecel: require('@/assets/images/telecel.png'),
  canal: require('@/assets/images/canal.png'),
  startimes: require('@/assets/images/startimes.png'),
  inps: require('@/assets/images/taxes.png'),
  mairie: require('@/assets/images/taxes.png'),
  sunu: require('@/assets/images/insurance.png'),
  sama: require('@/assets/images/sama.png'),
};

// 2026 UI Design System for Malian Companies - Strict Black/Gold/Color Theme
const MALI_COMPANIES = [
  { id: 'edm', name: 'EDM-SA', category: 'Énergie', type: 'Électricité', logoText: 'EDM', color: '#F2A900', icon: 'zap', requiredKyc: 1 },
  { id: 'isago', name: 'ISAGO', category: 'Énergie', type: 'Prépayé', logoText: 'ISG', color: '#E31C1C', icon: 'key', requiredKyc: 1 },
  { id: 'somagep', name: 'SOMAGEP', category: 'Eau', type: 'Eau', logoText: 'SOM', color: '#00A3E0', icon: 'droplet', requiredKyc: 1 },
  { id: 'orange', name: 'Orange Mali', category: 'Télécom', type: 'Télécom', logoText: 'ORG', color: '#FF6600', icon: 'phone', requiredKyc: 1 },
  { id: 'malitel', name: 'Moov Africa', category: 'Télécom', type: 'Télécom', logoText: 'MOOV', color: '#005CA9', icon: 'wifi', requiredKyc: 1 },
  { id: 'telecel', name: 'Telecel', category: 'Télécom', type: 'Télécom', logoText: 'TEL', color: '#7A2F8B', icon: 'smartphone', requiredKyc: 1 },
  { id: 'canal', name: 'Canal+', category: 'TV', type: 'TV', logoText: 'C+', color: '#111111', icon: 'tv', requiredKyc: 1 },
  { id: 'startimes', name: 'StarTimes', category: 'TV', type: 'TV', logoText: 'STAR', color: '#009B72', icon: 'monitor', requiredKyc: 1 },
  { id: 'inps', name: 'INPS', category: 'Taxes', type: 'Impôts', logoText: 'INPS', color: '#00843D', icon: 'briefcase', requiredKyc: 2 },
  { id: 'mairie', name: 'Mairie Bko', category: 'Taxes', type: 'Taxes', logoText: 'BKO', color: '#D22630', icon: 'map', requiredKyc: 2 },
  { id: 'sunu', name: 'SUNU', category: 'Assurance', type: 'Assurance', logoText: 'SUNU', color: '#0F2C59', icon: 'shield', requiredKyc: 2 },
  { id: 'sama', name: 'SAMA Money', category: 'Finance', type: 'Wallet', logoText: 'SAMA', color: '#00B050', icon: 'dollar-sign', requiredKyc: 1 },
];

const CATEGORIES = ['Tous', 'Énergie', 'Eau', 'Télécom', 'TV', 'Taxes', 'Finance', 'Assurance'];

export default function PaymentsScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { checkCeiling } = useCeilingCheck(1);
  const [kycLevel, setKycLevel] = useState(2);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');

  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [billRef, setBillRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const filteredCompanies = useMemo(() => {
    return MALI_COMPANIES.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) || company.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'Tous' || company.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const handleAction = (company: any) => {
    if (kycLevel < company.requiredKyc) {
      Alert.alert(
        "Niveau KYC Insuffisant", 
        `Cette fonctionnalité nécessite le KYC Niveau ${company.requiredKyc}.`
      );
    } else {
      setSelectedCompany(company);
      setPaymentModalVisible(true);
    }
  };

  const triggerPaymentSubmit = () => {
    if (!amount || !billRef) {
      Alert.alert('Champs Requis', 'Veuillez remplir tous les champs.');
      return;
    }
    if (!checkCeiling(parseFloat(amount))) return;
    
    // Close form and open PIN
    setPaymentModalVisible(false);
    setPinModalVisible(true);
  };

  const handlePaymentSubmit = async (pinValue: string) => {
    setLoading(true);
    setSubmitted(true);
    try {
      const response = await fetchAPI('/transactions/pay-bill', {
        method: 'POST',
        body: JSON.stringify({
          provider: selectedCompany.id,
          bill_reference: billRef,
          amount: parseFloat(amount),
          pin_code: pinValue
        })
      });
      
      setPinModalVisible(false);
      router.replace({
        pathname: '/success',
        params: {
          type: 'payment',
          amount: amount,
          recipient: selectedCompany.name,
          reference: billRef,
          title: 'Paiement Réussi',
          subtitle: response.message || `Votre facture à ${selectedCompany.name} a été payée avec succès.`
        }
      });
      setAmount(''); 
      setBillRef('');
      setSubmitted(false);
    } catch (error: any) {
      Alert.alert('Échec du Paiement', error.message || 'Une erreur est survenue.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const PinModal = () => {
    const pinLength = 4;
    const [localPin, setLocalPin] = useState('');

    const handleNumberPress = (num: string) => {
      if (localPin.length < pinLength) {
        const newPin = localPin + num;
        setLocalPin(newPin);
        if (newPin.length === pinLength) {
          setTimeout(() => {
            setPinModalVisible(false);
            handlePaymentSubmit(newPin);
          }, 200);
        }
      }
    };

    const handleDelete = () => {
      setLocalPin(localPin.slice(0, -1));
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={pinModalVisible}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <View style={styles.pinModalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={[styles.pinModalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.pinModalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
              VALIDATION DU PAIEMENT
            </Text>
            <Text style={[styles.pinModalSubtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              Saisissez votre code PIN pour valider le paiement de <Text style={{ color: theme.primary, fontWeight: '700' }}>{parseFloat(amount || '0').toLocaleString()} FCFA</Text> à <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{selectedCompany?.name}</Text>
            </Text>

            {/* Dots */}
            <View style={styles.pinDotsContainer}>
              {[...Array(pinLength)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: i < localPin.length ? theme.primary : 'transparent',
                      borderColor: theme.primary,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Custom Numeric Keyboard */}
            <View style={styles.keyboardContainer}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['cancel', '0', 'delete']
              ].map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keyboardRow}>
                  {row.map((key) => {
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.keyboardKey, { backgroundColor: theme.background, borderColor: theme.border }]}
                        onPress={() => {
                          if (key === 'cancel') setPinModalVisible(false);
                          else if (key === 'delete') handleDelete();
                          else handleNumberPress(key);
                        }}
                      >
                        {key === 'cancel' ? (
                          <Feather name="x" size={20} color={theme.textPrimary} />
                        ) : key === 'delete' ? (
                          <Feather name="delete" size={20} color={theme.textPrimary} />
                        ) : (
                          <Text style={[styles.keyboardKeyText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                            {key}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(600).springify()} style={[styles.header, { backgroundColor: theme.background }]}>
        <View>
          <Text style={[styles.mainTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Paiements & Services</Text>
          <Text style={[styles.descText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Réglez plus de 50+ services au Mali</Text>
        </View>
        <TouchableOpacity style={[styles.scanBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={() => router.push('/scan')}>
          <Feather name="maximize" size={20} color="#000000" />
        </TouchableOpacity>
      </Animated.View>

      {/* Search Bar */}
      <Animated.View entering={FadeInDown.duration(600).delay(100).springify()} style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="search" size={20} color={theme.inactiveToken} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
            placeholder="Rechercher (ex: EDM, Orange...)"
            placeholderTextColor={theme.inactiveToken}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* Categories */}
      <Animated.View entering={FadeInDown.duration(600).delay(200).springify()}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat, index) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryPill,
                  { backgroundColor: isActive ? theme.primary : theme.surface, borderColor: isActive ? theme.primary : theme.border, borderWidth: 1 }
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, { color: isActive ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>

      {/* Grid of Companies */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredCompanies.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={40} color={theme.inactiveToken} style={{ marginBottom: 15 }} />
            <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Aucune entreprise trouvée</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredCompanies.map((company, index) => {
              const cardWidth = (Dimensions.get('window').width - 40 - 20) / 3;
              return (
              <Animated.View 
                key={company.id} 
                entering={FadeInUp.duration(500).delay(200 + (index * 40)).springify()} 
                layout={Layout.springify()}
                style={{ width: cardWidth, marginBottom: 12 }}
              >
                <TouchableOpacity 
                  style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.border }]} 
                  onPress={() => handleAction(company)}
                  activeOpacity={0.8}
                >
                  {/* Brand Logo Image */}
                  <View style={styles.brandLogoBox}>
                    <Image 
                      source={COMPANY_LOGOS[company.id]} 
                      style={styles.brandLogoImage} 
                      resizeMode="cover"
                    />
                  </View>
                  <Text style={[styles.gridCardName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1}>
                    {company.name}
                  </Text>
                  <Text style={[styles.gridCardType, { color: theme.textSecondary, fontFamily: theme.fontFamily }]} numberOfLines={1}>
                    {company.type}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Payment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={paymentModalVisible}
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400).springify()} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            {selectedCompany && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    {/* Brand Styled Logo */}
                    <View style={styles.modalLogoBox}>
                      <Image 
                        source={COMPANY_LOGOS[selectedCompany.id]} 
                        style={styles.brandLogoImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View>
                      <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Payer {selectedCompany.name}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4, fontFamily: theme.fontFamily, textTransform: 'uppercase', letterSpacing: 1 }}>Règlement sécurisé</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.closeBtn, { backgroundColor: theme.surface }]} onPress={() => setPaymentModalVisible(false)}>
                    <Feather name="x" size={20} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>
                
                <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: '80%' }}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
                      {selectedCompany.category === 'Télécom' ? 'NUMÉRO DE TÉLÉPHONE' : 
                       selectedCompany.category === 'Énergie' ? 'NUMÉRO DE COMPTEUR' : 
                       'RÉFÉRENCE'}
                    </Text>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Feather name={selectedCompany.category === 'Télécom' ? 'phone' : 'file-text'} size={18} color={theme.primary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
                        placeholder="Ex: 77 00 00 00"
                        placeholderTextColor={theme.inactiveToken}
                        value={billRef}
                        onChangeText={setBillRef}
                        keyboardType={selectedCompany.category === 'Télécom' ? 'phone-pad' : 'default'}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>MONTANT (FCFA)</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                      <Text style={[styles.currencyPrefix, { color: theme.primary, fontFamily: theme.fontFamily }]}>CFA</Text>
                      <TextInput
                        style={[styles.input, { color: theme.textPrimary, fontSize: 24, letterSpacing: 1, fontFamily: theme.fontFamily }]}
                        placeholder="0"
                        placeholderTextColor={theme.inactiveToken}
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.btnPrimary, { backgroundColor: submitted ? theme.inactiveToken : theme.primary, opacity: loading ? 0.7 : 1 }]}
                    onPress={triggerPaymentSubmit}
                    disabled={loading || submitted}
                  >
                    {loading ? <ActivityIndicator color="#000" /> : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Confirmer • {amount ? `${parseFloat(amount).toLocaleString()} FCFA` : '0 FCFA'}</Text>
                        <Feather name="arrow-right" size={18} color="#000" />
                      </View>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
      <PinModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  mainTitle: { fontSize: 24, textTransform: 'uppercase', letterSpacing: 1 },
  descText: { fontSize: 13, marginTop: 4 },
  scanBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  
  searchSection: { paddingHorizontal: 20, marginBottom: 15 },
  searchBox: { flexDirection: 'row', alignItems: 'center', height: 56, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },
  
  categoryScroll: { paddingHorizontal: 20, paddingBottom: 15, gap: 10 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  categoryText: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },

  // Grid Styles
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  gridCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 125,
  },
  brandLogoBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  brandLogoImage: {
    width: '100%',
    height: '100%',
  },
  gridCardName: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gridCardType: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.8,
  },

  emptyState: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, minHeight: 400, borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  modalHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  modalLogoBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: { fontSize: 18, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#333' },
  
  inputGroup: { marginBottom: 24 },
  label: { fontSize: 12, marginBottom: 10, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  currencyPrefix: { fontSize: 16, marginRight: 12 },
  input: { flex: 1, fontSize: 16, height: '100%' },
  
  btnPrimary: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  btnText: { color: '#000', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 },
  
  // Pin Modal Styles
  pinModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  pinModalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    padding: 24,
    alignItems: 'center',
  },
  pinModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pinModalSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
    marginBottom: 30,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  keyboardContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyboardKey: {
    flex: 1,
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  keyboardKeyText: {
    fontSize: 20,
    fontWeight: '700',
  },
});

