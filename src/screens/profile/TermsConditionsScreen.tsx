import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const TermsConditionsScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and Conditions</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.date}>Last updated: January 2025</Text>

        <Text style={styles.heading}>1. Introduction</Text>
        <Text style={styles.text}>
          Welcome to Dhanvantri Farm. By accessing and using our services, you agree to be bound by these terms and conditions.
        </Text>

        <Text style={styles.heading}>2. Use of Service</Text>
        <Text style={styles.text}>
          Our service allows you to order fresh organic products directly from farms. You must be at least 18 years old to use our service.
        </Text>

        <Text style={styles.heading}>3. Orders and Payment</Text>
        <Text style={styles.text}>
          All orders are subject to availability. Payment must be made at the time of order placement. We accept various payment methods including credit/debit cards, UPI, and cash on delivery.
        </Text>

        <Text style={styles.heading}>4. Delivery</Text>
        <Text style={styles.text}>
          We strive to deliver products within the specified time slots. However, delivery times may vary due to unforeseen circumstances.
        </Text>

        <Text style={styles.heading}>5. Returns and Refunds</Text>
        <Text style={styles.text}>
          Products can be returned within 24 hours of delivery if they are not fresh or damaged. Refunds will be processed within 5-7 business days.
        </Text>

        <Text style={styles.heading}>6. Limitation of Liability</Text>
        <Text style={styles.text}>
          Dhanvantri Farm shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our service.
        </Text>
      </ScrollView>
    </View>
  );
};

export default TermsConditionsScreen;

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
  content: { flex: 1, padding: 20 },
  date: { fontSize: 13, color: '#666', marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: '700', color: '#000', marginTop: 16, marginBottom: 8 },
  text: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
});
