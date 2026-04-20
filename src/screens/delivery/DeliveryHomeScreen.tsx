import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Linking,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface TaskItem {
  product_name: string;
  quantity: number;
  unit: string;
}

interface TaskCustomer {
  name: string;
  mobile: string;
  address: string;
  landmark?: string | null;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface TaskPayment {
  method: string | null;
  amount_to_collect: number;
  status: string | null;
}

interface Task {
  id: number;
  type: string;
  order_number: string;
  customer: TaskCustomer;
  items: TaskItem[];
  payment: TaskPayment;
  delivery_slot: string;
  priority: string;
  status: string;
  special_instructions?: string;
}

interface Summary {
  total_tasks: number;
  completed: number;
  pending: number;
  failed: number;
  total_collection: number;
}

interface RouteOptimization {
  suggested_sequence: number[];
  estimated_completion_time: string;
  total_distance: string;
}

const DeliveryHomeScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState('');
  const [deliveryPersonId, setDeliveryPersonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<Summary>({
    total_tasks: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    total_collection: 0,
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskDetailLoading, setTaskDetailLoading] = useState(false);

  // Action modal (success/error/loading)
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalType, setActionModalType] = useState<'loading' | 'success' | 'error'>('loading');
  const [actionModalMessage, setActionModalMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk mark done
  const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    loadUserData();
    fetchTodayTasks();
  }, []);

