import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface CompanyInfo {
  name: string;
  mobile: string;
  email: string;
  address: string;
  website: string;
}

interface ContactData {
  agent_name: string;
  agent_mobile: string;
  agent_email: string;
  agent_address: string;
  company_info: CompanyInfo;
  support_hours: string;
  emergency_contact: string;
}

const ContactUsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setError(null);
      const response = await api.get('/api/v1/mobile/settings/contact');
      const data = await response.json();
      console.log('Contact Info Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setContactData(data.data);
      } else {
        setError(data.message || 'Failed to load contact information');
      }
    } catch (err) {
      console.error('Error fetching contact info:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchContactInfo();
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  const handleWebsite = (website: string) => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading contact info...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contact Us</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchContactInfo}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {/* Support Agent Section */}
        {contactData?.agent_name && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Support Agent</Text>
            <View style={styles.card}>
              <View style={styles.agentHeader}>
                <View style={styles.agentAvatar}>
                  <Icon name="headset" size={32} color={colors.primary} />
                </View>
                <View style={styles.agentInfo}>
                  <Text style={styles.agentName}>{contactData.agent_name}</Text>
                  <Text style={styles.agentRole}>Customer Support</Text>
                </View>
              </View>

              {contactData.agent_mobile && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleCall(contactData.agent_mobile)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                    <Icon name="phone" size={20} color="#10B981" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{contactData.agent_mobile}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {contactData.agent_email && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleEmail(contactData.agent_email)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <Icon name="email" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{contactData.agent_email}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {contactData.agent_address && (
                <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                    <Icon name="map-marker" size={20} color="#EF4444" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Address</Text>
                    <Text style={styles.contactValue}>{contactData.agent_address}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Company Information Section */}
        {contactData?.company_info && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.card}>
              <View style={styles.companyHeader}>
                <View style={styles.companyLogo}>
                  <Icon name="domain" size={28} color={colors.primary} />
                </View>
                <Text style={styles.companyName}>{contactData.company_info.name}</Text>
              </View>

              {contactData.company_info.mobile && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleCall(contactData.company_info.mobile)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#D1FAE5' }]}>
                    <Icon name="phone" size={20} color="#10B981" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Phone</Text>
                    <Text style={styles.contactValue}>{contactData.company_info.mobile}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {contactData.company_info.email && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleEmail(contactData.company_info.email)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#DBEAFE' }]}>
                    <Icon name="email" size={20} color="#3B82F6" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Email</Text>
                    <Text style={styles.contactValue}>{contactData.company_info.email}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {contactData.company_info.website && (
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleWebsite(contactData.company_info.website)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: '#E0E7FF' }]}>
                    <Icon name="web" size={20} color="#6366F1" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Website</Text>
                    <Text style={styles.contactValue}>{contactData.company_info.website}</Text>
                  </View>
                  <Icon name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}

              {contactData.company_info.address && (
                <View style={[styles.contactRow, { borderBottomWidth: 0 }]}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                    <Icon name="map-marker" size={20} color="#EF4444" />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactLabel}>Address</Text>
                    <Text style={styles.contactValue}>{contactData.company_info.address}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Support Hours & Emergency */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Support Hours</Text>
          <View style={styles.card}>
            {contactData?.support_hours && (
              <View style={styles.contactRow}>
                <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="clock-outline" size={20} color="#F59E0B" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Working Hours</Text>
                  <Text style={styles.contactValue}>{contactData.support_hours}</Text>
                </View>
              </View>
            )}

            {contactData?.emergency_contact && (
              <TouchableOpacity
                style={[styles.contactRow, { borderBottomWidth: 0 }]}
                onPress={() => handleCall(contactData.emergency_contact)}
              >
                <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <Icon name="phone-alert" size={20} color="#EF4444" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Emergency Contact</Text>
                  <Text style={[styles.contactValue, { color: '#EF4444', fontWeight: '600' }]}>
                    {contactData.emergency_contact}
                  </Text>
                </View>
                <Icon name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleCall(contactData?.emergency_contact || contactData?.agent_mobile || '')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="phone" size={24} color="#10B981" />
              </View>
              <Text style={styles.quickActionText}>Call Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleEmail(contactData?.company_info?.email || contactData?.agent_email || '')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
                <Icon name="email-fast" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickActionText}>Send Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => handleWebsite(contactData?.company_info?.website || '')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0E7FF' }]}>
                <Icon name="web" size={24} color="#6366F1" />
              </View>
              <Text style={styles.quickActionText}>Visit Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

export default ContactUsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  agentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: colors.purpleTint10,
  },
  agentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  agentInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  agentRole: {
    fontSize: 13,
    color: colors.textMuted,
  },
  companyHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: colors.purpleTint10,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
