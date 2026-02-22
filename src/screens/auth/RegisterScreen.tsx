import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from 'react-native-geolocation-service';

const BASE_URL = 'https://dr-ec-ag-ag-ag.onrender.com/api/v1/mobile';

type RegisterScreenProps = {
  navigation: any;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  // Personal Info
  const [firstName, setFirstName] = useState<string>('');
  const [middleName, setMiddleName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  // Password
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Address
  const [address, setAddress] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');

  // WhatsApp
  const [whatsappSameAsMobile, setWhatsappSameAsMobile] = useState<boolean>(true);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('');

  // Location
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [showManualLocation, setShowManualLocation] = useState<boolean>(false);

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState<boolean>(true);

  const openModal = (success: boolean, message: string) => {
    setModalSuccess(success);
    setModalMessage(message);
    setModalVisible(true);
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    }

    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to auto-fill your coordinates.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  };

  const getCurrentLocation = async () => {
    setLocationLoading(true);

    const hasPermission = await requestLocationPermission();

    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Location permission is required to get your current location.');
      setLocationLoading(false);
      return;
    }

    // Manual timeout fallback for emulator
    const timeoutId = setTimeout(() => {
      setLocationLoading(false);
      Alert.alert(
        'Location Timeout',
        'Unable to get location. Would you like to enter coordinates manually?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enter Manually', onPress: () => setShowManualLocation(true) },
        ]
      );
    }, 10000);

    Geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());
        setLocationLoading(false);
      },
      (error) => {
        clearTimeout(timeoutId);
        console.log('Location error:', error);
        Alert.alert(
          'Location Error',
          'Unable to get your location. Would you like to enter coordinates manually?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Enter Manually', onPress: () => setShowManualLocation(true) },
          ]
        );
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      openModal(false, 'Please enter your first name');
      return false;
    }
    if (!lastName.trim()) {
      openModal(false, 'Please enter your last name');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      openModal(false, 'Please enter a valid email address');
      return false;
    }
    if (mobile.length !== 10) {
      openModal(false, 'Please enter a valid 10-digit mobile number');
      return false;
    }
    if (password.length < 6) {
      openModal(false, 'Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      openModal(false, 'Passwords do not match');
      return false;
    }
    if (!address.trim()) {
      openModal(false, 'Please enter your address');
      return false;
    }
    if (!city.trim()) {
      openModal(false, 'Please enter your city');
      return false;
    }
    if (!state.trim()) {
      openModal(false, 'Please enter your state');
      return false;
    }
    if (pincode.length !== 6) {
      openModal(false, 'Please enter a valid 6-digit pincode');
      return false;
    }
    if (!whatsappSameAsMobile && whatsappNumber.length !== 10) {
      openModal(false, 'Please enter a valid WhatsApp number');
      return false;
    }
    if (!latitude || !longitude) {
      openModal(false, 'Please get your current location');
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          middle_name: middleName.trim(),
          email: email.trim().toLowerCase(),
          mobile: mobile,
          password: password,
          password_confirmation: confirmPassword,
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode,
          whatsapp_number: whatsappSameAsMobile ? mobile : whatsappNumber,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        openModal(true, 'Account created successfully!');
      } else {
        openModal(false, data?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      openModal(false, 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    options?: {
      keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
      maxLength?: number;
      autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
      multiline?: boolean;
    }
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <TextInput
        style={[styles.input, options?.multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={options?.keyboardType || 'default'}
        maxLength={options?.maxLength}
        autoCapitalize={options?.autoCapitalize}
        multiline={options?.multiline}
        numberOfLines={options?.multiline ? 3 : 1}
      />
    </View>
  );

  const renderPasswordInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    showPasswordState: boolean,
    toggleShowPassword: () => void
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label} <Text style={styles.required}>*</Text>
      </Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.passwordInput}
          secureTextEntry={!showPasswordState}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeButton}>
          <Icon
            name={showPasswordState ? 'eye-off' : 'eye'}
            size={22}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Icon name="leaf" size={40} color="#2E7D32" />
            <Text style={styles.title}>Join Dhanvantari Naturals</Text>
            <Text style={styles.subtitle}>
              Fresh organic products delivered to your door
            </Text>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account" size={20} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('First Name', firstName, setFirstName, '', {
                  autoCapitalize: 'words',
                })}
              </View>
              <View style={styles.halfInput}>
                {renderInput('Last Name', lastName, setLastName, '', {
                  autoCapitalize: 'words',
                })}
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Middle Name</Text>
              <TextInput
                style={styles.input}
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="Optional"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            {renderInput('Email', email, setEmail, 'sbc@example.com', {
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}

            {renderInput('Mobile Number', mobile, setMobile, '99999999', {
              keyboardType: 'phone-pad',
              maxLength: 10,
            })}
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={20} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            {renderPasswordInput(
              'Password',
              password,
              setPassword,
              'Enter password',
              showPassword,
              () => setShowPassword(!showPassword)
            )}

            {renderPasswordInput(
              'Confirm Password',
              confirmPassword,
              setConfirmPassword,
              'Re-enter password',
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}
          </View>

          {/* Address Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="map-marker" size={20} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Address Details</Text>
            </View>

            {renderInput('Address', address, setAddress, '123 Main Street, Apartment 4B', {
              multiline: true,
              autoCapitalize: 'words',
            })}

            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('City', city, setCity, 'Mumbai', {
                  autoCapitalize: 'words',
                })}
              </View>
              <View style={styles.halfInput}>
                {renderInput('State', state, setState, 'Maharashtra', {
                  autoCapitalize: 'words',
                })}
              </View>
            </View>

            {renderInput('Pincode', pincode, setPincode, '400001', {
              keyboardType: 'numeric',
              maxLength: 6,
            })}
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="crosshairs-gps" size={20} color="#2E7D32" />
              <Text style={styles.sectionTitle}>Location Coordinates</Text>
            </View>

            <TouchableOpacity
              style={styles.locationButton}
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="crosshairs-gps" size={20} color="#fff" />
                  <Text style={styles.locationButtonText}>Get My Current Location</Text>
                </>
              )}
            </TouchableOpacity>

            {latitude && longitude ? (
              <View style={styles.locationInfo}>
                <Icon name="check-circle" size={18} color="#16a34a" />
                <Text style={styles.locationText}>
                  Location captured: {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                </Text>
                <TouchableOpacity onPress={() => { setLatitude(''); setLongitude(''); }}>
                  <Icon name="close-circle" size={18} color="#dc2626" />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationInfo}>
                <Icon name="information" size={18} color="#6b7280" />
                <Text style={styles.locationHint}>
                  Tap the button above to get your location
                </Text>
              </View>
            )}

            {/* Manual Location Entry Toggle */}
            <TouchableOpacity
              style={styles.manualLocationToggle}
              onPress={() => setShowManualLocation(!showManualLocation)}
            >
              <Icon name="pencil" size={16} color="#2E7D32" />
              <Text style={styles.manualLocationToggleText}>
                {showManualLocation ? 'Hide manual entry' : 'Enter coordinates manually'}
              </Text>
            </TouchableOpacity>

            {showManualLocation && (
              <View style={styles.manualLocationContainer}>
                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>
                        Latitude <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={latitude}
                        onChangeText={setLatitude}
                        placeholder="19.0760"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                  <View style={styles.halfInput}>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>
                        Longitude <Text style={styles.required}>*</Text>
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={longitude}
                        onChangeText={setLongitude}
                        placeholder="72.8777"
                        placeholderTextColor="#9ca3af"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* WhatsApp Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="whatsapp" size={20} color="#25D366" />
              <Text style={styles.sectionTitle}>WhatsApp Number</Text>
            </View>

            <TouchableOpacity
              style={styles.toggleContainer}
              onPress={() => setWhatsappSameAsMobile(!whatsappSameAsMobile)}
              activeOpacity={0.8}
            >
              <View style={styles.toggleContent}>
                <Text style={styles.toggleLabel}>Same as mobile number</Text>
                {mobile ? (
                  <Text style={styles.toggleSubtext}>{mobile}</Text>
                ) : (
                  <Text style={styles.toggleSubtextHint}>Enter mobile number above</Text>
                )}
              </View>
              <View
                style={[
                  styles.toggle,
                  whatsappSameAsMobile && styles.toggleActive,
                ]}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    whatsappSameAsMobile && styles.toggleThumbActive,
                  ]}
                />
              </View>
            </TouchableOpacity>

            {!whatsappSameAsMobile && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  WhatsApp Number <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  placeholder="Enter WhatsApp number"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="account-plus" size={20} color="#fff" />
                <Text style={styles.buttonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.loginLink}
          >
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginTextBold}>Login</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View
              style={[
                styles.modalIconContainer,
                { backgroundColor: modalSuccess ? '#dcfce7' : '#fee2e2' },
              ]}
            >
              <Icon
                name={modalSuccess ? 'check-circle' : 'alert-circle'}
                size={48}
                color={modalSuccess ? '#16a34a' : '#dc2626'}
              />
            </View>
            <Text style={styles.modalTitle}>
              {modalSuccess ? 'Success!' : 'Oops!'}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>

            <TouchableOpacity
              style={[
                styles.modalButton,
                { backgroundColor: modalSuccess ? '#2E7D32' : '#dc2626' },
              ]}
              onPress={() => {
                setModalVisible(false);
                if (modalSuccess) navigation.navigate('Login');
              }}
            >
              <Text style={styles.modalButtonText}>
                {modalSuccess ? 'Go to Login' : 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FBF7' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#2E7D32',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  content: { padding: 20 },

  welcomeSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
    fontSize: 14,
  },

  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },

  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 6,
  },

  inputContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#dc2626',
  },

  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    color: '#111',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: '#111',
    fontSize: 15,
  },
  eyeButton: {
    padding: 8,
  },

  locationButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    gap: 8,
  },
  locationText: {
    color: '#16a34a',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  locationHint: {
    color: '#6b7280',
    fontSize: 13,
    flex: 1,
  },
  manualLocationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 10,
    gap: 6,
  },
  manualLocationToggleText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  manualLocationContainer: {
    marginTop: 8,
  },

  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  toggleContent: {
    flex: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  toggleSubtext: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    marginTop: 2,
  },
  toggleSubtextHint: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e5e7eb',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2E7D32',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },

  button: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    gap: 8,
    elevation: 3,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  loginLink: {
    marginTop: 20,
    paddingVertical: 12,
  },
  loginText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 15,
  },
  loginTextBold: {
    color: '#2E7D32',
    fontWeight: '700',
  },

  bottomPadding: {
    height: 30,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    color: '#6b7280',
    lineHeight: 22,
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    minWidth: 140,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
