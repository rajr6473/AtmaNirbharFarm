import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/api';
import { useCart } from '../../context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  size?: string;
}

const ProductFrequencyScreen = ({ route, navigation }: any) => {
  const { product } = route.params as { product: Product };
  const { addToCart } = useCart();

  // Frequency states
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');

  // Quantity
  const [quantity, setQuantity] = useState(1);

  // Date states
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 1)));

  // Time slot
  const [deliverySlot, setDeliverySlot] = useState('04:00-07:00 AM');
  const [showTimeSlots, setShowTimeSlots] = useState(false);

  // Address
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pincode, setPincode] = useState('');

  // Loading
  const [loading, setLoading] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(true);

  const timeSlots = [
    '04:00-07:00 AM',
    '07:00-10:00 AM',
    '10:00-01:00 PM',
    '01:00-04:00 PM',
    '04:00-07:00 PM',
  ];

  useEffect(() => {
    loadUserAddress();
  }, []);

  const loadUserAddress = async () => {
    try {
      setLoadingAddress(true);
      const userDataString = await AsyncStorage.getItem('userData');

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const customer = userData.customer || userData.user || userData;

        if (customer.address) {
          const fullAddress = `${customer.address}, ${customer.city}, ${customer.state}`;
          setDeliveryAddress(fullAddress);
          setPincode(customer.pincode || customer.pin_code || '');
        }
      }
    } catch (error) {
      console.error('Error loading address:', error);
    } finally {
      setLoadingAddress(false);
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const formatDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatAPIDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDeliveryTime = (): string => {
    const slot = deliverySlot.split('-')[0].trim();
    const [time, period] = slot.split(' ');
    const [hours, minutes] = time.split(':');

    let hour24 = parseInt(hours);
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }

    return `${String(hour24).padStart(2, '0')}:${minutes}:00`;
  };

  const handleAddToCart = async () => {
    if (!deliveryAddress || !pincode) {
      Alert.alert('Missing Information', 'Please add a delivery address');
      return;
    }

    try {
      setLoading(true);

      const subscriptionData = {
        subscription: {
          product_id: product.id,
          schedule_type: 'subscription',
          frequency: frequency,
          start_date: formatAPIDate(deliveryDate),
          end_date: formatAPIDate(endDate),
          quantity: quantity,
          delivery_time: getDeliveryTime(),
          delivery_address: deliveryAddress,
          pincode: pincode,
          latitude: 19.0760, // Default values - should be from address
          longitude: 72.8777,
          notes: `${frequency} delivery of ${product.name}`,
        },
      };

      console.log('=== Creating Subscription ===');
      console.log('Request Data:', JSON.stringify(subscriptionData, null, 2));

      const response = await api.post('/ecommerce/subscriptions', subscriptionData);
      const data = await response.json();

      console.log('=== Subscription Response ===');
      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        Alert.alert(
          'Subscription Created',
          `Your ${frequency} subscription for ${product.name} has been created successfully!`,
          [
            {
              text: 'View Orders',
              onPress: () => navigation.navigate('Tabs', { screen: 'Orders' }),
            },
            {
              text: 'Continue Shopping',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      Alert.alert('Network Error', 'Unable to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigation.goBack();
  };

  const totalAmount = product.price * quantity;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Frequency</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PRODUCT INFO */}
        <View style={styles.productSection}>
          <Image source={{ uri: product.image }} style={styles.productImage} resizeMode="contain" />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSize}>{product.size || '500 ml'}</Text>
            <Text style={styles.productPrice}>₹{product.price}</Text>
          </View>
        </View>

        {/* FREQUENCY SELECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How often do you want to receive this item?</Text>
          <View style={styles.frequencyButtons}>
            <TouchableOpacity
              style={[styles.frequencyButton, frequency === 'daily' && styles.frequencyButtonActive]}
              onPress={() => setFrequency('daily')}
            >
              <Text style={[styles.frequencyText, frequency === 'daily' && styles.frequencyTextActive]}>
                Daily
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.frequencyButton, frequency === 'custom' && styles.frequencyButtonActive]}
              onPress={() => setFrequency('custom')}
            >
              <Text style={[styles.frequencyText, frequency === 'custom' && styles.frequencyTextActive]}>
                Custom
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.frequencyButton, frequency === 'weekly' && styles.frequencyButtonActive]}
              onPress={() => setFrequency('weekly')}
            >
              <Text style={[styles.frequencyText, frequency === 'weekly' && styles.frequencyTextActive]}>
                On Interval
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* QUANTITY */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControl}>
              <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* DELIVERY DATE */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Select delivery date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(deliveryDate)}</Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={deliveryDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setDeliveryDate(selectedDate);
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {/* DELIVERY SLOT */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Delivery Slot</Text>
            <TouchableOpacity
              style={styles.slotButton}
              onPress={() => setShowTimeSlots(!showTimeSlots)}
            >
              <Text style={styles.slotText}>{deliverySlot}</Text>
            </TouchableOpacity>
          </View>

          {showTimeSlots && (
            <View style={styles.timeSlotsList}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[
                    styles.timeSlotItem,
                    deliverySlot === slot && styles.timeSlotItemActive,
                  ]}
                  onPress={() => {
                    setDeliverySlot(slot);
                    setShowTimeSlots(false);
                  }}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      deliverySlot === slot && styles.timeSlotTextActive,
                    ]}
                  >
                    {slot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* DELIVERY ADDRESS */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle}>Delivery to</Text>
            <TouchableOpacity
              style={styles.addressButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.addressButtonText}>
                {loadingAddress ? 'Loading...' : deliveryAddress ? 'Change Address' : 'Add Address'}
              </Text>
            </TouchableOpacity>
          </View>

          {deliveryAddress && (
            <View style={styles.addressContainer}>
              <Text style={styles.addressText}>{deliveryAddress}</Text>
              <Text style={styles.pincodeText}>Pincode: {pincode}</Text>
            </View>
          )}
        </View>

        {/* TOTAL AMOUNT */}
        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Total amount payable: ₹{totalAmount}</Text>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueShopping}
            disabled={loading}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.cartIcon}>🛒</Text>
                <Text style={styles.addButtonText}>Add to Cart</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductFrequencyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
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
  content: {
    flex: 1,
  },

  // Product Section
  productSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  productSize: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },

  // Section
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Frequency
  frequencyButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  frequencyButtonActive: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  frequencyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  frequencyTextActive: {
    color: '#fff',
  },

  // Quantity
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },

  // Date
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
  calendarIcon: {
    fontSize: 18,
  },

  // Time Slot
  slotButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  slotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
  timeSlotsList: {
    marginTop: 12,
    gap: 8,
  },
  timeSlotItem: {
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotItemActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4285F4',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#666',
  },
  timeSlotTextActive: {
    color: '#4285F4',
    fontWeight: '600',
  },

  // Address
  addressButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addressButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4285F4',
  },
  addressContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  pincodeText: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },

  // Total
  totalSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 8,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },

  // Actions
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  cartIcon: {
    fontSize: 20,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
