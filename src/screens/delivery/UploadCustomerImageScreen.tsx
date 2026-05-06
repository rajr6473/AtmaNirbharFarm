import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  StatusBar,
  ScrollView,
  Platform,
  Alert,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../utils/api';
import { colors, fonts, spacing, borderRadius } from '../../theme';

interface Customer {
  id: number;
  name: string;
  mobile: string;
  email: string;
  address: string;
}

type ImageType = 'profile' | 'house' | 'personal';

const UploadCustomerImageScreen = ({ navigation, route }: any) => {
  const { customer } = route.params as { customer: Customer };

  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [imageType, setImageType] = useState<ImageType>('profile');
  const [uploading, setUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const imageTypeOptions: { type: ImageType; label: string; icon: string; color: string; bg: string }[] = [
    { type: 'profile', label: 'Profile', icon: 'account-circle', color: colors.primary, bg: colors.purpleTint30 },
    { type: 'house', label: 'House', icon: 'home', color: colors.info, bg: colors.infoLight },
    { type: 'personal', label: 'Personal', icon: 'card-account-details', color: colors.success, bg: colors.successLight },
  ];

  // Request camera permission
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to take customer photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Camera Permission Required',
            'Camera permission is required to take photos. Please enable it in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        } else {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return false;
        }
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions via Info.plist
  };

  // Request photo library permission
  const requestGalleryPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        // Android 13+ uses READ_MEDIA_IMAGES, older versions use READ_EXTERNAL_STORAGE
        const permission = Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const granted = await PermissionsAndroid.request(
          permission,
          {
            title: 'Photo Library Permission',
            message: 'This app needs access to your photos to select customer images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return true;
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            'Photo Library Permission Required',
            'Photo library access is required to select images. Please enable it in app settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
            ]
          );
          return false;
        } else {
          Alert.alert('Permission Denied', 'Photo library access is required to select images.');
          return false;
        }
      } catch (err) {
        console.warn('Gallery permission error:', err);
        return false;
      }
    }
    return true; // iOS handles permissions via Info.plist
  };

  const openCamera = async () => {
    setShowImagePickerModal(false);

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
    });

    if (result.didCancel) {
      console.log('User cancelled camera');
    } else if (result.errorCode) {
      console.error('Camera Error:', result.errorMessage);
      if (result.errorCode === 'camera_unavailable') {
        Alert.alert('Camera Unavailable', 'Camera is not available on this device.');
      } else if (result.errorCode === 'permission') {
        Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      } else {
        Alert.alert('Error', result.errorMessage || 'Failed to open camera.');
      }
    } else if (result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    setShowImagePickerModal(false);

    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      return;
    }

    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
      includeBase64: false,
    });

    if (result.didCancel) {
      console.log('User cancelled image picker');
    } else if (result.errorCode) {
      console.error('Gallery Error:', result.errorMessage);
      if (result.errorCode === 'permission') {
        Alert.alert('Permission Required', 'Photo library access is required to select images.');
      } else {
        Alert.alert('Error', result.errorMessage || 'Failed to open gallery.');
      }
    } else if (result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !selectedImage.uri) {
      Alert.alert('No Image', 'Please select an image to upload');
      return;
    }

    setUploading(true);

    try {
      const token = await AsyncStorage.getItem('authToken');

      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: selectedImage.type || 'image/jpeg',
        name: selectedImage.fileName || 'customer_image.jpg',
      } as any);
      formData.append('image_type', imageType);

      console.log('Uploading image for customer:', customer.id);
      console.log('Image type:', imageType);
      console.log('Image URI:', selectedImage.uri);

      const response = await fetch(
        `${BASE_URL}api/v1/mobile/delivery/customers/${customer.id}/upload_image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();
      console.log('Upload Response:', JSON.stringify(data, null, 2));

      if (response.ok && data.success) {
        setShowSuccessModal(true);
      } else {
        Alert.alert('Upload Failed', data.message || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      Alert.alert('Network Error', 'Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryLight} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Photo</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info Card */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Icon name="account" size={32} color="#fff" />
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerMobile}>{customer.mobile}</Text>
          </View>
        </View>

        {/* Image Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Image Type</Text>
          <View style={styles.imageTypeRow}>
            {imageTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.imageTypeCard,
                  imageType === option.type && styles.imageTypeCardActive,
                  imageType === option.type && { borderColor: option.color },
                ]}
                onPress={() => setImageType(option.type)}
              >
                <View style={[styles.imageTypeIcon, { backgroundColor: option.bg }]}>
                  <Icon name={option.icon} size={28} color={option.color} />
                </View>
                <Text style={[
                  styles.imageTypeLabel,
                  imageType === option.type && { color: option.color, fontWeight: '700' }
                ]}>
                  {option.label}
                </Text>
                {imageType === option.type && (
                  <View style={[styles.checkBadge, { backgroundColor: option.color }]}>
                    <Icon name="check" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image Preview / Select Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photo</Text>

          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={removeSelectedImage}
                >
                  <Icon name="close" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              <View style={styles.imageInfo}>
                <Icon name="image" size={18} color={colors.gray600} />
                <Text style={styles.imageInfoText} numberOfLines={1}>
                  {selectedImage.fileName || 'Selected Image'}
                </Text>
                <Text style={styles.imageInfoSize}>
                  {selectedImage.fileSize ? `${(selectedImage.fileSize / 1024).toFixed(1)} KB` : ''}
                </Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectImageBtn}
              onPress={() => setShowImagePickerModal(true)}
            >
              <View style={styles.selectImageIcon}>
                <Icon name="camera-plus" size={40} color={colors.primary} />
              </View>
              <Text style={styles.selectImageTitle}>Tap to add photo</Text>
              <Text style={styles.selectImageSubtitle}>Take a photo or choose from gallery</Text>
            </TouchableOpacity>
          )}

          {/* Change Image Button */}
          {selectedImage && (
            <TouchableOpacity
              style={styles.changeImageBtn}
              onPress={() => setShowImagePickerModal(true)}
            >
              <Icon name="camera" size={20} color={colors.primary} />
              <Text style={styles.changeImageBtnText}>Change Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <View style={styles.guidelinesHeader}>
            <Icon name="information" size={20} color={colors.info} />
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Icon name="check-circle" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Use JPG or PNG format</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Icon name="check-circle" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>Ensure good lighting and clear image</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Icon name="check-circle" size={16} color={colors.success} />
            <Text style={styles.guidelineText}>For house photo, capture the entrance clearly</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.uploadBtn,
            (!selectedImage || uploading) && styles.uploadBtnDisabled
          ]}
          onPress={handleUpload}
          disabled={!selectedImage || uploading}
        >
          {uploading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.uploadBtnText}>Uploading...</Text>
            </>
          ) : (
            <>
              <Icon name="cloud-upload" size={22} color="#fff" />
              <Text style={styles.uploadBtnText}>Upload Photo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal visible={showImagePickerModal} transparent animationType="slide">
        <TouchableOpacity
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePickerModal(false)}
        >
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHandle} />
            <Text style={styles.pickerModalTitle}>Select Photo</Text>

            <TouchableOpacity style={styles.pickerOption} onPress={openCamera}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: colors.purpleTint30 }]}>
                <Icon name="camera" size={28} color={colors.primary} />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionTitle}>Take Photo</Text>
                <Text style={styles.pickerOptionSubtitle}>Use your camera to capture</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.pickerOption} onPress={openGallery}>
              <View style={[styles.pickerOptionIcon, { backgroundColor: colors.infoLight }]}>
                <Icon name="image-multiple" size={28} color={colors.info} />
              </View>
              <View style={styles.pickerOptionText}>
                <Text style={styles.pickerOptionTitle}>Choose from Gallery</Text>
                <Text style={styles.pickerOptionSubtitle}>Select from your photos</Text>
              </View>
              <Icon name="chevron-right" size={24} color={colors.gray400} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.pickerCancelBtn}
              onPress={() => setShowImagePickerModal(false)}
            >
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            {/* Decorative Background */}
            <View style={styles.modalDecoration}>
              <View style={styles.decoCircle1} />
              <View style={styles.decoCircle2} />
            </View>

            {/* Success Icon */}
            <View style={styles.successIconOuter}>
              <View style={styles.successIconMiddle}>
                <View style={styles.successIconInner}>
                  <Icon name="check-bold" size={40} color="#fff" />
                </View>
              </View>
            </View>

            <Text style={styles.successTitle}>Photo Uploaded!</Text>
            <Text style={styles.successMessage}>
              Customer photo has been successfully uploaded.
            </Text>

            {/* Uploaded Info */}
            <View style={styles.successInfoCard}>
              <View style={styles.successInfoRow}>
                <Icon name="image" size={18} color={colors.gray600} />
                <Text style={styles.successInfoLabel}>Type:</Text>
                <Text style={styles.successInfoValue}>
                  {imageType.charAt(0).toUpperCase() + imageType.slice(1)}
                </Text>
              </View>
              <View style={styles.successInfoRow}>
                <Icon name="account" size={18} color={colors.gray600} />
                <Text style={styles.successInfoLabel}>Customer:</Text>
                <Text style={styles.successInfoValue}>{customer.name}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.successBtn} onPress={handleSuccessClose}>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.successBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default UploadCustomerImageScreen;

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
  headerRight: {
    width: 44,
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },

  // Customer Card
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  customerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  customerMobile: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
    marginTop: 2,
  },

  // Section
  section: {
    backgroundColor: '#fff',
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Image Type
  imageTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  imageTypeCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  imageTypeCardActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  imageTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  imageTypeLabel: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.medium,
    color: colors.gray600,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Select Image
  selectImageBtn: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderStyle: 'dashed',
    backgroundColor: colors.gray100,
  },
  selectImageIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.purpleTint30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  selectImageTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  selectImageSubtitle: {
    fontSize: fonts.sizes.md,
    color: colors.gray500,
  },

  // Image Preview
  imagePreviewContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    backgroundColor: colors.gray100,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  removeImageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 8,
  },
  imageInfoText: {
    flex: 1,
    fontSize: fonts.sizes.md,
    color: colors.gray600,
  },
  imageInfoSize: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
  },
  changeImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.purpleTint30,
    gap: 8,
  },
  changeImageBtnText: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.semibold,
    color: colors.primary,
  },

  // Guidelines
  guidelinesCard: {
    backgroundColor: colors.infoLight,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.info + '30',
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.info,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  guidelineText: {
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: borderRadius.lg,
    gap: 10,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },

  // Image Picker Modal
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    paddingBottom: 40,
  },
  pickerModalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  pickerModalTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    marginBottom: spacing.md,
  },
  pickerOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pickerOptionText: {
    flex: 1,
  },
  pickerOptionTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.textPrimary,
  },
  pickerOptionSubtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    marginTop: 2,
  },
  pickerCancelBtn: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  pickerCancelText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
    color: colors.gray600,
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  successModalContent: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    overflow: 'hidden',
  },
  modalDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 120,
  },
  decoCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0fdf4',
    top: -80,
    right: -40,
  },
  decoCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#dcfce7',
    top: -30,
    left: -30,
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
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successTitle: {
    fontSize: fonts.sizes['3xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  successInfoCard: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    width: '100%',
    marginBottom: spacing.lg,
  },
  successInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  successInfoLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
  },
  successInfoValue: {
    fontSize: fonts.sizes.md,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
  },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: borderRadius.lg,
    gap: 8,
  },
  successBtnText: {
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.bold,
    color: '#fff',
  },
});
