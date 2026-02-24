import React, { use, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const BASE_URL = 'https://dr-ec-ag-ag-ag.onrender.com/api/v1/mobile';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email or mobile number');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      console.log('Login Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setErrorMessage('');

        const userData = data.data;
        console.log('User Data:', userData);

        // Store token
        if (userData?.token) {
          await AsyncStorage.setItem('authToken', userData.token);
        }

        // Store user data from the response
        // API returns: { token, username, role, user_id, customer_id, email, mobile, ... }
        await AsyncStorage.setItem('userName', userData.username || '');
        await AsyncStorage.setItem('userRole', userData.role || 'customer');
        await AsyncStorage.setItem('userEmail', userData.email || '');
        await AsyncStorage.setItem('userMobile', userData.mobile || '');
        await AsyncStorage.setItem('userId', String(userData.user_id || ''));
        await AsyncStorage.setItem('customerId', String(userData.customer_id || ''));
        await AsyncStorage.setItem('total_deliveries', String(userData?.dashboard_stats?.total_deliveries || 0));
        await AsyncStorage.setItem('completed_deliveries', String(userData?.dashboard_stats?.completed_deliveries || 0));
        await AsyncStorage.setItem('pending_deliveries', String(userData?.dashboard_stats?.pending_deliveries || 0));

        // Store full user data as JSON for later use
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        // Navigate based on role
        const role = userData.role || 'customer';

        if (role === 'delivery_person') {
          navigation.replace('DeliveryTabs');
        } else {
          navigation.replace('CustomerTabs');
        }
      } else {
        setErrorMessage(data.message || 'Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="leaf" size={50} color="#fff" />
        </View>
        <Text style={styles.title}>Dhanvantari Naturals</Text>
        <Text style={styles.subtitle}>Fresh • Organic • Delivered</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Login to your account</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Email / Mobile</Text>
        <View style={styles.inputWrapper}>
          <Icon name="email-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email or mobile number"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrapper}>
          <Icon name="lock-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('ForgotPassword')}
          disabled={loading}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="login" size={20} color="#fff" />
              <Text style={styles.loginButtonText}>Login</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  form: {
    flex: 1,
    padding: 24,
  },
  formTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.primary,
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#dc2626',
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111',
  },
  eyeButton: {
    padding: 8,
  },
  forgotText: {
    fontSize: fonts.sizes.md,
    color: colors.primaryLight,
    fontWeight: fonts.weights.semibold,
    textAlign: 'right',
    marginTop: spacing.md,
  },
  loginButton: {
    backgroundColor: colors.primary,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    marginTop: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    fontSize: fonts.sizes.md,
    color: colors.primaryLight,
    fontWeight: fonts.weights.bold,
  },
});
