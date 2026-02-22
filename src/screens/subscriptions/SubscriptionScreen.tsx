import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/api';

interface SubscriptionScreenProps {
  navigation: any;
  route: {
    params: {
      productId: number;
      productName?: string;
      productImage?: string;
    };
  };
}

const SubscriptionScreen: React.FC<SubscriptionScreenProps> = ({ navigation, route }) => {
  const { productId, productName } = route.params;

  // Form state
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [deliveryTime, setDeliveryTime] = useState('morning');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [notes, setNotes] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user address on mount
  useEffect(() => {
    loadUserData();
    setDefaultDates();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.address) {
          setDeliveryAddress(userData.address);
        }
        if (userData.pincode) {
          setPincode(userData.pincode);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const setDefaultDates = () => {
    const today = new Date();
    const startDateStr = today.toISOString().split('T')[0];

    const endDateObj = new Date(today);
    endDateObj.setMonth(endDateObj.getMonth() + 1);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    setStartDate(startDateStr);
    setEndDate(endDateStr);
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Daily', icon: 'calendar-today' },
    { value: 'weekly', label: 'Weekly', icon: 'calendar-week' },
    { value: 'monthly', label: 'Monthly', icon: 'calendar-month' },
  ];

  const deliveryTimeOptions = [
    { value: 'morning', label: 'Morning (6 AM - 9 AM)', icon: 'weather-sunny' },
    { value: 'afternoon', label: 'Afternoon (12 PM - 3 PM)', icon: 'white-balance-sunny' },
    { value: 'evening', label: 'Evening (5 PM - 8 PM)', icon: 'weather-sunset' },
  ];

  const validateForm = (): boolean => {
    if (!startDate.trim()) {
      Alert.alert('Required', 'Please enter a start date');
      return false;
    }

    if (!endDate.trim()) {
      Alert.alert('Required', 'Please enter an end date');
      return false;
    }

    if (!quantity.trim() || parseInt(quantity) < 1) {
      Alert.alert('Required', 'Please enter a valid quantity (minimum 1)');
      return false;
    }

    if (!deliveryAddress.trim()) {
      Alert.alert('Required', 'Please enter a delivery address');
      return false;
    }

    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Required', 'Please enter a valid 6-digit pincode');
      return false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      Alert.alert('Invalid Format', 'Start date must be in YYYY-MM-DD format');
      return false;
    }

    if (!dateRegex.test(endDate)) {
      Alert.alert('Invalid Format', 'End date must be in YYYY-MM-DD format');
      return false;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      Alert.alert('Invalid Date', 'End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubscribe = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const subscriptionData = {
        subscription: {
          product_id: productId,
          schedule_type: 'subscription',
          quantity: parseInt(quantity),
          frequency: frequency,
          start_date: startDate,
          end_date: endDate,
          delivery_time: deliveryTime,
          delivery_address: deliveryAddress,
          pincode: pincode,
          ...(notes.trim() && { notes: notes.trim() }),
        },
      };

      console.log('Creating subscription:', JSON.stringify(subscriptionData, null, 2));

      const response = await api.post('/ecommerce/subscriptions', subscriptionData);
      const data = await response.json();

      console.log('Subscription response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setSuccessMessage('Your subscription has been created successfully! You will receive regular deliveries as per your schedule.');
        setShowSuccessModal(true);
      } else {
        Alert.alert(
          'Subscription Failed',
          data.message || 'Failed to create subscription. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert(
        'Network Error',
        'Unable to create subscription. Please check your internet connection.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const incrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    setQuantity((currentQty + 1).toString());
  };

  const decrementQuantity = () => {
    const currentQty = parseInt(quantity) || 0;
    if (currentQty > 1) {
      setQuantity((currentQty - 1).toString());
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Subscription</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Product Info */}
        {productName ? (
          <View style={styles.productCard}>
            <View style={styles.productIconContainer}>
              <Icon name="package-variant" size={28} color="#2E7D32" />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productLabel}>Subscribing to</Text>
              <Text style={styles.productName}>{productName}</Text>
            </View>
          </View>
        ) : null}

        {/* Frequency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="repeat" size={18} color="#2E7D32" /> Delivery Frequency
          </Text>
          <View style={styles.frequencyContainer}>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyButton,
                  frequency === option.value && styles.frequencyButtonActive,
                ]}
                onPress={() => setFrequency(option.value as any)}
              >
                <Icon
                  name={option.icon}
                  size={24}
                  color={frequency === option.value ? '#2E7D32' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.frequencyLabel,
                    frequency === option.value && styles.frequencyLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="numeric" size={18} color="#2E7D32" /> Quantity per Delivery
          </Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
              <Icon name="minus" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.quantityDisplay}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
              <Icon name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="calendar-range" size={18} color="#2E7D32" /> Subscription Period
          </Text>

          <View style={styles.dateRow}>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={styles.dateInput}>
              <Text style={styles.inputLabel}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </View>

        {/* Delivery Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="clock-outline" size={18} color="#2E7D32" /> Preferred Delivery Time
          </Text>
          <View style={styles.timeOptionsContainer}>
            {deliveryTimeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  deliveryTime === option.value && styles.timeOptionActive,
                ]}
                onPress={() => setDeliveryTime(option.value)}
              >
                <Icon
                  name={option.icon}
                  size={20}
                  color={deliveryTime === option.value ? '#2E7D32' : '#9ca3af'}
                />
                <Text
                  style={[
                    styles.timeOptionLabel,
                    deliveryTime === option.value && styles.timeOptionLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
                {deliveryTime === option.value && (
                  <Icon name="check-circle" size={20} color="#2E7D32" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="map-marker" size={18} color="#2E7D32" /> Delivery Address
          </Text>

          <Text style={styles.inputLabel}>Full Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter complete delivery address"
            placeholderTextColor="#9ca3af"
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.inputLabel}>Pincode *</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit pincode"
            placeholderTextColor="#9ca3af"
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Icon name="note-text" size={18} color="#2E7D32" /> Additional Notes (Optional)
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any special instructions for delivery..."
            placeholderTextColor="#9ca3af"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Subscribe Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.subscribeButton, loading && styles.subscribeButtonDisabled]}
          onPress={handleSubscribe}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Icon name="calendar-check" size={22} color="#fff" />
              <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.successIconContainer}>
              <Icon name="check-circle" size={60} color="#2E7D32" />
            </View>
            <Text style={styles.modalTitle}>Subscription Created!</Text>
            <Text style={styles.modalMessage}>{successMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleSuccessClose}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#2E7D32',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Product Card
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  productIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  productInfo: {
    flex: 1,
  },
  productLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },

  // Frequency
  frequencyContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  frequencyButtonActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  frequencyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  frequencyLabelActive: {
    color: '#2E7D32',
  },

  // Quantity
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  quantityButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 30,
    paddingVertical: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
  },

  // Input
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },

  // Time Options
  timeOptionsContainer: {
    gap: 10,
  },
  timeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  timeOptionActive: {
    borderColor: '#2E7D32',
    backgroundColor: '#E8F5E9',
  },
  timeOptionLabel: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  timeOptionLabelActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  subscribeButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  subscribeButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
