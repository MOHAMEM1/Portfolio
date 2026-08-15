import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAppAlert } from '@/hooks/useAppAlert';
import AppAlert from '@/components/AppAlert';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg from 'react-native-svg';

export default function MerchantScreen() {
  const { colors, isDark } = useAppTheme();
  const { alertState, showAlert, hideAlert } = useAppAlert();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrPayload, setQrPayload] = useState<any>(null);
  const [needsEnrollment, setNeedsEnrollment] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [nfcModalVisible, setNfcModalVisible] = useState(false);
  const [cardNumber, setCardNumber] = useState('');

  const generateQRCode = async () => {
    if (!amount || isNaN(Number(amount))) {
      showAlert('Erreur', 'Veuillez entrer un montant valide.', { type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAPI('/merchants/qr-code', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description || 'Achat en boutique'
        })
      });
      setQrPayload(res.qr_payload);
      setNeedsEnrollment(false);
    } catch (error: any) {
      if (error.status === 403 || error.message?.includes('Seul un marchand')) {
        setNeedsEnrollment(true);
      } else {
        showAlert('Erreur', error.message || 'Impossible de générer le QR Code.', { type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!businessName) {
      showAlert('Erreur', 'Veuillez entrer le nom de votre commerce.', { type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      await fetchAPI('/merchants/enroll', {
        method: 'POST',
        body: JSON.stringify({ business_name: businessName })
      });
      showAlert('Succès', 'Vous êtes maintenant un Marchand XAALISI !', { type: 'success' });
      setNeedsEnrollment(false);
      // Auto-generate QR if amount was entered
      if (amount) {
        generateQRCode();
      }
    } catch (error: any) {
      showAlert('Erreur', error.message || 'Impossible de vous enrôler.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNFCCharge = async () => {
    if (!amount || isNaN(Number(amount))) {
      showAlert('Erreur', 'Veuillez entrer un montant valide.', { type: 'warning' });
      return;
    }
    setNfcModalVisible(true);
  };

  const processNFC = async () => {
    if (!cardNumber || cardNumber.length < 16) {
      showAlert('Erreur', 'Carte invalide.', { type: 'warning' });
      return;
    }
    setLoading(true);
    setNfcModalVisible(false);
    try {
      const res = await fetchAPI('/merchants/nfc/charge', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          card_number: cardNumber,
          expiry: "12/25",
          cvv: "123"
        })
      });
      showAlert('Succès', res.message || 'Paiement NFC réussi.', { type: 'success' });
    } catch (error: any) {
      showAlert('Erreur', error.message || 'Impossible de traiter le paiement.', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]} onPress={() => { if(router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>XAALISI SoftPOS</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(500)} style={styles.introSection}>
            <View style={[styles.iconBoxLg, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="shopping-bag" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.introTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Paiement Marchand</Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>
              Générez un QR Code pour accepter les paiements de vos clients instantanément.
            </Text>
          </Animated.View>

          {needsEnrollment ? (
            <Animated.View entering={FadeInUp.duration(600).delay(100)} style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Devenir Marchand</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 20, fontFamily: colors.fontFamily }}>
                Vous devez activer le mode marchand pour utiliser SoftPOS.
              </Text>
              
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                  placeholder="Nom de votre commerce"
                  placeholderTextColor={colors.inactiveToken}
                  value={businessName}
                  onChangeText={setBusinessName}
                />
              </View>

              <TouchableOpacity 
                style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={handleEnroll}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#000000" /> : (
                  <>
                    <Feather name="check-circle" size={18} color="#000000" />
                    <Text style={[styles.btnPrimaryText, { fontFamily: colors.fontFamily }]}>S&apos;enrôler</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(600).delay(100)} style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Nouveau Paiement</Text>
              
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
                <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginRight: 10 }}>FCFA</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily, fontSize: 24, fontWeight: '700' }]}
                  placeholder="0"
                  placeholderTextColor={colors.inactiveToken}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                  placeholder="Description (Optionnel)"
                  placeholderTextColor={colors.inactiveToken}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity 
                  style={[styles.btnPrimary, { backgroundColor: colors.primary, flex: 1, marginTop: 0 }]}
                  onPress={generateQRCode}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#000000" /> : (
                    <>
                      <Feather name="grid" size={18} color="#000000" />
                      <Text style={[styles.btnPrimaryText, { fontFamily: colors.fontFamily, fontSize: 14 }]}>QR Code</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.btnPrimary, { backgroundColor: '#10B981', flex: 1, marginTop: 0 }]}
                  onPress={handleNFCCharge}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                      <Feather name="wifi" size={18} color="#FFFFFF" />
                      <Text style={[styles.btnPrimaryText, { fontFamily: colors.fontFamily, color: '#FFFFFF', fontSize: 14 }]}>Tap to Phone</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* NFC Modal Simulation */}
          {nfcModalVisible && (
            <Animated.View entering={FadeInUp.duration(400)} style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="smartphone" size={48} color={colors.primary} style={{ marginBottom: 15 }} />
              <Text style={[styles.qrTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Approchez la carte du client</Text>
              <Text style={{ color: colors.textSecondary, marginBottom: 20, textAlign: 'center', fontFamily: colors.fontFamily }}>
                Pour la démo, veuillez saisir un numéro de carte (16 chiffres).
              </Text>
              
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border, width: '100%' }]}>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                  placeholder="Numéro de carte"
                  placeholderTextColor={colors.inactiveToken}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="numeric"
                  maxLength={16}
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                <TouchableOpacity 
                  style={[styles.btnPrimary, { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border, flex: 1 }]}
                  onPress={() => setNfcModalVisible(false)}
                >
                  <Text style={{ color: colors.textPrimary, fontFamily: colors.fontFamily }}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.btnPrimary, { backgroundColor: colors.primary, flex: 1 }]}
                  onPress={processNFC}
                >
                  <Text style={{ color: '#000', fontFamily: colors.fontFamily, fontWeight: '700' }}>Simuler NFC</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* QR Code Display */}
          {qrPayload && !needsEnrollment && (
            <Animated.View entering={FadeInUp.duration(600)} style={[styles.qrContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.qrTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>À Scanner par le client</Text>
              <View style={{ padding: 20, backgroundColor: '#FFFFFF', borderRadius: 16 }}>
                {/* Note: In a real app we'd use a QR Code component here like react-native-qrcode-svg. 
                    For now, we display the payload as a string. */}
                <Feather name="maximize" size={120} color="#000000" style={{ alignSelf: 'center' }} />
                <Text style={{ textAlign: 'center', marginTop: 15, fontSize: 12, color: '#666' }}>{JSON.stringify(qrPayload)}</Text>
              </View>
              <Text style={[styles.qrAmount, { color: colors.primary, fontFamily: colors.fontFamily }]}>
                {qrPayload.amount.toLocaleString()} FCFA
              </Text>
            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
      <AppAlert {...alertState} onDismiss={hideAlert} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },

  introSection: { alignItems: 'center', marginBottom: 30 },
  iconBoxLg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  introTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  introDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  card: { padding: 20, borderRadius: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  input: { flex: 1, fontSize: 16 },

  btnPrimary: { flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  btnPrimaryText: { color: '#000000', fontSize: 16, fontWeight: '700' },

  qrContainer: { marginTop: 30, padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  qrTitle: { fontSize: 16, fontWeight: '700', marginBottom: 20 },
  qrAmount: { fontSize: 28, fontWeight: '800', marginTop: 20 }
});
