import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';

export default function SettingsScreen() {
  const { colors: theme, isDark, toggleTheme } = useAppTheme();
  const { t, i18n } = useTranslation();
  const { logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(nextLang);
  };

  const toggleBiometric = () => {
    setBiometricEnabled(!biometricEnabled);
    if (!biometricEnabled) {
      Alert.alert(t('settings.biometric_title', 'Connexion Biométrique'), t('settings.biometric_enabled', 'La connexion biométrique a été activée avec succès.'));
    }
  };

  const handleDataStorage = () => {
    Alert.alert(
      t('settings.data_storage', 'Données et Stockage'),
      t('settings.clear_cache_msg', 'Taille du cache: 12.4 Mo\nVoulez-vous vider le cache ?'),
      [
        { text: t('common.cancel', 'Annuler'), style: 'cancel' },
        { text: t('settings.clear', 'Vider'), style: 'destructive', onPress: () => Alert.alert('Succès', 'Cache vidé avec succès.') }
      ]
    );
  };

  const handleAppInfo = () => {
    Alert.alert(
      t('settings.app_info', "Infos de l'application"),
      "XAALISI Mobile App\nVersion 1.0.0 (Build 42)\n\n© 2026 Xaalisi Group. Tous droits réservés."
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.delete_account', 'Supprimer le compte'),
      t('settings.delete_warning', 'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.'),
      [
        { text: t('common.cancel', 'Annuler'), style: 'cancel' },
        { 
          text: t('settings.delete_confirm', 'Supprimer'), 
          style: 'destructive', 
          onPress: async () => {
            await logout();
            setTimeout(() => router.replace('/'), 50);
          } 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('settings.title', 'Settings')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, { color: theme.inactiveToken }]}>{t('settings.preferences', 'PREFERENCES')}</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.dark_mode', 'Dark Mode')}</Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: '#3B2F6B' }}
              thumbColor={isDark ? theme.activeToken : '#FFFFFF'}
              style={Platform.OS === 'android' ? { transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] } : {}}
            />
          </View>
          
          <TouchableOpacity style={styles.row} onPress={toggleLanguage}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.language', 'Language')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.inactiveToken, marginRight: 10, fontFamily: 'Inter_500Medium' }}>
                {i18n.language === 'fr' ? 'Français' : 'English'}
              </Text>
              <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.inactiveToken, marginTop: 30 }]}>{t('settings.security', 'SECURITY')}</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={() => router.push('/change-pin')}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.change_pin', 'Change PIN')}</Text>
            <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
          </TouchableOpacity>
          <View style={styles.row}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.biometric_login', 'Biometric Login')}</Text>
            <Switch value={biometricEnabled} onValueChange={toggleBiometric} trackColor={{ false: '#E2E8F0', true: '#10b981' }} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.inactiveToken, marginTop: 30 }]}>{t('settings.system', 'SYSTEM')}</Text>
        
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={handleDataStorage}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.data_usage', 'Data Usage & Storage')}</Text>
            <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={handleAppInfo}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>{t('settings.app_info', 'App Info')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: theme.inactiveToken, marginRight: 10, fontFamily: 'Inter_500Medium' }}>v1.0.0</Text>
              <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>{t('settings.delete_account', 'Delete Account')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  scrollContent: { flexGrow: 1, padding: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10, paddingLeft: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 1 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  label: { fontSize: 16, fontWeight: '500', fontFamily: 'Inter_500Medium' },
  deleteBtn: { marginTop: 40, alignItems: 'center', padding: 15 },
  deleteText: { color: '#EF4444', fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
});
