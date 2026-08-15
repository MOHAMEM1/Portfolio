import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function SupportChatScreen() {
  const { colors: theme, isDark } = useAppTheme();
  
  const [messages, setMessages] = useState([
    { id: '1', text: "Bonjour ! Je suis XAALISI, votre assistant IA personnel. Comment puis-je vous aider aujourd'hui ?", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetchAPI('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: userMessage.text })
      });
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        isBot: true
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Désolé, je rencontre des difficultés de connexion. Veuillez réessayer plus tard.",
        isBot: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
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
          <View style={{ alignItems: 'center' }}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>XAALISI Assistant</Text>
            <Text style={{ color: '#10B981', fontSize: 12, fontFamily: theme.fontFamily, marginTop: 2 }}>En ligne (IA)</Text>
          </View>
          <View style={{ width: 44 }} />
        </Animated.View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((msg) => (
              <Animated.View 
                key={msg.id} 
                entering={FadeInUp.duration(300)}
                style={[
                  styles.messageBubble, 
                  msg.isBot ? [styles.botBubble, { backgroundColor: isDark ? '#222' : '#F0F0F0' }] : [styles.userBubble, { backgroundColor: theme.primary }]
                ]}
              >
                {msg.isBot && <Ionicons name="sparkles" size={14} color="#D4AF37" style={{ marginBottom: 4 }} />}
                <Text selectable={true} style={[
                  styles.messageText, 
                  { fontFamily: theme.fontFamily, color: msg.isBot ? theme.textPrimary : '#000' }
                ]}>
                  {msg.text}
                </Text>
              </Animated.View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.botBubble, { backgroundColor: 'transparent', alignSelf: 'flex-start', padding: 10 }]}>
                <ActivityIndicator size="small" color="#D4AF37" />
              </View>
            )}
          </ScrollView>

          <View style={[styles.inputContainer, { backgroundColor: isDark ? '#111' : '#FFF', borderTopColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily, backgroundColor: isDark ? '#222' : '#F5F5F5' }]}
              placeholder="Posez votre question..."
              placeholderTextColor={theme.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendBtn, { backgroundColor: inputText.trim() ? theme.primary : (isDark ? '#333' : '#E0E0E0') }]} 
              onPress={sendMessage}
              disabled={!inputText.trim()}
            >
              <Feather name="send" size={18} color={inputText.trim() ? '#000' : theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
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
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)'
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  chatContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 20,
    marginBottom: 16,
  },
  botBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
    alignItems: 'flex-end'
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    maxHeight: 100,
    minHeight: 44,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginBottom: 0
  }
});
