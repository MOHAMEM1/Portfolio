import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AppAlertProps {
  visible: boolean;
  type?: AlertType;
  title: string;
  message: string;
  buttons?: AlertButton[];
  onDismiss: () => void;
}

const ALERT_CONFIG: Record<AlertType, { icon: string; color: string; bgColor: string }> = {
  success: { icon: 'check-circle', color: '#22C55E', bgColor: 'rgba(34, 197, 94, 0.12)' },
  error: { icon: 'alert-circle', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.12)' },
  warning: { icon: 'alert-triangle', color: '#D4AF37', bgColor: 'rgba(212, 175, 55, 0.12)' },
  info: { icon: 'info', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.12)' },
};

export default function AppAlert({ visible, type = 'info', title, message, buttons, onDismiss }: AppAlertProps) {
  const config = ALERT_CONFIG[type];
  const alertButtons = buttons && buttons.length > 0 ? buttons : [{ text: 'OK', onPress: onDismiss }];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss}>
      <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} activeOpacity={1} onPress={onDismiss} />
        <Animated.View entering={ZoomIn.duration(250).springify()} style={styles.container}>
          {/* Gold accent line at top */}
          <View style={[styles.accentBar, { backgroundColor: config.color }]} />

          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
            <Feather name={config.icon as any} size={32} color={config.color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            {alertButtons.map((btn, index) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              const isPrimary = !isDestructive && !isCancel;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    isPrimary && { backgroundColor: '#D4AF37' },
                    isDestructive && { backgroundColor: '#EF4444' },
                    isCancel && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
                    alertButtons.length === 1 && { flex: 1 },
                  ]}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    else onDismiss();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.buttonText,
                    isPrimary && { color: '#000000' },
                    isDestructive && { color: '#FFFFFF' },
                    isCancel && { color: 'rgba(255,255,255,0.7)' },
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  container: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
    letterSpacing: 0.3,
  },
  message: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 24,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
