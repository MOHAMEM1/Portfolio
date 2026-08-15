import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const { isDark, colors: theme } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <Animated.View entering={FadeIn.duration(1000)} style={styles.centerContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary }]}>
          <Feather name="check" size={40} color="#000" />
        </View>
        <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>Welcome to XAALISI</Text>
        <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)' }]}>
          Your premium financial companion is ready.
        </Text>
      </Animated.View>

      <Animated.View entering={SlideInUp.duration(800).delay(500)} style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, { backgroundColor: isDark ? '#FFFFFF' : '#000000' }]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={[styles.btnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Go to Dashboard</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'space-between' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#FCD535',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 15, textAlign: 'center', letterSpacing: -0.5 },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center' },
  
  footer: { padding: 30, paddingBottom: Platform.OS === 'ios' ? 50 : 30 },
  btnPrimary: {
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
});
