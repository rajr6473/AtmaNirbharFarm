import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

export default function LoginScreen(props: any) {
  const [mobile, setMobile] = useState('');

  const onLogin = () => {
    if (mobile.length === 10) {
      props.navigation.replace('Tabs'); // ✅ go to home
    } else {
      Alert.alert('Error', 'Enter valid mobile number');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🌿 Dhanvantri Farm</Text>

      <TextInput
        placeholder="Enter mobile number"
        keyboardType="number-pad"
        maxLength={10}
        value={mobile}
        onChangeText={setMobile}
        style={styles.input}
      />

      <TouchableOpacity style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#F9FBF7',
  },
  logo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  btn: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
