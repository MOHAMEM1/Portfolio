import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LimitsScreen() {
  const { colors: theme, isDark } = useAppTheme();

  const limits = [
    {
      level: 'Niveau 1',
      title: 'Plafond Initial',
      amount: '200,000 FCFA',
      desc: 'Solde maximum autorisé sans pièce d\'identité.',
      icon: 'shield',
      color: theme.textSecondary
    },
    {
      level: 'Niveau 2',
      title: 'Plafond Standard',
      amount: '2,000,000 FCFA',
      desc: 'Solde maximum après vérification d\'identité (CNI/Passeport).',
      icon: 'check-circle',
      color: '#3B82F6'
    },
    {
      level: 'Niveau 3',
      title: 'Plafond Premium',
      amount: '10,000,000 FCFA',
      desc: 'Solde maximum avec justificatif de domicile et de revenus.',
      icon: 'star',
      color: '#F59E0B'
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Limites de transaction</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.description, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
            Vos limites de transaction sont déterminées par votre niveau de vérification KYC (Know Your Customer) selon la réglementation de la BCEAO.
          </Text>

          {limits.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name={item.icon as any} size={20} color={item.color} style={{ marginRight: 8 }} />
                  <Text style={[styles.levelLabel, { color: item.color, fontFamily: theme.fontFamily }]}>{item.level}</Text>
                </View>
                {index === 0 && (
                  <View style={[styles.badge, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                    <Text style={[styles.badgeText, { color: '#10B981', fontFamily: theme.fontFamily }]}>Actif</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{item.title}</Text>
              <Text style={[styles.amount, { color: theme.primary, fontFamily: theme.fontFamily }]}>{item.amount}</Text>
              <Text style={[styles.desc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{item.desc}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}
            onPress={() => router.push('/kyc')}
          >
            <Text style={[styles.upgradeBtnText, { fontFamily: theme.fontFamily }]}>Augmenter mes limites (KYC)</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  description: { fontSize: 14, marginBottom: 20, lineHeight: 22 },
  card: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  amount: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 13, lineHeight: 20 },
  upgradeBtn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  upgradeBtnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});
