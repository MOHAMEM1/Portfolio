import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppThemeProvider, useAppTheme } from '@/context/ThemeContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { WebSocketProvider } from '@/context/WebSocketContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

import { WalletProvider } from '@/context/WalletContext';
import '@/config/i18n';

SplashScreen.preventAutoHideAsync();

import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { View } from 'react-native';

function InactivityWrapper({ children }: { children: React.ReactNode }) {
  const { token, logout } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = useCallback(() => {
    if (!token) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      await logout();
      router.replace('/');
    }, 300000);
  }, [token, logout, router]);

  useEffect(() => {
    if (token) {
      resetTimer();
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token, resetTimer]);

  return (
    <View style={{ flex: 1 }} onTouchStart={resetTimer}>
      {children}
    </View>
  );
}

function InnerLayout() {
  const { isDark } = useAppTheme();
  return (
    <InactivityWrapper>
      <Stack screenOptions={{ 
        animation: 'fade_from_bottom', 
        headerShown: false,
        animationDuration: 250,
      }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="auth" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        
        {/* Navigation & Paramètres */}
        <Stack.Screen name="menu" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="notifications" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="change-pin" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="limits" options={{ animation: 'slide_from_right' }} />
        
        {/* KYC & Vérification */}
        <Stack.Screen name="kyc" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="id-upload" options={{ animation: 'slide_from_right' }} />
        
        {/* Services financiers */}
        <Stack.Screen name="cards" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="factures" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="cheques" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="tontines" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="statements" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="history" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="merchant" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="scan" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="ussd" options={{ animation: 'slide_from_right' }} />
        
        {/* Support & Aide */}
        <Stack.Screen name="support" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="support-chat" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="help" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="terms" options={{ animation: 'slide_from_right' }} />
        
        {/* Résultats */}
        <Stack.Screen name="success" options={{ animation: 'fade' }} />
        <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </InactivityWrapper>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {Platform.OS === 'web' && (
        <style type="text/css">{`
          input:focus, textarea:focus, select:focus {
            outline: none !important;
            box-shadow: none !important;
          }
          *:focus {
            outline: none !important;
          }
        `}</style>
      )}
      <AuthProvider>
        <WebSocketProvider>
          <AppThemeProvider>
            <NetworkProvider>
              <InnerLayout />
            </NetworkProvider>
          </AppThemeProvider>
        </WebSocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
