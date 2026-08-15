import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { fetchAPI } from '@/config/api';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function HistoryScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!username) return;
      try {
        const res = await fetchAPI(`/transactions/history/${username}`);
        setTransactions(res.transactions || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [username]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : theme.surface }]} onPress={() => { if(router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }}>
          <Feather name="chevron-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Historique des Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 40 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={[styles.emptyStateText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
              Aucune transaction récente
            </Text>
          </View>
        ) : (
          transactions.map((txn, index) => {
            const isPositive = txn.transaction_type === 'DEPOSIT' || (txn.transaction_type === 'TRANSFER' && txn.receiver_id === username);
            const amountColor = isPositive ? '#10B981' : theme.textPrimary;
            const sign = isPositive ? '+' : '-';
            
            let iconName: any = 'refresh-cw';
            if (txn.transaction_type === 'DEPOSIT') iconName = 'arrow-down-left';
            else if (txn.transaction_type === 'WITHDRAWAL') iconName = 'arrow-up-right';
            else if (txn.transaction_type === 'TRANSFER' && isPositive) iconName = 'arrow-down-left';
            else if (txn.transaction_type === 'PAYMENT') iconName = 'file-text';

            return (
              <Animated.View key={txn.transaction_id || index.toString()} entering={FadeInDown.duration(400).delay(index * 50)}>
                <View style={[styles.txnItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={[styles.txnIconBox, { backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : theme.primary + '15' }]}>
                    <Feather name={iconName} size={20} color={isPositive ? '#10B981' : theme.primary} />
                  </View>
                  <View style={styles.txnDetails}>
                    <Text style={[styles.txnTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
                      {txn.transaction_type === 'TRANSFER' ? (isPositive ? `De ${txn.sender_id}` : `Vers ${txn.receiver_id}`) : txn.transaction_type}
                    </Text>
                    <Text style={[styles.txnDate, { color: theme.textSecondary, fontFamily: theme.fontFamily }]} numberOfLines={1}>
                      {new Date(txn.timestamp).toLocaleDateString()} • {new Date(txn.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </Text>
                  </View>
                  <Text style={[styles.txnAmount, { color: amountColor, fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                    {sign}{txn.amount.toLocaleString()} FCFA
                  </Text>
                </View>
              </Animated.View>
            );
          })
        )}
      </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 16,
  },
  txnItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  txnIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnDetails: {
    flex: 1,
    marginRight: 8,
  },
  txnTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txnDate: {
    fontSize: 12,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 0,
    textAlign: 'right',
  },
});
