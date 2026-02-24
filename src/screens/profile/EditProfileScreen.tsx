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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const EditProfileScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mobile, setMobile] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Try to fetch from API first
      try {
        console.log('=== Fetching Profile from API ===');
        const response = await api.get('/ecommerce/profile');
        const data = await response.json();

        console.log('=== Profile API Response ===');
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

        if (response.ok && data.success) {
          const customer = data.data?.customer || data.data?.user || data.data;
          populateFormFields(customer);
          return;
        }
      } catch (apiError) {
        console.log('API fetch failed, falling back to AsyncStorage:', apiError);
      }

      // Fallback to AsyncStorage
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        console.log('=== Loaded User Data from AsyncStorage ===');
        console.log(JSON.stringify(userData, null, 2));

        const customer = userData.customer || userData.user || userData;
        populateFormFields(customer);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const populateFormFields = (customer: any) => {
    setFirstName(customer.first_name || customer.firstName || '');
    setLastName(customer.last_name || customer.lastName || '');
    setMobile(customer.mobile || customer.phone || '');
    setWhatsappNumber(customer.whatsapp_number || customer.whatsappNumber || customer.mobile || '');
    setAddress(customer.address || '');
    setCity(customer.city || '');
    setState(customer.state || '');
    setPincode(customer.pincode || customer.pin_code || '');
  };

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'Please enter your first name');
      return false;
    }

    if (!lastName.trim()) {
      Alert.alert('Validation Error', 'Please enter your last name');
      return false;
    }

    if (!mobile.trim() || mobile.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit mobile number');
      return false;
    }

    if (whatsappNumber && whatsappNumber.length !== 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit WhatsApp number');
      return false;
    }

    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter your address');
      return false;
    }

    if (!city.trim()) {
      Alert.alert('Validation Error', 'Please enter your city');
      return false;
    }

    if (!state.trim()) {
      Alert.alert('Validation Error', 'Please enter your state');
      return false;
    }

    if (!pincode.trim() || pincode.length !== 6) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit pincode');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const customerData = {
        customer: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          mobile: mobile.trim(),
          whatsapp_number: whatsappNumber.trim() || mobile.trim(),
          address: address.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
      };

      console.log('=== Updating Profile ===');
      console.log('Request Data:', JSON.stringify(customerData, null, 2));

      const response = await api.put('/ecommerce/profile', customerData);
      const data = await response.json();

      console.log('=== Profile Update Response ===');
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        // Update local storage with new data
        const currentUserData = await AsyncStorage.getItem('userData');
        if (currentUserData) {
          const parsed = JSON.parse(currentUserData);
          const updatedUserData = {
            ...parsed,
            customer: data.data?.customer || customerData.customer,
          };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        }

        Alert.alert('Success', 'Profile updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Network Error', 'Unable to update profile. Please check your internet connection.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E88E5" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changePhoto}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          {/* Personal Information */}
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Enter your first name"
            placeholderTextColor="#999"
            editable={!saving}
          />

          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Enter your last name"
            placeholderTextColor="#999"
            editable={!saving}
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter your mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#999"
            editable={!saving}
          />

          <Text style={styles.label}>WhatsApp Number</Text>
          <TextInput
            style={styles.input}
            value={whatsappNumber}
            onChangeText={setWhatsappNumber}
            placeholder="Enter your WhatsApp number"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor="#999"
            editable={!saving}
          />

          {/* Address Information */}
          <Text style={styles.sectionTitle}>Address Information</Text>

          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your complete address"
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!saving}
          />

          <Text style={styles.label}>City *</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            placeholder="Enter your city"
            placeholderTextColor="#999"
            editable={!saving}
          />

          <Text style={styles.label}>State *</Text>
          <TextInput
            style={styles.input}
            value={state}
            onChangeText={setState}
            placeholder="Enter your state"
            placeholderTextColor="#999"
            editable={!saving}
          />

          <Text style={styles.label}>Pincode *</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={setPincode}
            placeholder="Enter 6-digit pincode"
            keyboardType="number-pad"
            maxLength={6}
            placeholderTextColor="#999"
            editable={!saving}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  backIcon: {
    fontSize: 24,
    color: colors.white,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.md,
    color: colors.primaryLight,
  },
  content: {
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: colors.white,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    borderRadius: borderRadius.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${colors.primaryLight}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarIcon: {
    fontSize: 50,
  },
  changePhoto: {
    color: colors.primaryLight,
    fontWeight: fonts.weights.semibold,
    fontSize: fonts.sizes.md,
  },
  form: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fonts.sizes.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: spacing.lg,
  },
  saveButtonDisabled: {
    backgroundColor: `${colors.primary}80`,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
