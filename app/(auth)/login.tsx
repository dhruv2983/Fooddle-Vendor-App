import React, { useState } from 'react';
import { StyleSheet, Alert, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import { validateEmail, validateRequired } from '@/utils/validation';

const LoginScreen = () => {
  const [username, setUsername] = useState('vendor');
  const [password, setPassword] = useState('password');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    // Validate inputs
    const usernameValidation = validateRequired(username, 'Username');
    const passwordValidation = validateRequired(password, 'Password');
    
    setUsernameError(usernameValidation.isValid ? '' : usernameValidation.error || '');
    setPasswordError(passwordValidation.isValid ? '' : passwordValidation.error || '');
    
    if (!usernameValidation.isValid || !passwordValidation.isValid) {
      return;
    }

    await login({ username, password });
    if (error) {
      Alert.alert('Login Failed', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <ThemedText variant="header" style={styles.title}>
              VendorApp
            </ThemedText>
            <ThemedText variant="subtitle" style={styles.subtitle}>
              Professional Restaurant Management System
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.card}>
              <ThemedText variant="title" style={styles.formTitle}>
                Welcome Back
              </ThemedText>
              
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                error={usernameError}
              />
              
              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={passwordError}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <ThemedText style={styles.errorText}>
                    {error}
                  </ThemedText>
                </View>
              )}

              <Button 
                title={isLoading ? 'Signing in...' : 'Sign In'} 
                onPress={handleLogin} 
                disabled={isLoading}
                size="large"
              />

              <View style={styles.demoContainer}>
                <ThemedText variant="caption" style={styles.demoText}>
                  Demo credentials pre-filled
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
    marginBottom: theme.spacing.xxl,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.s,
    color: theme.colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.muted,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.dark,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: theme.colors.danger,
    borderWidth: 1,
    borderRadius: theme.borderRadius.s,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  demoContainer: {
    marginTop: theme.spacing.l,
    alignItems: 'center',
  },
  demoText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LoginScreen;
