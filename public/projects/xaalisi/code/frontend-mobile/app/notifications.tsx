import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const { colors: theme, isDark } = useAppTheme();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const res = await fetchAPI('/notifications/');
      setNotifications(res || []);
    } catch (error) {
      console.error("Erreur de chargement des notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PUT' });
      // Mettre à jour localement
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Impossible de marquer comme lu", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetchAPI('/notifications/read-all', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      Alert.alert("Succès", "Toutes les notifications sont marquées comme lues.");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de marquer tout comme lu.");
    }
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'SECURITY': return <Feather name="shield" size={24} color="#EF4444" />;
      case 'TRANSACTION': return <Feather name="dollar-sign" size={24} color="#FACC15" />;
      case 'SYSTEM': return <Feather name="info" size={24} color="#3B82F6" />;
      default: return <Feather name="bell" size={24} color={theme.textPrimary} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Notifications</Text>
        <TouchableOpacity style={styles.readAllBtn} onPress={markAllAsRead}>
          <Feather name="check-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="bell-slash" size={48} color={theme.inactiveToken} style={{ marginBottom: 20 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>Aucune notification</Text>
            <Text style={[styles.emptyDesc, { color: theme.inactiveToken }]}>Vous êtes à jour !</Text>
          </View>
        ) : (
          notifications.map((notif, index) => (
            <Animated.View 
              key={notif.id} 
              entering={FadeInDown.delay(index * 100).duration(400)}
              style={[
                styles.notifCard, 
                { backgroundColor: theme.surface, borderColor: theme.border },
                !notif.is_read && { borderLeftColor: theme.primary, borderLeftWidth: 4 }
              ]}
            >
              <View style={styles.iconContainer}>
                {getIconForType(notif.type)}
              </View>
              <View style={styles.notifContent}>
                <Text style={[styles.notifTitle, { color: theme.textPrimary }]}>{notif.title}</Text>
                <Text style={[styles.notifText, { color: theme.textSecondary }]}>{notif.message}</Text>
                <Text style={[styles.notifDate, { color: theme.inactiveToken }]}>
                  {new Date(notif.created_at).toLocaleString()}
                </Text>
              </View>
              {!notif.is_read && (
                <TouchableOpacity onPress={() => markAsRead(notif.id)} style={styles.markBtn}>
                  <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                </TouchableOpacity>
              )}
            </Animated.View>
          ))
        )}
      </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  readAllBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'Inter_700Bold' },
  scrollContent: { flexGrow: 1, padding: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 10, fontFamily: 'Inter_700Bold' },
  emptyDesc: { fontSize: 14, textAlign: 'center', fontFamily: 'Inter_400Regular' },
  notifCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 15,
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 4,
  },
  notifText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  notifDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  markBtn: {
    justifyContent: 'center',
    paddingLeft: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  }
});
