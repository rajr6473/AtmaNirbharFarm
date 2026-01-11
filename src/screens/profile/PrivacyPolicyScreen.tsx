import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const PrivacyPolicyScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.date}>Last updated: January 2025</Text>

        <Text style={styles.heading}>1. Information We Collect</Text>
        <Text style={styles.text}>
          We collect personal information including name, email, phone number, and delivery address when you create an account or place an order.
        </Text>

        <Text style={styles.heading}>2. How We Use Your Information</Text>
        <Text style={styles.text}>
          We use your information to process orders, improve our services, send notifications about your orders, and communicate promotional offers.
        </Text>

        <Text style={styles.heading}>3. Data Security</Text>
        <Text style={styles.text}>
          We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
        </Text>

        <Text style={styles.heading}>4. Sharing of Information</Text>
        <Text style={styles.text}>
          We do not sell or rent your personal information to third parties. We may share information with delivery partners solely for order fulfillment.
        </Text>

        <Text style={styles.heading}>5. Cookies</Text>
        <Text style={styles.text}>
          We use cookies to enhance your experience. You can choose to disable cookies in your browser settings.
        </Text>

        <Text style={styles.heading}>6. Your Rights</Text>
        <Text style={styles.text}>
          You have the right to access, update, or delete your personal information. Contact us at support@dhanvantrifarm.com for any privacy-related requests.
        </Text>

        <Text style={styles.heading}>7. Changes to This Policy</Text>
        <Text style={styles.text}>
          We may update this privacy policy from time to time. We will notify you of any significant changes.
        </Text>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicyScreen;

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
