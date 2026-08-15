import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, StatusBar, Dimensions,
  Image, Platform, ScrollView, Animated as RNAnimated, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { BASE_URL } from '@/config/api';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

const CARDS = [
  require('../assets/images/cart png (4).png'),
  require('../assets/images/cart png (2).png'),
  require('../assets/images/cart png (5).png'),
  require('../assets/images/cart png (6).png'),
];

export default function GetStartedScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { token, isLoading } = useAuth();
  const { t } = useTranslation();
  
  const scrollX = React.useRef(new RNAnimated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [gateDone, setGateDone] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  // Gate logic: run AFTER auth state is loaded
  useEffect(() => {
    if (isLoading) return;

    // No token → show the onboarding splash (no network check needed!)
    if (!token) {
      setGateDone(true);
      return;
    }

    // Has token → check if backend is reachable and check KYC
    const checkAndRoute = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        
        // Check KYC status instead of just the root endpoint
        const response = await fetch(`${BASE_URL}/auth/kyc/status`, { 
          method: 'GET', 
          headers: {
            'Authorization': `Bearer ${token}`
          },
          signal: controller.signal 
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const kycStatus = await response.json();
          if (kycStatus && !kycStatus.kyc_doc_uploaded) {
            router.replace('/id-upload');
          } else {
            router.replace('/(tabs)');
          }
        } else if (response.status === 401) {
          // Token invalid
          setGateDone(true);
        } else {
          router.replace('/(tabs)');
        }
        
      } catch {
        // Backend is down → maybe show offline mode or retry
        // For now, allow entry but data might fail
        router.replace('/(tabs)');
      }
    };
    checkAndRoute();
  }, [token, isLoading]);

  // Auto-scroll carousel
  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % CARDS.length;
      scrollViewRef.current?.scrollTo({ x: currentIndex * width, animated: true });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Show loading while auth is resolving
  if (isLoading || (!gateDone && token)) {
    return (
      <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar barStyle="light-content" />
        <Image source={require('../assets/images/LOGO.png')} style={{ width: 140, height: 45, tintColor: '#D4AF37', marginBottom: 30 }} resizeMode="contain" />
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{ color: 'rgba(255,255,255,0.4)', marginTop: 15, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>Chargement...</Text>
      </View>
    );
  }

  // Token exists but backend is offline → show offline gate
  if (showOffline) {
    return (
      <View style={[styles.container, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }]}>
        <StatusBar barStyle="light-content" />
        <View style={styles.offlineIconBox}>
          <Feather name="wifi-off" size={44} color="#EF4444" />
        </View>
        <Text style={styles.offlineTitle}>Connexion Requise</Text>
        <Text style={styles.offlineDesc}>
          XAALISI nécessite une connexion internet pour accéder à votre portefeuille en toute sécurité.
        </Text>
        <TouchableOpacity 
          style={[styles.retryBtn, { backgroundColor: '#D4AF37' }]} 
          onPress={async () => {
            setShowOffline(false);
            setGateDone(false);
            // Re-trigger the gate check
            try {
              const controller = new AbortController();
              const timeout = setTimeout(() => controller.abort(), 4000);
              await fetch(`${BASE_URL}/`, { method: 'GET', signal: controller.signal });
              clearTimeout(timeout);
              router.replace('/(tabs)');
            } catch {
              setShowOffline(true);
              setGateDone(true);
            }
          }}
        >
          <Feather name="refresh-cw" size={16} color="#000" style={{ marginRight: 10 }} />
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No token → Show the beautiful onboarding splash
  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.goldTopBackground} />
      <View style={[styles.circle, styles.circle1, { borderColor: 'rgba(255,255,255,0.2)' }]} />
      <View style={[styles.circle, styles.circle2, { borderColor: 'rgba(255,255,255,0.2)' }]} />

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).duration(800)} style={styles.topSection}>
          <Image source={require('../assets/images/LOGO.png')} style={[styles.logoImage, { tintColor: '#1A1A1A' }]} resizeMode="contain" />
        </Animated.View>

        <View style={styles.midSection}>
          <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={[styles.title, { color: '#000' }]}>
            {t('onboarding.title_1')}{'\n'}<Text style={{ color: '#FFF' }}>{t('onboarding.title_2')}</Text>
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={[styles.subtitle, { color: '#FFF', opacity: 0.9 }]}>
            {t('onboarding.subtitle')}
          </Animated.Text>
        </View>

        <Animated.View entering={FadeInUp.delay(800).duration(1000)} style={styles.illustrationContainer}>
          <RNAnimated.ScrollView
            ref={scrollViewRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            style={{ width: width, flex: 1 }}
            contentContainerStyle={{ alignItems: 'center' }}
            scrollEventThrottle={16}
            onScroll={RNAnimated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
          >
            {CARDS.map((img, idx) => {
              const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
              const scale = scrollX.interpolate({ inputRange, outputRange: [0.75, 1.05, 0.75], extrapolate: 'clamp' });
              return (
                <View key={idx} style={styles.cardShadow}>
                  <RNAnimated.Image source={img} style={[styles.mainCard, { transform: [{ scale }] }]} resizeMode="contain" />
                </View>
              );
            })}
          </RNAnimated.ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(800)} style={styles.bottomSection}>
          <Text style={[styles.legalText, { color: '#999' }]}>
            {t('onboarding.legal')}
          </Text>
          <TouchableOpacity
            style={[styles.btnPrimary, { backgroundColor: '#D4AF37' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/auth')}
          >
            <Text style={styles.btnText}>{t('onboarding.get_started')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', paddingVertical: Platform.OS === 'ios' ? 70 : 50, zIndex: 10 },

  goldTopBackground: {
    position: 'absolute', top: 0, left: -50, right: -50,
    height: height * 0.58, backgroundColor: '#D4AF37',
    borderBottomLeftRadius: 300, borderBottomRightRadius: 300,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10,
  },
  circle: { position: 'absolute', borderRadius: 1000, borderWidth: 1, zIndex: 0 },
  circle1: { width: width * 1.5, height: width * 1.5, top: -width * 0.4, right: -width * 0.4 },
  circle2: { width: width * 1.2, height: width * 1.2, bottom: -width * 0.3, left: -width * 0.3 },

  topSection: { alignItems: 'flex-start' },
  logoImage: { width: 130, height: 40, marginBottom: 20 },
  midSection: { marginTop: 20 },
  title: { fontSize: 38, fontWeight: '800', lineHeight: 46, letterSpacing: -1, marginBottom: 15 },
  subtitle: { fontSize: 16, lineHeight: 24, paddingRight: 30 },

  illustrationContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%', position: 'relative', marginTop: 40 },
  cardShadow: { width: width, height: width * 1.15, justifyContent: 'center', alignItems: 'center' },
  mainCard: { width: '100%', height: '100%' },

  bottomSection: { width: '100%' },
  legalText: { fontSize: 11, textAlign: 'center', marginBottom: 20 },
  btnPrimary: {
    height: 64, borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8
  },
  btnText: { color: '#0B0E11', fontSize: 19, fontWeight: '700', letterSpacing: 0.5 },

  // Offline gate styles
  offlineIconBox: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: '#EF4444', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  offlineTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
  offlineDesc: { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', lineHeight: 22, marginBottom: 25 },
  retryBtn: { flexDirection: 'row', height: 50, borderRadius: 14, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center' },
  retryText: { color: '#000', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
});