  const loadUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const idString = await AsyncStorage.getItem('userId');
      setUserName(name || 'Delivery Partner');
      if (idString) {
        setDeliveryPersonId(parseInt(idString, 10));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      setError(null);
      const response = await api.get('/api/v1/mobile/delivery/tasks/today');
      const data = await response.json();

      console.log('Today Tasks Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setSummary(data.data.summary || {
          total_tasks: 0,
          completed: 0,
          pending: 0,
          failed: 0,
          total_collection: 0,
        });
        setTasks(data.data.tasks || []);
        setRouteOptimization(data.data.route_optimization || null);
      } else {
        setError(data.message || 'Failed to load tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayTasks();
  };

  const fetchTaskDetails = async (taskId: number) => {
    setTaskDetailLoading(true);
    try {
      const response = await api.get(`/api/v1/mobile/delivery/tasks/${taskId}`);
      const data = await response.json();

      console.log('Task Details Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setSelectedTask(data.data.task);
        setShowTaskModal(true);
      } else {
        showActionResult('error', data.message || 'Failed to load task details');
      }
    } catch (err) {
      console.error('Error fetching task details:', err);
      showActionResult('error', 'Network error. Please try again.');
    } finally {
      setTaskDetailLoading(false);
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to track deliveries.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Return default location if geolocation fails
          resolve({
            latitude: 19.0750,
            longitude: 72.8775,
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );
    });
  };

  const showActionResult = (type: 'loading' | 'success' | 'error', message: string) => {
    setActionModalType(type);
    setActionModalMessage(message);
    setShowActionModal(true);

    if (type !== 'loading') {
      setTimeout(() => {
        setShowActionModal(false);
        if (type === 'success') {
          setShowTaskModal(false);
          fetchTodayTasks();
        }
      }, 2500);
    }
  };

  const startTask = async (taskId: number) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showActionResult('error', 'Location permission is required to start delivery');
      return;
    }

    setActionLoading(true);
    showActionResult('loading', 'Starting delivery...');

    try {
      const location = await getCurrentLocation();

      const response = await api.post(`/api/v1/mobile/delivery/tasks/${taskId}/start`, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      const data = await response.json();

      console.log('Start Task Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        showActionResult('success', 'Delivery started successfully!');
      } else {
        showActionResult('error', data.message || 'Failed to start delivery');
      }
    } catch (err) {
      console.error('Error starting task:', err);
      showActionResult('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const completeTask = async (taskId: number) => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showActionResult('error', 'Location permission is required to complete delivery');
      return;
    }

    setActionLoading(true);
    showActionResult('loading', 'Completing delivery...');

    try {
      const location = await getCurrentLocation();

      const response = await api.post(`/api/v1/mobile/delivery/tasks/${taskId}/complete`, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      });
      const data = await response.json();

      console.log('Complete Task Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        showActionResult('success', 'Delivery completed successfully!');
      } else {
        showActionResult('error', data.message || 'Failed to complete delivery');
      }
    } catch (err) {
      console.error('Error completing task:', err);
      showActionResult('error', 'Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getPendingTaskIds = (): number[] => {
    return tasks
      .filter(task => task.status === 'pending' || task.status === 'in_progress')
      .map(task => task.id);
  };

  const bulkMarkDone = async () => {
    const pendingIds = getPendingTaskIds();

    if (pendingIds.length === 0) {
      showActionResult('error', 'No pending tasks to mark as done');
      setShowBulkConfirmModal(false);
      return;
    }

    if (!deliveryPersonId) {
      showActionResult('error', 'Delivery person ID not found. Please login again.');
      setShowBulkConfirmModal(false);
      return;
    }

    setBulkProcessing(true);
    setShowBulkConfirmModal(false);
    showActionResult('loading', 'Marking all deliveries as complete...');

    try {
      const response = await api.post('/api/v1/mobile/delivery/bulk_mark_done', {
        delivery_ids: pendingIds,
        delivery_person_id: deliveryPersonId,
        completed_at: new Date().toISOString(),
      });
      const data = await response.json();

      console.log('Bulk Mark Done Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        showActionResult('success', `Successfully marked ${pendingIds.length} deliveries as complete!`);
      } else {
        showActionResult('error', data.message || 'Failed to mark deliveries as complete');
      }
    } catch (err) {
      console.error('Error in bulk mark done:', err);
      showActionResult('error', 'Network error. Please try again.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const callCustomer = (phone: string | null | undefined) => {
    if (!phone || phone.trim() === '') {
      Alert.alert(
        'Contact Unavailable',
        'Customer has not provided their mobile number. Please contact support for assistance.',
        [{ text: 'OK' }]
      );
      return;
    }
    Linking.openURL(`tel:${phone}`);
  };

  const openMaps = (address: string, lat?: number | null, lng?: number | null) => {
    if (lat && lng) {
      const url = Platform.OS === 'ios'
        ? `maps:0,0?q=${lat},${lng}`
        : `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(address)})`;
      Linking.openURL(url);
    } else if (address && address.trim() !== '') {
      // Show warning that exact location is not available, but try with address
      Alert.alert(
        'Approximate Location',
        'Customer has not provided exact location coordinates. Opening maps with address instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Maps',
            onPress: () => {
              const url = Platform.OS === 'ios'
                ? `maps:0,0?q=${encodeURIComponent(address)}`
                : `geo:0,0?q=${encodeURIComponent(address)}`;
              Linking.openURL(url);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Location Unavailable',
        'Customer has not provided their location or address. Please contact the customer for directions.',
        [{ text: 'OK' }]
      );
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return '#16a34a';
      case 'in_progress':
      case 'started':
        return '#2563eb';
      case 'pending':
        return '#F59E0B';
      case 'failed':
      case 'cancelled':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'check-circle';
      case 'in_progress':
      case 'started':
        return 'truck-delivery';
      case 'pending':
        return 'clock-outline';
      case 'failed':
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return '#dc2626';
      case 'normal':
        return '#2563eb';
      case 'low':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const renderTaskCard = (task: Task) => (
    <TouchableOpacity
      key={task.id}
      style={styles.taskCard}
      onPress={() => fetchTaskDetails(task.id)}
      activeOpacity={0.7}
    >
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.taskOrderInfo}>
          <Icon name="receipt" size={18} color="#2E7D32" />
          <Text style={styles.taskOrderNumber}>{task.order_number}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Icon name={getStatusIcon(task.status)} size={12} color="#fff" />
          <Text style={styles.statusText}>{task.status.replace('_', ' ')}</Text>
        </View>
      </View>

      {/* Customer Info */}
      <View style={styles.customerSection}>
        <View style={styles.customerInfo}>
          <Icon name="account" size={20} color="#374151" />
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{task.customer.name}</Text>
            <Text style={styles.customerAddress} numberOfLines={2}>{task.customer.address}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => callCustomer(task.customer.mobile)}
        >
          <Icon name="phone" size={20} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Items Preview */}
      <View style={styles.itemsPreview}>
        <Icon name="package-variant" size={16} color="#6b7280" />
        <Text style={styles.itemsText}>
          {task.items.length} item{task.items.length > 1 ? 's' : ''}: {task.items.map(i => `${i.product_name} (${i.quantity})`).join(', ')}
        </Text>
      </View>

      {/* Task Footer */}
      <View style={styles.taskFooter}>
        <View style={styles.slotInfo}>
          <Icon name="clock-outline" size={16} color="#F59E0B" />
          <Text style={styles.slotText}>{task.delivery_slot}</Text>
        </View>
        {task.payment.amount_to_collect > 0 ? (
          <View style={styles.collectInfo}>
            <Icon name="cash" size={16} color="#16a34a" />
            <Text style={styles.collectText}>₹{task.payment.amount_to_collect}</Text>
          </View>
        ) : null}
        {task.priority !== 'normal' ? (
          <View style={[styles.priorityBadge, { backgroundColor: `${getPriorityColor(task.priority)}15` }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
              {task.priority.toUpperCase()}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  // Full screen loader
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <View style={styles.loaderContent}>
          <View style={styles.loaderIconContainer}>
            <Icon name="truck-delivery" size={50} color="#2E7D32" />
          </View>
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
          <Text style={styles.loaderText}>Loading your tasks...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2D5A4A']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarContainer}>
                <Icon name="account" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{userName}</Text>
              </View>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#FEF3C7' }]}>
              <View style={styles.summaryIconContainer}>
                <Icon name="clock-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.summaryNumber}>{summary.pending}</Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#DBEAFE' }]}>
              <View style={styles.summaryIconContainer}>
                <Icon name="truck-delivery" size={24} color="#2563eb" />
              </View>
              <Text style={styles.summaryNumber}>{summary.total_tasks}</Text>
              <Text style={styles.summaryLabel}>Total Tasks</Text>
            </View>
          </View>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: '#D1FAE5' }]}>
              <View style={styles.summaryIconContainer}>
                <Icon name="check-circle" size={24} color="#16a34a" />
              </View>
              <Text style={styles.summaryNumber}>{summary.completed}</Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: '#FEE2E2' }]}>
              <View style={styles.summaryIconContainer}>
                <Icon name="close-circle" size={24} color="#dc2626" />
              </View>
              <Text style={styles.summaryNumber}>{summary.failed}</Text>
              <Text style={styles.summaryLabel}>Failed</Text>
            </View>
          </View>

          {/* Total Collection */}
          <View style={styles.collectionCard}>
            <Icon name="cash-multiple" size={28} color="#2E7D32" />
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionLabel}>Today's Collection</Text>
              <Text style={styles.collectionAmount}>₹{summary.total_collection}</Text>
            </View>
          </View>
        </View>

        {/* Route Optimization Info */}
        {routeOptimization ? (
          <View style={styles.routeCard}>
            <View style={styles.routeHeader}>
              <Icon name="map-marker-path" size={22} color="#2E7D32" />
              <Text style={styles.routeTitle}>Route Overview</Text>
            </View>
            <View style={styles.routeDetails}>
              <View style={styles.routeItem}>
                <Icon name="clock-fast" size={18} color="#6b7280" />
                <Text style={styles.routeText}>{routeOptimization.estimated_completion_time}</Text>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeItem}>
                <Icon name="map-marker-distance" size={18} color="#6b7280" />
                <Text style={styles.routeText}>{routeOptimization.total_distance}</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Today's Tasks Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Icon name="clipboard-list-outline" size={22} color="#2E7D32" />
            <Text style={styles.sectionTitle}>Today's Deliveries</Text>
          </View>
          <View style={styles.taskCount}>
            <Text style={styles.taskCountText}>{tasks.length}</Text>
          </View>
        </View>

        {/* Bulk Mark Done Button */}
        {summary.pending > 0 && (
          <TouchableOpacity
            style={styles.bulkMarkDoneButton}
            onPress={() => setShowBulkConfirmModal(true)}
            disabled={bulkProcessing}
          >
            <View style={styles.bulkButtonContent}>
              <View style={styles.bulkIconContainer}>
                <Icon name="check-all" size={24} color="#fff" />
              </View>
              <View style={styles.bulkTextContainer}>
                <Text style={styles.bulkButtonTitle}>Mark All as Delivered</Text>
                <Text style={styles.bulkButtonSubtitle}>
                  {summary.pending} pending {summary.pending === 1 ? 'delivery' : 'deliveries'}
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={50} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTodayTasks}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="package-variant-closed" size={60} color="#9ca3af" />
            </View>
            <Text style={styles.emptyTitle}>No Tasks Today</Text>
            <Text style={styles.emptyText}>
              You don't have any deliveries assigned for today.{'\n'}
              Pull down to refresh.
            </Text>
          </View>
        ) : (
          <View style={styles.tasksContainer}>
            {tasks.map(renderTaskCard)}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Task Detail Modal */}
      <Modal visible={showTaskModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.taskModalContent}>
            {selectedTask ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <Icon name="receipt" size={24} color="#2E7D32" />
                    <Text style={styles.modalTitle}>{selectedTask.order_number}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowTaskModal(false)}
                  >
                    <Icon name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>

                {/* Status Badge */}
                <View style={[styles.modalStatusBadge, { backgroundColor: getStatusColor(selectedTask.status) }]}>
                  <Icon name={getStatusIcon(selectedTask.status)} size={18} color="#fff" />
                  <Text style={styles.modalStatusText}>{selectedTask.status.replace('_', ' ')}</Text>
                </View>

                {/* Customer Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Customer Details</Text>
                  <View style={styles.customerCard}>
                    <View style={styles.customerMainInfo}>
                      <View style={styles.customerAvatar}>
                        <Icon name="account" size={28} color="#2E7D32" />
                      </View>
                      <View style={styles.customerTextInfo}>
                        <Text style={styles.customerNameLarge}>{selectedTask.customer.name}</Text>
                        <Text style={styles.customerPhone}>{selectedTask.customer.mobile}</Text>
                      </View>
                    </View>
                    <View style={styles.customerActions}>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => callCustomer(selectedTask.customer.mobile)}
                      >
                        <Icon name="phone" size={22} color="#2E7D32" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => openMaps(
                          selectedTask.customer.address,
                          selectedTask.customer.latitude,
                          selectedTask.customer.longitude
                        )}
                      >
                        <Icon name="navigation-variant" size={22} color="#2563eb" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.addressCard}>
                    <Icon name="map-marker" size={20} color="#6b7280" />
                    <Text style={styles.addressFullText}>{selectedTask.customer.address}</Text>
                  </View>
                  {selectedTask.customer.landmark ? (
                    <View style={styles.landmarkRow}>
                      <Icon name="flag-outline" size={16} color="#6b7280" />
                      <Text style={styles.landmarkText}>Landmark: {selectedTask.customer.landmark}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Items Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Items</Text>
                  <View style={styles.itemsCard}>
                    {selectedTask.items.map((item, index) => (
                      <View key={index} style={styles.itemRow}>
                        <View style={styles.itemDot} />
                        <Text style={styles.itemName}>{item.product_name}</Text>
                        <Text style={styles.itemQuantity}>
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Delivery Info Section */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Delivery Info</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Icon name="clock-outline" size={20} color="#F59E0B" />
                      <Text style={styles.infoLabel}>Time Slot</Text>
                      <Text style={styles.infoValue}>{selectedTask.delivery_slot}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Icon name="flag" size={20} color={getPriorityColor(selectedTask.priority)} />
                      <Text style={styles.infoLabel}>Priority</Text>
                      <Text style={[styles.infoValue, { color: getPriorityColor(selectedTask.priority) }]}>
                        {selectedTask.priority}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Payment Section */}
                {selectedTask.payment.amount_to_collect > 0 ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Payment</Text>
                    <View style={styles.paymentCard}>
                      <Icon name="cash" size={28} color="#16a34a" />
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentLabel}>Amount to Collect</Text>
                        <Text style={styles.paymentAmount}>₹{selectedTask.payment.amount_to_collect}</Text>
                      </View>
                      {selectedTask.payment.method ? (
                        <View style={styles.paymentMethod}>
                          <Text style={styles.paymentMethodText}>{selectedTask.payment.method}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ) : null}

                {/* Special Instructions */}
                {selectedTask.special_instructions ? (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Special Instructions</Text>
                    <View style={styles.instructionsCard}>
                      <Icon name="information-outline" size={20} color="#F59E0B" />
                      <Text style={styles.instructionsText}>{selectedTask.special_instructions}</Text>
                    </View>
                  </View>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                  {/* {selectedTask.status === 'pending' ? (
                    <TouchableOpacity
                      style={[styles.primaryActionButton, { backgroundColor: '#2563eb' }]}
                      onPress={() => startTask(selectedTask.id)}
                      disabled={actionLoading}
                    >
                      <Icon name="play-circle" size={24} color="#fff" />
                      <Text style={styles.primaryActionText}>Start Delivery</Text>
                    </TouchableOpacity>
                  ) : selectedTask.status === 'in_progress' || selectedTask.status === 'started' ? (
                    <TouchableOpacity
                      style={[styles.primaryActionButton, { backgroundColor: '#16a34a' }]}
                      onPress={() => completeTask(selectedTask.id)}
                      disabled={actionLoading}
                    >
                      <Icon name="check-circle" size={24} color="#fff" />
                      <Text style={styles.primaryActionText}>Complete Delivery</Text>
                    </TouchableOpacity>
                  ) : null} */}

                  <View style={styles.secondaryActions}>
                    <TouchableOpacity
                      style={styles.secondaryActionButton}
                      onPress={() => callCustomer(selectedTask.customer.mobile)}
                    >
                      <Icon name="phone" size={22} color="#2E7D32" />
                      <Text style={styles.secondaryActionText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.secondaryActionButton}
                      onPress={() => openMaps(
                        selectedTask.customer.address,
                        selectedTask.customer.latitude,
                        selectedTask.customer.longitude
                      )}
                    >
                      <Icon name="navigation-variant" size={22} color="#2563eb" />
                      <Text style={styles.secondaryActionText}>Navigate</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            ) : (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.modalLoadingText}>Loading task details...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Action Result Modal - Premium Design */}
      <Modal visible={showActionModal} transparent animationType="fade">
        <View style={styles.actionModalOverlay}>
          <View style={styles.actionModalContent}>
            {/* Decorative Background */}
            <View style={styles.actionModalDecoration}>
              {actionModalType === 'success' ? (
                <>
                  <View style={[styles.actionDecoCircle1, { backgroundColor: '#f0fdf4' }]} />
                  <View style={[styles.actionDecoCircle2, { backgroundColor: '#dcfce7' }]} />
                </>
              ) : actionModalType === 'error' ? (
                <>
                  <View style={[styles.actionDecoCircle1, { backgroundColor: '#fef2f2' }]} />
                  <View style={[styles.actionDecoCircle2, { backgroundColor: '#fee2e2' }]} />
                </>
              ) : (
                <>
                  <View style={[styles.actionDecoCircle1, { backgroundColor: '#f0fdf4' }]} />
                  <View style={[styles.actionDecoCircle2, { backgroundColor: '#dcfce7' }]} />
                </>
              )}
            </View>

            {actionModalType === 'loading' ? (
              <>
                <View style={styles.loadingIconOuter}>
                  <View style={styles.loadingIconMiddle}>
                    <View style={styles.loadingIconInner}>
                      <ActivityIndicator size="large" color="#fff" />
                    </View>
                  </View>
                </View>
                <Text style={styles.actionModalTitle}>Please Wait</Text>
                <Text style={styles.actionModalMessage}>{actionModalMessage}</Text>
                <View style={styles.loadingDots}>
                  <View style={[styles.loadingDot, { opacity: 0.4 }]} />
                  <View style={[styles.loadingDot, { opacity: 0.7 }]} />
                  <View style={[styles.loadingDot, { opacity: 1 }]} />
                </View>
              </>
            ) : actionModalType === 'success' ? (
              <>
                <View style={styles.successIconOuter}>
                  <View style={styles.successIconMiddle}>
                    <View style={styles.successIconInner}>
                      <Icon name="check-bold" size={40} color="#fff" />
                    </View>
                  </View>
                </View>
                <Text style={[styles.actionModalTitle, { color: '#16a34a' }]}>Success!</Text>
                <Text style={styles.actionModalMessage}>{actionModalMessage}</Text>
                <View style={styles.successCheckmark}>
                  <Icon name="check-circle" size={24} color="#16a34a" />
                  <Text style={styles.successCheckmarkText}>Task completed</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.errorIconOuter}>
                  <View style={styles.errorIconMiddle}>
                    <View style={styles.errorIconInner}>
                      <Icon name="close-thick" size={40} color="#fff" />
                    </View>
                  </View>
                </View>
                <Text style={[styles.actionModalTitle, { color: '#dc2626' }]}>Error</Text>
                <Text style={styles.actionModalMessage}>{actionModalMessage}</Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setShowActionModal(false)}
                >
                  <Icon name="close" size={18} color="#dc2626" />
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Bulk Confirm Modal */}
      <Modal visible={showBulkConfirmModal} transparent animationType="fade">
        <View style={styles.bulkModalOverlay}>
          <View style={styles.bulkModalContent}>
            {/* Decorative Background */}
            <View style={styles.bulkModalDecoration}>
              <View style={styles.bulkCircle1} />
              <View style={styles.bulkCircle2} />
            </View>

            {/* Icon */}
            <View style={styles.bulkModalIconContainer}>
              <View style={styles.bulkModalIconOuter}>
                <View style={styles.bulkModalIconInner}>
                  <Icon name="check-all" size={36} color="#fff" />
                </View>
              </View>
            </View>

            {/* Content */}
            <Text style={styles.bulkModalTitle}>Mark All Complete?</Text>
            <Text style={styles.bulkModalSubtitle}>
              This will mark {summary.pending} pending {summary.pending === 1 ? 'delivery' : 'deliveries'} as completed.
            </Text>

            {/* Summary Card */}
            <View style={styles.bulkSummaryCard}>
              <View style={styles.bulkSummaryItem}>
                <Icon name="package-variant" size={20} color="#F59E0B" />
                <Text style={styles.bulkSummaryText}>{summary.pending} Pending</Text>
              </View>
              <View style={styles.bulkSummaryDivider} />
              <View style={styles.bulkSummaryItem}>
                <Icon name="check-circle" size={20} color="#16a34a" />
                <Text style={styles.bulkSummaryText}>Will be Completed</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.bulkModalButtons}>
              <TouchableOpacity
                style={styles.bulkModalCancelBtn}
                onPress={() => setShowBulkConfirmModal(false)}
              >
                <Text style={styles.bulkModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bulkModalConfirmBtn}
                onPress={bulkMarkDone}
              >
                <Icon name="check-all" size={20} color="#fff" />
                <Text style={styles.bulkModalConfirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Task Detail Loading Indicator */}
      {taskDetailLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
      ) : null}
    </View>
  );
};

