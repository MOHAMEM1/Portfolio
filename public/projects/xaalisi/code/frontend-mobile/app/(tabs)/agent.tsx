import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Linking, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import AppAlert from '@/components/AppAlert';
import { useAppAlert } from '@/hooks/useAppAlert';

export default function AgentScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('operations');
  const [showOnboardingForm, setShowOnboardingForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { alertState, showAlert, hideAlert } = useAppAlert();

  // Agent Onboarding Form Fields
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [agentCity, setAgentCity] = useState('Bamako');
  const [agentQuartier, setAgentQuartier] = useState('');
  const [agentIdNumber, setAgentIdNumber] = useState('');
  const [agentLatitude, setAgentLatitude] = useState('');
  const [agentLongitude, setAgentLongitude] = useState('');

  const nearbyAgents = [
    { id: 1, name: 'Boutique Diallo', distance: '120m', address: 'ACI 2000, Bamako', status: 'open', phone: '+22377000001' },
    { id: 2, name: 'Cyber Kante', distance: '450m', address: 'Hamdallaye, Bamako', status: 'open', phone: '+22377000002' },
    { id: 3, name: 'Supermarché Faso', distance: '1.2km', address: 'Badalabougou', status: 'closed', phone: '+22377000003' },
  ];

  const handleAgentSubmit = async () => {
    if (formSubmitted) return;
    if (!agentName || !agentPhone || !agentIdNumber) {
      showAlert(t('agent.fields_required'), t('agent.fields_required_msg'), { type: 'warning' });
      return;
    }
    setFormLoading(true);
    setFormSubmitted(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      showAlert(t('agent.submitted_title'), t('agent.submitted_msg'), { type: 'success' });
      setShowOnboardingForm(false);
    } catch (error: any) {
      showAlert(t('common.error'), error.message, { type: 'error' });
      setFormSubmitted(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setShowDepositModal(false);
    showAlert(
      t('agent.deposit_success_title'),
      t('agent.deposit_success_msg', { amount: parseFloat(depositAmount).toLocaleString() }),
      { type: 'success' }
    );
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setShowWithdrawModal(false);
    showAlert(
      t('agent.withdraw_success_title'),
      t('agent.withdraw_success_msg', { amount: parseFloat(withdrawAmount).toLocaleString() }),
      { type: 'success' }
    );
    setWithdrawAmount('');
  };

  const AgentOperation = ({ icon, title, desc, delay, color, onPress }: any) => (
    <Animated.View entering={FadeInUp.duration(500).delay(delay)} style={styles.opCardWrapper}>
      <TouchableOpacity style={[styles.opCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]} onPress={onPress}>
        <View style={[styles.opIconBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.background }]}>
          <Feather name={icon} size={24} color={color || theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.opTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{title}</Text>
          <Text style={[styles.opDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{desc}</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={isDark ? ['#1a1500', '#000000', '#0a0a0a'] : ['#FFFDF5', '#FFFFFF', '#F8F9FA']} style={StyleSheet.absoluteFillObject} />
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'transparent' }]} />

      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => router.push('/menu')}>
            <Feather name="menu" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('agent.title')}</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => router.push('/notifications')}>
            <Feather name="bell" size={20} color={theme.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={[styles.tabContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]}>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'operations' && { backgroundColor: theme.primary }]} onPress={() => setActiveTab('operations')}>
            <Text style={[styles.tabBtnText, { color: activeTab === 'operations' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.operations_tab')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, activeTab === 'map' && { backgroundColor: theme.primary }]} onPress={() => setActiveTab('map')}>
            <Text style={[styles.tabBtnText, { color: activeTab === 'map' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.map_tab')}</Text>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {activeTab === 'operations' ? (
            <View>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.section_guichet')}</Text>
              <AgentOperation icon="log-in" title={t('agent.cash_in_title')} desc={t('agent.cash_in_desc')} delay={200} color={theme.success} onPress={() => setShowDepositModal(true)} />
              <AgentOperation icon="log-out" title={t('agent.cash_out_title')} desc={t('agent.cash_out_desc')} delay={300} color={theme.danger} onPress={() => setShowWithdrawModal(true)} />
              <AgentOperation icon="briefcase" title={t('agent.become_agent_title')} desc={t('agent.become_agent_desc')} delay={400} onPress={() => setShowOnboardingForm(true)} />
            </View>
          ) : (
            <Animated.View entering={FadeInUp.duration(500)}>
              <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
                <Feather name="map" size={48} color={theme.primary} style={{ marginBottom: 15 }} />
                <Text style={[styles.mapText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('agent.map_title')}</Text>
                <Text style={[styles.mapDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.map_desc')}</Text>
              </View>

              <Text style={[styles.sectionLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.nearby_agents')}</Text>
              {nearbyAgents.map((agent, index) => (
                <Animated.View key={agent.id} entering={FadeInUp.duration(500).delay(200 + (index * 100))} style={[styles.agentCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
                  <View style={styles.agentLeft}>
                    <View style={[styles.agentIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.background }]}>
                      <Feather name="map-pin" size={20} color={theme.primary} />
                    </View>
                    <View>
                      <Text style={[styles.agentName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{agent.name}</Text>
                      <Text style={[styles.agentAddress, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{agent.address}</Text>
                    </View>
                  </View>
                  <View style={styles.agentRight}>
                    <Text style={[styles.agentDistance, { color: theme.primary, fontFamily: theme.fontFamily }]}>{agent.distance}</Text>
                    <Text style={[styles.agentStatus, { color: agent.status === 'open' ? theme.success : theme.danger, fontFamily: theme.fontFamily }]}>{t(`common.${agent.status}`)}</Text>
                    {agent.status === 'open' && (
                      <TouchableOpacity 
                        style={[styles.callBtn, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                        onPress={() => Linking.openURL(`tel:${agent.phone}`)}
                      >
                        <Feather name="phone" size={12} color={theme.primary} />
                        <Text style={[styles.callBtnText, { color: theme.primary, fontFamily: theme.fontFamily }]}>{t('agent.call_agent')}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Deposit Modal */}
      <Modal visible={showDepositModal} animationType="slide" transparent onRequestClose={() => setShowDepositModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('agent.cash_in_title')}</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => setShowDepositModal(false)}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.amountIconBox, { backgroundColor: theme.success + '15' }]}>
              <Feather name="log-in" size={40} color={theme.success} />
            </View>
            <Text style={[styles.amountLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.deposit_amount')}</Text>
            <View style={[styles.formInputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
              <Feather name="dollar-sign" size={16} color={theme.primary} style={{ marginRight: 12 }} />
              <TextInput
                style={[styles.formInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="50 000"
                placeholderTextColor={theme.inactiveToken}
                value={depositAmount}
                onChangeText={setDepositAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.success, opacity: depositAmount ? 1 : 0.5 }]}
              onPress={handleDeposit}
              disabled={!depositAmount}
            >
              <Feather name="check" size={16} color="#000" style={{ marginRight: 10 }} />
              <Text style={[styles.submitText, { fontFamily: theme.fontFamily }]}>{t('agent.deposit_btn')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Withdraw Modal */}
      <Modal visible={showWithdrawModal} animationType="slide" transparent onRequestClose={() => setShowWithdrawModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('agent.cash_out_title')}</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => setShowWithdrawModal(false)}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.amountIconBox, { backgroundColor: '#EF444415' }]}>
              <Feather name="log-out" size={40} color="#EF4444" />
            </View>
            <Text style={[styles.amountLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{t('agent.withdraw_amount')}</Text>
            <View style={[styles.formInputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
              <Feather name="dollar-sign" size={16} color={theme.primary} style={{ marginRight: 12 }} />
              <TextInput
                style={[styles.formInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
                placeholder="25 000"
                placeholderTextColor={theme.inactiveToken}
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
                autoFocus
              />
            </View>
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#EF4444', opacity: withdrawAmount ? 1 : 0.5 }]}
              onPress={handleWithdraw}
              disabled={!withdrawAmount}
            >
              <Feather name="check" size={16} color="#FFF" style={{ marginRight: 10 }} />
              <Text style={[styles.submitText, { fontFamily: theme.fontFamily, color: '#FFF' }]}>{t('agent.withdraw_btn')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Agent Onboarding Form Modal */}
      <Modal visible={showOnboardingForm} animationType="slide" transparent onRequestClose={() => setShowOnboardingForm(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{t('agent.onboarding_title')}</Text>
              <TouchableOpacity style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => setShowOnboardingForm(false)}>
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <FormInput label={t('agent.full_name')} value={agentName} onChangeText={setAgentName} placeholder="Amadou Traoré" icon="user" />
              <FormInput label={t('agent.phone')} value={agentPhone} onChangeText={setAgentPhone} placeholder="+223 77 00 00 00" icon="phone" keyboardType="phone-pad" />
              <FormInput label="ID (NINA)" value={agentIdNumber} onChangeText={setAgentIdNumber} placeholder="ML-0000-0000" icon="hash" />
              <FormInput label={t('agent.city')} value={agentCity} onChangeText={setAgentCity} placeholder="Bamako" icon="map-pin" />
              <FormInput label="QUARTIER / ADRESSE" value={agentQuartier} onChangeText={setAgentQuartier} placeholder="Hamdallaye ACI 2000" icon="home" />

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: formSubmitted ? theme.inactiveToken : theme.primary, opacity: formLoading ? 0.7 : 1 }]}
                onPress={handleAgentSubmit}
                disabled={formLoading || formSubmitted}
              >
                {formLoading ? <ActivityIndicator color="#000" /> : (
                  <>
                    <Feather name={formSubmitted ? 'check-circle' : 'send'} size={16} color="#000" style={{ marginRight: 10 }} />
                    <Text style={[styles.submitText, { fontFamily: theme.fontFamily }]}>{t('agent.submit')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
        </KeyboardAvoidingView>
      </Modal>

      <AppAlert {...alertState} onDismiss={hideAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15, zIndex: 10 },
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 },

  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, borderRadius: 14, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabBtnText: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15, marginTop: 10 },

  opCardWrapper: { marginBottom: 15 },
  opCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1 },
  opIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  opTitle: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  opDesc: { fontSize: 12, lineHeight: 18 },

  mapPlaceholder: { height: 200, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  mapText: { fontSize: 18, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 },
  mapDesc: { fontSize: 13 },

  agentCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  agentLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  agentIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  agentName: { fontSize: 14, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  agentAddress: { fontSize: 12 },
  agentRight: { alignItems: 'flex-end' },
  agentDistance: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  agentStatus: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  callBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, gap: 4 },
  callBtnText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  amountIconBox: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 20 },
  amountLabel: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: Platform.OS === 'ios' ? 40 : 25, maxHeight: '85%', borderWidth: 1, borderColor: '#333' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },

  formInputGroup: { marginBottom: 18 },
  formLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, marginLeft: 4 },
  formInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, marginBottom: 20 },
  formInput: { flex: 1, fontSize: 14, height: '100%' },

  submitBtn: { flexDirection: 'row', height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20 },
  submitText: { color: '#000', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
});

// Module-level FormInput to prevent re-mount on every parent re-render (fixes focus loss)
const FormInput = ({ label, value, onChangeText, placeholder, icon, keyboardType }: any) => {
  const { colors: theme, isDark } = useAppTheme();
  return (
    <View style={styles.formInputGroup}>
      <Text style={[styles.formLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{label}</Text>
      <View style={[styles.formInputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
        <Feather name={icon || 'edit-3'} size={16} color={theme.primary} style={{ marginRight: 12 }} />
        <TextInput
          style={[styles.formInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
          placeholder={placeholder}
          placeholderTextColor={theme.inactiveToken}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
        />
      </View>
    </View>
  );
};
