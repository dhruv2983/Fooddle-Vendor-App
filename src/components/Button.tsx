import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
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
      style={[getButtonStyle(), style]} 
      disabled={disabled}
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
    ...theme.shadows.small,
  },
  
  // Sizes with reduced spacing
  small: {
    paddingHorizontal: theme.spacing.l,
    paddingVertical: theme.spacing.s,
    minHeight: 36,
  },
  medium: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.m,
    minHeight: theme.layout.buttonHeight,
  },
  large: {
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.l,
    minHeight: 48,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  danger: {
    backgroundColor: theme.colors.danger,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  disabled: {
    backgroundColor: theme.colors.muted,
  },

  // Text styles with reduced sizes
  text: {
    fontWeight: '600' as const,
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
