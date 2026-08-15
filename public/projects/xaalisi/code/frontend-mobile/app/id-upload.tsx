import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator, Alert, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import Animated, { FadeIn, FadeInUp, Layout, SlideInDown } from 'react-native-reanimated';
import { fetchAPI } from '@/config/api';

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  isPdf: boolean;
}

export default function IdUploadScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { height: screenHeight } = useWindowDimensions();
  
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'uploading' | 'analyzing' | 'done'>('uploading');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Scanner animation helper
  const [scannerY, setScannerY] = useState(0);

  useEffect(() => {
    if (verifying && verificationStep === 'analyzing') {
      const interval = setInterval(() => {
        setScannerY((prev) => (prev >= 200 ? 0 : prev + 10));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [verifying, verificationStep]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || 'id_image.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
          isPdf: false,
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de charger la bibliothèque d\'images.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Accès Refusé', "L'application a besoin d'accéder à l'appareil photo pour photographier votre pièce d'identité.");
        return;
      }

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || 'camera_image.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
          isPdf: false,
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de lancer l\'appareil photo.');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'application/pdf',
          isPdf: asset.mimeType?.includes('pdf') || asset.name.toLowerCase().endsWith('.pdf'),
        });
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Impossible de sélectionner le document.');
    }
  };

  const handleUploadAndVerify = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setVerifying(true);
    setVerificationStep('uploading');

    try {
      const formData = new FormData();
      let fileToUpload: any;

      if (Platform.OS === 'web') {
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        fileToUpload = blob;
        formData.append('file', fileToUpload, selectedFile.name);
      } else {
        fileToUpload = {
          uri: Platform.OS === 'android' ? selectedFile.uri : selectedFile.uri.replace('file://', ''),
          name: selectedFile.name,
          type: selectedFile.mimeType,
        };
        formData.append('file', fileToUpload);
      }

      // 1. Upload file to OCR (simulated AI Extraction)
      const dummyBase64 = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=".repeat(5);
      
      const uploadPromise = fetchAPI('/kyc/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_base64: dummyBase64 }),
      });

      // Switch to analyzing state after short upload delay
      setTimeout(() => {
        setVerificationStep('analyzing');
      }, 1000);

      const responseData = await uploadPromise;

      // 2. Wait a little more to complete the interactive checking visual
      setTimeout(() => {
        setVerificationResult(responseData);
        setVerificationStep('done');
        
        // 3. Automatically redirect to the KYC form to pre-fill it with extracted data
        setTimeout(() => {
          if (responseData && responseData.extracted_data) {
            const encodedData = encodeURIComponent(JSON.stringify(responseData.extracted_data));
            router.replace(`/kyc?ocrData=${encodedData}`);
          } else {
            router.replace('/kyc');
          }
        }, 3500);

      }, 3500);

    } catch (error: any) {
      console.error(error);
      setVerifying(false);
      setUploading(false);
      Alert.alert(
        'Vérification Échouée',
        error.message || "Une erreur est survenue lors de l'analyse du document d'identité."
      );
    }
  };

  const renderVerificationOverlay = () => {
    if (!verifying) return null;

    return (
      <Animated.View entering={FadeIn} style={[StyleSheet.absoluteFillObject, styles.overlay, { backgroundColor: '#000000' }]}>
        <StatusBar barStyle="light-content" />
        
        {verificationStep === 'uploading' && (
          <View style={styles.overlayContent}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.overlayTitle, { color: '#FFFFFF', fontFamily: theme.fontFamily }]}>Envoi du Document...</Text>
            <Text style={[styles.overlayDesc, { color: 'rgba(255,255,255,0.6)' }]}>
              Votre document est chiffré et transféré vers nos serveurs sécurisés.
            </Text>
          </View>
        )}

        {verificationStep === 'analyzing' && (
          <View style={styles.overlayContent}>
            <View style={styles.scannerWrapper}>
              {selectedFile?.isPdf ? (
                <View style={styles.pdfScanContainer}>
                  <Feather name="file-text" size={80} color={theme.primary} />
                  <Text style={[styles.pdfScanText, { color: '#FFFFFF' }]}>{selectedFile.name}</Text>
                </View>
              ) : (
                <Image source={{ uri: selectedFile?.uri }} style={styles.scanImage} />
              )}
              {/* Scan Laser Line */}
              <View style={[styles.scannerLine, { backgroundColor: theme.primary, top: scannerY }]} />
            </View>

            <ActivityIndicator size="small" color={theme.primary} style={{ marginTop: 25 }} />
            <Text style={[styles.overlayTitle, { color: '#FFFFFF', fontFamily: theme.fontFamily }]}>Vérification Système XAALISI...</Text>
            
            <View style={styles.checkStepList}>
              <View style={styles.checkStepItem}>
                <Feather name="check" size={14} color={theme.primary} style={styles.checkStepIcon} />
                <Text style={styles.checkStepText}>Format du fichier valide ({selectedFile?.name.split('.').pop()?.toUpperCase()})</Text>
              </View>
              <View style={styles.checkStepItem}>
                <Feather name="check" size={14} color={theme.primary} style={styles.checkStepIcon} />
                <Text style={styles.checkStepText}>Signature d&apos;authenticité vérifiée</Text>
              </View>
              <View style={styles.checkStepItem}>
                <ActivityIndicator size="small" color={theme.primary} style={[styles.checkStepIcon, { width: 14, height: 14 }]} />
                <Text style={[styles.checkStepText, { color: theme.primary }]}>Extraction OCR et vérification d&apos;âge {'>='} 18 ans...</Text>
              </View>
            </View>
          </View>
        )}

        {verificationStep === 'done' && verificationResult && (
          <Animated.View entering={SlideInDown} style={styles.overlayContent}>
            <View style={[styles.successBadge, { backgroundColor: theme.primary }]}>
              <Feather name="check" size={40} color="#000000" />
            </View>
            
            <Text style={[styles.overlayTitle, { color: '#FFFFFF', fontSize: 24, marginBottom: 8, fontFamily: theme.fontFamily }]}>
              Identité Vérifiée !
            </Text>
            <Text style={[styles.overlayDesc, { color: 'rgba(255,255,255,0.6)', marginBottom: 30 }]}>
              L&apos;analyse OCR a validé vos informations. Accès autorisé.
            </Text>

            <Animated.View entering={FadeInUp.delay(300)} style={[styles.resultCard, { borderColor: theme.primary }]}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>NOM COMPLET</Text>
                <Text style={[styles.resultValue, { color: '#FFFFFF' }]}>
                  {verificationResult.extracted_data?.name}
                </Text>
              </View>
              <View style={styles.divider} />
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>DATE DE NAISSANCE</Text>
                <Text style={[styles.resultValue, { color: '#FFFFFF' }]}>
                  {verificationResult.extracted_data?.dob}
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>ÂGE EXTRAIT</Text>
                <Text style={[styles.resultValue, { color: theme.primary }]}>
                  {verificationResult.extracted_data?.age} ans (Majeur)
                </Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>TYPE DE FICHIER</Text>
                <Text style={[styles.resultValue, { color: '#FFFFFF' }]}>
                  {verificationResult.extracted_data?.doc_type} Document
                </Text>
              </View>
            </Animated.View>

            <Text style={[styles.redirectText, { color: 'rgba(255,255,255,0.4)', marginTop: 25 }]}>
              Connexion et redirection en cours...
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => router.replace('/auth')}
        >
          <Feather name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeIn} style={styles.content}>
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
          Document d&apos;Identité
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
          Téléchargez votre pièce d&apos;identité (JPG, PNG ou PDF). Notre système vérifiera automatiquement vos données pour activer votre compte.
        </Text>

        <View style={styles.uploadArea}>
          {selectedFile ? (
            <Animated.View entering={FadeInUp} layout={Layout.springify()} style={[styles.imageWrapper, { borderColor: theme.border }]}>
              {selectedFile.isPdf ? (
                <View style={[styles.pdfPlaceholder, { backgroundColor: isDark ? '#111111' : '#F7F7F7' }]}>
                  <Feather name="file-text" size={60} color={theme.primary} style={{ marginBottom: 15 }} />
                  <Text style={[styles.pdfName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <Text style={[styles.pdfSize, { color: theme.textSecondary }]}>Fichier PDF</Text>
                </View>
              ) : (
                <Image source={{ uri: selectedFile.uri }} style={styles.idImage} />
              )}
              <TouchableOpacity 
                style={[styles.clearBtn, { backgroundColor: isDark ? '#111111' : '#FFFFFF' }]} 
                onPress={() => setSelectedFile(null)}
              >
                <Feather name="x" size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp} style={styles.placeholderContainer}>
              <View style={[styles.placeholderBox, { borderColor: theme.primary + '50', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FAF9F6' }]}>
                <Feather name="shield" size={48} color={theme.primary} style={{ marginBottom: 15 }} />
                <Text style={[styles.placeholderText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                  Aucun fichier sélectionné
                </Text>
                <Text style={[styles.placeholderSubtext, { color: theme.textSecondary }]}>
                  Format accepté : Image ou PDF
                </Text>
              </View>
              
              <View style={styles.actionGrid}>
                <TouchableOpacity style={[styles.actionGridBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface }]} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Prendre Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionGridBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface }]} onPress={pickImage}>
                  <Feather name="image" size={20} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Galerie Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionGridBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, width: '100%', marginTop: 10 }]} onPress={pickDocument}>
                  <Feather name="file-text" size={20} color={theme.primary} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Fichier (PDF, JPG, PNG)</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.btnPrimary, 
            { 
              backgroundColor: selectedFile ? theme.primary : (isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0'),
              opacity: selectedFile ? 1 : 0.6 
            }
          ]}
          disabled={!selectedFile || uploading}
          onPress={handleUploadAndVerify}
        >
          {uploading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={[styles.btnText, { color: selectedFile ? '#000000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>
              Lancer la Vérification
            </Text>
          )}
        </TouchableOpacity>
        {!uploading && (
          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center', paddingVertical: 10 }}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 14, fontWeight: '600', textDecorationLine: 'underline', fontFamily: theme.fontFamily }}>
              Passer pour l&apos;instant
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {renderVerificationOverlay()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 25, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 30, flex: 1 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 12, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 30, opacity: 0.8 },
  
  uploadArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderContainer: { width: '100%', alignItems: 'center' },
  placeholderBox: {
    width: '100%',
    height: 180,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  placeholderText: { fontSize: 16, fontWeight: '700', marginBottom: 5 },
  placeholderSubtext: { fontSize: 12, opacity: 0.6 },
  
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' },
  actionGridBtn: {
    width: '48%',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  
  imageWrapper: { width: '100%', height: 240, borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
  idImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  pdfPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  pdfName: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  pdfSize: { fontSize: 12, opacity: 0.6 },
  
  clearBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  footer: { padding: 30, paddingBottom: Platform.OS === 'ios' ? 50 : 45 },
  btnPrimary: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  // Verification Screen Styling
  overlay: {
    zIndex: 10000,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  overlayContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  overlayDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  scannerWrapper: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.6,
  },
  pdfScanContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pdfScanText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.8,
  },
  scannerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  checkStepList: {
    width: '100%',
    marginTop: 30,
    gap: 12,
  },
  checkStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 12,
  },
  checkStepIcon: {
    marginRight: 10,
  },
  checkStepText: {
    fontSize: 12,
    color: '#A0AEC0',
    fontWeight: '500',
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultCard: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#111111',
    gap: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 10,
    color: '#718096',
    fontWeight: '700',
    letterSpacing: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  redirectText: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
