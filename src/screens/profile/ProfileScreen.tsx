import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
// import { useAuth } from '../../context/AuthContext';


  // const { setIsLoggedIn } = useAuth();
  // const { setIsLoggedIn } = "true";


const ProfileScreen: React.FC<any> = ({ setIsLoggedIn }) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>My Profile</Text>

      <TouchableOpacity
        // onPress={() => setIsLoggedIn(false)} // ✅ ONLY THIS
        style={{
          backgroundColor: '#D32F2F',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBF7',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
});
