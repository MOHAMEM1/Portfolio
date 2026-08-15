import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type ChequeRequest = {
  id: string;
  pages: number;
  status: 'EN_COURS' | 'LIVRÉ' | 'ANNULÉ';
  date: string;
};

export default function ChequesScreen() {
  const { colors: theme, isDark } = useAppTheme();
  
  const [activeTab, setActiveTab] = useState<'request' | 'opposition' | 'history'>('request');
  
  // Request State
  const [pagesCount, setPagesCount] = useState<number>(25);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  
  // Opposition State
  const [chequeNumber, setChequeNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [oppositionLoading, setOppositionLoading] = useState(false);

  // History State
  const [chequeHistory, setChequeHistory] = useState<ChequeRequest[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await fetchAPI('/cheques/requests');
      if (response && Array.isArray(response)) {
        const mappedData: ChequeRequest[] = response.map((r: any) => ({
          id: `CHQ-${String(r.id).padStart(3, '0')}`,
          pages: r.pages_count,
          status: r.status === 'PENDING' ? 'EN_COURS' : r.status,
          date: new Date(r.created_at).toLocaleDateString('fr-FR'),
        }));
        setChequeHistory(mappedData.reverse());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique des chèques:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const handleRequest = async () => {
    setRequestLoading(true);
    try {
      await fetchAPI('/cheques/request', {
        method: 'POST',
        body: JSON.stringify({ account_id: 'default_account', pages_count: pagesCount })
      });
      setRequestSuccess(true);
      setTimeout(() => setRequestSuccess(false), 4000);
      if (activeTab === 'history') fetchHistory();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de demander le chéquier');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOpposition = async () => {
    if (!chequeNumber || !reason) {
      Alert.alert('Champs requis', 'Veuillez remplir le numéro de chèque et le motif.');
      return;
    }
    setOppositionLoading(true);
    try {
      await fetchAPI('/cheques/opposition', {
        method: 'POST',
        body: JSON.stringify({ 
          cheque_number: chequeNumber, 
          amount: amount ? parseFloat(amount) : null,
          reason 
        })
      });
      Alert.alert(
        'Opposition Enregistrée',
        `Le chèque N° ${chequeNumber} a été mis en opposition avec succès. Il ne pourra plus être encaissé.`,
        [{ text: 'Compris', style: 'default' }]
      );
      setChequeNumber('');
      setAmount('');
      setReason('');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'opposition');
    } finally {
      setOppositionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVRÉ': return '#10B981';
      case 'EN_COURS': return '#F59E0B';
      case 'ANNULÉ': return '#EF4444';
      default: return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'LIVRÉ': return 'Livré';
      case 'EN_COURS': return 'En cours';
      case 'ANNULÉ': return 'Annulé';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#1a1500', '#000000', '#0a0a0a'] : ['#FFFDF5', '#FFFFFF', '#F8F9FA']}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface, borderColor: theme.border }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Chèques</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <View style={styles.tabContainer}>
          {(['request', 'opposition', 'history'] as const).map(tab => (
            <TouchableOpacity 
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab, activeTab === tab && { borderBottomColor: theme.primary }]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? theme.primary : theme.textSecondary, fontFamily: theme.fontFamily }]}>
                {tab === 'request' ? 'Demander' : tab === 'opposition' ? 'Opposition' : 'Historique'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'request' ? (
            <Animated.View entering={FadeInUp.duration(400)}>
              {/* Cheque visual */}
              <View style={[styles.chequeVisual, { backgroundColor: isDark ? '#1a1a1a' : '#FFF', borderColor: theme.primary }]}>
                <View style={styles.chequeHeader}>
                  <Text style={[styles.chequeBankName, { color: theme.primary, fontFamily: theme.fontFamily }]}>XAALISI BANK</Text>
                  <Feather name="file-text" size={24} color={theme.primary} />
                </View>
                <View style={styles.chequeLine} />
                <View style={styles.chequeLine} />
                <View style={[styles.chequeLine, { width: '60%' }]} />
                <Text style={[styles.chequePages, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{pagesCount} pages</Text>
              </View>

              <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Format du chéquier</Text>
              <View style={styles.formatSelector}>
                {[25, 50, 100].map(num => (
                  <TouchableOpacity 
                    key={num} 
                    style={[styles.formatBtn, pagesCount === num ? { backgroundColor: theme.primary } : { backgroundColor: isDark ? '#222' : '#EEE' }]}
                    onPress={() => setPagesCount(num)}
                  >
                    <Text style={[styles.formatText, pagesCount === num ? { color: '#000' } : { color: theme.textSecondary }, { fontFamily: theme.fontFamily }]}>{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {requestSuccess && (
                <Animated.View entering={FadeInDown.duration(300)} style={[styles.successBanner, { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }]}>
                  <Feather name="check-circle" size={20} color="#10B981" />
                  <Text style={[styles.successText, { color: '#10B981', fontFamily: theme.fontFamily }]}>
                    Demande de chéquier ({pagesCount} pages) envoyée avec succès !
                  </Text>
                </Animated.View>
              )}

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: theme.primary }]} onPress={handleRequest} disabled={requestLoading}>
                {requestLoading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="send" size={18} color="#000" />
                    <Text style={[styles.submitText, { fontFamily: theme.fontFamily }]}>Commander le chéquier</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderColor: theme.border }]}>
                <Feather name="info" size={16} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
                  Le chéquier sera livré à votre agence sous 5 à 7 jours ouvrables. Vous recevrez une notification lors de sa disponibilité.
                </Text>
              </View>
            </Animated.View>
          ) : activeTab === 'opposition' ? (
            <Animated.View entering={FadeInUp.duration(400)}>
              <View style={[styles.warningBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: '#EF4444' }]}>
                <Feather name="alert-triangle" size={18} color="#EF4444" />
                <Text style={[styles.warningText, { color: '#EF4444', fontFamily: theme.fontFamily }]}>
                  L&apos;opposition est irréversible. Le chèque ne pourra plus être encaissé.
                </Text>
              </View>

              <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Numéro de chèque *</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, fontFamily: theme.fontFamily }]} 
                placeholder="Ex: 0001234567"
                placeholderTextColor={theme.textSecondary}
                value={chequeNumber}
                onChangeText={setChequeNumber}
              />
              
              <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Montant (Optionnel)</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, fontFamily: theme.fontFamily }]} 
                placeholder="Ex: 50000 FCFA"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />

              <Text style={[styles.label, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Motif de l&apos;opposition *</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border, fontFamily: theme.fontFamily, height: 100, textAlignVertical: 'top' }]} 
                placeholder="Ex: Perte, vol, fraude..."
                placeholderTextColor={theme.textSecondary}
                multiline
                value={reason}
                onChangeText={setReason}
              />

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#EF4444' }]} onPress={handleOpposition} disabled={oppositionLoading}>
                {oppositionLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Feather name="shield" size={18} color="#FFF" />
                    <Text style={[styles.submitText, { fontFamily: theme.fontFamily, color: '#FFF' }]}>Confirmer l&apos;opposition</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.duration(400)}>
              {chequeHistory.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="inbox" size={48} color={theme.textSecondary} />
                  <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Aucun chéquier demandé</Text>
                </View>
              ) : (
                chequeHistory.map((cheque, index) => (
                  <Animated.View 
                    key={cheque.id} 
                    entering={FadeInUp.duration(300).delay(index * 100)}
                    style={[styles.historyItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF', borderColor: theme.border }]}
                  >
                    <View style={[styles.historyLeft, { flex: 1 }]}>
                      <View style={[styles.historyIcon, { backgroundColor: isDark ? 'rgba(212,175,55,0.15)' : 'rgba(212,175,55,0.1)' }]}>
                        <Feather name="file-text" size={20} color={theme.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.historyTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Chéquier {cheque.pages} pages</Text>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.historyDate, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{cheque.id} • {cheque.date}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(cheque.status)}20` }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(cheque.status), fontFamily: theme.fontFamily }]}>{getStatusLabel(cheque.status)}</Text>
                    </View>
                  </Animated.View>
                ))
              )}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10,
  },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  tabContainer: { flexDirection: 'row', marginTop: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.2)' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: {},
  tabText: { fontSize: 14, fontWeight: '600' },
  content: { padding: 20, paddingBottom: 100 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 16 },
  chequeVisual: { borderWidth: 1.5, borderRadius: 16, padding: 20, marginBottom: 10, borderStyle: 'dashed' },
  chequeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chequeBankName: { fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  chequeLine: { height: 1, backgroundColor: 'rgba(150,150,150,0.3)', marginBottom: 14, borderRadius: 1 },
  chequePages: { textAlign: 'right', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  formatSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  formatBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  formatText: { fontSize: 18, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16 },
  submitBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 25, height: 56 },
  submitText: { color: '#000', fontSize: 16, fontWeight: '700' },
  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  successText: { flex: 1, fontSize: 13, fontWeight: '600' },
  warningBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  warningText: { flex: 1, fontSize: 13, fontWeight: '500' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 20 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  historyItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '600' },
  historyDate: { fontSize: 11, marginTop: 3 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 15 },
  emptyText: { fontSize: 14 },
});
