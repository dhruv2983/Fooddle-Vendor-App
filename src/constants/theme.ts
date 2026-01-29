const palette = {
  primary: 'rgba(30, 64, 175, 1)',    // Professional blue
  primaryLight: 'rgba(30, 64, 175, 0.1)',
  primaryMedium: 'rgba(30, 64, 175, 0.2)',
  secondary: '#6B7280',     // Gray
  success: '#059669',       // Professional green
  danger: '#DC2626',        // Professional red
  warning: '#D97706',       // Professional amber
  info: '#0891B2',          // Professional cyan
  light: '#F9FAFB',         // Very light gray
  dark: '#111827',          // Professional dark
  white: '#FFFFFF',
  surface: '#FFFFFF',       // White surface
  border: '#E5E7EB',
  muted: '#6B7280',
  textSecondary: '#4B5563',
};

export const theme = {
  colors: {
    background: palette.white,
    text: palette.dark,
    ...palette,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 40,
    xxxxxl: 48,
    xxxxxxl: 64,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  textVariants: {
    header: {
      fontSize: 24,
      fontWeight: '700' as const,
      fontFamily: 'Urbanist-Bold',
      color: palette.dark,
      lineHeight: 32,
      letterSpacing: -0.3,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      fontFamily: 'Urbanist-SemiBold',
      color: palette.dark,
      lineHeight: 26,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      fontFamily: 'Urbanist-Medium',
      color: palette.secondary,
      lineHeight: 20,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
      fontFamily: 'Urbanist-Regular',
      color: palette.dark,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      fontFamily: 'Urbanist-Regular',
      color: palette.muted,
      lineHeight: 16,
    },
    small: {
      fontSize: 10,
      fontWeight: '400' as const,
      fontFamily: 'Urbanist-Regular',
      color: palette.muted,
      lineHeight: 14,
    },
  },
  layout: {
    containerPadding: 16,
    sectionSpacing: 20,
    cardPadding: 16,
    buttonHeight: 44,
    inputHeight: 48,
    headerHeight: 120, // Keep header height same for top padding
    maxContentWidth: 1200,
  },
  accessibility: {
    minTouchTarget: 44,
    focusRing: 2,
  },
};
