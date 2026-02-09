import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, Platform } from 'react-native';
import { theme } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline';

type ButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: ButtonVariant;
  size?: 'small' | 'medium' | 'large';
};

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  style, 
  variant = 'primary', 
  size = 'medium',
  disabled,
  ...props 
}) => {
  const getButtonStyle = () => {
    const baseStyles = [styles.button, styles[size]];
    
    if (disabled) {
      return [...baseStyles, styles.disabled];
    } else {
      return [...baseStyles, styles[variant]];
    }
  };

  const getTextStyle = () => {
    const baseStyles = [styles.text, styles[`${size}Text` as keyof typeof styles]];
    
    if (disabled) {
      return [...baseStyles, styles.disabledText];
    } else {
      return [...baseStyles, styles[`${variant}Text` as keyof typeof styles]];
    }
  };

  return (
    <TouchableOpacity 
      style={[getButtonStyle(), style, { overflow: 'hidden' }]} 
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.m,
    ...(Platform.OS === 'ios' ? theme.shadows.small : {}),
    overflow: 'hidden',
  },
  
  // Sizes with reduced spacing
  small: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    minHeight: 36,
    overflow: 'hidden',
  },
  medium: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    minHeight: theme.layout.buttonHeight,
    overflow: 'hidden',
  },
  large: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.l,
    minHeight: 48,
    overflow: 'hidden',
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    overflow: 'hidden',
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
    overflow: 'hidden',
  },
  success: {
    backgroundColor: theme.colors.success,
    overflow: 'hidden',
  },
  danger: {
    backgroundColor: theme.colors.danger,
    overflow: 'hidden',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
  },
  disabled: {
    backgroundColor: theme.colors.muted,
    overflow: 'hidden',
  },

  // Text styles with reduced sizes
  text: {
    fontWeight: '600' as const,
    fontFamily: 'Urbanist-SemiBold',
    textAlign: 'center' as const,
    letterSpacing: 0.1,
  },
  smallText: {
    fontSize: 12,
    lineHeight: 16,
  },
  mediumText: {
    fontSize: 14,
    lineHeight: 20,
  },
  largeText: {
    fontSize: 16,
    lineHeight: 22,
  },
  primaryText: {
    color: theme.colors.white,
  },
  secondaryText: {
    color: theme.colors.white,
  },
  successText: {
    color: theme.colors.white,
  },
  dangerText: {
    color: theme.colors.white,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.white,
  },
});
