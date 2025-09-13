import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resolveApiBaseUrl } from '../../constants/config';
import getColors from '../../constants/colors';
import styles from '../../assets/styles/forgot-password.styles';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

const C = getColors('light');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isNavigating, navigate, cleanup } = useNavigationGuard();

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleSendCode = async () => {
    if (isNavigating || loading) return; // Prevent multiple rapid clicks

    if (!email.trim()) {
      setError('Invalid email');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Invalid email');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = await resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/farmers/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(() => router.push({
          pathname: '/password-reset/verify-code',
          params: { email: email.trim().toLowerCase() }
        }));
      } else {
        setError('Invalid email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Invalid email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigate(() => router.back())}
        disabled={isNavigating}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          Enter your email address to proceed with verification.
        </Text>

        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <Ionicons name="mail-outline" size={20} color={error ? "#FF3B30" : C.muted} />
          <TextInput
            style={styles.input}
            placeholder={error || "Email"}
            placeholderTextColor={error ? "#FF3B30" : C.muted}
            value={error ? "" : email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) setError(''); // Clear error when user starts typing
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.resetButton, (loading || isNavigating) && styles.resetButtonDisabled]}
          onPress={handleSendCode}
          disabled={loading || isNavigating}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Sending...</Text>
            </View>
          ) : (
            <Text style={styles.resetButtonText}>Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

