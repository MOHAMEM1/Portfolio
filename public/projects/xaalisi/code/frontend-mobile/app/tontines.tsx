import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function TontinesScreen() {
  const { colors, isDark } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState<'MY' | 'AVAILABLE'>('MY');
  const [tontines, setTontines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Creation form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('MONTHLY'); // DAILY, WEEKLY, MONTHLY
  const [submitting, setSubmitting] = useState(false);

  const loadTontines = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'MY' ? '/tontines/my' : '/tontines/available';
      const res = await fetchAPI(endpoint);
      setTontines(res || []);
    } catch (error) {
      console.error("Erreur chargement tontines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!showCreateForm) {
      loadTontines();
    }
  }, [activeTab, showCreateForm]);

  const handleCreate = async () => {
    if (!name || !amount || isNaN(Number(amount))) {
      Alert.alert('Erreur', 'Veuillez remplir correctement les informations.');
      return;
    }
    
    setSubmitting(true);
    try {
      await fetchAPI('/tontines/create', {
        method: 'POST',
        body: JSON.stringify({
          name,
          contribution_amount: parseFloat(amount),
          frequency
        })
      });
      
      Alert.alert('Succès', 'Tontine créée avec succès !');
      setShowCreateForm(false);
      setName('');
      setAmount('');
      setActiveTab('MY');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer la tontine.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (id: string) => {
    try {
      await fetchAPI(`/tontines/${id}/join`, { method: 'POST' });
      Alert.alert('Succès', 'Vous avez rejoint cette Tontine !');
      setActiveTab('MY');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de rejoindre.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Darét (Tontines)</Text>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={() => setShowCreateForm(!showCreateForm)}>
          <Feather name={showCreateForm ? "list" : "plus"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(500)} style={styles.introSection}>
            <View style={[styles.iconBoxLg, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="users" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.introTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Épargne Collective</Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>
              Rejoignez ou créez des groupes d&apos;épargne rotative en toute sécurité.
            </Text>
          </Animated.View>

          {showCreateForm ? (
            <Animated.View entering={FadeInUp.duration(400)} style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Créer une Tontine</Text>
              
              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
                <Feather name="target" size={20} color={colors.inactiveToken} style={{ marginRight: 10 }} />
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                  placeholder="Nom du groupe"
                  placeholderTextColor={colors.inactiveToken}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
                <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginRight: 10 }}>FCFA</Text>
                <TextInput
                  style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily, fontSize: 20, fontWeight: '700' }]}
                  placeholder="Cotisation par tour"
                  placeholderTextColor={colors.inactiveToken}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>

              {/* Frequence select simple */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                {['DAILY', 'WEEKLY', 'MONTHLY'].map(freq => (
                  <TouchableOpacity 
                    key={freq}
                    style={[
                      styles.freqBtn, 
                      { borderColor: colors.border, backgroundColor: frequency === freq ? colors.primary : (isDark ? 'rgba(0,0,0,0.2)' : colors.surface) }
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text 
                      numberOfLines={1} 
                      adjustsFontSizeToFit 
                      style={{ 
                        color: frequency === freq ? '#000' : colors.textPrimary, 
                        fontWeight: '700', fontSize: 12 
                      }}
                    >
                      {freq === 'DAILY' ? 'JOURNALIER' : freq === 'WEEKLY' ? 'HEBDOMADAIRE' : 'MENSUEL'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
                onPress={handleCreate}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="#000000" /> : (
                  <>
                    <Feather name="check" size={18} color="#000000" />
                    <Text style={[styles.btnPrimaryText, { fontFamily: colors.fontFamily }]}>Créer le groupe</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <>
              {/* Tabs */}
              <View style={[styles.tabsContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0' }]}>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'MY' && { backgroundColor: isDark ? '#222' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                  onPress={() => setActiveTab('MY')}
                >
                  <Text style={[styles.tabText, { color: activeTab === 'MY' ? colors.textPrimary : colors.inactiveToken, fontFamily: colors.fontFamily }]}>Mes Groupes</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.tab, activeTab === 'AVAILABLE' && { backgroundColor: isDark ? '#222' : '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }]}
                  onPress={() => setActiveTab('AVAILABLE')}
                >
                  <Text style={[styles.tabText, { color: activeTab === 'AVAILABLE' ? colors.textPrimary : colors.inactiveToken, fontFamily: colors.fontFamily }]}>Groupes Publics</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
              ) : tontines.length === 0 ? (
                <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.surface }]}>
                  <Feather name="inbox" size={32} color={colors.inactiveToken} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>Aucune tontine trouvée.</Text>
                </View>
              ) : (
                <View style={{ gap: 15 }}>
                  {tontines.map((t, idx) => (
                    <Animated.View key={t.id} entering={FadeInUp.duration(400).delay(idx * 100)} style={[styles.tontineCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <View>
                          <Text style={[styles.tTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>{t.name}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>Créé par {t.creator_id}</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: t.status === 'PENDING' ? '#F59E0B20' : colors.primary + '20' }]}>
                          <Text style={{ color: t.status === 'PENDING' ? '#F59E0B' : colors.primary, fontSize: 10, fontWeight: '700' }}>
                            {t.status}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={[styles.infoRow, { borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderTopWidth: 1, paddingTop: 12 }]}>
                        <View>
                          <Text style={{ color: colors.inactiveToken, fontSize: 11, textTransform: 'uppercase' }}>Cotisation</Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginTop: 2 }}>{t.contribution_amount} FCFA</Text>
                        </View>
                        <View>
                          <Text style={{ color: colors.inactiveToken, fontSize: 11, textTransform: 'uppercase' }}>Fréquence</Text>
                          <Text style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 }}>{t.frequency}</Text>
                        </View>
                      </View>

                      {activeTab === 'AVAILABLE' && (
                        <TouchableOpacity 
                          style={[styles.btnSecondary, { borderColor: colors.primary, marginTop: 15 }]}
                          onPress={() => handleJoin(t.id)}
                        >
                          <Text style={[styles.btnSecondaryText, { color: colors.primary, fontFamily: colors.fontFamily }]}>Rejoindre le groupe</Text>
                        </TouchableOpacity>
                      )}
                    </Animated.View>
                  ))}
                </View>
              )}
            </>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },

  introSection: { alignItems: 'center', marginBottom: 25 },
  iconBoxLg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  introTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  introDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  tabsContainer: { flexDirection: 'row', padding: 4, borderRadius: 16, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 14, fontWeight: '600' },

  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1, borderStyle: 'dashed' },
  emptyText: { marginTop: 12, fontSize: 15 },

  tontineCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  tTitle: { fontSize: 18, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  card: { padding: 20, borderRadius: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  input: { flex: 1, fontSize: 16 },
  freqBtn: { flex: 1, height: 40, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },

  btnPrimary: { flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 5 },
  btnPrimaryText: { color: '#000000', fontSize: 16, fontWeight: '700' },
  
  btnSecondary: { height: 45, borderRadius: 10, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
  btnSecondaryText: { fontSize: 14, fontWeight: '700' }
});
