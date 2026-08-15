import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchAPI } from '@/config/api';

type KycFlow = 'overview' | 'level2' | 'level3' | 'diaspora' | 'simplified' | 'review';

// KYC Ceiling Configuration — mirrors the backend kyc_ceilings table
const CEILINGS = {
  1: { label: 'Standard', daily: '200,000', monthly: '500,000', color: '#A0AEC0' },
  2: { label: 'Vérifié', daily: '2,000,000', monthly: '10,000,000', color: '#D4AF37' },
  3: { label: 'Premium', daily: '5,000,000', monthly: '50,000,000', color: '#10B981' },
};

export default function KycScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();

  const [flow, setFlow] = useState<KycFlow>('overview');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(1);

  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const res = await fetchAPI(`/auth/kyc/status?username=${username}`);
        if (res && res.kyc_tier !== undefined) {
          setCurrentLevel(res.kyc_tier);
        }
      } catch (err) {
        console.error("Failed to fetch KYC status:", err);
      }
    };
    fetchKycStatus();
  }, [username]);

  // Level 2 Fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [idType, setIdType] = useState('NINA');
  const [idNumber, setIdNumber] = useState('');

  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.ocrData) {
      try {
        const extractedData = JSON.parse(decodeURIComponent(params.ocrData as string));
        if (extractedData.first_name || extractedData.last_name) {
          setFullName(`${extractedData.first_name || ''} ${extractedData.last_name || ''}`.trim());
        }
        if (extractedData.date_of_birth) setDateOfBirth(extractedData.date_of_birth);
        if (extractedData.id_number) setIdNumber(extractedData.id_number);
        // Redirection automatique vers le flux niveau 2 après l'extraction OCR de la carte d'identité
        setFlow('level2');
      } catch (err) {
        console.error("Failed to parse OCR Data", err);
      }
    }
  }, [params.ocrData]);

  // Level 3 Fields (+ Level 2 fields)
  const [city, setCity] = useState('');
  const [quartier, setQuartier] = useState('');
  const [profession, setProfession] = useState('');
  const [addressProof, setAddressProof] = useState('');

  // Diaspora Fields
  const [foreignCountry, setForeignCountry] = useState('');
  const [residencePermit, setResidencePermit] = useState('');
  const [foreignIdNumber, setForeignIdNumber] = useState('');

  // Simplified Fields (agent-assisted)
  const [agentCode, setAgentCode] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');

  const handleSubmit = async () => {
    if (submitted) return;

    if (flow === 'level2') {
      if (!fullName.trim() || !dateOfBirth.trim() || !idNumber.trim()) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs avant de soumettre.');
        return;
      }
    } else if (flow === 'level3') {
      if (!fullName.trim() || !dateOfBirth.trim() || !idNumber.trim() || !city.trim() || !quartier.trim() || !profession.trim()) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs avant de soumettre.');
        return;
      }
    } else if (flow === 'diaspora') {
      if (!fullName.trim() || !dateOfBirth.trim() || !idNumber.trim() || !foreignCountry.trim() || !foreignIdNumber.trim()) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs avant de soumettre.');
        return;
      }
    } else if (flow === 'simplified') {
      if (!agentCode.trim() || !beneficiaryName.trim() || !beneficiaryPhone.trim()) {
        Alert.alert('Champs requis', 'Veuillez remplir tous les champs avant de soumettre.');
        return;
      }
    }

    setLoading(true);
    setSubmitted(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const levelText = flow === 'level2' ? '2' : flow === 'level3' ? '3' : flow === 'diaspora' ? '2 (Diaspora)' : '1';
      Alert.alert(
        'Demande KYC Soumise',
        `Votre demande de passage au Niveau ${levelText} a été envoyée.\n\nVous serez notifié une fois le dossier validé par notre équipe.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  // InputField is now defined at module level (below) to prevent focus loss

  // ========== OVERVIEW ==========
  const renderOverview = () => (
    <Animated.View entering={FadeInUp.duration(500)}>
      {/* Current Level Banner */}
      <View style={[styles.currentLevelCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.primary }]}>
        <View style={styles.levelCardHeader}>
          <View style={[styles.levelBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.levelBadgeText, { fontFamily: theme.fontFamily }]}>LVL {currentLevel}</Text>
          </View>
          <View>
            <Text style={[styles.levelLabel, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Niveau Actuel: {CEILINGS[currentLevel as keyof typeof CEILINGS].label}</Text>
            <Text style={[styles.levelLimit, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              {CEILINGS[currentLevel as keyof typeof CEILINGS].daily} FCFA/jour • {CEILINGS[currentLevel as keyof typeof CEILINGS].monthly} FCFA/mois
            </Text>
          </View>
        </View>
      </View>

      {/* Level Options */}
      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>PASSER AU NIVEAU SUPÉRIEUR</Text>

      {/* Level 2 */}
      <TouchableOpacity style={[styles.upgradeCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]} onPress={() => setFlow('level2')}>
        <View style={[styles.upgradeIconBox, { backgroundColor: theme.primary + '15' }]}>
          <Feather name="shield" size={22} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upgradeName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Niveau 2 — Vérifié</Text>
          <Text style={[styles.upgradeDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Pièce d&apos;identité + Selfie • 2M FCFA/jour</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
      </TouchableOpacity>

      {/* Level 3 */}
      <TouchableOpacity 
        style={[
          styles.upgradeCard, 
          { 
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, 
            borderColor: theme.border,
            opacity: currentLevel < 2 ? 0.55 : 1
          }
        ]} 
        onPress={() => {
          if (currentLevel < 2) {
            Alert.alert(
              "Niveau Bloqué", 
              "Vérifiez d'abord votre identité (Niveau 2) pour accéder aux avantages du Niveau 3."
            );
          } else {
            setFlow('level3');
          }
        }}
      >
        <View style={[styles.upgradeIconBox, { backgroundColor: currentLevel < 2 ? 'rgba(128,128,128,0.1)' : theme.primary + '15' }]}>
          <Feather name={currentLevel < 2 ? "lock" : "award"} size={22} color={currentLevel < 2 ? "#888" : theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upgradeName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Niveau 3 — Premium</Text>
          <Text style={[styles.upgradeDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Adresse + Profession + Justificatif • 5M FCFA/jour</Text>
        </View>
        <Feather name={currentLevel < 2 ? "lock" : "chevron-right"} size={18} color={theme.inactiveToken} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: theme.fontFamily, marginTop: 25 }]}>FLUX SPÉCIALISÉS</Text>

      {/* Diaspora */}
      <TouchableOpacity style={[styles.upgradeCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]} onPress={() => setFlow('diaspora')}>
        <View style={[styles.upgradeIconBox, { backgroundColor: theme.primary + '15' }]}>
          <Feather name="globe" size={22} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upgradeName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>KYC Diaspora</Text>
          <Text style={[styles.upgradeDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Documents étrangers • Vérification AML stricte</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
      </TouchableOpacity>

      {/* Simplified / Rural */}
      <TouchableOpacity style={[styles.upgradeCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]} onPress={() => setFlow('simplified')}>
        <View style={[styles.upgradeIconBox, { backgroundColor: theme.primary + '15' }]}>
          <Feather name="users" size={22} color={theme.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.upgradeName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>KYC Simplifié</Text>
          <Text style={[styles.upgradeDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Inscription assistée par agent • Zéro friction</Text>
        </View>
        <Feather name="chevron-right" size={20} color={theme.inactiveToken} />
      </TouchableOpacity>
    </Animated.View>
  );

  // ========== LEVEL 2 FORM ==========
  const renderLevel2 = () => (
    <Animated.View entering={SlideInRight.duration(400)}>
      <Text style={[styles.flowTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Vérification Niveau 2</Text>
      <Text style={[styles.flowDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Fournissez votre pièce d&apos;identité pour débloquer les limites élevées.</Text>
      <InputField label="NOM COMPLET" value={fullName} onChangeText={setFullName} placeholder="Nom Complet" icon="user" />
      <InputField label="DATE DE NAISSANCE" value={dateOfBirth} onChangeText={setDateOfBirth} placeholder="15/03/1990" icon="calendar" />
      <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily, marginLeft: 4, marginBottom: 8 }]}>TYPE DE PIÈCE</Text>
      <View style={styles.idTypeRow}>
        {['NINA', 'Passeport', 'CNI'].map(t => (
          <TouchableOpacity key={t} style={[styles.idTypePill, { backgroundColor: idType === t ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : theme.surface), borderColor: idType === t ? theme.primary : theme.border }]} onPress={() => setIdType(t)}>
            <Text style={[styles.idTypeText, { color: idType === t ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <InputField label="NUMÉRO D'IDENTIFICATION" value={idNumber} onChangeText={setIdNumber} placeholder="Numéro de pièce d'identité" icon="hash" />
      
      <TouchableOpacity 
        style={[styles.uploadBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/id-upload')}
      >
        <Feather name="camera" size={28} color={theme.primary} style={{ marginBottom: 10 }} />
        <Text style={[styles.uploadText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Photo de la Pièce d&apos;Identité</Text>
        <Text style={[styles.uploadDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Appuyez pour capturer ou télécharger</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.uploadBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : theme.surface, borderColor: theme.border }]}
        onPress={() => router.push('/id-upload')}
      >
        <Feather name="user" size={28} color={theme.primary} style={{ marginBottom: 10 }} />
        <Text style={[styles.uploadText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Selfie de Vérification</Text>
        <Text style={[styles.uploadDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Prenez une photo claire de votre visage</Text>
      </TouchableOpacity>
      
      <SubmitButton />
    </Animated.View>
  );

  // ========== LEVEL 3 FORM ==========
  const renderLevel3 = () => (
    <Animated.View entering={SlideInRight.duration(400)}>
      <Text style={[styles.flowTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Vérification Niveau 3 — Premium</Text>
      <Text style={[styles.flowDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Complétez votre profil pour accéder aux limites maximales (5M FCFA/jour).</Text>
      <InputField label="VILLE" value={city} onChangeText={setCity} placeholder="Ville de résidence" icon="map-pin" />
      <InputField label="QUARTIER" value={quartier} onChangeText={setQuartier} placeholder="Quartier de résidence" icon="home" />
      <InputField label="PROFESSION" value={profession} onChangeText={setProfession} placeholder="Profession actuelle" icon="briefcase" />
      <InputField label="JUSTIFICATIF DE DOMICILE" value={addressProof} onChangeText={setAddressProof} placeholder="Ex: Facture d'énergie / eau" icon="file-text" />
      <SubmitButton />
    </Animated.View>
  );

  // ========== DIASPORA FORM ==========
  const renderDiaspora = () => (
    <Animated.View entering={SlideInRight.duration(400)}>
      <Text style={[styles.flowTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>KYC Diaspora</Text>
      <View style={[styles.amlWarning, { backgroundColor: '#6366F1' + '15', borderColor: '#6366F1' }]}>
        <Feather name="alert-triangle" size={16} color="#6366F1" style={{ marginRight: 10 }} />
        <Text style={[styles.amlWarningText, { color: '#6366F1', fontFamily: theme.fontFamily }]}>Vérification AML (Anti-Blanchiment) stricte activée pour les comptes internationaux.</Text>
      </View>
      <InputField label="NOM COMPLET" value={fullName} onChangeText={setFullName} placeholder="Nom Complet" icon="user" />
      <InputField label="PAYS DE RÉSIDENCE" value={foreignCountry} onChangeText={setForeignCountry} placeholder="Pays de résidence" icon="globe" />
      <InputField label="NUMÉRO DE PASSEPORT" value={foreignIdNumber} onChangeText={setForeignIdNumber} placeholder="Numéro de passeport" icon="hash" />
      <InputField label="TITRE DE SÉJOUR / RÉSIDENCE" value={residencePermit} onChangeText={setResidencePermit} placeholder="Numéro du titre de séjour" icon="file-text" />
      <SubmitButton />
    </Animated.View>
  );

  // ========== SIMPLIFIED (RURAL) ==========
  const renderSimplified = () => (
    <Animated.View entering={SlideInRight.duration(400)}>
      <Text style={[styles.flowTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>KYC Simplifié — Inscription Assistée</Text>
      <Text style={[styles.flowDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Un agent XAALISI saisit les informations du bénéficiaire (agriculteur, mineur, retraité) directement sur son appareil. Zéro friction.
      </Text>
      <InputField label="CODE AGENT XAALISI" value={agentCode} onChangeText={setAgentCode} placeholder="AGT-XXX-XXX" icon="key" />
      <InputField label="NOM DU BÉNÉFICIAIRE" value={beneficiaryName} onChangeText={setBeneficiaryName} placeholder="Seydou Traoré" icon="user" />
      <InputField label="TÉLÉPHONE DU BÉNÉFICIAIRE" value={beneficiaryPhone} onChangeText={setBeneficiaryPhone} placeholder="+223 66 00 00 00" icon="phone" keyboardType="phone-pad" />
      <View style={[styles.kycInfoBox, { backgroundColor: '#F59E0B' + '15', borderColor: '#F59E0B' }]}>
        <Feather name="info" size={14} color="#F59E0B" style={{ marginRight: 10, marginTop: 2 }} />
        <Text style={[styles.kycInfoDesc, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
          Le portefeuille sera créé au Niveau 1 avec des limites de base. Le bénéficiaire recevra un SMS de confirmation.
        </Text>
      </View>
      <SubmitButton />
    </Animated.View>
  );

  const SubmitButton = () => (
    <TouchableOpacity
      style={[styles.submitBtn, { backgroundColor: submitted ? theme.inactiveToken : theme.primary, opacity: loading ? 0.7 : 1 }]}
      onPress={handleSubmit}
      disabled={loading || submitted}
    >
      {loading ? <ActivityIndicator color="#000" /> : (
        <>
          <Feather name={submitted ? 'check-circle' : 'send'} size={16} color="#000" style={{ marginRight: 10 }} />
          <Text style={[styles.submitText, { fontFamily: theme.fontFamily }]}>{submitted ? 'Soumis' : 'Soumettre la Vérification'}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  const getBackFlow = (): KycFlow => 'overview';

  return (
    <View style={styles.container}>
      <LinearGradient colors={isDark ? ['#1a1500', '#000000', '#0a0a0a'] : ['#FFFDF5', '#FFFFFF', '#F8F9FA']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} onPress={() => flow === 'overview' ? router.back() : setFlow(getBackFlow())}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>KYC Progressif</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {flow === 'overview' && renderOverview()}
          {flow === 'level2' && renderLevel2()}
          {flow === 'level3' && renderLevel3()}
          {flow === 'diaspora' && renderDiaspora()}
          {flow === 'simplified' && renderSimplified()}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 2 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  currentLevelCard: { padding: 20, borderRadius: 20, borderWidth: 1.5, marginBottom: 25 },
  levelCardHeader: { flexDirection: 'row', alignItems: 'center' },
  levelBadge: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  levelBadgeText: { color: '#000', fontSize: 12, fontWeight: '800' },
  levelLabel: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  levelLimit: { fontSize: 12 },

  sectionTitle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 15 },

  upgradeCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  upgradeIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  upgradeName: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 },
  upgradeDesc: { fontSize: 11 },

  flowTitle: { fontSize: 20, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  flowDesc: { fontSize: 13, lineHeight: 20, marginBottom: 25 },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  input: { flex: 1, fontSize: 14, height: '100%' },

  idTypeRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  idTypePill: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  idTypeText: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },

  uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, padding: 25, alignItems: 'center', marginBottom: 18 },
  uploadText: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  uploadDesc: { fontSize: 11 },

  amlWarning: { flexDirection: 'row', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  amlWarningText: { flex: 1, fontSize: 11, lineHeight: 18 },

  kycInfoBox: { flexDirection: 'row', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 20 },
  kycInfoDesc: { flex: 1, fontSize: 11, lineHeight: 18 },

  submitBtn: { flexDirection: 'row', height: 52, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitText: { color: '#000', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
});

// Module-level InputField to prevent re-mount on every parent re-render (fixes focus loss)
const InputField = ({ label, value, onChangeText, placeholder, icon, keyboardType }: any) => {
  const { colors: theme, isDark } = useAppTheme();
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
        <Feather name={icon || 'edit-3'} size={16} color={theme.primary} style={{ marginRight: 12 }} />
        <TextInput
          style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
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
