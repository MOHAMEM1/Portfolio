import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, Alert, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [mode, setMode] = useState<'scan' | 'mycode'>('scan');

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  if (!permission) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.permissionContainer}>
          <Feather name="camera-off" size={64} color={theme.inactiveToken} style={{ marginBottom: 20 }} />
          <Text style={[styles.permissionText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
            L&apos;accès à la caméra est requis pour scanner les codes QR.
          </Text>
          <TouchableOpacity 
            style={[styles.permissionBtn, { backgroundColor: theme.primary }]} 
            onPress={requestPermission}
          >
            <Text style={{ color: '#000', fontFamily: theme.fontFamily }}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    setScanned(true);
    // Parse QR Data (assuming it contains a username or payment link)
    Alert.alert('Code scanné', `Payer: ${data}`, [
      { 
        text: 'Annuler', 
        onPress: () => setScanned(false), 
        style: 'cancel' 
      },
      { 
        text: 'Payer', 
        onPress: () => {
          setScanned(false);
          // Normally we would pass data via router params
          router.push('/(tabs)/transfers');
        } 
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => router.back()}>
          <Feather name="x" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <View style={[styles.segmentedControl, { backgroundColor: theme.surface }]}>
          <TouchableOpacity 
            style={[styles.segmentBtn, mode === 'scan' && { backgroundColor: theme.primary }]}
            onPress={() => setMode('scan')}
          >
            <Text style={[styles.segmentText, { color: mode === 'scan' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>Scanner</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentBtn, mode === 'mycode' && { backgroundColor: theme.primary }]}
            onPress={() => setMode('mycode')}
          >
            <Text style={[styles.segmentText, { color: mode === 'mycode' ? '#000' : theme.textSecondary, fontFamily: theme.fontFamily }]}>Mon Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.iconBtn} />
      </View>

      {/* Body */}
      {mode === 'scan' ? (
        <View style={styles.cameraContainer}>
          <CameraView 
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.middleContainer}>
              <View style={styles.unfocusedContainer}></View>
              <View style={styles.focusedContainer}>
                {/* Scanner Frame UI */}
                <View style={[styles.corner, styles.topLeft, { borderColor: theme.primary }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: theme.primary }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.primary }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: theme.primary }]} />
              </View>
              <View style={styles.unfocusedContainer}></View>
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <Text style={[styles.scanInstruction, { fontFamily: theme.fontFamily }]}>
            Alignez le code QR dans le cadre
          </Text>
        </View>
      ) : (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.myCodeContainer}>
          <View style={[styles.qrCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.qrHeader}>
              <Text style={[styles.qrTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{username}</Text>
              <Text style={[styles.qrSubtitle, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]}>ID XAALISI: {username?.toUpperCase()}-XL</Text>
            </View>
            
            <View style={[styles.qrPlaceholder, { backgroundColor: '#FFFFFF' }]}>
              {/* Actual QR Code would go here using react-native-qrcode-svg */}
              <Feather name="maximize" size={150} color="#000" />
            </View>
            
            <Text style={[styles.qrFooterText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              Faites scanner ce code pour recevoir de l&apos;argent instantanément.
            </Text>
          </View>
        </Animated.View>
      )}

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
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  segmentedControl: { flexDirection: 'row', borderRadius: 12, padding: 4, width: 220 },
  segmentBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  segmentText: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },

  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 30, lineHeight: 24 },
  permissionBtn: { paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },

  cameraContainer: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  unfocusedContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)' },
  middleContainer: { flexDirection: 'row', height: SCAN_AREA_SIZE },
  focusedContainer: { width: SCAN_AREA_SIZE, height: SCAN_AREA_SIZE },
  
  corner: { position: 'absolute', width: 40, height: 40, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },

  scanInstruction: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 14,
    letterSpacing: 1,
  },

  myCodeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  qrCard: { width: '100%', maxWidth: 350, borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1 },
  qrHeader: { alignItems: 'center', marginBottom: 30 },
  qrTitle: { fontSize: 24, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  qrSubtitle: { fontSize: 13, letterSpacing: 1 },
  qrPlaceholder: { width: 220, height: 220, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  qrFooterText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
