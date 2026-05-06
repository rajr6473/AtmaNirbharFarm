import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
  latitude: string;
  longitude: string;
  whatsapp: string;
}

const AllCustomersScreen = ({ navigation }: any) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setError(null);
      const response = await api.get('/api/v1/mobile/delivery/my_customers');
      const data = await response.json();

      console.log('Customers Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setCustomers(data.data.customers || []);
        setTotal(data.data.total || 0);
      } else {
        setError(data.message || 'Failed to load customers');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  const handleCall = (phone: string) => {
    if (phone && phone.trim()) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleWhatsApp = (phone: string) => {
    if (phone && phone.trim()) {
      Linking.openURL(`whatsapp://send?phone=91${phone}`);
    }
  };

  const handleEmail = (email: string) => {
    if (email && email.trim()) {
      Linking.openURL(`mailto:${email}`);
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

  const renderCustomerCard = ({ item }: { item: Customer }) => (
    <View style={styles.customerCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
        </View>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          <Text style={styles.customerId}>Customer ID: #{item.id}</Text>
        </View>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionBtn}
            onPress={() => handleCall(item.mobile)}
          >
            <Icon name="phone" size={20} color={colors.primary} />
          </TouchableOpacity>
          {item.whatsapp || item.mobile ? (
            <TouchableOpacity
              style={[styles.quickActionBtn, { backgroundColor: '#dcfce7' }]}
              onPress={() => handleWhatsApp(item.whatsapp || item.mobile)}
            >
              <Icon name="whatsapp" size={20} color="#16a34a" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Contact Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Icon name="phone-outline" size={18} color={colors.gray600} />
          <Text style={styles.detailText}>{item.mobile || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="email-outline" size={18} color={colors.gray600} />
          <Text style={styles.detailText} numberOfLines={1}>{item.email || 'N/A'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="map-marker-outline" size={18} color={colors.gray600} />
          <Text style={styles.detailText} numberOfLines={2}>{item.address || 'N/A'}</Text>
        </View>
        {item.latitude && item.longitude ? (
          <View style={styles.locationBadge}>
            <Icon name="crosshairs-gps" size={14} color={colors.success} />
            <Text style={styles.locationBadgeText}>Location Available</Text>
          </View>
        ) : (
          <View style={[styles.locationBadge, { backgroundColor: colors.warningLight }]}>
            <Icon name="crosshairs-gps" size={14} color={colors.warning} />
            <Text style={[styles.locationBadgeText, { color: colors.warning }]}>No Location</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('UpdateCustomerLocation', { customer: item })}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.infoLight }]}>
            <Icon name="map-marker-radius" size={20} color={colors.info} />
          </View>
          <Text style={styles.actionBtnText}>Update Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.navigate('UploadCustomerImage', { customer: item })}
        >
          <View style={[styles.actionIconContainer, { backgroundColor: colors.purpleTint30 }]}>
            <Icon name="camera" size={20} color={colors.primary} />
          </View>
          <Text style={styles.actionBtnText}>Upload Photo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>All Customers</Text>
          <View style={styles.refreshBtnPlaceholder} />
        </View>
        <View style={styles.loaderContainer}>
          <View style={styles.loaderIconContainer}>
            <Icon name="account-group" size={50} color={colors.primary} />
          </View>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Loading customers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Customers</Text>
        <TouchableOpacity
          style={styles.refreshBtn}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="refresh" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.purpleTint30 }]}>
            <Icon name="account-group" size={20} color={colors.primary} />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryNumber}>{total}</Text>
            <Text style={styles.summaryLabel}>Total Customers</Text>
          </View>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.successLight }]}>
            <Icon name="map-marker-check" size={20} color={colors.success} />
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryNumber}>
              {customers.filter(c => c.latitude && c.longitude).length}
            </Text>
            <Text style={styles.summaryLabel}>With Location</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      {error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCustomers}>
            <Icon name="refresh" size={20} color="#fff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : customers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Icon name="account-off-outline" size={60} color={colors.gray400} />
          </View>
          <Text style={styles.emptyTitle}>No Customers Found</Text>
          <Text style={styles.emptyText}>
            You don't have any customers assigned yet.{'\n'}Pull down to refresh.
          </Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCustomerCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </View>
  );
};

export default AllCustomersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshBtnPlaceholder: {
    width: 44,
    height: 44,
  },

  // Summary
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: spacing.lg,
    marginTop: -10,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  summaryNumber: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: fonts.sizes.xs,
    color: colors.gray600,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.gray300,
    marginHorizontal: spacing.sm,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.purpleTint30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.md,
    fontSize: fonts.sizes.lg,
    color: colors.gray600,
    fontWeight: fonts.weights.medium,
  },

  // List
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.lg,
  },

  // Customer Card
  customerCard: {
    backgroundColor: '#fff',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  customerId: {
    fontSize: fonts.sizes.sm,
    color: colors.gray600,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.purpleTint30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Details
  detailsSection: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  detailText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 4,
    gap: 6,
  },
  locationBadgeText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.success,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray100,
    paddingVertical: 14,
    borderRadius: borderRadius.lg,
    gap: 10,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fonts.sizes.lg,
    color: colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  retryBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: '#fff',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
});
