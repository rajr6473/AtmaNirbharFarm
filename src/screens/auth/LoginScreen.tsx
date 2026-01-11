import React, { useState } from 'react';
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

const BASE_URL = 'https://dr-ec-ag-ag-ag.onrender.com/api/v1/mobile';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // Validation
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
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

      if (response.ok && data.success) {
        // Save auth token
        if (data.data?.token) {
          await AsyncStorage.setItem('authToken', data.data.token);
        }

        // Save user data
        if (data.data) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.data));
        }

        navigation.replace('Tabs');
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Dhanvantri Farm</Text>
        <Text style={styles.subtitle}>Fresh • Organic • Delivered</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Welcome Back</Text>
        <Text style={styles.formSubtitle}>Login to your account</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
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
            <Text style={styles.loginButtonText}>Login</Text>
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
    backgroundColor: '#F9FBF7',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 5,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#000',
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 14,
    paddingRight: 50,
    fontSize: 15,
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 14,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  forgotText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
    textAlign: 'right',
    marginTop: 12,
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
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
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '700',
  },
});
