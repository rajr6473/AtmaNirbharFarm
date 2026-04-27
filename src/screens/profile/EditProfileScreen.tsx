import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Modal,
  PermissionsAndroid,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../../utils/api';
import { colors } from '../../theme';

const { width } = Dimensions.get('window');

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: 'gender-male' },
  { value: 'female', label: 'Female', icon: 'gender-female' },
  { value: 'other', label: 'Other', icon: 'gender-non-binary' },
];

const EditProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Form fields matching API
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  // Date picker state
  const [tempDay, setTempDay] = useState('');
  const [tempMonth, setTempMonth] = useState('');
  const [tempYear, setTempYear] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Try API first
      try {
        const response = await api.get('/api/v1/mobile/ecommerce/profile');
        if (response.ok) {
          const data = await response.json();
          console.log('Profile API Response:', JSON.stringify(data, null, 2));

          if (data.success) {
            const customer = data.data?.customer || data.data?.user || data.data;
            populateFormFields(customer);
            return;
          }
        }
      } catch (apiError) {
        console.log('API fetch failed, using AsyncStorage:', apiError);
      }

      // Fallback to AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        const customer = userData.customer || userData.user || userData;
        populateFormFields(customer);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const populateFormFields = (customer: any) => {
    setFirstName(customer.first_name || customer.firstName || '');
    setLastName(customer.last_name || customer.lastName || '');
    setMobile(customer.mobile || customer.phone || '');
    setAddress(customer.address || '');
    setPincode(customer.pincode || '');
    setGender(customer.gender || '');
    setWhatsappNumber(customer.whatsapp_number || customer.whatsappNumber || '');
    setLatitude(customer.latitude?.toString() || '');
    setLongitude(customer.longitude?.toString() || '');

    if (customer.birth_date || customer.birthDate) {
      const dateStr = customer.birth_date || customer.birthDate;
      setBirthDate(new Date(dateStr));
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'We need access to your location for delivery purposes.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
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

    const timeout = setTimeout(() => {
      setLocationLoading(false);
      Alert.alert('Timeout', 'Unable to get location. Please try again.');
    }, 15000);

    Geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeout);
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setLocationLoading(false);
        Alert.alert('Success', 'Location captured successfully!');
      },
      (error) => {
        clearTimeout(timeout);
        setLocationLoading(false);
        Alert.alert('Error', 'Unable to get your location.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const openDatePicker = () => {
    if (birthDate) {
      setTempDay(birthDate.getDate().toString());
      setTempMonth((birthDate.getMonth() + 1).toString());
      setTempYear(birthDate.getFullYear().toString());
    } else {
      setTempDay('');
      setTempMonth('');
      setTempYear('');
    }
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    const day = parseInt(tempDay, 10);
    const month = parseInt(tempMonth, 10);
    const year = parseInt(tempYear, 10);

    if (!tempDay || !tempMonth || !tempYear) {
      Alert.alert('Error', 'Please fill all date fields');
      return;
    }

    if (day < 1 || day > 31) {
      Alert.alert('Error', 'Please enter a valid day (1-31)');
      return;
    }

    if (month < 1 || month > 12) {
      Alert.alert('Error', 'Please enter a valid month (1-12)');
      return;
    }

    if (year < 1920 || year > new Date().getFullYear()) {
      Alert.alert('Error', `Please enter a valid year (1920-${new Date().getFullYear()})`);
      return;
    }

    const date = new Date(year, month - 1, day);
    if (date > new Date()) {
      Alert.alert('Error', 'Birth date cannot be in the future');
      return;
    }

    setBirthDate(date);
    setShowDatePicker(false);
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Required', 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Required', 'Please enter your last name');
      return false;
    }
    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Required', 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (whatsappNumber && whatsappNumber.length !== 10) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit WhatsApp number');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Required', 'Please enter your address');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const customerData = {
        customer: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          mobile: mobile.trim(),
          address: address.trim(),
          gender: gender || undefined,
          birth_date: birthDate ? formatDate(birthDate) : undefined,
          whatsapp_number: whatsappNumber.trim() || mobile.trim(),
          latitude: latitude || undefined,
          longitude: longitude || undefined,
          pincode: pincode.trim() || undefined,
        },
      };

      console.log('Update Profile Request:', JSON.stringify(customerData, null, 2));

      const response = await api.put('/api/v1/mobile/ecommerce/profile', customerData);
      const data = await response.json();

      console.log('Update Profile Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Update AsyncStorage
        await AsyncStorage.setItem('userName', `${firstName} ${lastName}`);
        setSaving(false);
        setShowSuccessModal(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
        setSaving(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Unable to update profile. Please try again.');
      setSaving(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const getInitials = () => {
    const f = firstName.charAt(0).toUpperCase();
    const l = lastName.charAt(0).toUpperCase();
    return f + l || 'U';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <View style={styles.header}>
          <View style={styles.headerDecoration}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity
            style={[styles.saveHeaderButton, saving && styles.saveHeaderButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="check" size={22} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarOuter}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.avatarBadge}>
              <Icon name="camera" size={14} color="#fff" />
            </View>
          </View>
          <Text style={styles.avatarName}>{firstName} {lastName}</Text>
          <Text style={styles.avatarSubtext}>Update your personal information</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Icon name="account-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.cardContent}>
            {/* Name Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, activeField === 'firstName' && styles.inputContainerFocused]}>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor="#9ca3af"
                    editable={!saving}
                    onFocus={() => setActiveField('firstName')}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <View style={[styles.inputContainer, activeField === 'lastName' && styles.inputContainerFocused]}>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor="#9ca3af"
                    editable={!saving}
                    onFocus={() => setActiveField('lastName')}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Mobile */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, styles.inputContainerWithIcon, activeField === 'mobile' && styles.inputContainerFocused]}>
                <View style={styles.inputIconBox}>
                  <Icon name="phone" size={18} color={colors.primary} />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="9876543210"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!saving}
                  onFocus={() => setActiveField('mobile')}
                  onBlur={() => setActiveField(null)}
                />
              </View>
            </View>

            {/* WhatsApp */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>WhatsApp Number</Text>
              <View style={[styles.inputContainer, styles.inputContainerWithIcon, activeField === 'whatsapp' && styles.inputContainerFocused]}>
                <View style={[styles.inputIconBox, { backgroundColor: '#dcfce7' }]}>
                  <Icon name="whatsapp" size={18} color="#22c55e" />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="Same as mobile"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!saving}
                  onFocus={() => setActiveField('whatsapp')}
                  onBlur={() => setActiveField(null)}
                />
              </View>
            </View>

            {/* Gender & DOB Row */}
            <View style={styles.row}>
              <View style={styles.halfField}>
                <Text style={styles.label}>Gender</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, styles.selectContainer]}
                  onPress={() => setShowGenderPicker(true)}
                  disabled={saving}
                >
                  <View style={styles.selectContent}>
                    <Icon
                      name={gender ? GENDER_OPTIONS.find(g => g.value === gender)?.icon || 'account' : 'account-question'}
                      size={18}
                      color={gender ? colors.primary : '#9ca3af'}
                    />
                    <Text style={[styles.selectText, !gender && styles.placeholder]}>
                      {gender ? GENDER_OPTIONS.find(g => g.value === gender)?.label : 'Select'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.label}>Birth Date</Text>
                <TouchableOpacity
                  style={[styles.inputContainer, styles.selectContainer]}
                  onPress={openDatePicker}
                  disabled={saving}
                >
                  <View style={styles.selectContent}>
                    <Icon name="calendar" size={18} color={birthDate ? colors.primary : '#9ca3af'} />
                    <Text style={[styles.selectText, !birthDate && styles.placeholder]} numberOfLines={1}>
                      {birthDate ? formatDisplayDate(birthDate).split(' ').slice(0, 2).join(' ') : 'Select'}
                    </Text>
                  </View>
                  <Icon name="chevron-down" size={18} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#fef3c7' }]}>
              <Icon name="map-marker-outline" size={22} color="#d97706" />
            </View>
            <Text style={styles.cardTitle}>Delivery Address</Text>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>
                Full Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputContainer, styles.textAreaContainer, activeField === 'address' && styles.inputContainerFocused]}>
                <TextInput
                  style={styles.textArea}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Enter your complete delivery address"
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!saving}
                  onFocus={() => setActiveField('address')}
                  onBlur={() => setActiveField(null)}
                />
              </View>
            </View>

            {/* Pincode */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Pincode</Text>
              <View style={[styles.inputContainer, styles.inputContainerWithIcon, activeField === 'pincode' && styles.inputContainerFocused]}>
                <View style={[styles.inputIconBox, { backgroundColor: '#fef3c7' }]}>
                  <Icon name="map-marker-radius" size={18} color="#d97706" />
                </View>
                <TextInput
                  style={styles.inputWithIcon}
                  value={pincode}
                  onChangeText={setPincode}
                  placeholder="Enter 6-digit pincode"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!saving}
                  onFocus={() => setActiveField('pincode')}
                  onBlur={() => setActiveField(null)}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Location Card (Optional) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Icon name="crosshairs-gps" size={22} color="#2563eb" />
            </View>
            <Text style={styles.cardTitle}>GPS Location (Optional)</Text>
            {latitude && longitude && (
              <View style={styles.locationCapturedBadge}>
                <Icon name="check-circle" size={14} color="#16a34a" />
                <Text style={styles.locationCapturedText}>Captured</Text>
              </View>
            )}
          </View>

          <View style={styles.cardContent}>
            {/* Get Current Location Button */}
            <TouchableOpacity
              style={[styles.getLocationButton, locationLoading && styles.getLocationButtonDisabled]}
              onPress={getCurrentLocation}
              disabled={locationLoading || saving}
            >
              {locationLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.getLocationButtonText}>Getting Location...</Text>
                </>
              ) : (
                <>
                  <Icon name="crosshairs-gps" size={22} color="#fff" />
                  <Text style={styles.getLocationButtonText}>Get My Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Location Success Indicator */}
            {latitude && longitude && (
              <View style={styles.locationSuccessCard}>
                <View style={styles.locationSuccessIcon}>
                  <Icon name="map-marker-check" size={24} color="#16a34a" />
                </View>
                <View style={styles.locationSuccessContent}>
                  <Text style={styles.locationSuccessTitle}>Location Captured</Text>
                  <Text style={styles.locationSuccessCoords}>
                    {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.locationClearButton}
                  onPress={() => { setLatitude(''); setLongitude(''); }}
                >
                  <Icon name="close-circle" size={22} color="#dc2626" />
                </TouchableOpacity>
              </View>
            )}

            {/* OR Divider */}
            <View style={styles.orDivider}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR enter manually</Text>
              <View style={styles.orLine} />
            </View>

            {/* Manual Latitude & Longitude Fields */}
            <View style={styles.coordRow}>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Latitude</Text>
                <View style={[styles.inputContainer, activeField === 'latitude' && styles.inputContainerFocused]}>
                  <TextInput
                    style={styles.coordInput}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="e.g., 12.9716"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    editable={!saving}
                    onFocus={() => setActiveField('latitude')}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>
              <View style={styles.coordField}>
                <Text style={styles.coordLabel}>Longitude</Text>
                <View style={[styles.inputContainer, activeField === 'longitude' && styles.inputContainerFocused]}>
                  <TextInput
                    style={styles.coordInput}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="e.g., 77.5946"
                    placeholderTextColor="#9ca3af"
                    keyboardType="decimal-pad"
                    editable={!saving}
                    onFocus={() => setActiveField('longitude')}
                    onBlur={() => setActiveField(null)}
                  />
                </View>
              </View>
            </View>

            {/* Location Help Text */}
            <View style={styles.locationHelpContainer}>
              <Icon name="information-outline" size={16} color="#6b7280" />
              <Text style={styles.locationHelpText}>
                Location helps us deliver to your exact address accurately.
              </Text>
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.saveButtonText}>Updating Profile...</Text>
            </View>
          ) : (
            <View style={styles.saveButtonContent}>
              <Icon name="content-save-check" size={22} color="#fff" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Icon name="calendar-month" size={28} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Select Birth Date</Text>
              <Text style={styles.modalSubtitle}>Enter your date of birth</Text>
            </View>

            <View style={styles.dateInputRow}>
              <View style={styles.dateInputField}>
                <Text style={styles.dateInputLabel}>Day</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempDay}
                  onChangeText={setTempDay}
                  placeholder="DD"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.dateInputField}>
                <Text style={styles.dateInputLabel}>Month</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempMonth}
                  onChangeText={setTempMonth}
                  placeholder="MM"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View style={styles.dateInputField}>
                <Text style={styles.dateInputLabel}>Year</Text>
                <TextInput
                  style={styles.dateInput}
                  value={tempYear}
                  onChangeText={setTempYear}
                  placeholder="YYYY"
                  placeholderTextColor="#9ca3af"
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={confirmDate}
              >
                <Icon name="check" size={18} color="#fff" />
                <Text style={styles.modalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Gender Picker Modal */}
      <Modal visible={showGenderPicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="account-group" size={28} color="#9333ea" />
              </View>
              <Text style={styles.modalTitle}>Select Gender</Text>
              <Text style={styles.modalSubtitle}>Choose your gender</Text>
            </View>

            <View style={styles.genderOptions}>
              {GENDER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.genderOption,
                    gender === option.value && styles.genderOptionSelected,
                  ]}
                  onPress={() => {
                    setGender(option.value);
                    setShowGenderPicker(false);
                  }}
                >
                  <View style={[
                    styles.genderIconContainer,
                    gender === option.value && styles.genderIconContainerSelected,
                  ]}>
                    <Icon
                      name={option.icon}
                      size={26}
                      color={gender === option.value ? '#fff' : '#6b7280'}
                    />
                  </View>
                  <Text style={[
                    styles.genderOptionText,
                    gender === option.value && styles.genderOptionTextSelected,
                  ]}>
                    {option.label}
                  </Text>
                  {gender === option.value && (
                    <View style={styles.genderCheckmark}>
                      <Icon name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            {/* Decorative Background */}
            <View style={styles.successModalDecoration}>
              <View style={styles.successCircle1} />
              <View style={styles.successCircle2} />
              <View style={styles.successCircle3} />
            </View>

            {/* Animated Success Icon */}
            <View style={styles.successIconContainer}>
              <View style={styles.successIconOuter}>
                <View style={styles.successIconMiddle}>
                  <View style={styles.successIconInner}>
                    <Icon name="check-bold" size={40} color="#fff" />
                  </View>
                </View>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.successTitle}>Profile Updated!</Text>
            <Text style={styles.successSubtitle}>
              Your profile information has been successfully updated.
            </Text>

            {/* Updated Fields Summary */}
            <View style={styles.successSummary}>
              <View style={styles.successSummaryItem}>
                <Icon name="account" size={18} color={colors.primary} />
                <Text style={styles.successSummaryText}>{firstName} {lastName}</Text>
              </View>
              <View style={styles.successSummaryItem}>
                <Icon name="phone" size={18} color={colors.primary} />
                <Text style={styles.successSummaryText}>{mobile}</Text>
              </View>
              {address && (
                <View style={styles.successSummaryItem}>
                  <Icon name="map-marker" size={18} color={colors.primary} />
                  <Text style={styles.successSummaryText} numberOfLines={1}>{address}</Text>
                </View>
              )}
            </View>

            {/* Done Button */}
            <TouchableOpacity
              style={styles.successDoneBtn}
              onPress={handleSuccessClose}
            >
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.successDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -60,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: 20,
    left: -30,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: 60,
    left: width / 2 - 40,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  saveHeaderButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveHeaderButtonDisabled: {
    opacity: 0.6,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  avatarSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Content
  content: {
    flex: 1,
    marginTop: -10,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 20,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  cardContent: {
    padding: 16,
  },

  // Form
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  fieldGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  required: {
    color: '#dc2626',
  },
  inputContainer: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
  },
  inputContainerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIconBox: {
    width: 44,
    height: 52,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  selectText: {
    fontSize: 15,
    color: '#1f2937',
    flex: 1,
  },
  placeholder: {
    color: '#9ca3af',
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    padding: 14,
    fontSize: 15,
    color: '#1f2937',
    minHeight: 80,
    textAlignVertical: 'top',
  },

  // Location Card
  locationCapturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginLeft: 'auto',
  },
  locationCapturedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#16a34a',
  },
  getLocationButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  getLocationButtonDisabled: {
    opacity: 0.7,
  },
  getLocationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  locationSuccessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  locationSuccessIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationSuccessContent: {
    flex: 1,
  },
  locationSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#16a34a',
    marginBottom: 2,
  },
  locationSuccessCoords: {
    fontSize: 12,
    color: '#4b5563',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  locationClearButton: {
    padding: 4,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  orText: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
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
    color: '#4b5563',
    marginBottom: 8,
  },
  coordInput: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
    textAlign: 'center',
  },
  locationHelpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  locationHelpText: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },

  // Save Button
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },

  // Date Modal
  dateInputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  dateInputField: {
    flex: 1,
  },
  dateInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Gender Modal
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  genderOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  genderOptionSelected: {
    backgroundColor: '#f0fdf4',
    borderColor: colors.primary,
  },
  genderIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  genderIconContainerSelected: {
    backgroundColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  genderOptionTextSelected: {
    color: colors.primary,
  },
  genderCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },

  // Success Modal
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    overflow: 'hidden',
  },
  successModalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 180,
  },
  successCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f0fdf4',
    top: -100,
    right: -50,
  },
  successCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#dcfce7',
    top: -40,
    left: -40,
  },
  successCircle3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#bbf7d0',
    top: 20,
    right: 40,
  },
  successIconContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  successIconOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconMiddle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  successSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  successSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successSummaryText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  successDoneBtn: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successDoneBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
