import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function TermsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Conditions d&apos;Utilisation</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={[styles.title, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Conditions Générales (CGU)</Text>
          <Text style={[styles.date, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>Dernière mise à jour : Juillet 2026</Text>

          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: colors.fontFamily }]}>1. Introduction</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>
              Bienvenue sur XAALISI. Les présentes Conditions d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de l&apos;application XAALISI. En utilisant notre plateforme, vous acceptez d&apos;être lié par ces conditions.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: colors.fontFamily }]}>2. Sécurité et Confidentialité</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>
              - Vous êtes responsable de la confidentialité de votre code PIN.{'\n'}
              - Toutes les transactions sont chiffrées (AES-256) et conformes aux normes bancaires (ISO 20022).{'\n'}
              - Vos données personnelles sont traitées conformément à notre Politique de Confidentialité.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: colors.fontFamily }]}>3. Responsabilités de la Banque</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>
              XAALISI agit en tant que plateforme technologique. Les fonds sont garantis par nos banques partenaires agrées par la BCEAO. Nous nous engageons à garantir une disponibilité système maximale.
            </Text>
          </View>

          <View style={[styles.section, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: colors.fontFamily }]}>4. Tarification</Text>
            <Text style={[styles.paragraph, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>
              La création du Wallet XAALISI est gratuite. Les frais appliqués lors des transferts et paiements marchands sont affichés de manière transparente avant la confirmation de la transaction.
            </Text>
          </View>

        </Animated.View>
      </ScrollView>
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
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 5 },
  date: { fontSize: 12, marginBottom: 25 },
  section: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, letterSpacing: 0.5 },
  paragraph: { fontSize: 14, lineHeight: 22 },
});
