import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, RefreshControl, Dimensions, Linking, Alert, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors: theme, isDark, toggleTheme } = useAppTheme();
  const { username, logout } = useAuth();

  const [balance, setBalance] = useState(0);
  const [iban, setIban] = useState<string | null>(null);
  const [kycLevel, setKycLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailySpent, setDailySpent] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const { t, i18n } = useTranslation();

  const handleLogout = async () => {
    setMenuVisible(false);
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

  const DrawerMenuSection = ({ title, items }: any) => (
    <View style={styles.drawerSection}>
      <Text style={[styles.drawerSectionTitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{title}</Text>
      <View style={[styles.drawerCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]}>
        {items.map((item: any, index: number) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.drawerMenuItem, index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
            onPress={item.action}
          >
            <View style={styles.drawerMenuItemLeft}>
              <View style={[styles.drawerIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.background }]}>
                <Feather name={item.icon} size={18} color={item.danger ? theme.danger : theme.primary} />
              </View>
              <Text style={[styles.drawerMenuItemText, { color: item.danger ? theme.danger : theme.textPrimary, fontFamily: theme.fontFamily }]}>{item.label}</Text>
            </View>
            {item.value ? (
              <Text style={[styles.drawerMenuValue, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{item.value}</Text>
            ) : (
              <Feather name="chevron-right" size={18} color={theme.inactiveToken} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const KYC_LIMITS: Record<number, number> = {
    1: 5000,
    2: 200000,
    3: 5000000
  };

  const currentLimit = KYC_LIMITS[kycLevel] || 5000;
  const spendPercentage = Math.min((dailySpent / currentLimit) * 100, 100);

  const loadData = async () => {
    if (!username) return;
    try {
      // Offline-first: Load from cache
      const cachedDashboard = await import('@/config/storage').then(m => m.getSecureItem('offline_dashboard'));
      if (cachedDashboard) {
        const parsed = JSON.parse(cachedDashboard);
        setBalance(parsed.balance || 0);
        setDailySpent(parsed.dailySpent || 0);
        setIban(parsed.iban || null);
        setTransactions(parsed.transactions || []);
        setKycLevel(parsed.kycLevel || 1);
      }

      // Fetch real total balance and global daily spending across all accounts
      const resWallet = await fetchAPI(`/digital-banking/me/dashboard`);
      const newBalance = resWallet.total_balance !== undefined ? resWallet.total_balance : 0;
      const newDailySpent = resWallet.daily_spent !== undefined ? resWallet.daily_spent : 0;
      const newIban = resWallet.accounts && resWallet.accounts.length > 0 ? resWallet.accounts[0].iban : null;
      
      setBalance(newBalance);
      setDailySpent(newDailySpent);
      setIban(newIban);

      // Fetch real transactions
      const resHistory = await fetchAPI(`/transactions/history/${username}`);
      const newTransactions = resHistory.transactions || [];
      setTransactions(newTransactions);

      // Fetch real KYC level
      const resKyc = await fetchAPI(`/auth/kyc/status`);
      const newKycLevel = resKyc.kyc_tier !== undefined ? resKyc.kyc_tier : 1;
      setKycLevel(newKycLevel);

      // Update cache
      import('@/config/storage').then(m => m.setSecureItem('offline_dashboard', JSON.stringify({
        balance: newBalance,
        dailySpent: newDailySpent,
        iban: newIban,
        transactions: newTransactions,
        kycLevel: newKycLevel
      })));

    } catch (error) {
      console.error("Dashboard fetch error, falling back to cache", error);
      // Fallback is already handled by the initial cache load
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [username]);

  useEffect(() => {
    loadData();
  }, [username]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Luxury Top Header Card - Gold backdrop for both modes */}
        <Animated.View 
          entering={FadeInDown.duration(600)} 
          style={[
            styles.headerBlock, 
            { 
              borderColor: 'rgba(212, 175, 55, 0.25)',
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(229, 193, 88, 0.95)', 'rgba(212, 175, 55, 0.85)', 'rgba(170, 130, 10, 0.9)']}
            style={styles.headerGradient}
          />
          
          {/* Decorative Flowing Gold Ribbon Waves (wavy ribbon shapes, strictly gold, positioned away from text) */}
          <View style={[StyleSheet.absoluteFillObject, { zIndex: 1, overflow: 'hidden', borderBottomLeftRadius: 48, borderBottomRightRadius: 48 }]} pointerEvents="none">
            <Svg width="100%" height="100%" viewBox="0 0 400 350" preserveAspectRatio="none" pointerEvents="none">
              {/* Very transparent wide gold wave swooping in the background */}
              <Path 
                d="M 120,-20 C 200,60 280,100 420,110" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.12)" 
                strokeWidth="45" 
                strokeLinecap="round"
              />

              {/* Main gold ribbon 1 */}
              <Path 
                d="M 180,-20 C 260,60 320,120 420,160" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.25)" 
                strokeWidth="24" 
                strokeLinecap="round"
              />
              <Path 
                d="M 180,-20 C 260,60 320,120 420,160" 
                fill="none" 
                stroke="rgba(255, 255, 255, 0.15)" 
                strokeWidth="10" 
                strokeLinecap="round"
              />

              {/* Main gold ribbon 2 */}
              <Path 
                d="M 220,-20 C 290,80 340,160 420,220" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.18)" 
                strokeWidth="16" 
                strokeLinecap="round"
              />

              {/* Thin gold accent lines */}
              <Path 
                d="M 260,-20 C 310,90 360,200 420,280" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.22)" 
                strokeWidth="4" 
                strokeLinecap="round"
              />
              <Path 
                d="M 300,-20 C 340,100 380,240 420,320" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.15)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />

              {/* Bottom edge gold accent swoosh */}
              <Path 
                d="M -20,320 C 120,335 300,325 420,285" 
                fill="none" 
                stroke="rgba(212, 175, 55, 0.15)" 
                strokeWidth="18" 
                strokeLinecap="round"
              />
            </Svg>
          </View>
          
          {/* Top Actions Row */}
          <View style={styles.headerRow}>
            {/* Hamburger menu button on the left */}
            <TouchableOpacity 
              style={[styles.menuBtn, { backgroundColor: '#000000', shadowColor: '#000000' }]}
              onPress={() => router.push('/menu')}
            >
              <Feather name="menu" size={20} color="#D4AF37" />
            </TouchableOpacity>

            {/* Larger Wallet Button on the right - Routes to Cards page */}
            <TouchableOpacity 
              style={[styles.walletBtn, { backgroundColor: '#000000', borderColor: '#D4AF37' }]}
              onPress={() => router.push('/cards')}
            >
              <Ionicons name="wallet" size={18} color="#D4AF37" style={{ marginRight: 6 }} />
              <Text style={[styles.walletBtnText, { color: '#D4AF37', fontFamily: theme.fontFamily }]}>Wallet</Text>
            </TouchableOpacity>
          </View>

          {/* Balance Section */}
          <View style={styles.balanceSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15 }}>
              <Text style={[styles.balanceTitle, { color: '#000000', fontFamily: theme.fontFamily }]}>
                {t('home.main_balance')}
              </Text>
              <TouchableOpacity onPress={() => setShowBalance(!showBalance)} style={{ marginLeft: 10 }}>
                <Feather name={showBalance ? "eye-off" : "eye"} size={16} color="#000000" />
              </TouchableOpacity>
            </View>
            <View style={styles.balanceRow}>
              {showBalance ? (
                <>
                  <Text style={[styles.balancePrefix, { color: '#000000', fontFamily: theme.fontFamily }]}>FCFA</Text>
                  <Text style={[styles.balanceValue, { color: '#000000', fontFamily: theme.fontFamily }]}>
                    {balance.toLocaleString()}
                  </Text>
                </>
              ) : (
                <Text style={[styles.balanceHidden, { color: '#000000' }]}>••••••••</Text>
              )}
            </View>
            
            {/* IBAN Display */}
            {iban && (
              <View style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, marginRight: 6, fontFamily: theme.fontFamily }}>IBAN</Text>
                <Text style={{ color: '#000000', fontSize: 13, fontWeight: '600', letterSpacing: 1, fontFamily: theme.fontFamily }}>
                  {showBalance ? iban : '•••• •••• •••• ••••'}
                </Text>
              </View>
            )}

            {/* Top Up Button */}
            <TouchableOpacity 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#000000',
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                marginTop: 14,
                alignSelf: 'flex-start',
                borderWidth: 1.5,
                borderColor: '#D4AF37',
              }}
              onPress={() => router.push('/(tabs)/agent')}
            >
              <Feather name="plus-circle" size={16} color="#D4AF37" style={{ marginRight: 8 }} />
              <Text style={{ color: '#D4AF37', fontSize: 13, fontWeight: '700', fontFamily: theme.fontFamily, letterSpacing: 0.5 }}>{t('home.top_up')}</Text>
            </TouchableOpacity>
          </View>

          {/* Overlapping Daily Spending Tag */}
          <View style={[styles.overlapTag, { 
            backgroundColor: '#000000', 
            borderColor: '#D4AF37', 
            borderWidth: 1.5,
            shadowColor: '#000000' 
          }]}>
            <Feather name="arrow-up" size={14} color="#D4AF37" style={{ marginRight: 6 }} />
            <Text style={[styles.overlapTagText, { color: '#FFFFFF', fontFamily: theme.fontFamily }]}>
              {t('home.daily_spent')}: <Text style={{ color: '#D4AF37', fontWeight: '700' }}>{dailySpent.toLocaleString()}</Text> / {currentLimit.toLocaleString()} FCFA
            </Text>
          </View>
        </Animated.View>

        {/* Operation Grid (3x2 layout matching the screenshot) */}
        <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.operationsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('home.quick_actions')}</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={[styles.seeAllText, { color: theme.primary, fontFamily: theme.fontFamily }]}>{t('home.history')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.gridContainer}>
            {/* Card 1: Transfer */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/(tabs)/transfers')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.transfer')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <Ionicons name="swap-horizontal" size={24} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 2: My Wallet */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/cards')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.cards')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <Ionicons name="wallet" size={24} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 3: Chèques */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/cheques')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.cheques')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <Ionicons name="book" size={24} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 4: Scanner QR */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/scan')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.scan')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary, borderColor: theme.primary }]}>
                  <Ionicons name="qr-code" size={24} color="#000000" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 5: Assistant IA */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/support-chat')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.support')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <Ionicons name="sparkles" size={24} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Card 6: Mode Marchand (SoftPOS) */}
            <TouchableOpacity 
              style={[styles.gridCard, { borderColor: theme.primary, borderWidth: 1.5 }]}
              onPress={() => router.push('/merchant/pos')}
            >
              <View style={[styles.cardHeader, { backgroundColor: '#000000' }]}>
                <Text style={[styles.cardHeaderText, { color: '#D4AF37', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit>{t('home.merchant')}</Text>
              </View>
              <View style={[styles.cardBody, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <Feather name="shopping-bag" size={24} color={theme.primary} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Profile / KYC Progress Card */}
        <Animated.View entering={FadeInUp.duration(600).delay(300)} style={styles.kycSection}>
          <TouchableOpacity 
            style={[styles.kycCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push('/kyc')}
          >
            <View style={styles.kycHeader}>
              <Text style={[styles.kycTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('home.kyc_banner_title')}</Text>
              <Text style={[styles.kycStepText, { color: theme.primary, fontFamily: theme.fontFamily }]}>{kycLevel} / 3</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={[styles.kycProgressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
              <View style={[styles.kycProgressFill, { backgroundColor: theme.primary, width: `${(kycLevel / 3) * 100}%` }]} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.kycDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('home.kyc_banner_desc')}</Text>
              <Feather name="chevron-right" size={16} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Recent Activity Section */}
        <Animated.View entering={FadeInUp.duration(600).delay(400)} style={styles.txnSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('home.recent_tx')}</Text>
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyTxn, { borderColor: theme.border }]}>
              <Feather name="list" size={28} color={theme.inactiveToken} style={{ marginBottom: 12, opacity: 0.5 }} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontFamily: theme.fontFamily }}>
                {t('home.no_transactions')}
              </Text>
            </View>
          ) : (
            transactions.slice(0, 3).map((txn) => {
              const isPositive = txn.type === 'CREDIT';
              const color = isPositive ? theme.success : '#FF5252';
              let iconName = 'arrow-up-right';
              if (txn.transaction_type === 'DEPOSIT') iconName = 'arrow-down-left';
              else if (txn.transaction_type === 'WITHDRAWAL') iconName = 'arrow-up-right';
              else if (txn.transaction_type === 'TRANSFER' && isPositive) iconName = 'arrow-down-left';
              else if (txn.transaction_type === 'PAYMENT') iconName = 'file-text';

              return (
                <View key={txn.transaction_id} style={[styles.txnItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.txnLeft}>
                    <View style={[styles.txnIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
                      <Feather name={iconName as any} size={16} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.txnTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
                        {txn.description || (isPositive ? t('home.transfer_received') : t('home.transfer_sent'))}
                      </Text>
                      <Text style={[styles.txnDate, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
                        {new Date(txn.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Text style={[styles.txnAmount, { color: color, fontFamily: theme.fontFamily, fontWeight: '700' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                      {isPositive ? '+' : '-'}{parseFloat(txn.amount as any).toLocaleString()}
                    </Text>
                    <Feather name="chevron-right" size={14} color={theme.inactiveToken} />
                  </View>
                </View>
              );
            })
          )}
        </Animated.View>
      </ScrollView>

      {/* Drawer Menu overlay */}
      {menuVisible && (
        <View style={[StyleSheet.absoluteFillObject, { zIndex: 1000 }]}>
          {/* Backdrop overlay */}
          <TouchableOpacity 
            activeOpacity={1}
            style={styles.drawerBackdrop}
            onPress={() => setMenuVisible(false)}
          />
          {/* Drawer Panel */}
          <Animated.View 
            entering={SlideInLeft.duration(250)}
            exiting={SlideOutLeft.duration(200)}
            style={[styles.drawerPanel, { backgroundColor: theme.background, borderColor: theme.border }]}
          >
            <SafeAreaView style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Text style={[styles.drawerHeaderTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>XAALISI MENU</Text>
                <TouchableOpacity 
                  style={[styles.drawerCloseBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]}
                  onPress={() => setMenuVisible(false)}
                >
                  <Feather name="x" size={18} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.drawerScroll} showsVerticalScrollIndicator={false}>
                {/* Profile Info inside Drawer */}
                <View style={[styles.drawerProfile, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.drawerAvatar, { borderColor: theme.primary }]}>
                    <Text style={[styles.drawerAvatarText, { color: theme.primary, fontFamily: theme.fontFamily }]}>{username?.charAt(0).toUpperCase() || 'U'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.drawerProfileName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1}>{username || t('common.user')}</Text>
                    <Text style={[styles.drawerProfileId, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>ID: {username?.toUpperCase()}-XL</Text>
                  </View>
                </View>

                <DrawerMenuSection 
                  title={t('menu.security_title')} 
                  items={[
                    { icon: 'lock', label: t('menu.change_pin'), action: () => { setMenuVisible(false); router.push('/change-pin'); } },
                    { icon: 'shield', label: t('menu.limits'), action: () => { setMenuVisible(false); router.push('/limits'); } }
                  ]} 
                />

                <DrawerMenuSection 
                  title={t('menu.preferences_title')} 
                  items={[
                    { icon: 'globe', label: t('menu.language'), action: toggleLanguage, value: i18n.language === 'fr' ? 'Français' : 'English' },
                    { icon: 'moon', label: t('menu.dark_mode'), action: () => { toggleTheme(); }, value: isDark ? t('menu.active') : t('menu.inactive') }
                  ]} 
                />

                <DrawerMenuSection 
                  title={t('menu.help_title')} 
                  items={[
                    { icon: 'help-circle', label: t('menu.help_center'), action: () => { setMenuVisible(false); router.push('/help'); } },
                    { icon: 'message-circle', label: t('menu.contact_support'), action: handleSupport }
                  ]} 
                />

                <DrawerMenuSection 
                  title={t('menu.logout_title')} 
                  items={[
                    { icon: 'log-out', label: t('menu.logout'), action: handleLogout, danger: true }
                  ]} 
                />

                <Text style={[styles.drawerVersion, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]}>XAALISI v1.0.0</Text>
              </ScrollView>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  
  headerBlock: {
    height: 350,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    paddingHorizontal: 20,
    paddingTop: 20,
    position: 'relative',
    marginBottom: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderTopWidth: 0,
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },
  walletBtn: {
    height: 38,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
  },
  walletBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  balanceSection: {
    paddingLeft: 5,
  },
  balanceSubTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  balanceTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  balancePrefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  balanceHidden: {
    fontSize: 30,
    letterSpacing: 4,
    marginTop: 5,
  },
  overlapTag: {
    position: 'absolute',
    bottom: -22,
    left: 20,
    right: 20,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  overlapTagText: {
    fontSize: 11,
  },

  operationsSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  gridCard: {
    width: (width - 40 - 20) / 3,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    height: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  kycSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  kycCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  kycTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  kycStepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  kycProgressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 15,
  },
  kycProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  kycDesc: {
    fontSize: 13,
  },

  txnSection: {
    paddingHorizontal: 20,
  },
  emptyTxn: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txnIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  txnDate: {
    fontSize: 10,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  waveOverlay: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    zIndex: 1,
  },
  waveLine: {
    position: 'absolute',
    opacity: 0.85,
  },
  
  // Drawer Menu Styles
  drawerBackdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  drawerPanel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.78,
    borderRightWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
    paddingBottom: 15,
  },
  drawerHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  drawerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  drawerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  drawerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  drawerProfileName: {
    fontSize: 15,
    fontWeight: '700',
  },
  drawerProfileId: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  drawerSection: {
    marginBottom: 18,
  },
  drawerSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 10,
    marginBottom: 8,
  },
  drawerCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  drawerMenuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  drawerMenuItemText: {
    fontSize: 13,
  },
  drawerMenuValue: {
    fontSize: 12,
  },
  drawerVersion: {
    textAlign: 'center',
    fontSize: 10,
    marginTop: 15,
  },
});

