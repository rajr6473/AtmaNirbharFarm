import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../utils/api';
import { colors } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
  unit?: string;
}

interface SubscribeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  product: Product;
  onSuccess?: () => void;
  navigation?: any;
}

type FrequencyType = 'daily' | 'weekly' | 'monthly';
type DeliveryTimeType = 'morning' | 'afternoon' | 'evening';

const SubscribeBottomSheet: React.FC<SubscribeBottomSheetProps> = ({
  visible,
  onClose,
  product,
  onSuccess,
  navigation,
}) => {
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [quantity, setQuantity] = useState(1);
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTimeType>('morning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Delivery check states
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryChecked, setDeliveryChecked] = useState(false);
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);

  useEffect(() => {
    if (visible) {
      const today = new Date();
      setStartDate(today.toISOString().split('T')[0]);
      const end = new Date(today);
      end.setMonth(end.getMonth() + 1);
      setEndDate(end.toISOString().split('T')[0]);
      loadUserAddress();
      setShowSuccess(false);
      setError('');
    }
  }, [visible]);

  const loadUserAddress = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.address) setDeliveryAddress(user.address);
        if (user.pincode) setPincode(user.pincode);
        if (user.latitude) setLatitude(String(user.latitude));
        if (user.longitude) setLongitude(String(user.longitude));
      }
    } catch (err) {
      console.error('Error loading address:', err);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required.');
      return;
    }
    setLocationLoading(true);
    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setLocationLoading(false);
      },
      () => {
        setLocationLoading(false);
        Alert.alert('Error', 'Unable to get location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // Reset delivery check when pincode changes
  const handlePincodeChange = (value: string) => {
    setPincode(value);
    setDeliveryChecked(false);
    setIsDeliverable(false);
    setDeliveryMessage('');
    setEstimatedDays(null);
  };

  // Check delivery availability
  const checkDelivery = async () => {
    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Invalid Pincode', 'Please enter a valid 6-digit pincode');
      return;
    }

    setCheckingDelivery(true);

    try {
      const response = await api.post('/api/v1/mobile/ecommerce/check_delivery', {
        pincode: pincode.trim(),
      });
      const data = await response.json();

      setDeliveryChecked(true);

      if (response.ok && data.success) {
        setIsDeliverable(data.data.deliverable);
        setDeliveryMessage(data.data.message || '');
        setEstimatedDays(data.data.estimated_days);
      } else {
        setIsDeliverable(false);
        setDeliveryMessage(data.message || 'Unable to check delivery availability');
      }
    } catch (err) {
      setDeliveryChecked(true);
      setIsDeliverable(false);
      setDeliveryMessage('Network error. Please try again.');
    } finally {
      setCheckingDelivery(false);
    }
  };

  const handleSubscribe = async () => {
    setError('');
    if (!startDate || !endDate) {
      setError('Please enter start and end dates');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date');
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Please enter delivery address');
      return;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      setError('Please enter a valid 6-digit pincode');
      return;
    }
    if (!deliveryChecked) {
      setError('Please check delivery availability for your pincode');
      return;
    }
    if (!isDeliverable) {
      setError('Delivery is not available in your area');
      return;
    }

    try {
      setLoading(true);
      const subscriptionData: any = {
        subscription: {
          product_id: product.id.toString(),
          frequency,
          start_date: startDate,
          end_date: endDate,
          quantity,
          delivery_time: deliveryTime,
          delivery_address: deliveryAddress,
          pincode,
        },
      };
      if (latitude.trim()) subscriptionData.subscription.latitude = latitude;
      if (longitude.trim()) subscriptionData.subscription.longitude = longitude;
      if (notes.trim()) subscriptionData.subscription.notes = notes.trim();

      const response = await api.post('/api/v1/mobile/ecommerce/subscriptions', subscriptionData);
      const data = await response.json();

      if (response.ok && data.success) {
        setShowSuccess(true);
        onSuccess?.();
      } else {
        setError(data.message || 'Failed to create subscription');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    setError('');
    setFrequency('daily');
    setQuantity(1);
    setDeliveryTime('morning');
    setNotes('');
    setDeliveryChecked(false);
    setIsDeliverable(false);
    onClose();
  };

  const handleSuccessClose = () => {
    handleClose();
    // Navigate to My Subscriptions screen
    if (navigation) {
      navigation.navigate('Profile', { screen: 'MySubscriptions' });
    }
  };

  if (!visible) return null;

  // Success Screen
  if (showSuccess) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.successSheet}>
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <Icon name="check-bold" size={50} color="#fff" />
              </View>
            </View>
            <Text style={styles.successTitle}>Subscription Created!</Text>
            <Text style={styles.successMessage}>
              Your {frequency} subscription for {product.name} is active.
            </Text>
            <View style={styles.successSummary}>
              <Text style={styles.summaryItem}>Frequency: {frequency}</Text>
              <Text style={styles.summaryItem}>Quantity: {quantity}</Text>
              <Text style={styles.summaryItem}>Period: {startDate} to {endDate}</Text>
              <Text style={styles.summaryItem}>Time: {deliveryTime}</Text>
            </View>
            <TouchableOpacity style={styles.doneButton} onPress={handleSuccessClose}>
              <Text style={styles.doneButtonText}>View My Subscriptions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.productIcon}>
              <Icon name="calendar-check" size={22} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.subscribeLabel}>Subscribe to</Text>
              <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
            <Icon name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Frequency */}
          <Text style={styles.sectionTitle}>Delivery Frequency</Text>
          <View style={styles.frequencyRow}>
            {(['daily', 'weekly', 'monthly'] as FrequencyType[]).map((freq) => {
              const isActive = frequency === freq;
              const config = {
                daily: { icon: 'calendar-today', color: '#10B981', bg: '#D1FAE5', label: 'Daily', desc: 'Every day' },
                weekly: { icon: 'calendar-week', color: '#3B82F6', bg: '#DBEAFE', label: 'Weekly', desc: 'Once a week' },
                monthly: { icon: 'calendar-month', color: '#8B5CF6', bg: '#EDE9FE', label: 'Monthly', desc: 'Once a month' },
              }[freq];
              return (
                <TouchableOpacity
                  key={freq}
                  style={[styles.freqCard, isActive && { borderColor: config.color, backgroundColor: '#FAFAFF' }]}
                  onPress={() => setFrequency(freq)}
                >
                  <View style={[styles.freqIcon, { backgroundColor: config.bg }]}>
                    <Icon name={config.icon} size={24} color={config.color} />
                  </View>
                  <Text style={[styles.freqLabel, isActive && { color: config.color }]}>{config.label}</Text>
                  <Text style={styles.freqDesc}>{config.desc}</Text>
                  {isActive && (
                    <View style={[styles.checkMark, { backgroundColor: config.color }]}>
                      <Icon name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity */}
          <Text style={styles.sectionTitle}>Quantity per delivery</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Icon name="minus" size={22} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.qtyDisplay}>
              <Text style={styles.qtyValue}>{quantity}</Text>
              {product.unit && <Text style={styles.qtyUnit}>{product.unit}</Text>}
            </View>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
              <Icon name="plus" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Date Range */}
          <Text style={styles.sectionTitle}>Subscription Period</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Delivery Time */}
          <Text style={styles.sectionTitle}>Delivery Time</Text>
          <View style={styles.timeRow}>
            {(['morning', 'afternoon', 'evening'] as DeliveryTimeType[]).map((time) => {
              const isActive = deliveryTime === time;
              const config = {
                morning: { icon: 'weather-sunny', color: '#F59E0B', label: 'Morning', desc: '6-9 AM' },
                afternoon: { icon: 'white-balance-sunny', color: '#EF4444', label: 'Afternoon', desc: '12-3 PM' },
                evening: { icon: 'weather-sunset', color: '#6366F1', label: 'Evening', desc: '5-8 PM' },
              }[time];
              return (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeCard, isActive && styles.timeCardActive]}
                  onPress={() => setDeliveryTime(time)}
                >
                  <Icon name={config.icon} size={20} color={isActive ? config.color : '#999'} />
                  <Text style={[styles.timeLabel, isActive && { color: config.color }]}>{config.label}</Text>
                  <Text style={styles.timeDesc}>{config.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Address */}
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            placeholder="Enter complete delivery address"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={handlePincodeChange}
            placeholder="6-digit pincode"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={6}
          />

          {/* Check Delivery Section */}
          <View style={styles.deliveryCheckSection}>
            <TouchableOpacity
              style={[
                styles.checkDeliveryButton,
                checkingDelivery && styles.checkDeliveryButtonDisabled,
                deliveryChecked && isDeliverable && styles.checkDeliveryButtonSuccess,
              ]}
              onPress={checkDelivery}
              disabled={checkingDelivery || loading}
            >
              {checkingDelivery ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.checkDeliveryButtonText}>Checking...</Text>
                </>
              ) : deliveryChecked && isDeliverable ? (
                <>
                  <Icon name="check-circle" size={20} color="#fff" />
                  <Text style={styles.checkDeliveryButtonText}>Delivery Available</Text>
                </>
              ) : (
                <>
                  <Icon name="truck-check-outline" size={20} color="#fff" />
                  <Text style={styles.checkDeliveryButtonText}>Check Delivery Availability</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Delivery Check Result */}
            {deliveryChecked && (
              <View style={[
                styles.deliveryResultCard,
                isDeliverable ? styles.deliveryResultSuccess : styles.deliveryResultError,
              ]}>
                <View style={styles.deliveryResultHeader}>
                  <View style={[
                    styles.deliveryResultIconContainer,
                    isDeliverable ? styles.deliveryResultIconSuccess : styles.deliveryResultIconError,
                  ]}>
                    <Icon
                      name={isDeliverable ? 'truck-check' : 'truck-remove'}
                      size={24}
                      color={isDeliverable ? '#16a34a' : '#dc2626'}
                    />
                  </View>
                  <View style={styles.deliveryResultTextContainer}>
                    <Text style={[
                      styles.deliveryResultTitle,
                      isDeliverable ? styles.deliveryResultTitleSuccess : styles.deliveryResultTitleError,
                    ]}>
                      {isDeliverable ? 'Delivery Available!' : 'Not Deliverable'}
                    </Text>
                    <Text style={styles.deliveryResultMessage}>{deliveryMessage}</Text>
                  </View>
                </View>

                {isDeliverable && estimatedDays && (
                  <View style={styles.deliveryDetailsRow}>
                    <View style={styles.deliveryDetailItem}>
                      <Icon name="calendar-clock" size={18} color="#6b7280" />
                      <Text style={styles.deliveryDetailText}>
                        {estimatedDays} {estimatedDays === 1 ? 'day' : 'days'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Location (Optional) */}
          <View style={styles.locationSection}>
            <View style={styles.locationHeader}>
              <Icon name="crosshairs-gps" size={18} color={colors.primary} />
              <Text style={styles.locationTitle}>Location Coordinates (Optional)</Text>
            </View>

            <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation} disabled={locationLoading}>
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.locationBtnText}>Getting Location...</Text>
                </>
              ) : (
                <>
                  <Icon name="crosshairs-gps" size={18} color="#fff" />
                  <Text style={styles.locationBtnText}>Get My Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {latitude && longitude ? (
              <View style={styles.locationSuccess}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.locationSuccessText}>Location captured successfully</Text>
                <TouchableOpacity onPress={() => { setLatitude(''); setLongitude(''); }}>
                  <Icon name="close-circle" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ) : null}

            <Text style={styles.orText}>— OR enter manually —</Text>

            <View style={styles.coordRow}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <View style={styles.coordInput}>
                  <Icon name="latitude" size={16} color="#999" />
                  <TextInput
                    style={styles.coordTextInput}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="e.g., 12.9716"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <View style={styles.coordInput}>
                  <Icon name="longitude" size={16} color="#999" />
                  <TextInput
                    style={styles.coordTextInput}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="e.g., 77.5946"
                    placeholderTextColor="#999"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Notes */}
          <Text style={styles.label}>Special Instructions (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any delivery instructions..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={2}
          />

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Icon name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Per delivery</Text>
            <Text style={styles.priceValue}>₹{product.price * quantity}</Text>
          </View>
          <TouchableOpacity
            style={[styles.subscribeBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubscribe}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Icon name="calendar-check" size={20} color="#fff" />
                <Text style={styles.subscribeBtnText}>Subscribe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default SubscribeBottomSheet;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  productIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subscribeLabel: {
    fontSize: 12,
    color: '#666',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    maxWidth: 220,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    marginTop: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginTop: 12,
    marginBottom: 6,
  },

  // Frequency
  frequencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  freqCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  freqIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  freqLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  freqDesc: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },
  checkMark: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quantity
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    gap: 24,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  qtyDisplay: {
    alignItems: 'center',
    minWidth: 60,
  },
  qtyValue: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
  },
  qtyUnit: {
    fontSize: 12,
    color: '#666',
  },

  // Date
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    fontSize: 14,
    color: '#111',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },

  // Time
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  timeCard: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeCardActive: {
    backgroundColor: '#F3E8FF',
    borderColor: colors.primary,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  timeDesc: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
  },

  // Delivery Check
  deliveryCheckSection: {
    marginTop: 12,
  },
  checkDeliveryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  checkDeliveryButtonDisabled: {
    opacity: 0.7,
  },
  checkDeliveryButtonSuccess: {
    backgroundColor: '#16a34a',
  },
  checkDeliveryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  deliveryResultCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  deliveryResultSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  deliveryResultError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  deliveryResultHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  deliveryResultIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  deliveryResultIconSuccess: {
    backgroundColor: '#dcfce7',
  },
  deliveryResultIconError: {
    backgroundColor: '#fee2e2',
  },
  deliveryResultTextContainer: {
    flex: 1,
  },
  deliveryResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  deliveryResultTitleSuccess: {
    color: '#16a34a',
  },
  deliveryResultTitleError: {
    color: '#dc2626',
  },
  deliveryResultMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  deliveryDetailsRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#bbf7d0',
    gap: 20,
  },
  deliveryDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryDetailText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Location
  locationSection: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 10,
  },
  locationBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginVertical: 14,
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
  coordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  coordTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#111',
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#dc2626',
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
  },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    gap: 8,
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Success
  successSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 30,
    alignItems: 'center',
  },
  successIconOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111',
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  successSummary: {
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  summaryItem: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  doneButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 12,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
