import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

export default function AccountScreen() {
  const { colors: theme, isDark, toggleTheme } = useAppTheme();
  const { username, logout } = useAuth();
  const { t } = useTranslation();
  const [kycLevel, setKycLevel] = useState(1);
  const [loading, setLoading] = useState(true);

  const KYC_TIERS: Record<number, { label: string; limit: string; color: string }> = {
    1: { label: 'Tier 1 - Standard', limit: '5,000 FCFA / jour', color: '#718096' },
    2: { label: 'Tier 2 - Argent', limit: '200,000 FCFA / jour', color: '#A0AEC0' },
    3: { label: 'Tier 3 - Or Premium', limit: '5,000,000 FCFA / jour', color: '#D4AF37' }
  };

  const currentTier = KYC_TIERS[kycLevel] || KYC_TIERS[1];

  const fetchKycStatus = async () => {
    if (!username) return;
    try {
      const res = await fetchAPI(`/auth/kyc/status`);
      setKycLevel(res.kyc_tier !== undefined ? res.kyc_tier : 1);
    } catch (err) {
      console.error("Error fetching KYC level in Account screen", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStatus();
  }, [username]);

  const handleLogout = async () => {
    await logout();
    setTimeout(() => router.replace('/'), 50);
  };

  const initial = username ? username.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(500)} style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.title')}</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: theme.surface }]} onPress={() => router.push('/notifications')}>
          <Feather name="bell" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.profileSection}>
          <View style={[styles.avatarContainer, { borderColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.primary }]}>{initial}</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark-sharp" size={12} color="#000" />
            </View>
          </View>
          
          <Text style={[styles.usernameText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
            {username}
          </Text>
          <Text style={[styles.phoneText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
            Membre XAALISI
          </Text>
        </Animated.View>

        {/* KYC Badge Card */}
        <Animated.View entering={FadeInUp.duration(500).delay(200)} style={[styles.kycCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.kycHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark" size={20} color={currentTier.color} style={{ marginRight: 8 }} />
              <Text style={[styles.kycTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                {currentTier.label}
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/kyc')} style={[styles.upgradeBtn, { backgroundColor: theme.primary }]}>
              <Text style={styles.upgradeBtnText}>UPGRADE</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.kycLimitText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
            Limite journalière de transfert: <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{currentTier.limit}</Text>
          </Text>
        </Animated.View>

        {/* Menu Options */}
        <Animated.View entering={FadeInUp.duration(500).delay(300)} style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>PARAMÈTRES</Text>
          
          <View style={[styles.menuList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Dark Mode Toggle */}
            <View style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
              <View style={styles.menuRowLeft}>
                <Ionicons name="moon-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('settings.dark_mode')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#718096', true: theme.primary }}
                thumbColor={isDark ? '#000000' : '#FFFFFF'}
              />
            </View>

            {/* Manage Wallet */}
            <TouchableOpacity 
              style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => router.push('/cards')}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="card-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.wallet_cards')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>

            {/* Factures & Reçus */}
            <TouchableOpacity 
              style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => router.push('/factures')}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="receipt-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.invoices')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>

            {/* Relevés Bancaires */}
            <TouchableOpacity 
              style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => router.push('/statements')}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="document-text-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.statements')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>

            {/* KYC Settings */}
            <TouchableOpacity 
              style={[styles.menuRow, { borderBottomWidth: 1, borderBottomColor: theme.border }]}
              onPress={() => router.push('/kyc')}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="finger-print-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.kyc_status')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>

            {/* App Settings Screen */}
            <TouchableOpacity 
              style={styles.menuRow}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuRowLeft}>
                <Ionicons name="settings-outline" size={20} color={theme.primary} style={{ marginRight: 15 }} />
                <Text style={[styles.menuLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('account.app_settings')}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.duration(500).delay(400)} style={{ marginTop: 30 }}>
          <TouchableOpacity style={[styles.logoutBtn, { borderColor: '#EF4444' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={{ marginRight: 8 }} />
            <Text style={[styles.logoutBtnText, { fontFamily: theme.fontFamily }]}>{t('account.logout')}</Text>
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
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 110 },
  
  profileSection: {
    alignItems: 'center',
    marginVertical: 25,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  phoneText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  kycCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 30,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upgradeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  upgradeBtnText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  kycLimitText: {
    fontSize: 12,
  },

  menuSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 10,
    fontWeight: '700',
    paddingLeft: 5,
  },
  menuList: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});