export default DeliveryHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Loader
  loaderContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContent: {
    alignItems: 'center',
  },
  loaderIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: spacing.base,
    fontSize: fonts.sizes.lg,
    color: colors.primaryLight,
    fontWeight: fonts.weights.semibold,
  },

  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  welcomeText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  userName: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.white,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 6,
  },
  onlineText: {
    fontSize: fonts.sizes.sm,
    fontWeight: fonts.weights.semibold,
    color: colors.white,
  },

  // Summary
  summaryContainer: {
    paddingHorizontal: spacing.base,
    marginTop: -15,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryIconContainer: {
    marginBottom: 8,
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontWeight: '500',
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 16,
    marginTop: 4,
  },
  collectionInfo: {
    marginLeft: 14,
  },
  collectionLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  collectionAmount: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.primaryLight,
  },

  // Route Card
  routeCard: {
    backgroundColor: colors.white,
    marginHorizontal: 22,
    marginTop: spacing.base,
    padding: spacing.base,
    borderRadius: borderRadius.base,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  routeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  routeDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 20,
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  taskCount: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
  },
  taskCountText: {
    color: colors.white,
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
  },

  // Tasks
  tasksContainer: {
    paddingHorizontal: spacing.base,
  },
  taskCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  taskOrderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskOrderNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  customerAddress: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  itemsText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  taskFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  collectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  collectText: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Error & Empty
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontWeight: fonts.weights.semibold,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Task Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  taskModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    marginBottom: 20,
  },
  modalStatusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  customerMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  customerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerTextInfo: {
    flex: 1,
  },
  customerNameLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
  },
  customerPhone: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  customerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  addressFullText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  landmarkText: {
    fontSize: 13,
    color: '#6b7280',
  },
  itemsCard: {
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.md,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  itemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    padding: 16,
    borderRadius: 14,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 14,
  },
  paymentLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  paymentAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16a34a',
  },
  paymentMethod: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
  },
  instructionsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  actionButtonsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  primaryActionText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  modalLoading: {
    padding: 60,
    alignItems: 'center',
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#6b7280',
  },

  // Action Modal - Premium
  actionModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  actionModalContent: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '90%',
    maxWidth: 340,
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  actionModalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 150,
  },
  actionDecoCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: -100,
    right: -50,
  },
  actionDecoCircle2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -40,
    left: -40,
  },
  loadingIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  loadingIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  successIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  errorIconMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 10,
  },
  actionModalMessage: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  successCheckmark: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  successCheckmarkText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  dismissButton: {
    flexDirection: 'row',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    gap: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },

  // Loading Overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bulk Mark Done Button
  bulkMarkDoneButton: {
    marginHorizontal: 22,
    marginBottom: 16,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bulkButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  bulkIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bulkTextContainer: {
    flex: 1,
  },
  bulkButtonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  bulkButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Bulk Modal
  bulkModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  bulkModalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    overflow: 'hidden',
  },
  bulkModalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  bulkCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0fdf4',
    top: -80,
    right: -40,
  },
  bulkCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    top: -30,
    left: -30,
  },
  bulkModalIconContainer: {
    marginBottom: 20,
    marginTop: 10,
  },
  bulkModalIconOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkModalIconInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkModalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  bulkModalSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  bulkSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bulkSummaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bulkSummaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  bulkSummaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  bulkModalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  bulkModalCancelBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  bulkModalConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bulkModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
