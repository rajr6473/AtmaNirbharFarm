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
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { useCart } from '../../context/CartContext';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const CheckoutScreen = ({ navigation }: any) => {
  const { cart, totalAmount, clearCart, cartItemCount } = useCart() as any;
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');

  // Location fields
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);

  // Customer ID from login
  const [customerId, setCustomerId] = useState<number | null>(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      let customerIdValue: number | null = null;

      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data loaded:', user);

        // Pre-fill form with user data
        if (user.username) setCustomerName(user.username);
        if (user.email) setCustomerEmail(user.email);
        if (user.mobile) setCustomerPhone(user.mobile);
        if (user.address) setDeliveryAddress(user.address);
        if (user.pincode) setPincode(user.pincode);
        if (user.latitude) setLatitude(String(user.latitude));
        if (user.longitude) setLongitude(String(user.longitude));
        if (user.customer_id) customerIdValue = user.customer_id;
      }

      // Also try to get customer_id directly from AsyncStorage as fallback
      if (!customerIdValue) {
        const storedCustomerId = await AsyncStorage.getItem('customerId');
        if (storedCustomerId) {
          customerIdValue = parseInt(storedCustomerId, 10);
        }
      }

      if (customerIdValue) {
        console.log('Customer ID loaded:', customerIdValue);
        setCustomerId(customerIdValue);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  // Request location permission (Android)
  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for delivery.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Get current location
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required. Please enter coordinates manually below.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLocationLoading(true);

    // Set a timeout to handle slow location responses
    const locationTimeout = setTimeout(() => {
      setLocationLoading(false);
      Alert.alert(
        'Location Timeout',
        'Unable to get location automatically. Please enter coordinates manually below or try again.',
        [
          { text: 'OK' },
          { text: 'Try Again', onPress: getCurrentLocation },
        ]
      );
    }, 15000);

    Geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(locationTimeout);
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setLocationLoading(false);
      },
      (error) => {
        clearTimeout(locationTimeout);
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        Alert.alert(
          'Location Error',
          'Unable to get your location automatically. Please enter coordinates manually below.',
          [{ text: 'OK' }]
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const validateForm = (): boolean => {
    if (!customerName.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return false;
    }

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      Alert.alert('Required', 'Please enter a valid email');
      return false;
    }

    if (!customerPhone.trim() || customerPhone.length !== 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit phone number');
      return false;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Required', 'Please enter delivery address');
      return false;
    }

    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Required', 'Please enter a valid 6-digit pincode');
      return false;
    }

    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Required', 'Please get your location or enter coordinates manually');
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

      const bookingData = {
        booking: {
          customer_id: customerId,
          customer_name: customerName.trim(),
          customer_email: customerEmail.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: deliveryAddress.trim(),
          pincode: pincode.trim(),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          payment_method: paymentMethod,
          notes: notes.trim() || undefined,
          booking_items_attributes: bookingItems,
        },
      };

      console.log('=== Booking Request ===');
      console.log('Customer ID:', customerId);
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
          navigation.getParent()?.navigate('Home');
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
      navigation.getParent()?.navigate('Home');
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
          <Icon name="arrow-left" size={24} color="#fff" />
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
          <View style={styles.sectionHeader}>
            <Icon name="account" size={22} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>Customer Details</Text>
          </View>

          <Text style={styles.label}>
            Full Name <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="account-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor="#9ca3af"
              value={customerName}
              onChangeText={setCustomerName}
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="email-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#9ca3af"
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>
            Phone Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="phone-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#9ca3af"
              value={customerPhone}
              onChangeText={setCustomerPhone}
              keyboardType="phone-pad"
              maxLength={10}
              editable={!loading}
            />
          </View>
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="map-marker" size={22} color={colors.primaryLight} />
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

          <Text style={styles.label}>
            Pincode <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWrapper}>
            <Icon name="map-marker-radius-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor="#9ca3af"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              maxLength={6}
              editable={!loading}
            />
          </View>

          {/* LOCATION SECTION */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Icon name="crosshairs-gps" size={20} color={colors.primaryLight} />
              <Text style={styles.locationTitle}>Location Coordinates <Text style={styles.required}>*</Text></Text>
            </View>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading || loading}
            >
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.locationButtonText}>Getting Location...</Text>
                </>
              ) : (
                <>
                  <Icon name="crosshairs-gps" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>Get My Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {latitude && longitude ? (
              <View style={styles.locationSuccess}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.locationSuccessText}>
                  Location captured successfully
                </Text>
                <TouchableOpacity onPress={() => { setLatitude(''); setLongitude(''); }}>
                  <Icon name="close-circle" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ) : null}

            <Text style={styles.orText}>— OR enter manually —</Text>

            {/* Latitude and Longitude Fields */}
            <View style={styles.coordRow}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>
                  Latitude <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="latitude" size={18} color="#9ca3af" />
                  <TextInput
                    style={styles.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="e.g., 19.0760"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>
                  Longitude <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="longitude" size={18} color="#9ca3af" />
                  <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="e.g., 72.8777"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    editable={!loading}
                  />
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Delivery Notes (Optional)</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special instructions for delivery"
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

        {/* PAYMENT METHOD */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="wallet" size={22} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('cod')}
            disabled={loading}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.radioButton, paymentMethod === 'cod' ? styles.radioButtonSelected : null]}>
                {paymentMethod === 'cod' ? (
                  <View style={styles.radioButtonInner} />
                ) : null}
              </View>
              <View style={styles.paymentIconContainer}>
                <Icon name="cash" size={24} color={paymentMethod === 'cod' ? colors.primaryLight : colors.textMuted} />
              </View>
              <View>
                <Text style={[styles.paymentText, paymentMethod === 'cod' && styles.paymentTextSelected]}>
                  Cash on Delivery
                </Text>
                <Text style={styles.paymentSubtext}>Pay when you receive</Text>
              </View>
            </View>
            {paymentMethod === 'cod' ? (
              <Icon name="check-circle" size={22} color={colors.primaryLight} />
            ) : null}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'online' && styles.paymentOptionSelected]}
            onPress={() => setPaymentMethod('online')}
            disabled={loading}
          >
            <View style={styles.paymentOptionLeft}>
              <View style={[styles.radioButton, paymentMethod === 'online' && styles.radioButtonSelected]}>
                {paymentMethod === 'online' ? (
                  <View style={styles.radioButtonInner} />
                ) : null}
              </View>
              <View style={styles.paymentIconContainer}>
                <Icon name="credit-card" size={24} color={paymentMethod === 'online' ? colors.primaryLight : colors.textMuted} />
              </View>
              <View>
                <Text style={[styles.paymentText, paymentMethod === 'online' && styles.paymentTextSelected]}>
                  Online Payment
                </Text>
                <Text style={styles.paymentSubtext}>UPI / Card / Netbanking</Text>
              </View>
            </View>
            {paymentMethod === 'online' ? (
              <Icon name="check-circle" size={22} color={colors.primaryLight} />
            ) : null}
          </TouchableOpacity>
        </View>

        {/* ORDER SUMMARY */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="receipt" size={22} color={colors.primaryLight} />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <View style={styles.summaryCard}>
            {cart.map((item: any) => (
              <View key={item.id} style={styles.summaryItem}>
                <View style={styles.summaryItemLeft}>
                  <Text style={styles.summaryItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.summaryItemQty}>x{item.qty}</Text>
                </View>
                <Text style={styles.summaryItemPrice}>₹{item.price * item.qty}</Text>
              </View>
            ))}

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

        <View style={{ height: 120 }} />
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
              <Text style={styles.placeButtonText}>Place Order</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* SUCCESS/ERROR MODAL */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalType === 'success' ? (
              <>
                <View style={styles.successIconContainer}>
                  <View style={styles.successCircle}>
                    <Icon name="check" size={50} color="#2E7D32" />
                  </View>
                </View>

                <Text style={styles.successTitle}>Order Placed!</Text>
                <Text style={styles.successMessage}>
                  Thank you for your order.{'\n'}
                  You will receive a confirmation shortly.
                </Text>

                <View style={styles.successDetails}>
                  <View style={styles.successDetailRow}>
                    <Icon name="package-variant" size={20} color="#2E7D32" />
                    <Text style={styles.successDetailText}>
                      {cartItemCount} item{cartItemCount > 1 ? 's' : ''} ordered
                    </Text>
                  </View>
                  <View style={styles.successDetailRow}>
                    <Icon name="cash" size={20} color="#2E7D32" />
                    <Text style={styles.successDetailText}>
                      ₹{totalAmount} - {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </Text>
                  </View>
                </View>

                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="#2E7D32" size="small" />
                  <Text style={styles.redirectText}>Redirecting to home...</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.errorIconContainer}>
                  <View style={styles.errorCircle}>
                    <Icon name="close" size={50} color="#dc2626" />
                  </View>
                </View>

                <Text style={styles.errorTitle}>Order Failed</Text>
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

export default CheckoutScreen;

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
    backgroundColor: colors.primary,
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
    marginTop: 12,
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
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
    borderRadius: 10,
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
    minHeight: 60,
    textAlignVertical: 'top',
  },

  // LOCATION
  locationSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  locationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#166534',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 14,
    borderRadius: borderRadius.md,
    gap: 10,
  },
  locationButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
  },
  locationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    gap: 8,
  },
  locationSuccessText: {
    flex: 1,
    fontSize: 13,
    color: '#16a34a',
    fontWeight: '500',
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 13,
    marginVertical: 16,
  },
  coordRow: {
    flexDirection: 'row',
    gap: 12,
  },
  coordField: {
    flex: 1,
  },
  coordLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  // PAYMENT
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentOptionSelected: {
    backgroundColor: colors.successLight,
    borderColor: colors.primaryLight,
  },
  paymentOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: colors.primaryLight,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
  },
  paymentText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  paymentTextSelected: {
    color: colors.primaryLight,
  },
  paymentSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },

  // ORDER SUMMARY
  summaryCard: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 10,
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
  summaryItemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
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
    color: colors.primaryLight,
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: borderRadius.base,
    gap: 8,
    elevation: 3,
    shadowColor: colors.primaryLight,
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

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: colors.shadow,
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
    backgroundColor: colors.successLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.primaryLight,
  },
  successTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.primaryLight,
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
  errorIconContainer: {
    marginBottom: 24,
  },
  errorCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#dc2626',
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
