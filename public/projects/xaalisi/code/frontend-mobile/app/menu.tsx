import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function MenuScreen() {
  const { theme, colors, isDark, toggleTheme } = useAppTheme();
  const { username, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    await logout();
    setTimeout(() => router.replace('/'), 50);
  };

  const handleSupport = () => {
    Linking.openURL('mailto:support@xaalisi.com?subject=Demande de support XAALISI');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const MenuSection = ({ title, items, delay }: any) => (
    <Animated.View entering={FadeInUp.duration(500).delay(delay)} style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
        {items.map((item: any, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.menuItem, index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={item.action}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.background }]}>
                <Feather name={item.icon} size={18} color={item.danger ? colors.danger : colors.primary} />
              </View>
              <Text style={[styles.menuItemText, { color: item.danger ? colors.danger : colors.textPrimary, fontFamily: colors.fontFamily }]}>{item.label}</Text>
            </View>
            {item.value ? (
              <Text style={[styles.menuValue, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>{item.value}</Text>
            ) : (
              <Feather name="chevron-right" size={18} color={colors.inactiveToken} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]} onPress={handleBack}>
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Menu Principal</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Summary */}
        <Animated.View entering={FadeInDown.duration(500)} style={[styles.profileCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarLg, { borderColor: colors.primary }]}>
            <Text style={[styles.avatarTextLg, { color: colors.primary, fontFamily: colors.fontFamily }]}>{username?.charAt(0).toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>{username || 'Utilisateur'}</Text>
            <Text style={[styles.profileId, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>ID XAALISI: {username ? username.toUpperCase() : 'USER'}-XL</Text>
            <View style={[styles.kycBadge, { backgroundColor: colors.primary + '20' }]}>
              <Feather name="shield" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={[styles.kycText, { color: colors.primary, fontFamily: colors.fontFamily }]}>KYC Niveau 2</Text>
            </View>
          </View>
        </Animated.View>

        <MenuSection 
          title={t('menu.security_title', 'SÉCURITÉ')} 
          delay={100}
          items={[
            { icon: 'lock', label: t('menu.change_pin', 'Modifier le code PIN'), action: () => router.push('/change-pin') },
            { icon: 'shield', label: t('menu.limits', 'Limites de transaction'), action: () => router.push('/limits') }
          ]} 
        />

        <MenuSection 
          title={t('menu.preferences_title', 'PRÉFÉRENCES')} 
          delay={200}
          items={[
            { icon: 'globe', label: t('menu.language', 'Langue'), action: toggleLanguage, value: i18n.language === 'fr' ? 'Français' : 'English' },
            { icon: 'bell', label: t('menu.notifications', 'Notifications'), action: () => router.push('/notifications') },
            { icon: 'moon', label: t('menu.dark_mode', 'Mode Sombre'), action: toggleTheme, value: isDark ? t('menu.active', 'Activé') : t('menu.inactive', 'Désactivé') }
          ]} 
        />

        <MenuSection 
          title={t('menu.services_title', 'XAALISI SERVICES')} 
          delay={100}
          items={[
            { icon: 'send', label: t('menu.transfer', 'Transfert d\'argent'), action: () => router.push('/(tabs)/transfers') },
            { icon: 'shopping-cart', label: t('menu.merchant_payment', 'Paiement Marchand'), action: () => router.push('/merchant') },
            { icon: 'file-text', label: t('menu.bill_payment', 'Paiement Factures'), action: () => router.push('/factures') },
            { icon: 'users', label: t('menu.tontines', 'Tontines (Darét)'), action: () => router.push('/tontines') },
            { icon: 'globe', label: t('menu.international_transfer', 'Transfert International'), action: () => router.push('/(tabs)/transfers'), isNew: true },
          ]} 
        />

        <MenuSection 
          title={t('menu.help_title', 'AIDE & SUPPORT')} 
          delay={300}
          items={[
            { icon: 'help-circle', label: t('menu.help_center', 'Centre d\'aide'), action: () => router.push('/help') },
            { icon: 'message-circle', label: t('menu.contact_support', 'Contacter le support'), action: () => router.push('/support') },
            { icon: 'file-text', label: t('menu.terms', 'Conditions d\'utilisation'), action: () => router.push('/terms') }
          ]} 
        />

        <MenuSection 
          title={t('menu.logout_title', 'DÉCONNEXION')} 
          delay={400}
          items={[
            { icon: 'log-out', label: t('menu.logout', 'Se déconnecter'), action: handleLogout, danger: true }
          ]} 
        />

        <Text style={[styles.versionText, { color: colors.inactiveToken, fontFamily: colors.fontFamily }]}>XAALISI v1.0.0 (Build 2026)</Text>
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

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 30,
  },
  avatarLg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', borderWidth: 2, marginRight: 15 },
  avatarTextLg: { fontSize: 28 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, marginBottom: 4, letterSpacing: 0.5 },
  profileId: { fontSize: 12, marginBottom: 8, letterSpacing: 1 },
  kycBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  kycText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginLeft: 15, marginBottom: 10 },
  card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuItemText: { fontSize: 14, letterSpacing: 0.5 },
  menuValue: { fontSize: 13 },

  versionText: { textAlign: 'center', fontSize: 11, letterSpacing: 1, marginTop: 10, marginBottom: 20 },
});
