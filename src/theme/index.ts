/**
 * Dhanvantri Farm - Centralized Theme
 * Professional, clean design with consistent colors and typography
 */

export const colors = {
  // Primary Brand Colors
  primary: '#1A3C34',
  primaryDark: '#0F2820',
  primaryLight: '#2D5A4A',

  // Accent Colors
  accent: '#C4A962',
  accentLight: '#D4BC7D',
  accentDark: '#A89050',

  // Background Colors
  background: '#F8F9F5',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#F0F2ED',
  cardBackground: '#FFFFFF',

  // Text Colors
  textPrimary: '#1A3C34',
  textSecondary: '#4A5568',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  textWhite: '#FFFFFF',

  // Status Colors
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',

  // Order Status Colors
  statusDelivered: '#16A34A',
  statusOutForDelivery: '#2563EB',
  statusPacked: '#7C3AED',
  statusConfirmed: '#0891B2',
  statusPending: '#F59E0B',
  statusCancelled: '#DC2626',

  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F7F8F7',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',

  // Border Colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',

  // Shadow
  shadow: '#000000',
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
  },

  // Font Weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
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
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
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
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.md,
  },

  // Header
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },

  // Header Title
  headerTitle: {
    fontSize: fonts.sizes['2xl'],
    fontWeight: fonts.weights.bold,
    color: colors.textWhite,
  },

  // Back Button
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
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

  // Primary Button
  primaryButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  primaryButtonText: {
    color: colors.primary,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
  },

  // Secondary Button
  secondaryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.base,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },

  secondaryButtonText: {
    color: colors.textWhite,
    fontSize: fonts.sizes.base,
    fontWeight: fonts.weights.semibold,
  },

  // Input
  input: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: fonts.sizes.base,
    color: colors.textPrimary,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
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
