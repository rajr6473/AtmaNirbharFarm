import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const TransactionsScreen = ({ navigation }: any) => {
  const transactions = [
    { id: 1, date: '12 Jan 2025', type: 'Payment', amount: 250, status: 'Success' },
    { id: 2, date: '10 Jan 2025', type: 'Refund', amount: -50, status: 'Success' },
    { id: 3, date: '8 Jan 2025', type: 'Payment', amount: 420, status: 'Success' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {transactions.map((txn) => (
          <View key={txn.id} style={styles.txnCard}>
            <View style={styles.txnLeft}>
              <Text style={styles.txnType}>{txn.type}</Text>
              <Text style={styles.txnDate}>{txn.date}</Text>
            </View>
            <View style={styles.txnRight}>
              <Text style={[styles.txnAmount, txn.amount < 0 ? styles.refund : styles.payment]}>
                {txn.amount > 0 ? '+' : ''}₹{Math.abs(txn.amount)}
              </Text>
              <Text style={styles.txnStatus}>{txn.status}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backIcon: { fontSize: 24, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  content: { flex: 1, padding: 16 },
  txnCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  txnLeft: {},
  txnType: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  txnDate: { fontSize: 13, color: '#666' },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  payment: { color: '#4CAF50' },
  refund: { color: '#F44336' },
  txnStatus: { fontSize: 12, color: '#666' },
});
