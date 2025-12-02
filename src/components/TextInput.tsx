import React, { useState } from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps, View, Text } from 'react-native';
import { theme } from '@/constants/theme';

type CustomTextInputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
};

export const TextInput: React.FC<CustomTextInputProps> = ({ 
  style, 
  label, 
  error, 
  icon, 
  onFocus,
  onBlur,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getInputStyle = () => {
    let inputStyle = { ...styles.input };
    
    if (isFocused) {
      inputStyle = { ...inputStyle, ...styles.inputFocused };
    }
    
    if (error) {
      inputStyle = { ...inputStyle, ...styles.inputError };
    }
    
    return inputStyle;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <View style={styles.inputContainer}>
        {icon && (
          <View style={styles.iconContainer}>
            {icon}
          </View>
        )}
        <RNTextInput
          style={[getInputStyle(), icon ? styles.inputWithIcon : {}, style]}
          placeholderTextColor={theme.colors.muted}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginBottom: theme.spacing.xs,
    color: theme.colors.dark,
    lineHeight: 16,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.m,
    borderRadius: theme.borderRadius.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    minHeight: theme.layout.inputHeight,
    ...theme.shadows.small,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.xxxxl,
  },
  iconContainer: {
    position: 'absolute',
    left: theme.spacing.m,
    top: '50%',
    transform: [{ translateY: -12 }],
    zIndex: 1,
  },
  errorText: {
    fontSize: 10,
    fontWeight: '400' as const,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
    lineHeight: 14,
  },
});
