import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';

const DeleteAccountScreen = ({ navigation }: any) => {
  const [reason, setReason] = useState('');

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Your account has been scheduled for deletion.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delete My Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.warningCard}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Warning</Text>
          <Text style={styles.warningText}>
            Deleting your account will permanently remove all your data including:
          </Text>
          <Text style={styles.bulletPoint}>• Order history</Text>
          <Text style={styles.bulletPoint}>• Saved addresses</Text>
          <Text style={styles.bulletPoint}>• Wallet balance</Text>
          <Text style={styles.bulletPoint}>• Referral rewards</Text>
        </View>

        <View style={styles.reasonCard}>
          <Text style={styles.label}>Why are you leaving? (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Help us improve by sharing your reason"
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete My Account</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Your account will be deleted within 30 days. You can cancel this request by contacting support within this period.
        </Text>
      </ScrollView>
    </View>
  );
};

export default DeleteAccountScreen;

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
  warningCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  warningIcon: { fontSize: 48, marginBottom: 12 },
  warningTitle: { fontSize: 18, fontWeight: '700', color: '#E65100', marginBottom: 12 },
  warningText: { fontSize: 14, color: '#444', marginBottom: 12, textAlign: 'center' },
  bulletPoint: { fontSize: 14, color: '#444', marginVertical: 4, alignSelf: 'flex-start' },
  reasonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  deleteButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  note: { fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18 },
});
