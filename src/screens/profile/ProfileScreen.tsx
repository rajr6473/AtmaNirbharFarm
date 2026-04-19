import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius } from '../../theme';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation, route }: any) => {
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
  });

  useFocusEffect(
    React.useCallback(() => {
      loadUserData();
    }, [])
  );

  useEffect(() => {
    if (route.params?.updatedUser) {
      setUser(prev => ({ ...prev, ...route.params.updatedUser }));
    }
  }, [route.params?.updatedUser]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userName = await AsyncStorage.getItem('userName');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userMobile = await AsyncStorage.getItem('userMobile');
      const userRole = await AsyncStorage.getItem('userRole');

      setUser({
        name: userName || 'User',
        email: userEmail || '',
        phone: userMobile || '',
        role: userRole || 'customer',
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      setLoggingOut(true);
      await AsyncStorage.multiRemove([
        'authToken',
        'userData',
        'userName',
        'userEmail',
        'userMobile',
        'userId',
        'customerId',
        'userRole',
      ]);
      setShowLogoutModal(false);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error);
      setLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Premium Header with Gradient Effect */}
      <View style={styles.header}>
        <View style={styles.headerDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        <Text style={styles.headerTitle}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
            </View>
            <View style={styles.onlineIndicator} />
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.roleBadge}>
              <Icon
                name={user.role === 'delivery_person' ? 'truck-delivery' : 'account'}
                size={12}
                color="#fff"
              />
              <Text style={styles.roleText}>
                {user.role === 'delivery_person' ? 'Delivery Partner' : 'Customer'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Icon name="pencil" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Contact Info */}
        <View style={styles.contactInfo}>
          {user.phone ? (
            <View style={styles.contactItem}>
              <Icon name="phone" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contactText}>{user.phone}</Text>
            </View>
          ) : null}
          {user.email ? (
            <View style={styles.contactItem}>
              <Icon name="email" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.contactText}>{user.email}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#dbeafe' }]}>
              <Icon name="package-variant" size={24} color="#2563eb" />
            </View>
            <Text style={styles.statLabel}>My Bookings</Text>
            <Icon name="chevron-right" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Main Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#f0fdf4' }]}>
                <Icon name="account-edit" size={22} color="#16a34a" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Edit Profile</Text>
                <Text style={styles.menuSubtitle}>Update your personal information</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          {/* Commented out features
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Transactions')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Icon name="swap-horizontal" size={22} color="#d97706" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Transactions</Text>
                <Text style={styles.menuSubtitle}>Payment history</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MonthlyBill')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#f3e8ff' }]}>
                <Icon name="file-chart" size={22} color="#9333ea" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Monthly Bill</Text>
                <Text style={styles.menuSubtitle}>View monthly statements</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
          */}
        </View>

        {/* Support Section - Commented out
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('FAQs')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#fef3c7' }]}>
                <Icon name="help-circle" size={22} color="#d97706" />
              </View>
              <View>
                <Text style={styles.menuTitle}>FAQs</Text>
                <Text style={styles.menuSubtitle}>Frequently asked questions</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ContactUs')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: '#dbeafe' }]}>
                <Icon name="headset" size={22} color="#2563eb" />
              </View>
              <View>
                <Text style={styles.menuTitle}>Contact Us</Text>
                <Text style={styles.menuSubtitle}>Get help from our team</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={22} color="#9ca3af" />
          </TouchableOpacity>
        </View>
        */}

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <View style={styles.logoutLeft}>
              <View style={styles.logoutIconContainer}>
                <Icon name="logout" size={22} color="#dc2626" />
              </View>
              <Text style={styles.logoutText}>Logout</Text>
            </View>
            <Icon name="chevron-right" size={22} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Icon name="leaf" size={24} color={colors.primary} />
          <Text style={styles.appName}>Dhanvantari Naturals</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Premium Logout Modal */}
      <Modal visible={showLogoutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Decorative Background */}
            <View style={styles.modalDecoration}>
              <View style={styles.modalCircle1} />
              <View style={styles.modalCircle2} />
            </View>

            {/* Icon */}
            <View style={styles.logoutModalIconContainer}>
              <View style={styles.logoutModalIconOuter}>
                <View style={styles.logoutModalIconInner}>
                  <Icon name="logout-variant" size={36} color="#dc2626" />
                </View>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.logoutModalTitle}>Logout</Text>
            <Text style={styles.logoutModalSubtitle}>
              Are you sure you want to logout from your account?
            </Text>

            {/* User Info */}
            <View style={styles.logoutUserCard}>
              <View style={styles.logoutUserAvatar}>
                <Text style={styles.logoutUserAvatarText}>{getInitials(user.name)}</Text>
              </View>
              <View style={styles.logoutUserInfo}>
                <Text style={styles.logoutUserName}>{user.name}</Text>
                <Text style={styles.logoutUserEmail}>{user.email || user.phone}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutModalCancelBtn}
                onPress={() => setShowLogoutModal(false)}
                disabled={loggingOut}
              >
                <Text style={styles.logoutModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.logoutModalConfirmBtn, loggingOut && styles.logoutModalConfirmBtnDisabled]}
                onPress={confirmLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="logout" size={18} color="#fff" />
                    <Text style={styles.logoutModalConfirmText}>Logout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -50,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.03)',
    bottom: -30,
    left: -30,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22c55e',
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
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roleText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  editProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Contact Info
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Stats
  statsContainer: {
    marginBottom: 20,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  statLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },

  // Menu Section
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },

  // Logout Section
  logoutSection: {
    backgroundColor: '#fef2f2',
    borderRadius: 20,
    padding: 6,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 8,
  },
  appVersion: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },

  // Logout Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  modalCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#fef2f2',
    top: -80,
    right: -40,
  },
  modalCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fee2e2',
    top: -30,
    left: -30,
  },
  logoutModalIconContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  logoutModalIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  logoutModalSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  logoutUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutUserAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  logoutUserInfo: {
    flex: 1,
  },
  logoutUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  logoutUserEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  logoutModalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  logoutModalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutModalConfirmBtnDisabled: {
    opacity: 0.7,
  },
  logoutModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
