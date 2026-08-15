import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Visual USSD Simulator: Mirrors the backend USSD router (*123#)
 * for testing without an actual USSD gateway.
 */
export default function UssdScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  
  const [history, setHistory] = useState<{ type: 'system' | 'user'; text: string }[]>([
    { type: 'system', text: 'Bienvenue sur XAALISI *123#:\n1. Mon Solde\n2. Transfert d\'argent\n3. Paiement Facture' }
  ]);
  const [input, setInput] = useState('');
  const [path, setPath] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);

  const processInput = (userInput: string) => {
    const newPath = [...path, userInput];
    const level = newPath.length;
    let response = '';
    let end = false;

    try {
      if (newPath[0] === '1') {
        if (level === 1) { response = 'Entrez votre code PIN secret:'; }
        else if (level === 2) { response = `Votre solde actuel est de 480,000 FCFA.`; end = true; }
      } else if (newPath[0] === '2') {
        if (level === 1) { response = 'Entrez le numero du destinataire:'; }
        else if (level === 2) { response = 'Entrez le montant a envoyer (FCFA):'; }
        else if (level === 3) { response = `Vous allez envoyer ${newPath[2]} FCFA au ${newPath[1]}.\nEntrez votre code PIN pour valider:`; }
        else if (level === 4) { response = `Succes! ${newPath[2]} FCFA transferes au ${newPath[1]}.`; end = true; }
      } else if (newPath[0] === '3') {
        if (level === 1) { response = 'Choisissez le fournisseur:\n1. Eau\n2. Electricite'; }
        else if (level === 2) { response = 'Entrez le numero de votre facture:'; }
        else if (level === 3) { response = 'Entrez le montant de la facture:'; }
        else if (level === 4) { response = 'Entrez votre code PIN pour valider:'; }
        else if (level === 5) {
          const provider = newPath[1] === '1' ? 'EAU' : 'ELECTRICITE';
          response = `Succes! Facture ${provider} (${newPath[2]}) payee: ${newPath[3]} FCFA.`;
          end = true;
        }
      } else {
        response = 'Choix invalide. Au revoir.';
        end = true;
      }
    } catch {
      response = 'Saisie invalide.';
      end = true;
    }

    setHistory(prev => [
      ...prev,
      { type: 'user', text: userInput },
      { type: 'system', text: response }
    ]);
    setPath(newPath);
    setInput('');
    if (end) setEnded(true);
  };

  const resetSession = () => {
    setHistory([{ type: 'system', text: 'Bienvenue sur XAALISI *123#:\n1. Mon Solde\n2. Transfert d\'argent\n3. Paiement Facture' }]);
    setPath([]);
    setInput('');
    setEnded(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={isDark ? ['#0a0a0a', '#000'] : ['#FFF', '#F5F5F5']} style={StyleSheet.absoluteFillObject} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.primary, fontFamily: theme.fontFamily }]}>*123#</Text>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} onPress={resetSession}>
            <Feather name="refresh-cw" size={18} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.chatArea} showsVerticalScrollIndicator={false}>
          {history.map((msg, i) => (
            <Animated.View key={i} entering={FadeInUp.duration(300)} style={[styles.bubble, msg.type === 'user' ? styles.userBubble : styles.systemBubble, { backgroundColor: msg.type === 'user' ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : theme.surface), borderColor: msg.type === 'user' ? theme.primary : theme.border }]}>
              <Text style={[styles.bubbleText, { color: msg.type === 'user' ? '#000' : theme.textPrimary, fontFamily: theme.fontFamily }]}>{msg.text}</Text>
            </Animated.View>
          ))}
        </ScrollView>

        {!ended ? (
          <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
            <View style={[styles.inputBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
                placeholder="Entrez votre réponse..."
                placeholderTextColor={theme.inactiveToken}
                value={input}
                onChangeText={setInput}
                keyboardType="default"
              />
            </View>
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={() => input.trim() && processInput(input.trim())}>
              <Feather name="send" size={18} color="#000" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={[styles.restartBtn, { backgroundColor: theme.primary }]} onPress={resetSession}>
              <Feather name="refresh-cw" size={16} color="#000" style={{ marginRight: 10 }} />
              <Text style={[styles.restartText, { fontFamily: theme.fontFamily }]}>Nouvelle Session *123#</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30, paddingBottom: 15 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  headerTitle: { fontSize: 22, letterSpacing: 2 },

  chatArea: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
  bubble: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10, maxWidth: '85%' },
  systemBubble: { alignSelf: 'flex-start' },
  userBubble: { alignSelf: 'flex-end' },
  bubbleText: { fontSize: 14, lineHeight: 22 },

  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1 },
  inputBox: { flex: 1, height: 48, borderRadius: 14, borderWidth: 1, paddingHorizontal: 16, justifyContent: 'center', marginRight: 12 },
  textInput: { fontSize: 15, height: '100%' },
  sendBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },

  restartBtn: { flex: 1, flexDirection: 'row', height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  restartText: { color: '#000', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
});
