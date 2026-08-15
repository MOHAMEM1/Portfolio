import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, StatusBar, Modal, FlatList, ActivityIndicator, Alert, Image, useWindowDimensions, Pressable
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import Animated, { FadeIn, FadeInDown, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

type AuthStep = 'login' | 'signup_phone' | 'signup_pin' | 'signup_id' | 'forgot_phone' | 'forgot_otp' | 'forgot_pin';

export default function AuthScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { login: loginContext } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const pinInputRef = useRef<TextInput>(null);
  const confirmPinInputRef = useRef<TextInput>(null);
  const loginPinInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const loginPhoneInputRef = useRef<TextInput>(null);

  const [step, setStep] = useState<AuthStep>('login');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [countryCode, setCountryCode] = useState('ML');
  const [callingCode, setCallingCode] = useState('223');
  const [isCountryPickerVisible, setCountryPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedIdType, setSelectedIdType] = useState<string | null>(null);

  const countries = [
    { code: 'ML', name: 'Mali', dialCode: '223', flag: '🇲🇱' },
    { code: 'SN', name: 'Sénégal', dialCode: '221', flag: '🇸🇳' },
    { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '225', flag: '🇨🇮' },
    { code: 'GN', name: 'Guinée', dialCode: '224', flag: '🇬🇳' },
    { code: 'BF', name: 'Burkina Faso', dialCode: '226', flag: '🇧🇫' },
    { code: 'NE', name: 'Niger', dialCode: '227', flag: '🇳🇪' },
    { code: 'FR', name: 'France', dialCode: '33', flag: '🇫🇷' },
    { code: 'US', name: 'États-Unis', dialCode: '1', flag: '🇺🇸' },
  ];

  const idTypes = [
    { id: 'nina', title: 'Carte NINA (Mali)', icon: 'credit-card' },
    { id: 'passport', title: 'Passeport', icon: 'book' },
    { id: 'national_id', title: 'Carte Nationale d\'Identité', icon: 'user' },
  ];

  const isDiaspora = !['ML'].includes(countryCode);

  const [alertConfig, setAlertConfig] = useState<{ visible: boolean, title: string, message: string, buttons?: { text: string; onPress?: () => void }[] }>({ visible: false, title: '', message: '' });

  const showAlert = (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const handleNextToPin = () => {
    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      showAlert('Erreur', 'Veuillez entrer un numéro de téléphone valide (au moins 8 chiffres).');
      return;
    }
    setStep('signup_pin');
  };

  const handleNextToId = () => {
    if (!pin || pin.length < 4) {
      showAlert('Erreur', 'Veuillez entrer un PIN de 4 chiffres.');
      return;
    }
    if (pin !== confirmPin) {
      showAlert('Erreur', 'Les codes PIN ne correspondent pas.');
      return;
    }
    setStep('signup_id');
  };

  const handleSignup = async () => {
    if (submitted) return;
    if (!selectedIdType) {
      showAlert('Erreur', 'Veuillez sélectionner un type de pièce d\'identité.');
      return;
    }
    
    setLoading(true);
    setSubmitted(true);
    
    // Clean phone number: remove spaces and append calling code or just remove spaces depending on backend
    const cleanPhone = phone.replace(/\s+/g, '');
    const username = cleanPhone;
    
    try {
      await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: username,
          password: pin,
          pin_code: pin,
        })
      });
      
      // Auto-login after registration
      const bodyString = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(pin)}`;
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyString
      });
      await loginContext(data.access_token, username);
      
      if (Platform.OS === 'web') {
        router.replace('/id-upload');
      } else {
        showAlert(
          'Compte Créé',
          'Votre portefeuille XAALISI a été créé avec succès.\n\nVeuillez maintenant télécharger votre pièce d\'identité.',
          [{ text: 'Continuer', onPress: () => router.replace('/id-upload') }]
        );
      }
    } catch (error: any) {
      showAlert('Erreur', error.message || 'L\'inscription a échoué.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (submitted) return;
    if (!phone || !pin) {
      showAlert('Champs Requis', 'Veuillez entrer votre numéro et votre PIN.');
      return;
    }
    setLoading(true);
    setSubmitted(true);
    try {
      const cleanPhone = phone.replace(/\s+/g, '');
      const bodyString = `username=${encodeURIComponent(cleanPhone)}&password=${encodeURIComponent(pin)}`;

      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyString
      });
      await loginContext(data.access_token, cleanPhone);

      // Verify if they have uploaded their KYC document
      try {
        const kycStatus = await fetchAPI('/auth/kyc/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access_token}`
          }
        });
        if (!kycStatus.kyc_doc_uploaded) {
          router.replace('/id-upload');
        } else {
          router.replace('/(tabs)');
        }
      } catch (e) {
        console.error(e);
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      showAlert('Échec de Connexion', error.message || 'Identifiants incorrects.');
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const renderSignupPhone = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Créer un Compte</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>NUMÉRO DE TÉLÉPHONE</Text>
        <View
          style={[styles.phoneInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}
        >
          <TouchableOpacity style={styles.countryPicker} onPress={() => setCountryPickerVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` }}
                style={{ width: 22, height: 15, marginRight: 8, borderRadius: 2 }}
              />
              <Text style={[styles.countryText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                +{callingCode}
              </Text>
              <Feather name="chevron-down" size={12} color={theme.textPrimary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TextInput
            ref={phoneInputRef}
            style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
            placeholder="77 00 00 00"
            placeholderTextColor={theme.inactiveToken}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        {isDiaspora && (
          <View style={[styles.diasporaBadge, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="globe" size={12} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.diasporaText, { color: theme.primary, fontFamily: theme.fontFamily }]}>Mode Diaspora — Vérification AML activée</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        onPress={handleNextToPin}
      >
        <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Suivant</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStep('login'); setPin(''); setConfirmPin(''); }} style={styles.switchLink}>
        <Text style={[styles.switchText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
          Déjà un compte ? <Text style={{ color: theme.primary, fontWeight: '700' }}>Se Connecter</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSignupPin = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Sécuriser le compte</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Sécurisez votre portefeuille avec un code PIN.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CRÉER UN CODE PIN (4 CHIFFRES)</Text>
        <Pressable 
          style={styles.pinBoxesContainer} 
          onPress={() => pinInputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: pin.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{pin.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            ref={pinInputRef}
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={pin}
            onChangeText={(val) => {
              setPin(val);
              if (val.length === 4) {
                confirmPinInputRef.current?.focus();
              }
            }}
          />
        </Pressable>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CONFIRMER LE CODE PIN</Text>
        <Pressable 
          style={styles.pinBoxesContainer}
          onPress={() => confirmPinInputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: confirmPin.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{confirmPin.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            ref={confirmPinInputRef}
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={confirmPin}
            onChangeText={setConfirmPin}
          />
        </Pressable>
      </View>

      <View style={styles.fingerprintContainer}>
        <TouchableOpacity style={styles.fingerprintBtn}>
          <Feather name="command" size={24} color={theme.primary} />
          <Text style={[styles.fingerprintText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Ou utiliser l&apos;empreinte digitale</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        onPress={handleNextToId}
      >
        <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Suivant</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSignupId = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Vérification d&apos;Identité</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Sélectionnez une pièce d&apos;identité pour finaliser votre inscription.
      </Text>

      <View style={styles.idOptionsContainer}>
        {idTypes.map((type) => {
          const isSelected = selectedIdType === type.id;
          return (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.idOptionBox,
                { 
                  backgroundColor: isSelected ? theme.primary : 'transparent',
                  borderColor: isSelected ? theme.primary : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
                  borderWidth: isSelected ? 1.5 : 1
                }
              ]}
              onPress={() => setSelectedIdType(type.id)}
            >
              <Feather 
                name={type.icon as any} 
                size={22} 
                color={isSelected ? '#000000' : (isDark ? '#FFFFFF' : theme.textSecondary)} 
                style={{ marginBottom: 12 }} 
              />
              <Text 
                style={[
                  styles.idOptionText, 
                  { 
                    color: isSelected ? '#000000' : (isDark ? '#FFFFFF' : theme.textPrimary),
                    fontFamily: theme.fontFamily 
                  }
                ]}
              >
                {type.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.btnPrimary, 
          { 
            backgroundColor: 'transparent', 
            borderWidth: 1.5, 
            borderColor: theme.primary, 
            opacity: loading ? 0.7 : 1, 
            marginTop: 25 
          }
        ]}
        onPress={handleSignup}
        disabled={loading || submitted}
      >
        {loading ? <ActivityIndicator color={theme.primary} /> : (
          <Text style={[styles.btnText, { color: theme.primary, fontFamily: theme.fontFamily }]}>Finaliser l&apos;Inscription</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );

  const renderLogin = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Bienvenue</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Entrez vos identifiants pour accéder à votre portefeuille.
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>NUMÉRO DE TÉLÉPHONE</Text>
        <View
          style={[styles.phoneInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}
        >
          <TouchableOpacity style={styles.countryPicker} onPress={() => setCountryPickerVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image
                source={{ uri: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` }}
                style={{ width: 22, height: 15, marginRight: 8, borderRadius: 2 }}
              />
              <Text style={[styles.countryText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                +{callingCode}
              </Text>
              <Feather name="chevron-down" size={12} color={theme.textPrimary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TextInput
            ref={loginPhoneInputRef}
            style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
            placeholder="77 00 00 00"
            placeholderTextColor={theme.inactiveToken}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        {isDiaspora && (
          <View style={[styles.diasporaBadge, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="globe" size={12} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.diasporaText, { color: theme.primary, fontFamily: theme.fontFamily }]}>Mode Diaspora — Vérification AML activée</Text>
          </View>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CODE PIN</Text>
        <View
          style={styles.pinBoxesContainer}
        >
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: pin.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{pin.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            ref={loginPinInputRef}
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={pin}
            onChangeText={setPin}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: submitted ? theme.inactiveToken : theme.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={handleLogin}
        disabled={loading || submitted}
      >
        {loading ? <ActivityIndicator color="#000" /> : (
          <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Se Connecter</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStep('forgot_phone'); setSubmitted(false); setPin(''); }} style={{ marginTop: 20, alignSelf: 'center' }}>
        <Text style={{ color: theme.textSecondary, fontFamily: theme.fontFamily, fontSize: 13, fontWeight: '500' }}>
          Mot de passe oublié ?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => { setStep('signup_phone'); setSubmitted(false); setPin(''); }} style={styles.switchLink}>
        <Text style={[styles.switchText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
          Nouveau sur XAALISI ? <Text style={{ color: theme.primary, fontWeight: '700' }}>Créer un Compte</Text>
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderForgotPhone = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Récupération</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Entrez le numéro associé à votre compte.
      </Text>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>NUMÉRO DE TÉLÉPHONE</Text>
        <View style={[styles.phoneInputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.countryPicker} onPress={() => setCountryPickerVisible(true)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={{ uri: `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png` }} style={{ width: 22, height: 15, marginRight: 8, borderRadius: 2 }} />
              <Text style={[styles.countryText, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>+{callingCode}</Text>
              <Feather name="chevron-down" size={12} color={theme.textPrimary} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <TextInput
            ref={loginPhoneInputRef}
            style={[styles.input, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
            placeholder="77 00 00 00"
            placeholderTextColor={theme.inactiveToken}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        onPress={() => {
          const cleanPhone = phone.replace(/\s+/g, '');
          if (!cleanPhone || cleanPhone.length < 8) {
            showAlert('Erreur', 'Veuillez entrer un numéro valide.');
            return;
          }
          setStep('forgot_otp');
        }}
      >
        <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Recevoir le code</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const [resetOtp, setResetOtp] = useState('');
  
  const renderForgotOtp = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Vérification</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Un code a été envoyé par SMS au +{callingCode} {phone}
      </Text>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CODE OTP</Text>
        <Pressable style={styles.pinBoxesContainer}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: resetOtp.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{resetOtp.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={resetOtp}
            onChangeText={setResetOtp}
            autoFocus
          />
        </Pressable>
      </View>
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: theme.primary }]}
        onPress={() => {
          if (resetOtp.length !== 4) {
            showAlert('Erreur', 'Veuillez entrer le code OTP à 4 chiffres.');
            return;
          }
          setPin(''); setConfirmPin('');
          setStep('forgot_pin');
        }}
      >
        <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Vérifier le code</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderForgotPin = () => (
    <Animated.View entering={FadeIn.duration(500)} style={styles.formContent}>
      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Nouveau Code</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
        Créez un nouveau code PIN sécurisé.
      </Text>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>NOUVEAU CODE PIN</Text>
        <Pressable style={styles.pinBoxesContainer} onPress={() => pinInputRef.current?.focus()}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: pin.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{pin.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            ref={pinInputRef}
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={pin}
            onChangeText={(val) => {
              setPin(val);
              if (val.length === 4) confirmPinInputRef.current?.focus();
            }}
          />
        </Pressable>
      </View>
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>CONFIRMER LE CODE PIN</Text>
        <Pressable style={styles.pinBoxesContainer} onPress={() => confirmPinInputRef.current?.focus()}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.pinBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : theme.surface, borderColor: confirmPin.length === index ? theme.primary : theme.border }]}>
              <Text style={[styles.pinBoxText, { color: theme.textPrimary }]}>{confirmPin.length > index ? '●' : ''}</Text>
            </View>
          ))}
          <TextInput
            ref={confirmPinInputRef}
            style={styles.hiddenPinInput}
            keyboardType="number-pad"
            maxLength={4}
            value={confirmPin}
            onChangeText={setConfirmPin}
          />
        </Pressable>
      </View>
      <TouchableOpacity
        style={[styles.btnPrimary, { backgroundColor: theme.primary, opacity: loading ? 0.7 : 1 }]}
        onPress={() => {
          if (pin.length !== 4) return showAlert('Erreur', 'Veuillez entrer 4 chiffres.');
          if (pin !== confirmPin) return showAlert('Erreur', 'Les codes ne correspondent pas.');
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            showAlert('Succès', 'Votre PIN a été réinitialisé avec succès.', [
              { text: 'Se connecter', onPress: () => { setStep('login'); setPin(''); setConfirmPin(''); setResetOtp(''); } }
            ]);
          }, 1500);
        }}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#000" /> : <Text style={[styles.btnText, { fontFamily: theme.fontFamily }]}>Réinitialiser</Text>}
      </TouchableOpacity>
    </Animated.View>
  );

  const getBackAction = () => {
    if (step === 'login') return () => router.back();
    if (step === 'signup_phone') return () => setStep('login');
    if (step === 'signup_pin') return () => setStep('signup_phone');
    if (step === 'signup_id') return () => setStep('signup_pin');
    if (step === 'forgot_phone') return () => setStep('login');
    if (step === 'forgot_otp') return () => setStep('forgot_phone');
    if (step === 'forgot_pin') return () => setStep('forgot_otp');
    return () => router.back();
  };

  const getStepTitle = () => {
    if (step === 'login') return 'CONNEXION';
    if (step.startsWith('forgot')) return 'RÉCUPÉRATION';
    return 'INSCRIPTION';
  };

  return (
    <View style={styles.container}>
      {isDark ? (
        <>
          <Image
            source={require('../assets/images/watermarked_img_2484420249904618943.png')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: screenHeight * 0.7,
              opacity: 0.8,
            }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)', '#000000']}
            locations={[0, 0.5, 0.8, 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: screenHeight * 0.7,
            }}
          />
        </>
      ) : (
        <>
          <LinearGradient colors={['#FFFDF5', '#FFFFFF']} style={StyleSheet.absoluteFillObject} />
          <Image
            source={require('../assets/images/light_hero_chart.png')}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: screenHeight * 0.7,
              opacity: 1,
            }}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
            locations={[0, 0.6, 0.85, 1]}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: screenHeight * 0.7,
            }}
          />
        </>
      )}
      <KeyboardAvoidingView style={{ flex: 1, width: '100%' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
            onPress={getBackAction()}
          >
            <Feather name="arrow-left" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.stepBadge, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="shield" size={14} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.stepBadgeText, { color: theme.primary, fontFamily: theme.fontFamily }]}>
              {getStepTitle()}
            </Text>
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
          <View style={{ width: '100%', zIndex: 1 }}>
            {step === 'signup_phone' && renderSignupPhone()}
            {step === 'signup_pin' && renderSignupPin()}
            {step === 'signup_id' && renderSignupId()}
            {step === 'login' && renderLogin()}
            {step === 'forgot_phone' && renderForgotPhone()}
            {step === 'forgot_otp' && renderForgotOtp()}
            {step === 'forgot_pin' && renderForgotPin()}
          </View>
        </View>

        {/* Country Picker Modal */}
        {isCountryPickerVisible && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setCountryPickerVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setCountryPickerVisible(false)} />
              <Animated.View entering={SlideInDown} exiting={SlideOutDown} style={[styles.modalContent, { backgroundColor: theme.background }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Sélectionner le Pays</Text>
                  <TouchableOpacity onPress={() => setCountryPickerVisible(false)}>
                    <Feather name="x" size={24} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={countries}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.countryItem, { borderBottomColor: theme.border }]}
                      onPress={() => { setCountryCode(item.code); setCallingCode(item.dialCode); setCountryPickerVisible(false); }}
                    >
                      <Image
                        source={{ uri: `https://flagcdn.com/w40/${item.code.toLowerCase()}.png` }}
                        style={{ width: 24, height: 16, marginRight: 12, borderRadius: 2 }}
                      />
                      <Text style={[styles.countryName, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{item.name}</Text>
                      <Text style={[styles.countryDialCode, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>+{item.dialCode}</Text>
                    </TouchableOpacity>
                  )}
                />
              </Animated.View>
            </View>
          </Modal>
        )}

        {/* Custom Alert Modal */}
        {alertConfig.visible && (
          <Modal visible transparent animationType="fade" onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}>
            <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
              <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))} />
              <Animated.View entering={FadeInDown.duration(300)} style={[styles.customAlertContainer, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                <View style={[styles.customAlertIcon, { backgroundColor: alertConfig.title.toLowerCase().includes('succès') || alertConfig.title.toLowerCase().includes('créé') || alertConfig.title.toLowerCase().includes('soumise') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 69, 58, 0.1)' }]}>
                  <Feather 
                    name={alertConfig.title.toLowerCase().includes('succès') || alertConfig.title.toLowerCase().includes('créé') || alertConfig.title.toLowerCase().includes('soumise') ? 'check-circle' : 'alert-triangle'} 
                    size={32} 
                    color={alertConfig.title.toLowerCase().includes('succès') || alertConfig.title.toLowerCase().includes('créé') || alertConfig.title.toLowerCase().includes('soumise') ? '#4CAF50' : '#FF453A'} 
                  />
                </View>
                <Text style={[styles.customAlertTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{alertConfig.title}</Text>
                <Text style={[styles.customAlertMessage, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>{alertConfig.message}</Text>
                
                <View style={styles.customAlertButtons}>
                  {alertConfig.buttons && alertConfig.buttons.length > 0 ? (
                    alertConfig.buttons.map((btn, idx) => (
                      <TouchableOpacity 
                        key={idx} 
                        style={[styles.customAlertBtn, { backgroundColor: theme.primary }]} 
                        onPress={() => {
                          setAlertConfig(prev => ({ ...prev, visible: false }));
                          if(btn.onPress) btn.onPress();
                        }}
                      >
                        <Text style={[styles.customAlertBtnText, { fontFamily: theme.fontFamily }]}>{btn.text}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <TouchableOpacity 
                      style={[styles.customAlertBtn, { backgroundColor: theme.primary }]} 
                      onPress={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
                    >
                      <Text style={[styles.customAlertBtnText, { fontFamily: theme.fontFamily }]}>Compris</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', overflow: 'hidden', width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, paddingTop: Platform.OS === 'ios' ? 60 : 40, width: '100%' },
  backBtn: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  stepBadgeText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 2 },

  formContent: { paddingHorizontal: 30 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 22, marginBottom: 30 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, marginLeft: 4 },
  phoneInputContainer: { height: 56, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 5 },
  countryPicker: { paddingHorizontal: 12, height: '100%', justifyContent: 'center' },
  countryText: { fontSize: 14 },
  divider: { width: 1, height: 24, marginHorizontal: 5 },
  input: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 16, backgroundColor: 'transparent', outlineStyle: 'none' as any },
  
  pinBoxesContainer: { flexDirection: 'row', justifyContent: 'center', gap: 15, position: 'relative' },
  pinBox: { width: 60, height: 65, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  pinBoxText: { fontSize: 24 },
  hiddenPinInput: { position: 'absolute', width: '100%', height: '100%', opacity: 0 },

  fingerprintContainer: { alignItems: 'center', marginVertical: 10 },
  fingerprintBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10 },
  fingerprintText: { fontSize: 13, fontWeight: '500' },

  idOptionsContainer: { gap: 12, marginTop: 10 },
  idOptionBox: { paddingVertical: 22, paddingHorizontal: 20, borderRadius: 24, alignItems: 'center', flexDirection: 'column', width: '100%' },
  idOptionText: { fontSize: 15, fontWeight: '600' },

  diasporaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginTop: 10 },
  diasporaText: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },

  kycInfoBox: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  kycInfoTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  kycInfoDesc: { fontSize: 11, lineHeight: 18 },

  btnPrimary: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 5 },
  btnText: { color: '#000', fontSize: 15, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  switchLink: { marginTop: 20, padding: 10 },
  switchText: { textAlign: 'center', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.2)' },
  modalTitle: { fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  countryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 15, borderBottomWidth: 1 },
  countryFlag: { fontSize: 18, marginRight: 10, textAlign: 'center' },
  countryName: { flex: 1, fontSize: 15 },
  countryDialCode: { fontSize: 15, fontWeight: '600', opacity: 0.8, marginRight: 5 },

  customAlertContainer: { width: '85%', borderRadius: 24, padding: 25, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  customAlertIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  customAlertTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 },
  customAlertMessage: { fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 25 },
  customAlertButtons: { width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 10 },
  customAlertBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  customAlertBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
