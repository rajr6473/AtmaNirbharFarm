/**
 * Atma Nirbhar Farm - Centralized Theme
 * Modern purple/violet design inspired by ShopEase UI
 */

export const colors = {
  // Primary Brand Colors - Light Purple/Lavender Theme
  primary: '#8B5CF6',
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  primarySoft: '#C4B5FD',

  // Gradient Colors
  gradientStart: '#8B5CF6',
  gradientMiddle: '#A78BFA',
  gradientEnd: '#C4B5FD',

  // Accent Colors
  accent: '#8B5CF6',
  accentLight: '#DDD6FE',
  accentDark: '#6D28D9',

  // Background Colors
  background: '#FAF5FF',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F3E8FF',
  backgroundSoft: '#FDFCFF',
  cardBackground: '#FFFFFF',

  // Purple Tints for backgrounds - Lighter/Softer
  purpleTint10: '#FDFCFF',
  purpleTint20: '#FAF5FF',
  purpleTint30: '#F3E8FF',
  purpleTint40: '#EDE9FE',
  purpleTint50: '#DDD6FE',

  // Text Colors
  textPrimary: '#1F2937',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',
  textPurple: '#7C3AED',

  // Status Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Order Status Colors
  statusDelivered: '#10B981',
  statusOutForDelivery: '#3B82F6',
  statusPacked: '#7C3AED',
  statusConfirmed: '#06B6D4',
  statusPending: '#F59E0B',
  statusCancelled: '#EF4444',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F9FAFB',
  gray200: '#F3F4F6',
  gray300: '#E5E7EB',
  gray400: '#D1D5DB',
  gray500: '#9CA3AF',
  gray600: '#6B7280',
  gray700: '#4B5563',
  gray800: '#374151',

  // Border Colors
  border: '#EDE9FE',
  borderLight: '#F3E8FF',
  borderDark: '#DDD6FE',
  borderPurple: '#DDD6FE',

  // Shadow
  shadow: '#8B5CF6',
  shadowDark: '#1F2937',
};

export const fonts = {
  // Font Sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 15,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 36,
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  purple: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};

// Common component styles
export const commonStyles = {
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Cards
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.md,
  },

  // Header with gradient-like style
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.xl,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },

  // Header Title
  headerTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textWhite,
  },

  // Back Button
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },

  // Section Title
  sectionTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: fonts.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Primary Button (Purple)
  primaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...shadows.purple,
  },

  primaryButtonText: {
    color: colors.textWhite,
    fontSize: fonts.sizes.lg,
    fontWeight: fonts.weights.semibold,
  },

  // Secondary Button (Outlined)
  secondaryButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  secondaryButtonText: {
    color: colors.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
  },

  // Input
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fonts.sizes.base,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  // Floating Action Button
  fab: {
    position: 'absolute' as const,
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...shadows.purple,
  },

  // Badge
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },

  badgeText: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: fonts.weights.bold,
  },
};

export default {
  colors,
  fonts,
  spacing,
  borderRadius,
  shadows,
  commonStyles,
};
