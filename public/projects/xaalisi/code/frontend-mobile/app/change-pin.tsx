import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ChangePinScreen() {
  const { colors: theme, isDark } = useAppTheme();
  
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!currentPin || !newPin || !confirmPin) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les nouveaux codes PIN ne correspondent pas.');
      return;
    }
    if (newPin.length !== 4 || currentPin.length !== 4) {
      Alert.alert('Erreur', 'Le code PIN doit contenir exactement 4 chiffres.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Succès', 'Votre code PIN a été modifié avec succès.');
      router.back();
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Modifier le code PIN</Text>
        <View style={{ width: 40 }} />
      </View>

      <Animated.View entering={FadeInDown.duration(400)} style={styles.content}>
        <Text style={[styles.description, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
          Pour des raisons de sécurité, veuillez saisir votre code PIN actuel avant d&apos;en choisir un nouveau.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CODE PIN ACTUEL</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="lock" size={20} color={theme.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
              placeholder="****"
              placeholderTextColor={theme.inactiveToken}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={currentPin}
              onChangeText={setCurrentPin}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>NOUVEAU CODE PIN</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="shield" size={20} color={theme.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
              placeholder="Nouveau code (4 chiffres)"
              placeholderTextColor={theme.inactiveToken}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={newPin}
              onChangeText={setNewPin}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CONFIRMER LE CODE PIN</Text>
          <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Feather name="check-circle" size={20} color={theme.primary} style={styles.icon} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
              placeholder="Confirmer le code PIN"
              placeholderTextColor={theme.inactiveToken}
              secureTextEntry
              keyboardType="numeric"
              maxLength={4}
              value={confirmPin}
              onChangeText={setConfirmPin}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Mettre à jour le PIN</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
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
  content: { padding: 20 },
  description: { fontSize: 14, marginBottom: 30, lineHeight: 22 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  btn: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#000', fontSize: 16, fontWeight: '700' }
});
