import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, SafeAreaView, Modal } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpCenterScreen() {
  const router = useRouter();

  const handleWhatsAppContact = () => {
    // Remplacer par le numéro WhatsApp réel de XAALISI Support
    Linking.openURL('https://wa.me/22300000000?text=Bonjour%20le%20support%20XAALISI');
  };

  const faqs = [
    {
      question: "Comment consulter mon solde ?",
      answer: "Votre solde est visible directement sur l'écran d'accueil. Vous pouvez aussi envoyer 'SOLDE' par SMS au 36000."
    },
    {
      question: "Comment envoyer de l'argent ?",
      answer: "Allez dans l'onglet 'Paiements', choisissez 'Transfert P2P', entrez le numéro du destinataire et le montant, puis validez avec votre code PIN."
    },
    {
      question: "Que faire si ma transaction a échoué ?",
      answer: "Vérifiez votre solde et votre connexion internet. Si l'argent a été débité mais non reçu, contactez-nous via WhatsApp ou ouvrez un ticket de réclamation ci-dessous."
    }
  ];

  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  
  const playVideo = (title: string) => {
    setCurrentVideoTitle(title);
    setVideoModalVisible(true);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Custom Back Button Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.title}>Comment pouvons-nous vous aider ?</Text>
          <Text style={styles.subtitle}>Retrouvez des réponses rapides ou contactez notre support.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions Fréquentes (FAQ)</Text>
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqCard}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tutoriels Vidéo</Text>
          <TouchableOpacity style={styles.tutorialButton} onPress={() => playVideo("Comment sécuriser mon compte")}>
            <Ionicons name="play-circle" size={24} color="#047857" />
            <Text style={styles.tutorialText}>Comment sécuriser mon compte</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tutorialButton} onPress={() => playVideo("Payer une facture d'électricité")}>
            <Ionicons name="play-circle" size={24} color="#047857" />
            <Text style={styles.tutorialText}>Payer une facture d&apos;électricité</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Direct</Text>
          
          <TouchableOpacity style={styles.contactCard} onPress={handleWhatsAppContact}>
            <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Assistant WhatsApp</Text>
              <Text style={styles.contactSub}>Réponse instantanée 24/7</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={() => router.push('/support')}>
            <Ionicons name="mail" size={32} color="#4F46E5" />
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Ouvrir un ticket</Text>
              <Text style={styles.contactSub}>Pour les problèmes complexes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Video Modal */}
      <Modal visible={videoModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setVideoModalVisible(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>{currentVideoTitle}</Text>
            <TouchableOpacity onPress={() => setVideoModalVisible(false)} style={{ padding: 8 }}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="play-circle-outline" size={80} color="rgba(255,255,255,0.5)" />
            <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>Lecture de la vidéo en cours...</Text>
            <Text style={{ color: 'rgba(255,255,255,0.6)', marginTop: 8, fontSize: 12 }}>(Simulateur de lecteur vidéo XAALISI)</Text>
          </View>
        </SafeAreaView>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tutorialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  tutorialText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  contactInfo: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactSub: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
});
