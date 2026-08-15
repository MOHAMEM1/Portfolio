import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function StatementsScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('06');
  const [selectedYear, setSelectedYear] = useState('2026');

  const months = [
    { label: 'Janvier', value: '01' }, { label: 'Février', value: '02' },
    { label: 'Mars', value: '03' }, { label: 'Avril', value: '04' },
    { label: 'Mai', value: '05' }, { label: 'Juin', value: '06' },
    { label: 'Juillet', value: '07' }, { label: 'Août', value: '08' },
    { label: 'Septembre', value: '09' }, { label: 'Octobre', value: '10' },
    { label: 'Novembre', value: '11' }, { label: 'Décembre', value: '12' },
  ];

  const handleDownload = async () => {
    if (!username) return;
    setLoading(true);
    try {
      const response = await fetchAPI('/statements/generate', {
        method: 'POST',
        body: JSON.stringify({
          user_id: username,
          start_date: `${selectedYear}-${selectedMonth}-01`,
          end_date: `${selectedYear}-${selectedMonth}-28`
        })
      });
      
      if (Platform.OS === 'web') {
        window.alert('Votre relevé a été généré avec succès! (Vérifiez vos emails)');
      } else {
        Alert.alert('Succès', 'Votre relevé a été généré et envoyé à votre adresse email.');
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(error.message || 'Erreur lors de la génération du relevé.');
      } else {
        Alert.alert('Erreur', error.message || 'Impossible de générer le relevé.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Relevés Bancaires</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="file-text" size={40} color={theme.primary} style={{ marginBottom: 15 }} />
            <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Générer un Relevé</Text>
            <Text style={[styles.desc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              Sélectionnez la période pour générer votre relevé bancaire officiel. Il vous sera envoyé par email.
            </Text>

            <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Mois</Text>
            <View style={styles.grid}>
              {months.slice(0, 6).map(m => (
                <TouchableOpacity 
                  key={m.value}
                  style={[styles.pill, { 
                    backgroundColor: selectedMonth === m.value ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'),
                    borderColor: selectedMonth === m.value ? theme.primary : theme.border
                  }]}
                  onPress={() => setSelectedMonth(m.value)}
                >
                  <Text style={{ 
                    color: selectedMonth === m.value ? '#000' : theme.textPrimary, 
                    fontFamily: theme.fontFamily,
                    fontSize: 13
                  }}>{m.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.downloadBtn, { backgroundColor: theme.primary }]}
              onPress={handleDownload}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#000" /> : (
                <>
                  <Feather name="download" size={20} color="#000" style={{ marginRight: 8 }} />
                  <Text style={[styles.downloadText, { fontFamily: theme.fontFamily }]}>Télécharger le relevé</Text>
                </>
              )}
            </TouchableOpacity>
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
  scrollContent: { padding: 20 },
  card: {
    padding: 24, borderRadius: 24, borderWidth: 1,
    alignItems: 'center'
  },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  desc: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  label: { alignSelf: 'flex-start', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: '100%', paddingVertical: 16, borderRadius: 16,
  },
  downloadText: { color: '#000', fontSize: 16, fontWeight: '700' }
});
