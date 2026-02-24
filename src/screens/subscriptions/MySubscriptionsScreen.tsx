import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius, shadows } from '../../theme';

interface Product {
  id: number;
  name: string;
  price: string | number;
  image?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
}

interface Subscription {
  id: number;
  customer?: Customer;
  product?: Product;
  // Legacy fields for backwards compatibility
  product_id?: number;
  product_name?: string;
  product_image?: string;
  quantity: string | number;
  unit?: string;
  start_date: string;
  end_date: string;
  delivery_time: string;
  delivery_pattern?: string;  // API uses this
  frequency?: string;         // Legacy field
  delivery_address?: string;
  pincode?: string;
  status: string;
  is_active?: boolean;
  notes?: string;
  created_at?: string;
}

type ActionType = 'pause' | 'resume' | 'cancel';

const MySubscriptionsScreen = ({ navigation }: any) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'paused' | 'cancelled'>('active');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<ActionType>('pause');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Success/Error modal
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [activeTab])
  );

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/ecommerce/subscriptions?page=1&per_page=20&status=${activeTab}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setSubscriptions(data.data?.subscriptions || data.subscriptions || []);
      } else {
        console.error('Failed to fetch subscriptions:', data.message);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const openActionModal = (subscription: Subscription, action: ActionType) => {
    setSelectedSubscription(subscription);
    setActionType(action);
    setModalVisible(true);
  };

  const handleAction = async () => {
    if (!selectedSubscription) return;

    try {
      setActionLoading(true);

      const response = await api.put(`/ecommerce/subscriptions/${selectedSubscription.id}/${actionType}`, {});
      console.log(`Response for ${actionType} subscription:`, response);
      const data = await response.json();
      console.log(`Data for ${actionType} subscription:`, data);

      setModalVisible(false);

      if (response.ok && data.success) {
        showResultModal(true, getSuccessMessage(actionType));
        fetchSubscriptions();
      } else {
        showResultModal(false, data.message || `Failed to ${actionType} subscription`);
      }
    } catch (error) {
      console.error(`Error ${actionType} subscription:`, error);
      setModalVisible(false);
      showResultModal(false, 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const showResultModal = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultModalVisible(true);
  };

  const getSuccessMessage = (action: ActionType): string => {
    switch (action) {
      case 'pause':
        return 'Subscription paused successfully. You can resume it anytime.';
      case 'resume':
        return 'Subscription resumed successfully. Deliveries will continue as scheduled.';
      case 'cancel':
        return 'Subscription cancelled successfully.';
      default:
        return 'Action completed successfully.';
    }
  };

  const getActionColor = (action: ActionType): string => {
    switch (action) {
      case 'pause':
        return '#FF9800';
      case 'resume':
        return '#2E7D32';
      case 'cancel':
        return '#dc2626';
      default:
        return '#666';
    }
  };

  const getActionIcon = (action: ActionType): string => {
    switch (action) {
      case 'pause':
        return '⏸️';
      case 'resume':
        return '▶️';
      case 'cancel':
        return '✖️';
      default:
        return '•';
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#2E7D32';
      case 'paused':
        return '#FF9800';
      case 'cancelled':
        return '#dc2626';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatFrequency = (frequency: string): string => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  // Helper to get product name from subscription
  const getProductName = (subscription: Subscription): string => {
    if (subscription.product?.name) return subscription.product.name;
    if (subscription.product_name) return subscription.product_name;
    if (subscription.product?.id) return `Product #${subscription.product.id}`;
    if (subscription.product_id) return `Product #${subscription.product_id}`;
    return 'Unknown Product';
  };

  // Helper to get product price from subscription
  const getProductPrice = (subscription: Subscription): string => {
    if (subscription.product?.price) {
      const price = typeof subscription.product.price === 'string'
        ? parseFloat(subscription.product.price)
        : subscription.product.price;
      return `₹${price.toFixed(2)}`;
    }
    return '';
  };

  // Helper to get delivery pattern/frequency
  const getDeliveryPattern = (subscription: Subscription): string => {
    return subscription.delivery_pattern || subscription.frequency || 'daily';
  };

  // Helper to get quantity with unit
  const getQuantityDisplay = (subscription: Subscription): string => {
    const qty = typeof subscription.quantity === 'string'
      ? parseFloat(subscription.quantity)
      : subscription.quantity;
    const unit = subscription.unit || '';
    return unit ? `${qty} ${unit}` : `${qty}`;
  };

  const renderSubscriptionCard = (subscription: Subscription) => {
    const isActive = subscription.status?.toLowerCase() === 'active';
    const isPaused = subscription.status?.toLowerCase() === 'paused';
    const isCancelled = subscription.status?.toLowerCase() === 'cancelled';
    const productName = getProductName(subscription);
    const productPrice = getProductPrice(subscription);
    const deliveryPattern = getDeliveryPattern(subscription);
    const quantityDisplay = getQuantityDisplay(subscription);

    return (
      <View key={subscription.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <Text style={styles.productName}>{productName}</Text>
            {productPrice ? (
              <Text style={styles.productPrice}>{productPrice}</Text>
            ) : null}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusBadgeColor(subscription.status) },
              ]}
            >
              <Text style={styles.statusText}>{subscription.status?.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.frequencyBadge}>
            <Text style={styles.frequencyText}>{formatFrequency(deliveryPattern)}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📦 Quantity:</Text>
            <Text style={styles.detailValue}>{quantityDisplay}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>📅 Start Date:</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.start_date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🏁 End Date:</Text>
            <Text style={styles.detailValue}>{formatDate(subscription.end_date)}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>🕐 Delivery Time:</Text>
            <Text style={styles.detailValue}>{formatFrequency(subscription.delivery_time || 'morning')}</Text>
          </View>

          {subscription.delivery_address ? (
            <View style={styles.addressRow}>
              <Text style={styles.detailLabel}>📍 Address:</Text>
              <Text style={styles.addressValue}>
                {subscription.delivery_address}
              </Text>
            </View>
          ) : null}

          {subscription.pincode ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>📮 Pincode:</Text>
              <Text style={styles.detailValue}>{subscription.pincode}</Text>
            </View>
          ) : null}

          {subscription.notes ? (
            <View style={styles.notesRow}>
              <Text style={styles.detailLabel}>📝 Notes:</Text>
              <Text style={styles.notesValue}>{subscription.notes}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          {isActive && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}
                onPress={() => openActionModal(subscription, 'pause')}
              >
                <Text style={[styles.actionButtonText, { color: '#FF9800' }]}>⏸️ Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFEBEE', borderColor: '#dc2626' }]}
                onPress={() => openActionModal(subscription, 'cancel')}
              >
                <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>✖️ Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {isPaused && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#E8F5E9', borderColor: '#2E7D32' }]}
                onPress={() => openActionModal(subscription, 'resume')}
              >
                <Text style={[styles.actionButtonText, { color: '#2E7D32' }]}>▶️ Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FFEBEE', borderColor: '#dc2626' }]}
                onPress={() => openActionModal(subscription, 'cancel')}
              >
                <Text style={[styles.actionButtonText, { color: '#dc2626' }]}>✖️ Cancel</Text>
              </TouchableOpacity>
            </>
          )}

          {isCancelled && (
            <View style={styles.cancelledFooter}>
              <Text style={styles.cancelledText}>This subscription has been cancelled</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="calendar-check" size={24} color="#fff" />
          <Text style={styles.headerTitle}>My Subscriptions</Text>
        </View>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.getParent()?.navigate('Explore')}
        >
          <Icon name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'paused' && styles.tabActive]}
          onPress={() => setActiveTab('paused')}
        >
          <Text style={[styles.tabText, activeTab === 'paused' && styles.tabTextActive]}>
            Paused
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'cancelled' && styles.tabActive]}
          onPress={() => setActiveTab('cancelled')}
        >
          <Text style={[styles.tabText, activeTab === 'cancelled' && styles.tabTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {subscriptions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="calendar-blank-outline" size={60} color="#9ca3af" />
              </View>
              <Text style={styles.emptyTitle}>No {activeTab} subscriptions</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'active'
                  ? 'Start a subscription to get regular deliveries'
                  : `You don't have any ${activeTab} subscriptions`}
              </Text>
              {activeTab === 'active' ? (
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => navigation.getParent()?.navigate('Explore')}
                >
                  <Icon name="magnify" size={20} color="#fff" />
                  <Text style={styles.browseButtonText}>Browse Products</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            subscriptions.map(renderSubscriptionCard)
          )}
        </ScrollView>
      )}

      {/* Action Confirmation Modal */}
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalIcon}>{getActionIcon(actionType)}</Text>
            <Text style={styles.modalTitle}>
              {actionType.charAt(0).toUpperCase() + actionType.slice(1)} Subscription?
            </Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to {actionType} this subscription?
              {actionType === 'cancel' && '\n\nThis action cannot be undone.'}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setModalVisible(false)}
                disabled={actionLoading}
              >
                <Text style={styles.modalCancelText}>No, Go Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: getActionColor(actionType) }]}
                onPress={handleAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    Yes, {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result Modal */}
      <Modal transparent visible={resultModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.resultIcon}>{resultSuccess ? '✅' : '❌'}</Text>
            <Text style={styles.modalTitle}>{resultSuccess ? 'Success!' : 'Error'}</Text>
            <Text style={styles.modalMessage}>{resultMessage}</Text>

            <TouchableOpacity
              style={[
                styles.resultButton,
                { backgroundColor: resultSuccess ? '#2E7D32' : '#dc2626' },
              ]}
              onPress={() => setResultModalVisible(false)}
            >
              <Text style={styles.modalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MySubscriptionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    paddingTop: 50,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  exploreButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#2D5A4A',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  browseButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3C34',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cardHeaderLeft: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryLight,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  frequencyBadge: {
    backgroundColor: '#1A3C34',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Card Body
  cardBody: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  addressRow: {
    marginBottom: 10,
  },
  addressValue: {
    fontSize: 13,
    color: '#333',
    marginTop: 4,
    lineHeight: 18,
  },
  notesRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  notesValue: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Card Footer
  cardFooter: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: '#FAFAFA',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelledFooter: {
    flex: 1,
    alignItems: 'center',
  },
  cancelledText: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  resultIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  resultButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
  },
});
