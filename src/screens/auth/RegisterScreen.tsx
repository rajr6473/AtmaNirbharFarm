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

const BASE_URL = 'https://dr-ec-ag-ag-ag.onrender.com/api/v1/mobile';

type RegisterScreenProps = {
  navigation: any;
};

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>('');
  const [modalSuccess, setModalSuccess] = useState<boolean>(true);

  const openModal = (success: boolean, message: string) => {
    setModalSuccess(success);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleRegister = async () => {
    if (!firstName.trim()) return openModal(false, 'Please enter first name');
    if (!lastName.trim()) return openModal(false, 'Please enter last name');
    if (!email.includes('@')) return openModal(false, 'Enter a valid email');
    if (mobile.length !== 10)
      return openModal(false, 'Enter valid mobile number');
    if (password.length < 6)
      return openModal(false, 'Password must be at least 6 characters');
    if (password !== confirmPassword)
      return openModal(false, 'Passwords do not match');

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          mobile,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        openModal(true, 'Account created successfully');
      } else {
        openModal(false, data?.message || 'Registration failed');
      }
    } catch (error) {
      openModal(false, 'Network error. Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Join Dhanvantri Farm</Text>
          <Text style={styles.subtitle}>
            Fresh organic products delivered to your door
          </Text>

          {/* INPUTS */}
          <Text style={styles.label}>First Name</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

          <Text style={styles.label}>Last Name</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            value={mobile}
            onChangeText={setMobile}
          />

          {/* PASSWORD */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Icon
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={22}
                color="#6b7280"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Already have an account? Login
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Icon
              name={modalSuccess ? 'check-circle' : 'alert-circle'}
              size={56}
              color={modalSuccess ? '#16a34a' : '#dc2626'}
            />
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
    padding: 16,
    backgroundColor: '#2E7D32',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  content: { padding: 24 },

  title: { fontSize: 24, fontWeight: '800', color: '#2E7D32' },
  subtitle: { color: '#6b7280', marginBottom: 20 },

  label: { marginTop: 12, fontWeight: '600', color: '#111' },

  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },

  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    marginTop: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#000',
  },

  button: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    marginTop: 28,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  loginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#2E7D32',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  modalMessage: {
    marginVertical: 16,
    fontSize: 15,
    textAlign: 'center',
    color: '#111',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  modalButtonText: { color: '#fff', fontWeight: '700' },
});
