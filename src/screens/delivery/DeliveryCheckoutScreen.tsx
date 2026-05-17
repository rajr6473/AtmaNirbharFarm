import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDeliveryCart } from '../../context/DeliveryCartContext';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface Customer {
  id: number;
  name: string;
}

const DeliveryCheckoutScreen = ({ navigation }: any) => {
  const { cart, totalAmount, clearCart, cartItemCount } = useDeliveryCart();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields based on API body
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Customer dropdown
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [customerSearchText, setCustomerSearchText] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  // Load customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search
  useEffect(() => {
    if (customerSearchText.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const searchTerm = customerSearchText.toLowerCase();
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm) ||
          c.id.toString().includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [customerSearchText, customers]);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await api.get('/api/v1/mobile/delivery/my_customers');
      const data = await response.json();

      console.log('Customers Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        let customersList: Customer[] = [];
        // Handle the response structure from my_customers API
        if (data.data?.customers && Array.isArray(data.data.customers)) {
          customersList = data.data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
          }));
        } else if (Array.isArray(data.data)) {
          customersList = data.data.map((c: any) => ({
            id: c.id,
            name: c.name,
          }));
        } else if (data.customers) {
          customersList = data.customers.map((c: any) => ({
            id: c.id,
            name: c.name,
          }));
        }
        setCustomers(customersList);
        setFilteredCustomers(customersList);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerId(customer.id);
    setShowCustomerPicker(false);
    setCustomerSearchText('');
  };

  const validateForm = (): boolean => {
    if (!customerId) {
      Alert.alert('Required', 'Please select a customer');
      return false;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Required', 'Please enter delivery address');
      return false;
    }

    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return false;
    }

    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Format items for API
      const items = cart.map((item: any) => ({
        product_id: item.id,
        quantity: item.qty,
      }));

      // Only pass customer_id (not the full customer object)
      const bookingData = {
        customer_id: customerId,
        delivery_address: deliveryAddress.trim(),
        notes: notes.trim() || undefined,
        items: items,
      };

      console.log('=== Delivery Booking Request ===');
      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));

      const response = await api.post('/api/v1/mobile/delivery/bookings', bookingData);
      const data = await response.json();

      console.log('=== Delivery Booking Response ===');
      console.log('Status:', response.status);
      console.log('Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Show success modal
        setModalType('success');
        setShowModal(true);

        // Clear cart and redirect after 3 seconds
        setTimeout(() => {
          clearCart();
          setShowModal(false);
          navigation.navigate('DeliveryHome');
        }, 3000);
      } else {
        // Show error modal
        setModalType('error');
        setErrorMessage(data.message || 'Unable to create booking. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      // Show error modal
      setModalType('error');
      setErrorMessage('Unable to connect to server. Please check your internet connection and try again.');
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    if (modalType === 'success') {
      clearCart();
      navigation.navigate('DeliveryHome');
    }
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={[
        styles.customerItem,
        selectedCustomer?.id === item.id && styles.customerItemSelected,
      ]}
      onPress={() => selectCustomer(item)}
      activeOpacity={0.7}
    >
      <View style={styles.customerItemLeft}>
        <View style={[
          styles.customerAvatar,
          selectedCustomer?.id === item.id && styles.customerAvatarSelected,
        ]}>
          <Icon
            name="account"
            size={24}
            color={selectedCustomer?.id === item.id ? '#fff' : '#7C3AED'}
          />
        </View>
        <View style={styles.customerInfo}>
          <Text style={[
            styles.customerName,
            selectedCustomer?.id === item.id && styles.customerNameSelected,
          ]}>
            {item.name}
          </Text>
          <Text style={styles.customerIdText}>ID: {item.id}</Text>
        </View>
      </View>
      {selectedCustomer?.id === item.id && (
        <Icon name="check-circle" size={24} color="#7C3AED" />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CUSTOMER SELECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="account" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.sectionTitle}>Select Customer</Text>
          </View>

          <Text style={styles.label}>
            Customer <Text style={styles.required}>*</Text>
          </Text>

          {/* Customer Dropdown Button */}
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              selectedCustomer && styles.dropdownButtonSelected,
            ]}
            onPress={() => setShowCustomerPicker(true)}
            disabled={loading || loadingCustomers}
          >
            {loadingCustomers ? (
              <View style={styles.dropdownLoading}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.dropdownLoadingText}>Loading customers...</Text>
              </View>
            ) : selectedCustomer ? (
              <View style={styles.dropdownSelected}>
                <View style={styles.dropdownSelectedAvatar}>
                  <Icon name="account-check" size={20} color="#16a34a" />
                </View>
                <View style={styles.dropdownSelectedInfo}>
                  <Text style={styles.dropdownSelectedName}>{selectedCustomer.name}</Text>
                  <Text style={styles.dropdownSelectedId}>Customer ID: {selectedCustomer.id}</Text>
                </View>
                <Icon name="chevron-down" size={24} color="#6b7280" />
              </View>
            ) : (
              <View style={styles.dropdownPlaceholder}>
                <Icon name="account-search" size={22} color="#9ca3af" />
                <Text style={styles.dropdownPlaceholderText}>Select a customer</Text>
                <Icon name="chevron-down" size={24} color="#9ca3af" />
              </View>
            )}
          </TouchableOpacity>

          {/* Selected Customer Card */}
          {selectedCustomer && (
            <View style={styles.selectedCustomerCard}>
              <Icon name="check-circle" size={18} color="#16a34a" />
              <Text style={styles.selectedCustomerText}>
                Order will be created for <Text style={styles.selectedCustomerBold}>{selectedCustomer.name}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="map-marker" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
          </View>

          <Text style={styles.label}>
            Full Address <Text style={styles.required}>*</Text>
          </Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter complete delivery address with landmark"
              placeholderTextColor="#9ca3af"
              value={deliveryAddress}
              onChangeText={setDeliveryAddress}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>

        {/* NOTES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="note-text" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.sectionTitle}>Delivery Notes</Text>
          </View>

          <Text style={styles.label}>Notes (Optional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g., Ring bell twice, Leave at door..."
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="receipt" size={22} color="#7C3AED" />
            </View>
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryCard}>
            {cart.map((item: any) => {
              const itemKey = item.variantId ? `${item.id}-${item.variantId}` : `${item.id}`;
              return (
                <View key={itemKey} style={styles.summaryItem}>
                  <View style={styles.summaryItemLeft}>
                    <View style={styles.summaryItemNameContainer}>
                      <Text style={styles.summaryItemName} numberOfLines={1}>{item.name}</Text>
                      {item.variantLabel && (
                        <Text style={styles.summaryItemVariant}>{item.variantLabel}</Text>
                      )}
                    </View>
                    <Text style={styles.summaryItemQty}>x{item.qty}</Text>
                  </View>
                  <Text style={styles.summaryItemPrice}>₹{item.price * item.qty}</Text>
                </View>
              );
            })}

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cartItemCount})</Text>
              <Text style={styles.summaryValue}>₹{totalAmount}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValueFree}>FREE</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTotalLabel}>Total Amount</Text>
              <Text style={styles.summaryTotalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* PLACE ORDER BUTTON */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotalLabel}>Total Payable</Text>
          <Text style={styles.footerTotalValue}>₹{totalAmount}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeButton, loading && styles.placeButtonDisabled]}
          onPress={placeOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.placeButtonText}>Create Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* CUSTOMER PICKER MODAL */}
      <Modal
        visible={showCustomerPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomerPicker(false)}
      >
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            {/* Picker Header */}
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Customer</Text>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => {
                  setShowCustomerPicker(false);
                  setCustomerSearchText('');
                }}
              >
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.pickerSearchContainer}>
              <View style={styles.pickerSearchBar}>
                <Icon name="magnify" size={22} color="#9ca3af" />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search by name or ID..."
                  placeholderTextColor="#9ca3af"
                  value={customerSearchText}
                  onChangeText={setCustomerSearchText}
                  autoFocus
                />
                {customerSearchText.length > 0 && (
                  <TouchableOpacity onPress={() => setCustomerSearchText('')}>
                    <Icon name="close-circle" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Customer Count */}
            <View style={styles.customerCountContainer}>
              <Text style={styles.customerCountText}>
                {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
              </Text>
            </View>

            {/* Customer List */}
            {loadingCustomers ? (
              <View style={styles.pickerLoading}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.pickerLoadingText}>Loading customers...</Text>
              </View>
            ) : filteredCustomers.length === 0 ? (
              <View style={styles.pickerEmpty}>
                <Icon name="account-search" size={50} color="#9ca3af" />
                <Text style={styles.pickerEmptyTitle}>No customers found</Text>
                <Text style={styles.pickerEmptyText}>
                  {customerSearchText
                    ? `No results for "${customerSearchText}"`
                    : 'No customers available'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredCustomers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderCustomerItem}
                contentContainerStyle={styles.customerList}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.customerSeparator} />}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* SUCCESS/ERROR MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Decorative Background */}
            <View style={styles.modalDecoration}>
              {modalType === 'success' ? (
                <>
                  <View style={[styles.decoCircle1, { backgroundColor: '#f0fdf4' }]} />
                  <View style={[styles.decoCircle2, { backgroundColor: '#dcfce7' }]} />
                </>
              ) : (
                <>
                  <View style={[styles.decoCircle1, { backgroundColor: '#fef2f2' }]} />
                  <View style={[styles.decoCircle2, { backgroundColor: '#fee2e2' }]} />
                </>
              )}
            </View>

            {modalType === 'success' ? (
              <>
                <View style={styles.successIconOuter}>
                  <View style={styles.successIconMiddle}>
                    <View style={styles.successIconInner}>
                      <Icon name="check-bold" size={40} color="#fff" />
                    </View>
                  </View>
                </View>

                <Text style={styles.successTitle}>Booking Created!</Text>
                <Text style={styles.successMessage}>
                  The order has been successfully created.{'\n'}
                  Customer will be notified shortly.
                </Text>

                <View style={styles.successDetails}>
                  <View style={styles.successDetailRow}>
                    <Icon name="package-variant" size={20} color="#16a34a" />
                    <Text style={styles.successDetailText}>
                      {cartItemCount} item{cartItemCount > 1 ? 's' : ''} ordered
                    </Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Icon name="cash" size={20} color="#16a34a" />
                    <Text style={styles.successDetailText}>
                      Total: ₹{totalAmount}
                    </Text>
                  </View>
                  {selectedCustomer && (
                    <View style={styles.successDetailRow}>
                      <Icon name="account" size={20} color="#16a34a" />
                      <Text style={styles.successDetailText}>
                        Customer: {selectedCustomer.name}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#16a34a" size="small" />
                  <Text style={styles.redirectText}>Redirecting to home...</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.errorIconOuter}>
                  <View style={styles.errorIconMiddle}>
                    <View style={styles.errorIconInner}>
                      <Icon name="close-thick" size={40} color="#fff" />
                    </View>
                  </View>
                </View>

                <Text style={styles.errorTitle}>Booking Failed</Text>
                <Text style={styles.errorMessage}>{errorMessage}</Text>

                <TouchableOpacity style={styles.retryButton} onPress={handleModalClose}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default DeliveryCheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // HEADER
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 50,
    paddingBottom: spacing.base,
    backgroundColor: '#7C3AED',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },

  // CONTENT
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },

  // FORM INPUTS
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginTop: 4,
    marginBottom: 10,
  },
  required: {
    color: '#dc2626',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#111',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // DROPDOWN BUTTON
  dropdownButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 14,
  },
  dropdownButtonSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#FAF5FF',
  },
  dropdownLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownLoadingText: {
    fontSize: 15,
    color: '#6b7280',
  },
  dropdownPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownPlaceholderText: {
    flex: 1,
    fontSize: 15,
    color: '#9ca3af',
  },
  dropdownSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownSelectedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownSelectedInfo: {
    flex: 1,
  },
  dropdownSelectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  dropdownSelectedId: {
    fontSize: 13,
    color: '#7C3AED',
    marginTop: 2,
  },

  // Selected Customer Card
  selectedCustomerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    gap: 10,
  },
  selectedCustomerText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
  },
  selectedCustomerBold: {
    fontWeight: '700',
  },

  // ORDER SUMMARY
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryItemNameContainer: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 14,
    color: '#374151',
  },
  summaryItemVariant: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  summaryItemQty: {
    fontSize: 13,
    color: '#6b7280',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  summaryValueFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  summaryTotalValue: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: '#7C3AED',
  },

  // FOOTER
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerTotalLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 2,
  },
  footerTotalValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: borderRadius.base,
    gap: 8,
    elevation: 3,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  placeButtonDisabled: {
    opacity: 0.6,
  },
  placeButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.bold,
    fontSize: fonts.sizes.lg,
  },

  // PICKER MODAL
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  pickerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  pickerSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pickerSearchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: '#111',
  },
  customerCountContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  customerCountText: {
    fontSize: 13,
    color: '#6b7280',
  },
  customerList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
  },
  customerItemSelected: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#7C3AED',
  },
  customerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerAvatarSelected: {
    backgroundColor: '#7C3AED',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  customerNameSelected: {
    color: '#7C3AED',
  },
  customerIdText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  customerSeparator: {
    height: 8,
  },
  pickerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  pickerLoadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  pickerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  pickerEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  pickerEmptyText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },

  // SUCCESS/ERROR MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing['2xl'],
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  modalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 150,
  },
  decoCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -100,
    right: -50,
  },
  decoCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    left: -40,
  },

  // SUCCESS STYLES
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  successIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: '#16a34a',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successDetailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  redirectText: {
    fontSize: 13,
    color: '#9ca3af',
  },

  // ERROR STYLES
  errorIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  errorIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
