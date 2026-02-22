import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    name: '',
    phone: '',
    email: '',
  });

  // Load user data on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  // Listen for updates from EditProfile screen
  useEffect(() => {
    if (route.params?.updatedUser) {
      setUser(route.params.updatedUser);
    }
  }, [route.params?.updatedUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userMobile = await AsyncStorage.getItem('userMobile');

      setUser({
        name: userName || 'User',
        email: userEmail || '',
        phone: userMobile || '',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { id: 1, icon: 'help-circle-outline', title: 'FAQs', screen: 'FAQs' },
    { id: 2, icon: 'phone-outline', title: 'Contact Us', screen: 'ContactUs' },
    { id: 3, icon: 'gift-outline', title: 'Refer & Earn', screen: 'ReferEarn' },
    { id: 4, icon: 'translate', title: 'App Language', screen: 'AppLanguage' },
    { id: 5, icon: 'truck-delivery-outline', title: 'Delivery Preferences', screen: 'DeliveryPreferences' },
    { id: 6, icon: 'map-marker-outline', title: 'Address Requests', screen: 'AddressRequests' },
    { id: 7, icon: 'file-document-outline', title: 'Terms and Conditions', screen: 'TermsConditions' },
    { id: 8, icon: 'shield-lock-outline', title: 'Privacy Policy', screen: 'PrivacyPolicy' },
    { id: 9, icon: 'delete-outline', title: 'Delete My Account', screen: 'DeleteAccount', danger: true },
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
              // Clear auth data but keep cart
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('userData');
              await AsyncStorage.removeItem('userName');
              await AsyncStorage.removeItem('userEmail');
              await AsyncStorage.removeItem('userMobile');
              await AsyncStorage.removeItem('userId');
              await AsyncStorage.removeItem('customerId');
              await AsyncStorage.removeItem('userRole');
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="account" size={40} color="#2E7D32" />
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
            {user.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile', { user })}
          >
            <Icon name="pencil" size={18} color="#2E7D32" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTION CARDS */}
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#E3F2FD' }]}>
            <Icon name="clipboard-list-outline" size={28} color="#1976D2" />
          </View>
          <Text style={styles.cardTitle}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Transactions')}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#FFF3E0' }]}>
            <Icon name="swap-horizontal" size={28} color="#F57C00" />
          </View>
          <Text style={styles.cardTitle}>Transactions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('MonthlyBill')}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#F3E5F5' }]}>
            <Icon name="file-chart-outline" size={28} color="#7B1FA2" />
          </View>
          <Text style={styles.cardTitle}>Monthly Bill</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.getParent()?.navigate('Subscribe')}
        >
          <View style={[styles.cardIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <Icon name="calendar-sync-outline" size={28} color="#2E7D32" />
          </View>
          <Text style={styles.cardTitle}>Subscriptions</Text>
        </TouchableOpacity>
      </View>

      {/* MENU ITEMS */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuHeader}>Settings & Support</Text>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuLeft}>
              <Icon
                name={item.icon}
                size={22}
                color={item.danger ? '#dc2626' : '#374151'}
              />
              <Text style={[styles.menuTitle, item.danger && styles.menuTitleDanger]}>
                {item.title}
              </Text>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        ))}

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="logout" size={22} color="#dc2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FBF7',
  },

  // HEADER
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  userEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ACTION CARDS
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -12,
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },

  // MENU
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  menuHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuTitle: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  menuTitleDanger: {
    color: '#dc2626',
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fef2f2',
    gap: 12,
  },
  logoutText: {
    fontSize: 15,
    color: '#dc2626',
    fontWeight: '600',
  },
});
