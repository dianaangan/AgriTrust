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
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resolveApiBaseUrl } from '../../constants/config';
import getColors from '../../constants/colors';
import styles from '../../assets/styles/verify-code.styles';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';

const C = getColors('light');

export default function VerifyCodeScreen() {
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { isNavigating, navigate, cleanup } = useNavigationGuard();

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyCode = async () => {
    if (isNavigating || loading) return; // Prevent multiple rapid clicks

    if (!code.trim()) {
      setError('Invalid code');
      return;
    }

    if (code.trim().length !== 6) {
      setError('Invalid code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = await resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/farmers/verify-reset-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          code: code.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(() => router.push({
          pathname: '/password-reset/new-password',
          params: { email, code: code.trim() }
        }));
      } else {
        setError('Invalid code');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      setError('Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (isNavigating || resendLoading) return; // Prevent multiple rapid clicks

    setResendLoading(true);
    setError('');

    try {
      const apiBaseUrl = await resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/farmers/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setCountdown(60); // 60 seconds countdown
        Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Resend code error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>One-Time Code</Text>
        <Text style={styles.subtitle}>
          Please input the verification code sent to your email address.
        </Text>

        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <Ionicons name="keypad-outline" size={20} color={error ? "#FF3B30" : C.muted} />
          <TextInput
            style={styles.input}
            placeholder={error || "Verification Code"}
            placeholderTextColor={error ? "#FF3B30" : C.muted}
            value={error ? "" : code}
            onChangeText={(value) => {
              setCode(value);
              if (error) setError(''); // Clear error when user starts typing
            }}
            keyboardType="number-pad"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <View style={styles.resendContainer}>
          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resendLoading || countdown > 0 || isNavigating}
            style={styles.resendButton}
          >
            {resendLoading ? (
              <ActivityIndicator size="small" color={C.primary} />
            ) : (
              <Text style={[
                styles.resendText,
                (resendLoading || countdown > 0) && styles.resendTextDisabled
              ]}>
                {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.verifyButton, (loading || isNavigating) && styles.verifyButtonDisabled]}
          onPress={handleVerifyCode}
          disabled={loading || isNavigating}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.verifyButtonText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

