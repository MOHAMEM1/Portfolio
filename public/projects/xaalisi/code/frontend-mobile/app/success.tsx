import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useLocalSearchParams, router } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { ScrollView } from 'react-native-gesture-handler';

export default function SuccessScreen() {
  const { colors: theme } = useAppTheme();
  const params = useLocalSearchParams();
  
  const type = params.type || 'transfer';
  const amount = params.amount || '0';
  const recipient = params.recipient || 'N/A';
  const reference = params.reference || Math.random().toString(36).substring(2, 10).toUpperCase();
  const title = params.title || 'Opération Réussie';
  const subtitle = params.subtitle || 'Votre transaction a été validée avec succès.';

  const formattedAmount = parseFloat(amount as string).toLocaleString();
  const currentDate = new Date().toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Checkmark Backdrop */}
        <View style={styles.badgeSection}>
          <Animated.View entering={ZoomIn.duration(500)} style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="checkmark-done" size={54} color="#000000" />
          </Animated.View>
          
          <Animated.Text entering={FadeInDown.duration(500).delay(200)} style={[styles.title, { color: theme.primary, fontFamily: theme.fontFamily }]}>
            {title}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(500).delay(300)} style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
            {subtitle}
          </Animated.Text>
        </View>

        {/* Receipt/Transaction Details Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={[styles.receiptCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.receiptHeader}>
            <Text style={[styles.receiptLabel, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]}>MONTANT TOTAL</Text>
            <Text style={[styles.receiptAmount, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
              {formattedAmount} <Text style={{ fontSize: 18, fontWeight: '500' }}>FCFA</Text>
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Type</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
              {type === 'transfer' ? 'Transfert de Fonds' : 'Paiement de Facture'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              {type === 'transfer' ? 'Destinataire' : 'Fournisseur'}
            </Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{recipient}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Date & Heure</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{currentDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Frais de Service</Text>
            <Text style={[styles.detailValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>0 FCFA</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Référence ID</Text>
            <Text style={[styles.detailValue, { color: theme.primary, fontFamily: theme.fontFamily, fontWeight: '700' }]}>{reference}</Text>
          </View>
        </Animated.View>

        {/* Navigation Actions */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={[styles.primaryBtnText, { fontFamily: theme.fontFamily }]}>Retour à l&apos;accueil</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.secondaryBtn, { borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/factures', params: { search: reference } })}
          >
            <Ionicons name="receipt-outline" size={18} color={theme.textPrimary} style={{ marginRight: 8 }} />
            <Text style={[styles.secondaryBtnText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Voir la facture</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center', alignItems: 'center' },
  badgeSection: {
    alignItems: 'center',
    marginBottom: 35,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  receiptCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    marginBottom: 35,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  receiptLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  receiptAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  divider: {
    height: 1.5,
    width: '100%',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionContainer: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
