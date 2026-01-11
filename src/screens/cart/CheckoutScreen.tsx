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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';

const CheckoutScreen = ({ navigation }: any) => {
  const { cart, totalAmount, clearCart } = useCart() as any;
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error'>('success');
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'online'>('cash_on_delivery');

  // Load user data from AsyncStorage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data loaded:', user);

        // Pre-fill form with user data
        if (user.username) setCustomerName(user.username);
        if (user.email) setCustomerEmail(user.email);
        if (user.mobile) setCustomerPhone(user.mobile);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return false;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return false;
    }

    if (!customerPhone.trim() || customerPhone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return false;
    }

    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
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
      // Format cart items for API
      const bookingItems = cart.map((item: any) => ({
        product_id: item.id,
        quantity: item.qty,
        price: parseFloat(item.price.toString()),
      }));

      // For now, using default coordinates (can be enhanced with geocoding API)
      const defaultLatitude = 19.0760;
      const defaultLongitude = 72.8777;

      const bookingData = {
        booking: {
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          pincode: pincode.trim(),
          latitude: defaultLatitude,
          longitude: defaultLongitude,
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
          booking_items_attributes: bookingItems,
        },
      };

      console.log('=== Booking Request ===');
      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));

      const response = await api.post('/ecommerce/bookings', bookingData);
      const data = await response.json();

      console.log('=== Booking Response ===');
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
          navigation.navigate('Tabs', {
            screen: 'Home',
          });
        }, 3000);
      } else {
        // Show error modal
        setModalType('error');
        setErrorMessage(data.message || 'Unable to place order. Please try again.');
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error placing order:', error);
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
      navigation.navigate('Tabs', {
        screen: 'Home',
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* CUSTOMER DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#999"
            value={customerName}
            onChangeText={setCustomerName}
            editable={!loading}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor="#999"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
            maxLength={10}
            editable={!loading}
          />
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>

          <Text style={styles.label}>Full Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter complete delivery address"
            placeholderTextColor="#999"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />

          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit pincode"
            placeholderTextColor="#999"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />

          <Text style={styles.label}>Delivery Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions for delivery"
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setPaymentMethod('cash_on_delivery')}
            disabled={loading}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'cash_on_delivery' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={styles.radioText}>Cash on Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setPaymentMethod('online')}
            disabled={loading}
          >
            <View style={styles.radioButton}>
              {paymentMethod === 'online' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
            <Text style={styles.radioText}>Online Payment</Text>
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items ({cart.length})</Text>
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

        <View style={{ height: 100 }} />
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
            <Text style={styles.placeButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SUCCESS/ERROR MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'success' ? (
              <>
                {/* Success Animation Container */}
                <View style={styles.successIconContainer}>
                  <View style={styles.successCircle}>
                    <Text style={styles.successIcon}>✓</Text>
                  </View>
                </View>

                <Text style={styles.successTitle}>Order Placed Successfully!</Text>
                <Text style={styles.successMessage}>
                  Thank you for your order.{'\n'}
                  You will receive a confirmation shortly.
                </Text>

                <View style={styles.successDetails}>
                  <View style={styles.successDetailRow}>
                    <Text style={styles.successDetailIcon}>📦</Text>
                    <Text style={styles.successDetailText}>
                      {cart.length} item{cart.length > 1 ? 's' : ''} ordered
                    </Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Text style={styles.successDetailIcon}>💰</Text>
                    <Text style={styles.successDetailText}>
                      ₹{totalAmount} - {paymentMethod === 'cash_on_delivery' ? 'COD' : 'Online'}
                    </Text>
                  </View>
                </View>

                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#4CAF50" size="small" />
                  <Text style={styles.redirectText}>Redirecting to home...</Text>
                </View>
              </>
            ) : (
              <>
                {/* Error Animation Container */}
                <View style={styles.errorIconContainer}>
                  <View style={styles.errorCircle}>
                    <Text style={styles.errorIcon}>✕</Text>
                  </View>
                </View>

                <Text style={styles.errorTitle}>Order Failed</Text>
                <Text style={styles.errorMessage}>
                  {errorMessage}
                </Text>

                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleModalClose}
                >
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

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // HEADER
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
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },

  // CONTENT
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },

  // FORM INPUTS
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#000',
  },
  textArea: {
    minHeight: 80,
  },

  // PAYMENT METHOD
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4285F4',
  },
  radioText: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },

  // ORDER SUMMARY
  summaryCard: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  summaryValueFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },

  // FOOTER
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerTotalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  placeButton: {
    backgroundColor: '#4285F4',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },
  placeButtonDisabled: {
    opacity: 0.6,
  },
  placeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },

  // SUCCESS STYLES
  successIconContainer: {
    marginBottom: 24,
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  successIcon: {
    fontSize: 56,
    color: '#4CAF50',
    fontWeight: '700',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successDetails: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  successDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  successDetailIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  successDetailText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  redirectText: {
    fontSize: 13,
    color: '#999',
  },

  // ERROR STYLES
  errorIconContainer: {
    marginBottom: 24,
  },
  errorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#F44336',
  },
  errorIcon: {
    fontSize: 56,
    color: '#F44336',
    fontWeight: '700',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
