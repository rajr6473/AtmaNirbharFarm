import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';

const DeliveryPreferencesScreen = ({ navigation }: any) => {
  const [morningSlot, setMorningSlot] = useState(true);
  const [eveningSlot, setEveningSlot] = useState(false);
  const [contactless, setContactless] = useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivery Preferences</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Preferred Time Slots</Text>

        <View style={styles.prefCard}>
          <View>
            <Text style={styles.prefTitle}>Morning Delivery</Text>
            <Text style={styles.prefSubtitle}>4:00 AM - 7:00 AM</Text>
          </View>
          <Switch value={morningSlot} onValueChange={setMorningSlot} />
        </View>

        <View style={styles.prefCard}>
          <View>
            <Text style={styles.prefTitle}>Evening Delivery</Text>
            <Text style={styles.prefSubtitle}>5:00 PM - 8:00 PM</Text>
          </View>
          <Switch value={eveningSlot} onValueChange={setEveningSlot} />
        </View>

        <Text style={styles.sectionTitle}>Delivery Options</Text>

        <View style={styles.prefCard}>
          <View>
            <Text style={styles.prefTitle}>Contactless Delivery</Text>
            <Text style={styles.prefSubtitle}>Leave at doorstep</Text>
          </View>
          <Switch value={contactless} onValueChange={setContactless} />
        </View>
      </ScrollView>
    </View>
  );
};

export default DeliveryPreferencesScreen;

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
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#666', marginBottom: 12, marginTop: 8 },
  prefCard: {
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
  prefTitle: { fontSize: 16, fontWeight: '600', color: '#000', marginBottom: 4 },
  prefSubtitle: { fontSize: 13, color: '#666' },
});
