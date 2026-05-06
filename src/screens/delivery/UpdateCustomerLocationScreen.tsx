import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StatusBar,
  ScrollView,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
}

const UpdateCustomerLocationScreen = ({ navigation, route }: any) => {
  const { customer } = route.params as { customer: Customer };

  const [latitude, setLatitude] = useState(customer.latitude || '');
  const [longitude, setLongitude] = useState(customer.longitude || '');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (customer.latitude && customer.longitude) {
      setLocationCaptured(true);
    }
  }, []);

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to update customer coordinates.',
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

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to get current location.');
      return;
    }

    setLocationLoading(true);

    Geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setLocationCaptured(true);
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        Alert.alert('Error', 'Unable to get current location. Please try again or enter manually.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  const handleUpdateLocation = async () => {
    if (!latitude.trim() || !longitude.trim()) {
      Alert.alert('Missing Fields', 'Please enter both latitude and longitude');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      Alert.alert('Invalid Values', 'Please enter valid numeric values for coordinates');
      return;
    }

    if (latNum < -90 || latNum > 90) {
      Alert.alert('Invalid Latitude', 'Latitude must be between -90 and 90');
      return;
    }

    if (lngNum < -180 || lngNum > 180) {
      Alert.alert('Invalid Longitude', 'Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);

    try {
      const response = await api.put(`/api/v1/mobile/delivery/customers/${customer.id}/location`, {
        latitude: latitude.trim(),
        longitude: longitude.trim(),
      });

      const data = await response.json();
      console.log('Update Location Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to update location. Please try again.');
      }
    } catch (err) {
      console.error('Error updating location:', err);
      Alert.alert('Network Error', 'Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Location</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Icon name="account" size={32} color="#fff" />
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerMobile}>{customer.mobile}</Text>
            {customer.address ? (
              <Text style={styles.customerAddress} numberOfLines={2}>
                {customer.address}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.locationSection}>
          <View style={styles.sectionHeader}>
            <Icon name="crosshairs-gps" size={22} color={colors.primary} />
            <Text style={styles.sectionTitle}>Location Coordinates</Text>
          </View>

          {/* Get Current Location Button */}
          <TouchableOpacity
            style={[styles.getLocationBtn, locationLoading && styles.getLocationBtnDisabled]}
            onPress={getCurrentLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.getLocationBtnText}>Getting Location...</Text>
              </>
            ) : (
              <>
                <Icon name="crosshairs-gps" size={22} color="#fff" />
                <Text style={styles.getLocationBtnText}>Get My Current Location</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Location Captured Success */}
          {locationCaptured && !locationLoading && (
            <View style={styles.locationSuccessRow}>
              <Icon name="check-circle" size={20} color={colors.success} />
              <Text style={styles.locationSuccessText}>Location coordinates captured</Text>
              <TouchableOpacity onPress={() => {
                setLatitude('');
                setLongitude('');
                setLocationCaptured(false);
              }}>
                <Icon name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          {/* OR Divider */}
          <View style={styles.orDivider}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR enter manually</Text>
            <View style={styles.orLine} />
          </View>

          {/* Latitude Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Latitude *</Text>
            <View style={styles.inputContainer}>
              <Icon name="latitude" size={20} color={colors.gray500} />
              <TextInput
                style={styles.input}
                value={latitude}
                onChangeText={(text) => {
                  setLatitude(text);
                  setLocationCaptured(false);
                }}
                placeholder="e.g., 12.9716"
                placeholderTextColor={colors.gray400}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.inputHint}>Range: -90 to 90</Text>
          </View>

          {/* Longitude Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Longitude *</Text>
            <View style={styles.inputContainer}>
              <Icon name="longitude" size={20} color={colors.gray500} />
              <TextInput
                style={styles.input}
                value={longitude}
                onChangeText={(text) => {
                  setLongitude(text);
                  setLocationCaptured(false);
                }}
                placeholder="e.g., 77.5946"
                placeholderTextColor={colors.gray400}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.inputHint}>Range: -180 to 180</Text>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Icon name="information-outline" size={20} color={colors.info} />
            <Text style={styles.infoText}>
              Accurate location coordinates help delivery partners find the customer easily.
              Use "Get My Current Location" when you are at the customer's address.
            </Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleUpdateLocation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Icon name="check" size={22} color="#fff" />
              <Text style={styles.submitBtnText}>Update Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            {/* Decorative Background */}
            <View style={styles.modalDecoration}>
              <View style={styles.decoCircle1} />
              <View style={styles.decoCircle2} />
            </View>

            {/* Success Icon */}
            <View style={styles.successIconOuter}>
              <View style={styles.successIconMiddle}>
                <View style={styles.successIconInner}>
                  <Icon name="check-bold" size={40} color="#fff" />
                </View>
              </View>
            </View>

            <Text style={styles.successTitle}>Location Updated!</Text>
            <Text style={styles.successMessage}>
              Customer location has been successfully updated.
            </Text>

            {/* Updated Location Info */}
            <View style={styles.successInfoCard}>
              <View style={styles.successInfoRow}>
                <Icon name="latitude" size={18} color={colors.gray600} />
                <Text style={styles.successInfoLabel}>Latitude:</Text>
                <Text style={styles.successInfoValue}>{latitude}</Text>
              </View>
              <View style={styles.successInfoRow}>
                <Icon name="longitude" size={18} color={colors.gray600} />
                <Text style={styles.successInfoLabel}>Longitude:</Text>
                <Text style={styles.successInfoValue}>{longitude}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.successBtn} onPress={handleSuccessClose}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UpdateCustomerLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },
  headerRight: {
    width: 44,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Customer Card
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  customerMobile: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
    marginTop: 2,
  },
  customerAddress: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    marginTop: 4,
    lineHeight: 18,
  },

  // Location Section
  locationSection: {
    backgroundColor: '#fff',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 10,
  },
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },

  // Get Location Button
  getLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    gap: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getLocationBtnDisabled: {
    opacity: 0.7,
  },
  getLocationBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: '#fff',
  },

  // Location Success
  locationSuccessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    gap: 10,
  },
  locationSuccessText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.success,
  },

  // OR Divider
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray300,
  },
  orText: {
    marginHorizontal: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.gray500,
    fontWeight: fonts.weights.medium,
  },

  // Input
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    fontSize: fonts.sizes.lg,
    color: colors.textPrimary,
  },
  inputHint: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    marginTop: 4,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.md,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: fonts.sizes.sm,
    color: colors.info,
    lineHeight: 20,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    gap: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  decoCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0fdf4',
    top: -80,
    right: -40,
  },
  decoCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    top: -30,
    left: -30,
  },
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
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  successInfoCard: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  successInfoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
  },
  successInfoValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  successBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },
});
