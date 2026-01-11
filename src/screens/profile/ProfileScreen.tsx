import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ProfileScreen = () => {
  // 🔐 TEMP auth state (replace later with AuthContext)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Dummy user data (replace from API later)
  const user = {
    name: 'Rajesh Kumar',
    email: 'rajesh@gmail.com',
    phone: '9876543210',
    address: '12, MG Road, Bangalore, Karnataka - 560001',
  };

  // ---------------- LOGGED IN VIEW ----------------
  if (isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>My Profile</Text>

        <View style={styles.card}>
          <ProfileItem label="Name" value={user.name} />
          <ProfileItem label="Email" value={user.email} />
          <ProfileItem label="Phone" value={user.phone} />
          <ProfileItem label="Address" value={user.address} />
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setIsLoggedIn(false)}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------------- REGISTER VIEW ----------------
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Create Account</Text>

      <Input placeholder="Full Name" />
      <Input placeholder="Email" keyboardType="email-address" />
      <Input placeholder="Phone Number" keyboardType="number-pad" />
      <Input placeholder="Password" secureTextEntry />
      <Input placeholder="Confirm Password" secureTextEntry />

      <View style={styles.row}>
        <Input placeholder="State" style={styles.half} />
        <Input placeholder="City" style={styles.half} />
      </View>

      <Input placeholder="Pincode" keyboardType="number-pad" />
      <Input placeholder="Full Address" multiline style={{ height: 80 }} />

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => setIsLoggedIn(true)}
      >
        <Text style={styles.primaryText}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.switchText}>
        Already have an account?
        <Text
          style={styles.link}
          onPress={() => setIsLoggedIn(true)}
        >
          {' '}Login
        </Text>
      </Text>
    </ScrollView>
  );
};

export default ProfileScreen;

/* ---------------- REUSABLE COMPONENTS ---------------- */

const Input = ({ style, ...props }: any) => (
  <TextInput
    {...props}
    placeholderTextColor="#999"
    style={[styles.input, style]}
  />
);

const ProfileItem = ({ label, value }: any) => (
  <View style={styles.profileRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9FBF7',
    padding: 16,
  },

  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: 16,
    textAlign: 'center',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
  },

  profileRow: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 2,
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    marginBottom: 12,
    elevation: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  half: {
    width: '48%',
  },

  primaryBtn: {
    backgroundColor: '#2E7D32',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  logoutBtn: {
    backgroundColor: '#D32F2F',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
  },

  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  switchText: {
    textAlign: 'center',
    marginTop: 14,
    color: '#555',
  },

  link: {
    color: '#2E7D32',
    fontWeight: '700',
  },
});
