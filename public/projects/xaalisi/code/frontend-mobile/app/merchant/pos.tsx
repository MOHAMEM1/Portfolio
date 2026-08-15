import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function SoftPOSScreen() {
  const { colors: theme, isDark } = useAppTheme();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState<'IDLE' | 'NFC' | 'QR' | 'INVOICE'>('IDLE');
  const [loading, setLoading] = useState(false);

  const simulateNFC = async () => {
    if (!amount) {
      Alert.alert('Erreur', 'Veuillez saisir un montant.');
      return;
    }
    setMode('NFC');
    setLoading(true);
    
    try {
      // Attendre 2 secondes pour l'effet visuel NFC
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const res = await fetchAPI('/merchants/nfc/charge', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(amount),
          card_number: "4000123456789010", // Dummy card for demo
          expiry: "12/25",
          cvv: "123"
        })
      });
      
      Alert.alert('Succès', res.message || 'Paiement sans contact (NFC) réussi !');
      setMode('IDLE');
      setAmount('');
      setDescription('');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Échec du paiement NFC.');
      setMode('IDLE');
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = async () => {
    if (!amount || !description) {
      Alert.alert('Erreur', 'Veuillez saisir un montant et une description (Email).');
      return;
    }
    setLoading(true);
    try {
      await fetchAPI('/merchants/invoice', {
        method: 'POST',
        body: JSON.stringify({ 
          customer_email: description,
          amount: parseFloat(amount),
          description: "Facture générée depuis SoftPOS" 
        })
      });
      Alert.alert('Succès', 'Facture envoyée avec succès.');
      setAmount('');
      setDescription('');
    } catch (err) {
      Alert.alert('Erreur', 'Erreur lors de la création de la facture.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1a1500', '#000000', '#0a0a0a'] : ['#FFFDF5', '#FFFFFF', '#F8F9FA']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface, borderColor: theme.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>XAALISI SoftPOS</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600)} style={styles.content}>
          
          <View style={styles.displayAmount}>
            <Text style={[styles.currency, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>FCFA</Text>
            <TextInput
              style={[styles.amountInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              editable={mode === 'IDLE'}
            />
          </View>

          <TextInput
            style={[styles.descInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, fontFamily: theme.fontFamily }]}
            placeholder="Description ou Email (Facture)"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            editable={mode === 'IDLE'}
          />

          {mode === 'NFC' ? (
            <View style={styles.nfcOverlay}>
              <Animated.View style={styles.pulseCircle}>
                <Ionicons name="wifi" size={80} color={theme.primary} style={{ transform: [{ rotate: '90deg' }] }} />
              </Animated.View>
              <Text style={[styles.nfcText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                Approchez la carte ou le téléphone du client...
              </Text>
            </View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={simulateNFC} disabled={loading}>
                <Ionicons name="card" size={24} color="#FFF" />
                <Text style={[styles.actionText, { fontFamily: theme.fontFamily }]}>Tap To Pay (NFC)</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={generateInvoice} disabled={loading}>
                <Feather name="file-text" size={24} color="#000" />
                <Text style={[styles.actionText, { color: '#000', fontFamily: theme.fontFamily }]}>Envoyer Facture</Text>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    flex: 1,
    justifyContent: 'center'
  },
  displayAmount: {
    alignItems: 'center',
    marginBottom: 40
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 10
  },
  amountInput: {
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    height: 80,
  },
  descInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 40
  },
  actions: {
    gap: 16
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700'
  },
  nfcOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  pulseCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(212,175,55,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(212,175,55,0.3)',
    marginBottom: 20
  },
  nfcText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center'
  }
});
