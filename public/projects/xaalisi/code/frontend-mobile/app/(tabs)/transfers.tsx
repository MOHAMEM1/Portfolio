import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, ScrollView, Modal } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { useCeilingCheck } from '@/hooks/useCeilingCheck';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import AppAlert from '@/components/AppAlert';
import { useAppAlert } from '@/hooks/useAppAlert';

export default function TransfersScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  const { checkCeiling } = useCeilingCheck(1); // User's KYC level
  const { t } = useTranslation();
  
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [transferType, setTransferType] = useState('wallet');
  const [recentContacts, setRecentContacts] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('virtual');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fundingSources = [
    { id: 'virtual', name: 'Visa Virtuelle', detail: '•••• 4242', icon: 'credit-card' },
    { id: 'physical', name: 'Visa Physique', detail: '•••• 8912', icon: 'credit-card' }
  ];

  // PIN modal states
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [pendingPin, setPendingPin] = useState('');

  const { alertState, showAlert, hideAlert } = useAppAlert();

  useEffect(() => {
    const fetchRecentContacts = async () => {
      if (!username) return;
      try {
        const res = await fetchAPI(`/transactions/history/${username}`);
        const txs = res.transactions || [];
        const seen = new Set<string>();
        const contactsList: any[] = [];
        
        txs.forEach((tx: any) => {
          const contactPhone = tx.other_party;
          if (
            contactPhone && 
            contactPhone !== username && 
            !contactPhone.startsWith('System_') && 
            !contactPhone.startsWith('SYSTEM_') && 
            !seen.has(contactPhone)
          ) {
            seen.add(contactPhone);
            contactsList.push({
              id: contactPhone,
              name: contactPhone,
              phone: contactPhone,
              initial: contactPhone.charAt(0).toUpperCase()
            });
          }
        });
        setRecentContacts(contactsList.slice(0, 5));
      } catch (err) {
        console.error("Error fetching recent contacts", err);
      }
    };
    fetchRecentContacts();
  }, [username]);

  const triggerTransferSubmit = () => {
    if (!receiver || !amount) {
      showAlert(t('agent.fields_required'), t('transfers.fields_required_msg', 'Veuillez saisir un destinataire et un montant.'), { type: 'warning' });
      return;
    }
    
    // CEILING CHECK: Block if amount exceeds KYC limit
    if (!checkCeiling(parseFloat(amount))) return;
    
    setPinModalVisible(true);
  };

  const handlePinSubmit = async (pinCode: string, otpCode?: string) => {
    setLoading(true);
    setSubmitted(true); // LOCK the button immediately
    try {
      const headers: any = {};
      if (otpCode) {
        headers['X-OTP-Code'] = otpCode;
      }
      const response = await fetchAPI('/transactions/transfer', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          sender: username,
          receiver,
          amount: parseFloat(amount),
          pin_code: pinCode
        })
      });
      
      // Navigate to the Success screen
      const selectedSrcInfo = fundingSources.find(s => s.id === selectedSource);
      router.replace({
        pathname: '/success',
        params: {
          type: 'transfer',
          amount: amount,
          recipient: receiver,
          title: 'Transfert Réussi',
          subtitle: response.message || `${amount} FCFA ${t('transfers.sent_to', 'envoyés à')} ${receiver} ${t('transfers.from', 'depuis votre')} ${selectedSrcInfo?.name || 'Wallet'}.`
        }
      });
    } catch (error: any) {
      if (error.message && error.message.includes('MFA_REQUIRED')) {
        setPendingPin(pinCode);
        try {
          await fetchAPI('/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: username })
          });
          setOtpModalVisible(true);
        } catch (otpError: any) {
          showAlert(t('common.error', 'Erreur'), 'Impossible d\'envoyer le code OTP.', { type: 'error' });
        }
      } else {
        showAlert(t('transfers.failed', 'Échec du Transfert'), error.message || t('common.error', 'Une erreur est survenue.'), { type: 'error' });
      }
      setSubmitted(false); // Unlock on failure so user can retry
    } finally {
      setLoading(false);
    }
  };

  const TransferTypeSelector = () => (
    <View style={[styles.typeSelectorContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {[
        { id: 'wallet', label: t('transfers.wallet', 'Wallet'), icon: 'smartphone' },
        { id: 'bank', label: t('transfers.bank', 'Banque'), icon: 'briefcase' },
        { id: 'mobile', label: t('transfers.mobile', 'Mobile'), icon: 'phone' },
        { id: 'diaspora', label: 'Diaspora (EUR)', icon: 'globe' }
      ].map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[styles.typeBtn, transferType === type.id && { backgroundColor: theme.primary }]}
          onPress={() => setTransferType(type.id)}
        >
          <Feather name={type.icon as any} size={14} color={transferType === type.id ? '#000' : theme.textSecondary} style={{ marginRight: 6 }} />
          <Text style={[styles.typeBtnText, { color: transferType === type.id ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

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
            handlePinSubmit(newPin);
          }, 200);
        }
      }
    };

    const handleDelete = () => {
      setLocalPin(localPin.slice(0, -1));
    };

    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={pinModalVisible}
        onRequestClose={() => setPinModalVisible(false)}
      >
        <SafeAreaView style={[styles.pinModalOverlay, { backgroundColor: '#000000' }]}>
          <View style={styles.pinModalHeader}>
            <TouchableOpacity onPress={() => setPinModalVisible(false)} style={styles.pinModalCloseBtn}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.pinModalHeaderTitle, { fontFamily: theme.fontFamily }]}>SÉCURITÉ</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.pinModalContent} bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.warningContainer}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="shield-checkmark" size={44} color="#D4AF37" />
              </View>
              <Text style={[styles.pinModalTitle, { color: '#FFD700', fontFamily: theme.fontFamily }]}>
                AVERTISSEMENT DE SÉCURITÉ
              </Text>
              <Text style={[styles.pinModalSubtitle, { color: '#CCCCCC', fontFamily: theme.fontFamily }]}>
                Veuillez confirmer que vous êtes bien le titulaire du compte. Toute tentative d&apos;opération frauduleuse ou non autorisée entraînera la suspension immédiate du compte.
              </Text>
            </View>

            <Text style={[styles.transferInfoText, { color: '#888888', fontFamily: theme.fontFamily }]}>
              Montant : <Text style={{ color: '#D4AF37', fontWeight: '700' }}>{parseFloat(amount || '0').toLocaleString()} FCFA</Text> vers <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{receiver}</Text>
            </Text>

            {/* Dots */}
            <View style={styles.pinDotsContainer}>
              {[...Array(pinLength)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: i < localPin.length ? '#D4AF37' : 'transparent',
                      borderColor: '#D4AF37',
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
                        style={[styles.keyboardKey, { backgroundColor: '#111111', borderColor: '#222222' }]}
                        onPress={() => {
                          if (key === 'cancel') setPinModalVisible(false);
                          else if (key === 'delete') handleDelete();
                          else handleNumberPress(key);
                        }}
                      >
                        {key === 'cancel' ? (
                          <Feather name="x" size={20} color="#FFFFFF" />
                        ) : key === 'delete' ? (
                          <Feather name="delete" size={20} color="#FFFFFF" />
                        ) : (
                          <Text style={[styles.keyboardKeyText, { color: '#FFFFFF', fontFamily: theme.fontFamily }]}>
                            {key}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
          <AppAlert {...alertState} onDismiss={hideAlert} />
        </SafeAreaView>
      </Modal>
    );
  };

  const OtpModal = () => {
    const otpLength = 6;
    const [localOtp, setLocalOtp] = useState('');

    const handleNumberPress = (num: string) => {
      if (localOtp.length < otpLength) {
        const newOtp = localOtp + num;
        setLocalOtp(newOtp);
        if (newOtp.length === otpLength) {
          setTimeout(() => {
            setOtpModalVisible(false);
            handlePinSubmit(pendingPin, newOtp);
          }, 200);
        }
      }
    };

    const handleDelete = () => {
      setLocalOtp(localOtp.slice(0, -1));
    };

    return (
      <Modal
        animationType="fade"
        transparent={false}
        visible={otpModalVisible}
        onRequestClose={() => setOtpModalVisible(false)}
      >
        <SafeAreaView style={[styles.pinModalOverlay, { backgroundColor: '#000000' }]}>
          <View style={styles.pinModalHeader}>
            <TouchableOpacity onPress={() => setOtpModalVisible(false)} style={styles.pinModalCloseBtn}>
              <Feather name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={[styles.pinModalHeaderTitle, { fontFamily: theme.fontFamily }]}>VALIDATION OTP</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.pinModalContent} bounces={false} showsVerticalScrollIndicator={false}>
            <View style={styles.warningContainer}>
              <View style={styles.warningIconCircle}>
                <Ionicons name="chatbubble-ellipses-outline" size={44} color="#D4AF37" />
              </View>
              <Text style={[styles.pinModalTitle, { color: '#FFD700', fontFamily: theme.fontFamily }]}>
                CODE OTP REQUIS
              </Text>
              <Text style={[styles.pinModalSubtitle, { color: '#CCCCCC', fontFamily: theme.fontFamily }]}>
                Un code de vérification à 6 chiffres a été envoyé par SMS. Veuillez le saisir ci-dessous pour valider la transaction de gros montant.
              </Text>
            </View>

            <View style={styles.pinDotsContainer}>
              {[...Array(otpLength)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: i < localOtp.length ? '#D4AF37' : 'transparent',
                      borderColor: '#D4AF37',
                    },
                  ]}
                />
              ))}
            </View>

            <View style={styles.keyboardContainer}>
              {[
                ['1', '2', '3'],
                ['4', '5', '6'],
                ['7', '8', '9'],
                ['cancel', '0', 'delete']
              ].map((row, rowIndex) => (
                <View key={rowIndex} style={styles.keyboardRow}>
                  {row.map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.keyboardKey, { backgroundColor: '#111111', borderColor: '#222222' }]}
                      onPress={() => {
                        if (key === 'cancel') setOtpModalVisible(false);
                        else if (key === 'delete') handleDelete();
                        else handleNumberPress(key);
                      }}
                    >
                      {key === 'cancel' ? (
                        <Feather name="x" size={20} color="#FFFFFF" />
                      ) : key === 'delete' ? (
                        <Feather name="delete" size={20} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.keyboardKeyText, { color: '#FFFFFF', fontFamily: theme.fontFamily }]}>
                          {key}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
          <AppAlert {...alertState} onDismiss={hideAlert} />
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.push('/menu')} style={styles.backBtn}>
            <Feather name="menu" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('transfers.title', "Envoyer de l'argent")}</Text>
          <View style={{ width: 24 }} />
        </Animated.View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <TransferTypeSelector />
          </Animated.View>

          {/* Recent Contacts */}
          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('transfers.recent_contacts', 'CONTACTS RÉCENTS')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
              {recentContacts.map((contact) => (
                <TouchableOpacity 
                  key={contact.id} 
                  style={styles.contactItem}
                  onPress={() => setReceiver(contact.phone)}
                >
                  <View style={[styles.contactAvatar, { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 }]}>
                    <Text style={[styles.contactInitial, { color: theme.primary, fontFamily: theme.fontFamily }]}>{contact.initial}</Text>
                  </View>
                  <Text style={[styles.contactName, { color: theme.textSecondary, fontFamily: theme.fontFamily }]} numberOfLines={1}>
                    {contact.name}
                  </Text>
                </TouchableOpacity>
              ))}
              {recentContacts.length === 0 && (
                <View style={{ justifyContent: 'center', marginRight: 20, paddingVertical: 10 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, fontFamily: theme.fontFamily, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('transfers.no_recent', 'Aucun contact récent')}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.contactItem} onPress={() => router.push('/scan')}>
                <View style={[styles.contactAvatar, { backgroundColor: theme.primary, borderWidth: 0 }]}>
                  <Feather name="maximize" size={20} color="#000000" />
                </View>
                <Text style={[styles.contactName, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('transfers.scan', 'Scanner')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.formContainer}>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('transfers.source_account', "COMPTE D'ORIGINE")}</Text>
              
              <TouchableOpacity
                style={[
                  styles.dropdownHeader,
                  {
                    backgroundColor: theme.surface,
                    borderColor: dropdownOpen ? theme.primary : theme.border,
                  }
                ]}
                activeOpacity={0.8}
                onPress={() => setDropdownOpen(!dropdownOpen)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={[styles.sourceIconBox, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                    <Feather name="credit-card" size={16} color={theme.primary} />
                  </View>
                  <View>
                    <Text style={[styles.sourceName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                      {fundingSources.find(s => s.id === selectedSource)?.name}
                    </Text>
                    <Text style={[styles.sourceDetail, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: 10 }]}>
                      {fundingSources.find(s => s.id === selectedSource)?.detail}
                    </Text>
                  </View>
                </View>
                <Feather name={dropdownOpen ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              {dropdownOpen && (
                <View style={[styles.dropdownList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  {fundingSources.map((src) => {
                    const isSelected = selectedSource === src.id;
                    return (
                      <TouchableOpacity
                        key={src.id}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                          }
                        ]}
                        onPress={() => {
                          setSelectedSource(src.id);
                          setDropdownOpen(false);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Feather name="credit-card" size={16} color={isSelected ? theme.primary : theme.textSecondary} />
                          <View>
                            <Text style={[styles.sourceName, { color: isSelected ? theme.primary : theme.textPrimary, fontFamily: theme.fontFamily }]}>
                              {src.name}
                            </Text>
                            <Text style={[styles.sourceDetail, { color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: 10 }]}>
                              {src.detail}
                            </Text>
                          </View>
                        </View>
                        {isSelected && <Feather name="check" size={16} color={theme.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
                {transferType === 'bank' ? 'IBAN / NUMÉRO DE COMPTE' : t('transfers.recipient', "DESTINATAIRE")}
              </Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Feather name={transferType === 'bank' ? 'briefcase' : 'user'} size={18} color={theme.primary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1, color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder={transferType === 'bank' ? "Ex: ML0000000000" : "+223 70 00 00 00"}
                  placeholderTextColor={theme.inactiveToken}
                  value={receiver}
                  onChangeText={setReceiver}
                  keyboardType={transferType === 'bank' ? 'default' : 'phone-pad'}
                />
                <TouchableOpacity onPress={() => showAlert('Bénéficiaire', 'Contact enregistré avec succès!')} style={{ padding: 5 }}>
                  <Feather name="user-plus" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('transfers.amount', "MONTANT")}</Text>
              <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.currencyPrefix, { color: theme.primary, fontFamily: theme.fontFamily }]}>
                  {transferType === 'diaspora' ? 'EUR' : 'CFA'}
                </Text>
                <TextInput
                  style={[styles.input, styles.amountInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                  placeholder="0"
                  placeholderTextColor={theme.inactiveToken}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              
              {/* Convert EUR to FCFA dynamically if Diaspora */}
              {transferType === 'diaspora' && amount && !isNaN(Number(amount)) && (
                <Text style={{ color: '#10B981', fontFamily: theme.fontFamily, fontSize: 13, marginTop: 8 }}>
                  ≈ {(Number(amount) * 655.957).toLocaleString()} FCFA (Taux: 1 EUR = 655.95 FCFA)
                </Text>
              )}
            </View>

            <Animated.View entering={FadeInUp.duration(500).delay(400)} style={{ marginTop: 30, marginBottom: 20 }}>
              <TouchableOpacity 
                style={[styles.btnPrimary, { backgroundColor: submitted ? theme.inactiveToken : theme.primary, opacity: loading ? 0.7 : 1 }]}
                onPress={triggerTransferSubmit}
                disabled={loading || submitted}
                activeOpacity={0.7}
              >
                {loading ? <ActivityIndicator color="#000" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Feather name={submitted ? 'check-circle' : 'arrow-right'} size={18} color="#000" />
                    <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>{submitted ? 'Envoyé' : `Envoyer ${amount ? `${amount} FCFA` : ''}`}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>

          </Animated.View>

        </ScrollView>

        {/* PIN Entry Overlay */}
        <PinModal />
        <OtpModal />

      </KeyboardAvoidingView>
      <AppAlert {...alertState} onDismiss={hideAlert} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: '100%', height: '100%' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 20 : 40, 
    paddingBottom: 15, 
    borderBottomWidth: 1 
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  content: { paddingBottom: 100 },
  
  typeSelectorContainer: {
    flexDirection: 'row',
    margin: 20,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  typeBtnText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  recentSection: { marginBottom: 30 },
  sectionTitle: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 20, marginBottom: 15 },
  contactItem: { alignItems: 'center', marginRight: 20, width: 60 },
  contactAvatar: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  contactInitial: { fontSize: 20 },
  contactName: { fontSize: 11, textAlign: 'center', textTransform: 'uppercase' },

  formContainer: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  currencyPrefix: { fontSize: 16, marginRight: 12 },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%'
  },
  amountInput: {
    fontSize: 24,
    letterSpacing: 1,
  },
  
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
  },
  btnPrimary: {
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#000', fontSize: 15, textTransform: 'uppercase', letterSpacing: 1 },

  // Pin Modal Styles
  pinModalOverlay: {
    flex: 1,
  },
  pinModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 15,
  },
  pinModalCloseBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  pinModalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pinModalContent: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  warningContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 20,
  },
  warningIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  transferInfoText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
  },
  pinModalTitle: {
    fontSize: 16,
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
  sourceCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    minWidth: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  dropdownList: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sourceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sourceDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
});
