import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView, FlatList, TouchableOpacity, Modal, ActivityIndicator, TextInput, ScrollView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { fetchAPI } from '@/config/api';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function FacturesScreen() {
  const { colors: theme, isDark } = useAppTheme();
  const { username } = useAuth();
  const params = useLocalSearchParams();

  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState((params.search as string) || '');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchTransactions = async () => {
    if (!username) return;
    try {
      const res = await fetchAPI(`/transactions/history/${username}`);
      setTransactions(res.transactions || []);
      
      // If a search reference was passed in params, auto-open it!
      if (params.search && res.transactions) {
        const matchingTxn = res.transactions.find((t: any) => 
          t.id?.toString() === params.search || 
          t.reference?.toLowerCase() === (params.search as string).toLowerCase()
        );
        if (matchingTxn) {
          setSelectedTxn(matchingTxn);
          setModalVisible(true);
        }
      }
    } catch (err) {
      console.error("Error fetching transactions on invoices page", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [username]);

  const filteredTxns = transactions.filter((txn) => {
    const term = searchQuery.toLowerCase();
    const otherParty = (txn.other_party || '').toLowerCase();
    const amountStr = (txn.amount || '').toString();
    const idStr = (txn.id || '').toString();
    const memo = (txn.memo || '').toLowerCase();
    const provider = (txn.provider || '').toLowerCase();
    
    return otherParty.includes(term) || amountStr.includes(term) || idStr.includes(term) || memo.includes(term) || provider.includes(term);
  });

  const handleShare = async (txn: any) => {
    try {
      const isTransfer = !!txn.other_party;
      const title = isTransfer ? 'Reçu de Transfert' : 'Reçu de Paiement';
      const typeLabel = isTransfer ? 'Bénéficiaire' : 'Fournisseur';
      const targetName = txn.other_party || txn.provider || 'N/A';
      const amountStr = parseFloat(txn.amount).toLocaleString() + ' FCFA';
      const dateStr = new Date(txn.date).toLocaleString('fr-FR');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
              .logo { font-size: 28px; font-weight: bold; color: #D4AF37; letter-spacing: 2px; }
              .title { font-size: 18px; margin-top: 5px; color: #666; }
              .details { margin-top: 20px; border: 1px solid #eee; border-radius: 10px; padding: 20px; background: #fafafa; }
              .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
              .label { font-weight: bold; color: #555; }
              .value { text-align: right; font-size: 16px; }
              .amount { font-size: 24px; font-weight: bold; color: #EF4444; }
              .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">XAALISI</div>
              <div class="title">${title}</div>
            </div>
            <div class="details">
              <div class="row">
                <span class="label">Référence ID</span>
                <span class="value">${txn.id || 'N/A'}</span>
              </div>
              <div class="row">
                <span class="label">Date</span>
                <span class="value">${dateStr}</span>
              </div>
              <div class="row">
                <span class="label">${typeLabel}</span>
                <span class="value">${targetName}</span>
              </div>
              <div class="row">
                <span class="label">Statut</span>
                <span class="value" style="color: #10B981; font-weight: bold;">RÉUSSI</span>
              </div>
              <div class="row">
                <span class="label">Montant</span>
                <span class="value amount">-${amountStr}</span>
              </div>
            </div>
            <div class="footer">
              Ce document est un reçu numérique généré automatiquement par XAALISI.<br/>
              Merci de votre confiance.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html, base64: false });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger le reçu',
          UTI: 'com.adobe.pdf'
        });
      }
    } catch (error) {
      console.error("Error generating PDF", error);
    }
  };

  const InvoiceModal = () => {
    if (!selectedTxn) return null;
    const isTransfer = !!selectedTxn.other_party;
    const amountVal = parseFloat(selectedTxn.amount);
    const dateFormatted = new Date(selectedTxn.date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInUp.duration(400)} style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.invoiceHeaderTitle, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]}>FACTURE NUMÉRIQUE</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Feather name="x" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Official Invoice Sheet */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.invoiceSheet}>
              {/* Brand Header */}
              <View style={styles.sheetBrandHeader}>
                <Text style={[styles.brandText, { color: theme.primary, fontFamily: theme.fontFamily }]}>XAALISI</Text>
                <Text style={[styles.maliText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>RÉPUBLIQUE DU MALI</Text>
              </View>

              {/* Status Indicator */}
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.statusText, { color: '#10B981', fontFamily: theme.fontFamily }]}>PAIEMENT ACQUITTE</Text>
              </View>

              {/* Amount Display */}
              <View style={styles.sheetAmountBlock}>
                <Text style={[styles.sheetAmount, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                  {amountVal.toLocaleString()} <Text style={{ fontSize: 18, fontWeight: '500' }}>FCFA</Text>
                </Text>
                <Text style={[styles.feeLabel, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]}>Frais: 0 FCFA • T.V.A.: Inclus (0%)</Text>
              </View>

              <View style={[styles.sheetDivider, { borderColor: theme.border }]} />

              {/* Invoice Detail Rows */}
              <View style={styles.invoiceDetailsContainer}>
                <View style={styles.invoiceRow}>
                  <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Date de Facture</Text>
                  <Text style={[styles.invoiceValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{dateFormatted}</Text>
                </View>

                <View style={styles.invoiceRow}>
                  <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Numéro de Référence</Text>
                  <Text style={[styles.invoiceValue, { color: theme.primary, fontFamily: theme.fontFamily, fontWeight: '700' }]}>{selectedTxn.id}</Text>
                </View>

                <View style={styles.invoiceRow}>
                  <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Émetteur (Débiteur)</Text>
                  <Text style={[styles.invoiceValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>+{username}</Text>
                </View>

                <View style={styles.invoiceRow}>
                  <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Bénéficiaire (Créditeur)</Text>
                  <Text style={[styles.invoiceValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>
                    {isTransfer ? `+${selectedTxn.other_party}` : (selectedTxn.provider || 'Service Public').toUpperCase()}
                  </Text>
                </View>

                {selectedTxn.bill_reference && (
                  <View style={styles.invoiceRow}>
                    <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Référence Facture</Text>
                    <Text style={[styles.invoiceValue, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>{selectedTxn.bill_reference}</Text>
                  </View>
                )}

                <View style={styles.invoiceRow}>
                  <Text style={[styles.invoiceLabel, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>Statut de Validation</Text>
                  <Text style={[styles.invoiceValue, { color: '#10B981', fontFamily: theme.fontFamily, fontWeight: '700' }]}>RÉUSSI</Text>
                </View>
              </View>

              <View style={[styles.sheetDivider, { borderColor: theme.border }]} />

              {/* Decorative QR/Barcode for authenticity */}
              <View style={styles.barcodeSection}>
                <View style={[styles.fakeBarcode, { borderColor: theme.inactiveToken }]}>
                  <View style={[styles.barcodeLine, { width: '8%', marginRight: '2%' }]} />
                  <View style={[styles.barcodeLine, { width: '4%', marginRight: '3%' }]} />
                  <View style={[styles.barcodeLine, { width: '12%', marginRight: '1%' }]} />
                  <View style={[styles.barcodeLine, { width: '6%', marginRight: '2%' }]} />
                  <View style={[styles.barcodeLine, { width: '10%', marginRight: '4%' }]} />
                  <View style={[styles.barcodeLine, { width: '3%', marginRight: '1%' }]} />
                  <View style={[styles.barcodeLine, { width: '15%', marginRight: '2%' }]} />
                  <View style={[styles.barcodeLine, { width: '8%', marginRight: '1%' }]} />
                  <View style={[styles.barcodeLine, { width: '5%' }]} />
                </View>
                <Text style={[styles.barcodeText, { color: theme.inactiveToken }]}>XAALISI SECURE DIGITAL SIGNATURE</Text>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.shareBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleShare(selectedTxn)}
              >
                <Feather name="download" size={18} color="#000" style={{ marginRight: 8 }} />
                <Text style={styles.shareBtnText}>Télécharger / Partager</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.printBtn, { borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.printBtnText, { color: theme.textPrimary }]}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderTxnItem = ({ item }: { item: any }) => {
    const isTransfer = !!item.other_party;
    const isPositive = false; // All payments/transfers are outgoing in this view
    const dateStr = new Date(item.date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return (
      <TouchableOpacity 
        style={[styles.txnItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => {
          setSelectedTxn(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.txnLeft}>
          <View style={[styles.txnIconBox, { backgroundColor: theme.primary + '15' }]}>
            <Feather 
              name={isTransfer ? "arrow-up-right" : "file-text"} 
              size={18} 
              color={theme.primary} 
            />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.txnTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
              {isTransfer ? `Envoi vers +${item.other_party}` : `Facture ${item.provider || 'Service'}`}
            </Text>
            <Text style={[styles.txnDate, { color: theme.inactiveToken, fontFamily: theme.fontFamily }]} numberOfLines={1} ellipsizeMode="tail">
              {dateStr} • Réf: #{item.id}
            </Text>
          </View>
        </View>
        <Text style={[styles.txnAmount, { color: '#EF4444', fontFamily: theme.fontFamily }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          -{parseFloat(item.amount).toLocaleString()} FCFA
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}>Factures & Reçus</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={[styles.searchWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="search" size={18} color={theme.inactiveToken} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary, fontFamily: theme.fontFamily }]}
            placeholder="Rechercher (Ex: EDM, Canal...)"
            placeholderTextColor={theme.inactiveToken}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x" size={16} color={theme.inactiveToken} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Transactions List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredTxns}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderTxnItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color={theme.inactiveToken} style={{ marginBottom: 15 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary, fontFamily: theme.fontFamily }]}>
                Aucune facture ou reçu trouvé
              </Text>
            </View>
          }
        />
      )}

      {/* Digital Invoice Detail Modal */}
      <InvoiceModal />
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
    paddingTop: Platform.OS === 'ios' ? 10 : 30,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center' },
  headerTitle: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2 },
  
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  txnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  txnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  txnIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  txnTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  txnDate: {
    fontSize: 11,
  },
  txnAmount: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 0,
    textAlign: 'right',
  },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    height: '85%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  invoiceSheet: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  sheetBrandHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  brandText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  maliText: {
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '600',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 25,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sheetAmountBlock: {
    alignItems: 'center',
    marginBottom: 25,
  },
  sheetAmount: {
    fontSize: 34,
    fontWeight: '800',
  },
  feeLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  sheetDivider: {
    borderWidth: 1,
    borderStyle: 'dashed',
    width: '100%',
    marginVertical: 15,
  },
  invoiceDetailsContainer: {
    gap: 15,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceLabel: {
    fontSize: 13,
  },
  invoiceValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  barcodeSection: {
    alignItems: 'center',
    marginTop: 40,
  },
  fakeBarcode: {
    height: 48,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  barcodeLine: {
    height: '80%',
    backgroundColor: '#000',
  },
  barcodeText: {
    fontSize: 8,
    letterSpacing: 2.5,
    fontWeight: '700',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  shareBtn: {
    flex: 2,
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
  printBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printBtnText: {
    fontWeight: '700',
    fontSize: 14,
  },
});
