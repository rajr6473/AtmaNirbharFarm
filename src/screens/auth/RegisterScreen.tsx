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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const BASE_URL = 'https://dhan-g618.onrender.com/api/v1/mobile';

type RegisterScreenProps = {
  navigation: any;
};

const ROLES = [
  { value: 'customer', label: 'Customer' },
  // { value: 'delivery_person', label: 'Delivery Person' },
];

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  // Personal Info
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  // Password
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Role
  const [role, setRole] = useState<string>('customer');
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);

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
          email: email.trim().toLowerCase(),
          mobile: mobile,
          password: password,
          password_confirmation: confirmPassword,
          role: role,
        }),
      });

      const data = await response.json();
      console.log('Register Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        openModal(true, data.message || 'Registration successful! You can now login.');
      } else {
        openModal(false, data?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Register error:', error);
      openModal(false, 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedRoleLabel = () => {
    return ROLES.find(r => r.value === role)?.label || 'Select Role';
  };

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
            <Icon name="leaf" size={40} color={colors.primary} />
            <Text style={styles.title}>Join Dhanvantari Naturals</Text>
            <Text style={styles.subtitle}>
              Fresh organic products delivered to your door
            </Text>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  First Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>
                  Last Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Mobile Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={mobile}
                onChangeText={setMobile}
                placeholder="9898989899"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
                maxLength={10}
                editable={!loading}
              />
            </View>
          </View>

          {/* Role Selection Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account-group" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Account Type</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Role <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                disabled={loading}
              >
                <Text style={styles.dropdownText}>{getSelectedRoleLabel()}</Text>
                <Icon
                  name={showRoleDropdown ? 'chevron-up' : 'chevron-down'}
                  size={24}
                  color="#6b7280"
                />
              </TouchableOpacity>

              {showRoleDropdown && (
                <View style={styles.dropdownOptions}>
                  {ROLES.map((roleOption) => (
                    <TouchableOpacity
                      key={roleOption.value}
                      style={[
                        styles.dropdownOption,
                        role === roleOption.value && styles.dropdownOptionSelected,
                      ]}
                      onPress={() => {
                        setRole(roleOption.value);
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Icon
                        name={roleOption.value === 'customer' ? 'account' : 'truck-delivery'}
                        size={20}
                        color={role === roleOption.value ? colors.primary : '#6b7280'}
                      />
                      <Text
                        style={[
                          styles.dropdownOptionText,
                          role === roleOption.value && styles.dropdownOptionTextSelected,
                        ]}
                      >
                        {roleOption.label}
                      </Text>
                      {role === roleOption.value && (
                        <Icon name="check" size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="lock" size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Security</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password (min 6 characters)"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter password"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeButton}
                >
                  <Icon
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
            </View>
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
            disabled={loading}
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
                { backgroundColor: modalSuccess ? colors.primary : '#dc2626' },
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    elevation: 4,
    shadowColor: colors.shadow,
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
    fontSize: fonts.sizes['3xl'],
    fontWeight: '800',
    color: colors.primary,
    marginTop: spacing.md,
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

  dropdown: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#111',
    fontSize: 15,
  },
  dropdownOptions: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: '#f0fdf4',
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  dropdownOptionTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  button: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    borderRadius: borderRadius.base,
    marginTop: spacing.sm,
    gap: spacing.sm,
    elevation: 3,
    shadowColor: colors.primary,
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
    color: colors.primaryLight,
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
