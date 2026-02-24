import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const MonthlyBillScreen = ({ navigation }: any) => {
  const bills = [
    { month: 'January 2025', amount: 2450, paid: true },
    { month: 'December 2024', amount: 1890, paid: true },
    { month: 'November 2024', amount: 2120, paid: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Monthly Bill</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {bills.map((bill, index) => (
          <View key={index} style={styles.billCard}>
            <View>
              <Text style={styles.month}>{bill.month}</Text>
              <Text style={styles.amount}>₹{bill.amount}</Text>
            </View>
            <View style={[styles.badge, bill.paid ? styles.paidBadge : styles.unpaidBadge]}>
              <Text style={styles.badgeText}>{bill.paid ? 'Paid' : 'Pending'}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default MonthlyBillScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#1A3C34',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backIcon: { fontSize: 24, color: '#fff' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  content: { flex: 1, padding: 16 },
  billCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  month: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  amount: { fontSize: 20, fontWeight: '700', color: '#1A3C34' },
  badge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  paidBadge: { backgroundColor: '#E8F5E9' },
  unpaidBadge: { backgroundColor: '#FFEBEE' },
  badgeText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
});
