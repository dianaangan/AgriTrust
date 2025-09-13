import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { resolveApiBaseUrl } from '../../constants/config';
import getColors from '../../constants/colors';
import styles from '../../assets/styles/new-password.styles';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';
import SuccessToast from '../../components/SuccessToast';

const C = getColors('light');

export default function NewPasswordScreen() {
  const { email, code } = useLocalSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const { isNavigating, navigate, cleanup } = useNavigationGuard();

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
    navigate(() => router.replace('/auth/login'));
  };

  const handleSavePassword = async () => {
    if (isNavigating || loading) return; // Prevent multiple rapid clicks

    if (!newPassword.trim()) {
      setError('Invalid password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Invalid password');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Invalid password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Invalid password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const apiBaseUrl = await resolveApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/farmers/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          code,
          newPassword: newPassword.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessToast(true);
      } else {
        setError('Invalid password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Invalid password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Create your new password</Text>
        <Text style={styles.subtitle}>
          Set your new password and confirm it to successfully change your password.
        </Text>

        <View style={[styles.inputWrapper, error && styles.inputError]}>
          <TextInput
            style={styles.input}
            placeholder={error || "New password"}
            placeholderTextColor={error ? "#FF3B30" : C.muted}
            value={error ? "" : newPassword}
            onChangeText={(value) => {
              setNewPassword(value);
              if (error) setError(''); // Clear error when user starts typing
            }}
            secureTextEntry={!showPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={error ? "#FF3B30" : C.muted} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={C.muted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            editable={!loading}
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeButton}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={C.muted} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, (loading || isNavigating) && styles.saveButtonDisabled]}
          onPress={handleSavePassword}
          disabled={loading || isNavigating}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Saving...</Text>
            </View>
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <SuccessToast
        visible={showSuccessToast}
        onClose={handleSuccessToastClose}
        title="Password Reset Successful"
        message="Your password has been reset successfully. You can now log in with your new password."
        duration={0}
      />
    </View>
  );
}

