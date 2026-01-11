import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';

const AddressRequestsScreen = ({ navigation }: any) => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'Flat: 1st. A cross road, 1, 1, 305, vidyanagar, girinagr, 1st A cross, near balaji bliss apprtment, 560085',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Work',
      address: 'Office 205, Tech Park, Electronic City Phase 1, Bangalore, 560100',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    flatNo: '',
    street: '',
    area: '',
    city: '',
    pincode: '',
    landmark: '',
  });

  const handleAddAddress = () => {
    if (!newAddress.flatNo || !newAddress.street || !newAddress.city || !newAddress.pincode) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const fullAddress = `${newAddress.flatNo}, ${newAddress.street}, ${newAddress.area}, ${newAddress.landmark ? newAddress.landmark + ', ' : ''}${newAddress.city}, ${newAddress.pincode}`;

    const newAddr = {
      id: addresses.length + 1,
      type: newAddress.type,
      address: fullAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddr]);
    setShowAddModal(false);
    setNewAddress({
      type: 'Home',
      flatNo: '',
      street: '',
      area: '',
      city: '',
      pincode: '',
      landmark: '',
    });
    Alert.alert('Success', 'Address added successfully!');
  };

  const handleDeleteAddress = (id: number) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setAddresses(addresses.filter(addr => addr.id !== id));
          },
        },
      ]
    );
  };

  const handleSetDefault = (id: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {addresses.map((addr) => (
          <View key={addr.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressType}>{addr.type}</Text>
              {addr.isDefault && <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>}
            </View>
            <Text style={styles.addressText}>{addr.address}</Text>
            <View style={styles.actions}>
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)}>
                  <Text style={styles.actionText}>Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleDeleteAddress(addr.id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add New Address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ADD ADDRESS MODAL */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowAddModal(false)}
          />

          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Address</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
              {/* Address Type Selection */}
              <Text style={styles.label}>Address Type</Text>
              <View style={styles.typeButtons}>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.type === 'Home' && styles.typeButtonActive]}
                  onPress={() => setNewAddress({ ...newAddress, type: 'Home' })}
                >
                  <Text style={[styles.typeButtonText, newAddress.type === 'Home' && styles.typeButtonTextActive]}>
                    Home
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.type === 'Work' && styles.typeButtonActive]}
                  onPress={() => setNewAddress({ ...newAddress, type: 'Work' })}
                >
                  <Text style={[styles.typeButtonText, newAddress.type === 'Work' && styles.typeButtonTextActive]}>
                    Work
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, newAddress.type === 'Other' && styles.typeButtonActive]}
                  onPress={() => setNewAddress({ ...newAddress, type: 'Other' })}
                >
                  <Text style={[styles.typeButtonText, newAddress.type === 'Other' && styles.typeButtonTextActive]}>
                    Other
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Flat / House No. *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter flat/house number"
                value={newAddress.flatNo}
                onChangeText={(text) => setNewAddress({ ...newAddress, flatNo: text })}
              />

              <Text style={styles.label}>Street / Road *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter street name"
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              />

              <Text style={styles.label}>Area / Locality</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter area"
                value={newAddress.area}
                onChangeText={(text) => setNewAddress({ ...newAddress, area: text })}
              />

              <Text style={styles.label}>Landmark (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter nearby landmark"
                value={newAddress.landmark}
                onChangeText={(text) => setNewAddress({ ...newAddress, landmark: text })}
              />

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>City *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="City"
                    value={newAddress.city}
                    onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                  />
                </View>

                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Pincode *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pincode"
                    value={newAddress.pincode}
                    onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                <Text style={styles.saveButtonText}>Save Address</Text>
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddressRequestsScreen;

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
  addressCard: {
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
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  addressType: { fontSize: 16, fontWeight: '700', color: '#000' },
  defaultBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  defaultText: { fontSize: 11, fontWeight: '600', color: '#4CAF50' },
  addressText: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 16 },
  actionText: { fontSize: 14, fontWeight: '600', color: '#1E88E5' },
  deleteText: { fontSize: 14, fontWeight: '600', color: '#F44336' },
  addButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1E88E5',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: { fontSize: 15, fontWeight: '600', color: '#1E88E5' },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  closeButton: {
    fontSize: 24,
    color: '#666',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#1E88E5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
