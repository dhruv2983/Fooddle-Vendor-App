import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/Button';
import { useAuthStore } from '@/store/authStore';
import { theme } from '@/constants/theme';
import { validateRequired } from '@/utils/validation';
import Ionicons from '@expo/vector-icons/Ionicons';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    const usernameValidation = validateRequired(username, 'Username');
    const passwordValidation = validateRequired(password, 'Password');

    setUsernameError(usernameValidation.isValid ? '' : usernameValidation.error || '');
    setPasswordError(passwordValidation.isValid ? '' : passwordValidation.error || '');

    if (!usernameValidation.isValid || !passwordValidation.isValid) return;

    await login({ username, password });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo section */}
          <View style={styles.logoSection}>
            <View style={styles.logoWrap}>
              <Image
                source={require('../../assets/images/f_logo_no_bg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <ThemedText style={styles.appName}>Fooddle Vendor</ThemedText>
            <ThemedText style={styles.tagline}>Restaurant management, simplified</ThemedText>
          </View>

          {/* Form card */}
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>Sign In</ThemedText>
            <ThemedText style={styles.cardSubtitle}>Enter your credentials to continue</ThemedText>

            <View style={styles.fields}>
              <TextInput
                label="Username"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                error={usernameError}
              />

              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                error={passwordError}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={8}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={theme.colors.muted}
                    />
                  </TouchableOpacity>
                }
              />
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={theme.colors.danger} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            <Button
              title={isLoading ? 'Signing in…' : 'Sign In'}
              onPress={handleLogin}
              disabled={isLoading}
              size="large"
              style={styles.signInButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingBottom: 48,
  },
  logoWrap: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: 72,
    height: 72,
  },
  appName: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: '700',
    color: theme.colors.dark,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.muted,
    letterSpacing: 0.1,
  },

  // Form card
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: theme.colors.dark,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: theme.colors.muted,
    marginBottom: 24,
  },
  fields: {
    gap: 4,
  },

  // Error
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  errorText: {
    flex: 1,
    color: theme.colors.danger,
    fontSize: 13,
  },

  signInButton: {
    marginTop: 20,
  },
});

export default LoginScreen;
