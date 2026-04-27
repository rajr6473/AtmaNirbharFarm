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
  TextInput,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, fonts, spacing, borderRadius, shadows } from '../../theme';
import { api } from '../../utils/api';

const { width } = Dimensions.get('window');

interface CompanyInfo {
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  website?: string;
}

interface ContactInfo {
  agent_name?: string;
  agent_mobile?: string;
  agent_email?: string;
  agent_address?: string;
  company_info?: CompanyInfo;
  support_hours?: string;
  emergency_contact?: string;
}

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

  // Change Password State
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [termsContent, setTermsContent] = useState('');
  const [loadingTerms, setLoadingTerms] = useState(false);

  // Contact Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(false);

  // Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultModalType, setResultModalType] = useState<'success' | 'error'>('success');
  const [resultModalMessage, setResultModalMessage] = useState('');

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

  // Show result modal
  const showResult = (type: 'success' | 'error', message: string) => {
    setResultModalType(type);
    setResultModalMessage(message);
    setShowResultModal(true);
  };

  // Change Password Handler
  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      showResult('error', 'Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      showResult('error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      showResult('error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showResult('error', 'New passwords do not match');
      return;
    }

    setChangingPassword(true);

    try {
      const response = await api.post('/api/v1/mobile/settings/change_password', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      const data = await response.json();
      console.log('Change Password Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setShowChangePasswordModal(false);
        resetPasswordFields();
        showResult('success', data.message || 'Password changed successfully!');
      } else {
        showResult('error', data.message || 'Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      showResult('error', 'Network error. Please check your connection and try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  const resetPasswordFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  // Fetch Terms and Conditions
  const fetchTerms = async () => {
    setShowTermsModal(true);
    setLoadingTerms(true);

    try {
      const response = await api.get('/api/v1/mobile/settings/terms');
      const data = await response.json();
      console.log('Terms Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setTermsContent(
          data.data?.terms_content ||
          data.data?.content ||
          data.data?.terms ||
          data.message ||
          'Terms and Conditions'
        );
      } else {
        setTermsContent(data.message || 'Unable to load terms and conditions.');
      }
    } catch (error) {
      console.error('Fetch terms error:', error);
      setTermsContent('Network error. Please try again later.');
    } finally {
      setLoadingTerms(false);
    }
  };

  // Fetch Contact Info
  const fetchContactInfo = async () => {
    setShowContactModal(true);
    setLoadingContact(true);

    try {
      const response = await api.get('/api/v1/mobile/settings/contact');
      const data = await response.json();
      console.log('Contact Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setContactInfo(data.data || {});
      } else {
        setContactInfo(null);
      }
    } catch (error) {
      console.error('Fetch contact error:', error);
      setContactInfo(null);
    } finally {
      setLoadingContact(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWhatsApp = (number: string) => {
    Linking.openURL(`whatsapp://send?phone=${number}`);
  };

  const handleWebsite = (url: string) => {
    Linking.openURL(url.startsWith('http') ? url : `https://${url}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerDecoration}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoInner}>
            <Icon name="leaf" size={32} color={colors.primary} />
          </View>
        </View>

        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Settings Menu */}
        <View style={styles.menuSection}>
          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                <Icon name="account-edit-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Edit Profile</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Address Book */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                <Icon name="map-marker-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Address Book</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setShowChangePasswordModal(true)}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                <Icon name="lock-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Change Password</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Order History */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyOrders')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                <Icon name="clipboard-list-outline" size={22} color={colors.primary} />
              </View>
              <Text style={styles.menuTitle}>Order History</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.menuDivider} />

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={fetchTerms}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.infoLight }]}>
                <Icon name="file-document-outline" size={22} color={colors.info} />
              </View>
              <Text style={styles.menuTitle}>Terms & Conditions</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Contact Us */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={fetchContactInfo}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.successLight }]}>
                <Icon name="phone-outline" size={22} color={colors.success} />
              </View>
              <Text style={styles.menuTitle}>Contact Us</Text>
            </View>
            <Icon name="chevron-right" size={22} color={colors.gray400} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.menuDivider} />

          {/* Logout */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleLogout}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconContainer, { backgroundColor: colors.errorLight }]}>
                <Icon name="logout" size={22} color={colors.error} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.error }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Icon name="leaf" size={28} color={colors.primary} />
          <Text style={styles.appName}>Atma Nirbhar Farm</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ==================== CHANGE PASSWORD MODAL ==================== */}
      <Modal visible={showChangePasswordModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.passwordModalContent}>
            {/* Decorative Background */}
            <View style={styles.passwordModalDecoration}>
              <View style={styles.passwordCircle1} />
              <View style={styles.passwordCircle2} />
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => {
                setShowChangePasswordModal(false);
                resetPasswordFields();
              }}
            >
              <Icon name="close" size={24} color={colors.gray600} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.passwordModalIconContainer}>
              <View style={styles.passwordModalIconOuter}>
                <View style={styles.passwordModalIconInner}>
                  <Icon name="lock-reset" size={36} color={colors.white} />
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={styles.passwordModalTitle}>Change Password</Text>
            <Text style={styles.passwordModalSubtitle}>
              Enter your current password and choose a new one
            </Text>

            {/* Form */}
            <View style={styles.passwordForm}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-outline" size={20} color={colors.gray500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter current password"
                    placeholderTextColor={colors.gray400}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrentPassword}
                    editable={!changingPassword}
                  />
                  <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                    <Icon name={showCurrentPassword ? 'eye-off' : 'eye'} size={22} color={colors.gray500} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-plus-outline" size={20} color={colors.gray500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password"
                    placeholderTextColor={colors.gray400}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    editable={!changingPassword}
                  />
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                    <Icon name={showNewPassword ? 'eye-off' : 'eye'} size={22} color={colors.gray500} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-check-outline" size={20} color={colors.gray500} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={colors.gray400}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    editable={!changingPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                    <Icon name={showConfirmPassword ? 'eye-off' : 'eye'} size={22} color={colors.gray500} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.changePasswordBtn, changingPassword && styles.btnDisabled]}
              onPress={handleChangePassword}
              disabled={changingPassword}
            >
              {changingPassword ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Icon name="check-circle" size={20} color={colors.white} />
                  <Text style={styles.changePasswordBtnText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== TERMS & CONDITIONS MODAL ==================== */}
      <Modal visible={showTermsModal} transparent animationType="slide">
        <View style={styles.fullModalOverlay}>
          <View style={styles.fullModalContent}>
            {/* Header */}
            <View style={styles.fullModalHeader}>
              <View style={styles.fullModalHeaderDecoration}>
                <View style={styles.fullModalCircle1} />
                <View style={styles.fullModalCircle2} />
              </View>
              <TouchableOpacity
                style={styles.fullModalCloseBtn}
                onPress={() => setShowTermsModal(false)}
              >
                <Icon name="close" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.fullModalIconContainer}>
                <Icon name="file-document-outline" size={32} color={colors.white} />
              </View>
              <Text style={styles.fullModalTitle}>Terms & Conditions</Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fullModalBodyContent}
            >
              {loadingTerms ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.modalLoadingText}>Loading terms...</Text>
                </View>
              ) : (
                <Text style={styles.termsText}>{termsContent}</Text>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.fullModalFooter}>
              <TouchableOpacity
                style={styles.fullModalAcceptBtn}
                onPress={() => setShowTermsModal(false)}
              >
                <Icon name="check" size={20} color={colors.white} />
                <Text style={styles.fullModalAcceptBtnText}>I Understand</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== CONTACT US MODAL ==================== */}
      <Modal visible={showContactModal} transparent animationType="slide">
        <View style={styles.fullModalOverlay}>
          <View style={styles.fullModalContent}>
            {/* Header */}
            <View style={[styles.fullModalHeader, { backgroundColor: colors.success }]}>
              <View style={styles.fullModalHeaderDecoration}>
                <View style={[styles.fullModalCircle1, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
                <View style={[styles.fullModalCircle2, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              </View>
              <TouchableOpacity
                style={styles.fullModalCloseBtn}
                onPress={() => setShowContactModal(false)}
              >
                <Icon name="close" size={24} color={colors.white} />
              </TouchableOpacity>
              <View style={styles.fullModalIconContainer}>
                <Icon name="headset" size={32} color={colors.white} />
              </View>
              <Text style={styles.fullModalTitle}>Contact Us</Text>
              <Text style={styles.fullModalSubtitle}>We're here to help you</Text>
            </View>

            {/* Content */}
            <ScrollView
              style={styles.fullModalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.fullModalBodyContent}
            >
              {loadingContact ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color={colors.success} />
                  <Text style={styles.modalLoadingText}>Loading contact info...</Text>
                </View>
              ) : contactInfo ? (
                <View style={styles.contactContainer}>
                  {/* Support Agent Section */}
                  {contactInfo.agent_name && (
                    <View style={styles.contactSectionHeader}>
                      <Icon name="headset" size={18} color={colors.primary} />
                      <Text style={styles.contactSectionTitle}>Support Agent</Text>
                    </View>
                  )}

                  {/* Agent Name */}
                  {contactInfo.agent_name && (
                    <View style={styles.contactCard}>
                      <View style={[styles.contactIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                        <Icon name="account" size={24} color={colors.primary} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Agent Name</Text>
                        <Text style={styles.contactValue}>{contactInfo.agent_name}</Text>
                      </View>
                    </View>
                  )}

                  {/* Agent Phone */}
                  {contactInfo.agent_mobile && (
                    <TouchableOpacity
                      style={styles.contactCard}
                      onPress={() => handleCall(contactInfo.agent_mobile!)}
                    >
                      <View style={[styles.contactIconContainer, { backgroundColor: '#D1FAE5' }]}>
                        <Icon name="phone" size={24} color="#10B981" />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Agent Phone</Text>
                        <Text style={styles.contactValue}>{contactInfo.agent_mobile}</Text>
                      </View>
                      <View style={styles.contactAction}>
                        <Icon name="phone-outgoing" size={20} color="#10B981" />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Agent Email */}
                  {contactInfo.agent_email && (
                    <TouchableOpacity
                      style={styles.contactCard}
                      onPress={() => handleEmail(contactInfo.agent_email!)}
                    >
                      <View style={[styles.contactIconContainer, { backgroundColor: colors.infoLight }]}>
                        <Icon name="email-outline" size={24} color={colors.info} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Agent Email</Text>
                        <Text style={styles.contactValue}>{contactInfo.agent_email}</Text>
                      </View>
                      <View style={styles.contactAction}>
                        <Icon name="email-send-outline" size={20} color={colors.info} />
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Agent Address */}
                  {contactInfo.agent_address && (
                    <View style={styles.contactCard}>
                      <View style={[styles.contactIconContainer, { backgroundColor: colors.errorLight }]}>
                        <Icon name="map-marker-outline" size={24} color={colors.error} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Agent Address</Text>
                        <Text style={styles.contactValue}>{contactInfo.agent_address}</Text>
                      </View>
                    </View>
                  )}

                  {/* Company Information Section */}
                  {contactInfo.company_info && (
                    <>
                      <View style={[styles.contactSectionHeader, { marginTop: spacing.lg }]}>
                        <Icon name="domain" size={18} color={colors.primary} />
                        <Text style={styles.contactSectionTitle}>Company Information</Text>
                      </View>

                      {/* Company Name */}
                      {contactInfo.company_info.name && (
                        <View style={styles.contactCard}>
                          <View style={[styles.contactIconContainer, { backgroundColor: colors.purpleTint30 }]}>
                            <Icon name="office-building" size={24} color={colors.primary} />
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Company Name</Text>
                            <Text style={styles.contactValue}>{contactInfo.company_info.name}</Text>
                          </View>
                        </View>
                      )}

                      {/* Company Phone */}
                      {contactInfo.company_info.mobile && (
                        <TouchableOpacity
                          style={styles.contactCard}
                          onPress={() => handleCall(contactInfo.company_info!.mobile!)}
                        >
                          <View style={[styles.contactIconContainer, { backgroundColor: '#D1FAE5' }]}>
                            <Icon name="phone" size={24} color="#10B981" />
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Company Phone</Text>
                            <Text style={styles.contactValue}>{contactInfo.company_info.mobile}</Text>
                          </View>
                          <View style={styles.contactAction}>
                            <Icon name="phone-outgoing" size={20} color="#10B981" />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* Company Email */}
                      {contactInfo.company_info.email && (
                        <TouchableOpacity
                          style={styles.contactCard}
                          onPress={() => handleEmail(contactInfo.company_info!.email!)}
                        >
                          <View style={[styles.contactIconContainer, { backgroundColor: colors.infoLight }]}>
                            <Icon name="email-outline" size={24} color={colors.info} />
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Company Email</Text>
                            <Text style={styles.contactValue}>{contactInfo.company_info.email}</Text>
                          </View>
                          <View style={styles.contactAction}>
                            <Icon name="email-send-outline" size={20} color={colors.info} />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* Company Website */}
                      {contactInfo.company_info.website && (
                        <TouchableOpacity
                          style={styles.contactCard}
                          onPress={() => handleWebsite(contactInfo.company_info!.website!)}
                        >
                          <View style={[styles.contactIconContainer, { backgroundColor: colors.warningLight }]}>
                            <Icon name="web" size={24} color={colors.warning} />
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Website</Text>
                            <Text style={styles.contactValue}>{contactInfo.company_info.website}</Text>
                          </View>
                          <View style={styles.contactAction}>
                            <Icon name="open-in-new" size={20} color={colors.warning} />
                          </View>
                        </TouchableOpacity>
                      )}

                      {/* Company Address */}
                      {contactInfo.company_info.address && (
                        <View style={styles.contactCard}>
                          <View style={[styles.contactIconContainer, { backgroundColor: colors.errorLight }]}>
                            <Icon name="map-marker-outline" size={24} color={colors.error} />
                          </View>
                          <View style={styles.contactInfo}>
                            <Text style={styles.contactLabel}>Company Address</Text>
                            <Text style={styles.contactValue}>{contactInfo.company_info.address}</Text>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  {/* Support Hours & Emergency Section */}
                  {(contactInfo.support_hours || contactInfo.emergency_contact) && (
                    <View style={[styles.contactSectionHeader, { marginTop: spacing.lg }]}>
                      <Icon name="clock-outline" size={18} color={colors.primary} />
                      <Text style={styles.contactSectionTitle}>Support Hours</Text>
                    </View>
                  )}

                  {/* Support Hours */}
                  {contactInfo.support_hours && (
                    <View style={styles.contactCard}>
                      <View style={[styles.contactIconContainer, { backgroundColor: colors.successLight }]}>
                        <Icon name="clock-outline" size={24} color={colors.success} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Working Hours</Text>
                        <Text style={styles.contactValue}>{contactInfo.support_hours}</Text>
                      </View>
                    </View>
                  )}

                  {/* Emergency Contact */}
                  {contactInfo.emergency_contact && (
                    <TouchableOpacity
                      style={styles.contactCard}
                      onPress={() => handleCall(contactInfo.emergency_contact!)}
                    >
                      <View style={[styles.contactIconContainer, { backgroundColor: colors.errorLight }]}>
                        <Icon name="phone-alert" size={24} color={colors.error} />
                      </View>
                      <View style={styles.contactInfo}>
                        <Text style={styles.contactLabel}>Emergency Contact</Text>
                        <Text style={[styles.contactValue, { color: colors.error, fontWeight: '600' }]}>
                          {contactInfo.emergency_contact}
                        </Text>
                      </View>
                      <View style={styles.contactAction}>
                        <Icon name="phone-outgoing" size={20} color={colors.error} />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.noContactContainer}>
                  <Icon name="alert-circle-outline" size={50} color={colors.gray400} />
                  <Text style={styles.noContactText}>Unable to load contact information</Text>
                  <Text style={styles.noContactSubtext}>Please try again later</Text>
                </View>
              )}
            </ScrollView>

            {/* Footer */}
            <View style={styles.fullModalFooter}>
              <TouchableOpacity
                style={[styles.fullModalAcceptBtn, { backgroundColor: colors.success }]}
                onPress={() => setShowContactModal(false)}
              >
                <Text style={styles.fullModalAcceptBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ==================== RESULT MODAL (Success/Error) ==================== */}
      <Modal visible={showResultModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.resultModalContent}>
            {/* Decorative Background */}
            <View style={styles.resultModalDecoration}>
              <View style={[
                styles.resultCircle1,
                { backgroundColor: resultModalType === 'success' ? colors.successLight : colors.errorLight }
              ]} />
              <View style={[
                styles.resultCircle2,
                { backgroundColor: resultModalType === 'success' ? '#A7F3D0' : '#FECACA' }
              ]} />
            </View>

            {/* Icon */}
            <View style={styles.resultModalIconContainer}>
              <View style={[
                styles.resultModalIconOuter,
                { backgroundColor: resultModalType === 'success' ? colors.successLight : colors.errorLight }
              ]}>
                <View style={[
                  styles.resultModalIconInner,
                  { backgroundColor: resultModalType === 'success' ? colors.success : colors.error }
                ]}>
                  <Icon
                    name={resultModalType === 'success' ? 'check-bold' : 'close-thick'}
                    size={36}
                    color={colors.white}
                  />
                </View>
              </View>
            </View>

            {/* Content */}
            <Text style={[
              styles.resultModalTitle,
              { color: resultModalType === 'success' ? colors.success : colors.error }
            ]}>
              {resultModalType === 'success' ? 'Success!' : 'Oops!'}
            </Text>
            <Text style={styles.resultModalMessage}>{resultModalMessage}</Text>

            {/* Button */}
            <TouchableOpacity
              style={[
                styles.resultModalBtn,
                { backgroundColor: resultModalType === 'success' ? colors.success : colors.error }
              ]}
              onPress={() => setShowResultModal(false)}
            >
              <Text style={styles.resultModalBtnText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ==================== LOGOUT MODAL ==================== */}
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
                  <Icon name="logout-variant" size={36} color={colors.error} />
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Header
  header: {
    backgroundColor: colors.primaryLight,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -80,
    right: -60,
  },
  circle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -50,
    left: -40,
  },
  circle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: 60,
    left: 50,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoInner: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  headerTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },

  // Menu Section
  menuSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['2xl'],
    padding: spacing.sm,
    ...shadows.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.base,
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
    marginRight: spacing.md,
  },
  menuTitle: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.medium,
    color: colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.md,
  },

  // App Info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  appName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  appVersion: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Common Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    padding: spacing.xl,
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
    backgroundColor: colors.errorLight,
    top: -80,
    right: -40,
  },
  modalCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FECACA',
    top: -30,
    left: -30,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  // Change Password Modal
  passwordModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    overflow: 'hidden',
  },
  passwordModalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  passwordCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.purpleTint30,
    top: -80,
    right: -40,
  },
  passwordCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.purpleTint40,
    top: -30,
    left: -30,
  },
  passwordModalIconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  passwordModalIconOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purpleTint30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordModalTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  passwordModalSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  passwordForm: {
    width: '100%',
    gap: spacing.md,
  },
  inputContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fonts.sizes.base,
    color: colors.textPrimary,
  },
  changePasswordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    marginTop: spacing.lg,
    gap: spacing.sm,
    ...shadows.purple,
  },
  changePasswordBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
  btnDisabled: {
    opacity: 0.7,
  },

  // Full Screen Modal (Terms & Contact)
  fullModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullModalContent: {
    flex: 1,
    backgroundColor: colors.white,
    marginTop: 60,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    overflow: 'hidden',
  },
  fullModalHeader: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  fullModalHeaderDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
  fullModalCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -60,
    right: -40,
  },
  fullModalCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -30,
    left: -30,
  },
  fullModalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullModalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fullModalTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  fullModalSubtitle: {
    fontSize: fonts.sizes.md,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xs,
  },
  fullModalBody: {
    flex: 1,
  },
  fullModalBodyContent: {
    padding: spacing.xl,
  },
  fullModalFooter: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fullModalAcceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    gap: spacing.sm,
    ...shadows.purple,
  },
  fullModalAcceptBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  modalLoadingText: {
    fontSize: fonts.sizes.base,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  termsText: {
    fontSize: fonts.sizes.base,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Contact Styles
  contactContainer: {
    gap: spacing.md,
  },
  contactSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  contactSectionTitle: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.medium,
    color: colors.textPrimary,
  },
  contactAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noContactContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
  },
  noContactText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  noContactSubtext: {
    fontSize: fonts.sizes.md,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },

  // Result Modal
  resultModalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius['3xl'],
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultModalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  resultCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -80,
    right: -40,
  },
  resultCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: -30,
    left: -30,
  },
  resultModalIconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  resultModalIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultModalTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.sm,
  },
  resultModalMessage: {
    fontSize: fonts.sizes.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  resultModalBtn: {
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    alignItems: 'center',
  },
  resultModalBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },

  // Logout Modal
  logoutModalIconContainer: {
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  logoutModalIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  logoutModalSubtitle: {
    fontSize: fonts.sizes.base,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  logoutUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoutUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logoutUserAvatarText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  logoutUserInfo: {
    flex: 1,
  },
  logoutUserName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  logoutUserEmail: {
    fontSize: fonts.sizes.sm,
    color: colors.textMuted,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  logoutModalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    backgroundColor: colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutModalCancelText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textSecondary,
  },
  logoutModalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutModalConfirmBtnDisabled: {
    opacity: 0.7,
  },
  logoutModalConfirmText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },
});
