import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation, route }: any) => {
  // User data state
  const [user, setUser] = useState({
    name: 'Pramod Bhat',
    phone: '9632850872',
    email: 'pramod@example.com',
  });

  // Listen for updates from EditProfile screen
  useEffect(() => {
    if (route.params?.updatedUser) {
      setUser(route.params.updatedUser);
    }
  }, [route.params?.updatedUser]);

  const menuItems = [
    { id: 1, icon: '❓', title: 'FAQs', screen: 'FAQs' },
    { id: 2, icon: '📞', title: 'Contact Us', screen: 'ContactUs' },
    { id: 3, icon: '👥', title: 'Refer & Earn', screen: 'ReferEarn' },
    { id: 4, icon: '🌐', title: 'App Language', screen: 'AppLanguage' },
    { id: 5, icon: '🚚', title: 'Delivery Preferences', screen: 'DeliveryPreferences' },
    { id: 6, icon: '📍', title: 'Address Requests', screen: 'AddressRequests' },
    { id: 7, icon: '📄', title: 'Terms and Conditions', screen: 'TermsConditions' },
    { id: 8, icon: '🔒', title: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { id: 9, icon: '🗑️', title: 'Delete My Account', screen: 'DeleteAccount' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarIcon}>👤</Text>
              <View style={styles.addIcon}>
                <Text style={styles.addIconText}>+</Text>
              </View>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { user })}
          >
            <Text style={styles.editButtonText}>EDIT{'\n'}PROFILE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTION CARDS */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.cardIcon}>📋</Text>
          <Text style={styles.cardTitle}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Transactions')}
        >
          <Text style={styles.cardIcon}>💱</Text>
          <Text style={styles.cardTitle}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MonthlyBill')}
        >
          <Text style={styles.cardIcon}>📊</Text>
          <Text style={styles.cardTitle}>Monthly Bill</Text>
        </TouchableOpacity>
      </View>

      {/* MENU ITEMS */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },

  // HEADER
  header: {
    backgroundColor: '#1E88E5',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  avatarIcon: {
    fontSize: 32,
  },
  addIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  addIconText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ACTION CARDS
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },

  // MENU
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 28,
    color: '#999',
    fontWeight: '300',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#FFEBEE',
    marginTop: 12,
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  logoutText: {
    fontSize: 16,
    color: '#D32F2F',
    fontWeight: '600',
  },
});
