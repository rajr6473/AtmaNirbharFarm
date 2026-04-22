import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fonts, spacing, borderRadius, shadows } from '../../theme';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://dhan-g618.onrender.com/api/v1/mobile';

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
          username: email.trim(),
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
    <View style={styles.container}>
      {/* Purple Wave Background */}
      <View style={styles.waveBackground}>
        <View style={styles.wave1} />
        <View style={styles.wave2} />
        <View style={styles.wave3} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoInner}>
              <Icon name="leaf" size={40} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.title}>Login</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Icon name="alert-circle" size={20} color={colors.error} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Icon name="email-outline" size={20} color={colors.gray500} style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Email</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor={colors.gray400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-outline" size={20} color={colors.gray500} style={styles.inputIcon} />
            <Text style={styles.inputLabel}>Password</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.gray400}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Icon name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.gray500} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Social Login Divider */}
          {/* <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View> */}

          {/* Social Login Buttons */}
          {/* <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="google" size={24} color="#DB4437" />
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Wave */}
      <View style={styles.bottomWave}>
        <View style={styles.bottomWave1} />
        <View style={styles.bottomWave2} />
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  waveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  wave1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.purpleTint40,
    opacity: 0.8,
  },
  wave2: {
    position: 'absolute',
    top: -80,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.purpleTint50,
    opacity: 0.6,
  },
  wave3: {
    position: 'absolute',
    top: 50,
    right: 50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primarySoft,
    opacity: 0.4,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 100,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
    marginBottom: spacing.lg,
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.purpleTint30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: fonts.sizes['4xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.xl,
    ...shadows.md,
  },
  errorContainer: {
    backgroundColor: colors.errorLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.error,
    fontWeight: fonts.weights.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  inputLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.base,
    fontSize: fonts.sizes.base,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  forgotText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.semibold,
    textAlign: 'right',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  loginButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.purple,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: fonts.weights.bold,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
  bottomWave1: {
    position: 'absolute',
    bottom: -60,
    left: -50,
    width: 250,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.purpleTint40,
    opacity: 0.7,
  },
  bottomWave2: {
    position: 'absolute',
    bottom: -80,
    right: -30,
    width: 200,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.purpleTint50,
    opacity: 0.5,
  },
});
