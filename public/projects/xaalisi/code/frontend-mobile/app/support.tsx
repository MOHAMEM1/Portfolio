import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function SupportScreen() {
  const { colors, isDark } = useAppTheme();
  const { username } = useAuth();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadTickets = async () => {
    if (!username) return;
    try {
      const res = await fetchAPI('/crm/tickets');
      setTickets(res.tickets || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tickets", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [username]);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir le sujet et la description.');
      return;
    }
    
    setSubmitting(true);
    try {
      await fetchAPI('/crm/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title: subject,
          description
        })
      });
      
      Alert.alert('Succès', 'Votre réclamation a été envoyée au support.');
      setSubject('');
      setDescription('');
      loadTickets(); // Reload list
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de créer le ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return '#F59E0B'; // Warning orange
      case 'EN_COURS': return colors.primary;
      case 'RESOLU': return colors.success;
      default: return colors.inactiveToken;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return 'Nouveau';
      case 'EN_COURS': return 'En cours';
      case 'RESOLU': return 'Résolu';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : colors.surface }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Support Client</Text>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Animated.View entering={FadeInDown.duration(500)} style={styles.introSection}>
            <View style={[styles.iconBoxLg, { backgroundColor: colors.primary + '15' }]}>
              <Feather name="life-buoy" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.introTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Comment pouvons-nous vous aider ?</Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>
              Ouvrez un ticket de réclamation ou suivez l&apos;état de vos demandes précédentes.
            </Text>
          </Animated.View>

          {/* Create Ticket Form */}
          <Animated.View entering={FadeInUp.duration(600).delay(100)} style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}>Nouveau Ticket</Text>
            
            <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                placeholder="Sujet de votre demande"
                placeholderTextColor={colors.inactiveToken}
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : colors.background, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, styles.textArea, { color: colors.textPrimary, fontFamily: colors.fontFamily }]}
                placeholder="Décrivez votre problème en détail..."
                placeholderTextColor={colors.inactiveToken}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Feather name="send" size={18} color="#000000" />
                  <Text style={[styles.btnPrimaryText, { fontFamily: colors.fontFamily }]}>Envoyer la demande</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Previous Tickets */}
          <Animated.View entering={FadeInUp.duration(600).delay(200)} style={{ marginTop: 30 }}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>VOS RÉCLAMATIONS</Text>
            
            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : tickets.length === 0 ? (
              <View style={[styles.emptyBox, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : colors.surface }]}>
                <Feather name="check-circle" size={32} color={colors.inactiveToken} />
                <Text style={[styles.emptyText, { color: colors.textSecondary, fontFamily: colors.fontFamily }]}>Aucun ticket de support.</Text>
              </View>
            ) : (
              tickets.map((ticket, index) => (
                <View key={ticket.id} style={[styles.ticketCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : colors.surface, borderColor: colors.border }]}>
                  <View style={styles.ticketHeader}>
                    <Text style={[styles.ticketSubject, { color: colors.textPrimary, fontFamily: colors.fontFamily }]} numberOfLines={1}>{ticket.title}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) + '20' }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(ticket.status), fontFamily: colors.fontFamily }]}>
                        {getStatusLabel(ticket.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.ticketDesc, { color: colors.textSecondary, fontFamily: colors.fontFamily }]} numberOfLines={2}>
                    {ticket.description}
                  </Text>
                  <View style={styles.ticketFooter}>
                    <Text style={[styles.ticketDate, { color: colors.inactiveToken, fontFamily: colors.fontFamily }]}>
                      Ticket #{ticket.id.substring(0,8)}
                    </Text>
                    <Text style={[styles.ticketDate, { color: colors.inactiveToken, fontFamily: colors.fontFamily }]}>
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </Animated.View>

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

  introSection: { alignItems: 'center', marginBottom: 30 },
  iconBoxLg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  introTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  introDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },

  card: { padding: 20, borderRadius: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15, height: 55 },
  textAreaContainer: { height: 120, paddingVertical: 15, alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 16 },
  textArea: { height: '100%', width: '100%' },

  btnPrimary: { flexDirection: 'row', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  btnPrimaryText: { color: '#000000', fontSize: 16, fontWeight: '700' },

  sectionTitle: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginBottom: 15, marginLeft: 5 },
  
  emptyBox: { padding: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, borderWidth: 1 },
  emptyText: { marginTop: 12, fontSize: 15 },

  ticketCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  ticketSubject: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '700' },
  ticketDesc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.1)' },
  ticketDate: { fontSize: 12 }
});
