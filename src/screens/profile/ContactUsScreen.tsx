import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

const ContactUsScreen = ({ navigation }: any) => {
  const handleCall = () => {
    Linking.openURL('tel:+919632850872');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@dhanvantrifarm.com');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📞</Text>
          <Text style={styles.cardTitle}>Phone</Text>
          <Text style={styles.cardValue}>+91 9632850872</Text>
          <TouchableOpacity style={styles.button} onPress={handleCall}>
            <Text style={styles.buttonText}>Call Now</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>📧</Text>
          <Text style={styles.cardTitle}>Email</Text>
          <Text style={styles.cardValue}>support@dhanvantrifarm.com</Text>
          <TouchableOpacity style={styles.button} onPress={handleEmail}>
            <Text style={styles.buttonText}>Send Email</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardIcon}>📍</Text>
          <Text style={styles.cardTitle}>Address</Text>
          <Text style={styles.cardValue}>
            Dhanvantari Naturals{'\n'}
            Bangalore, Karnataka{'\n'}
            India - 560001
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactUsScreen;

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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardIcon: { fontSize: 48, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 8 },
  cardValue: { fontSize: 15, color: '#000', textAlign: 'center', marginBottom: 16 },
  button: {
    backgroundColor: '#1E88E5',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
