import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import styles from "../../assets/styles/register.styles";
import { API_BASE_URL } from "../../constants/config";
import { useBuyerRegistration } from "../../contexts/BuyerRegistrationContext";

export default function Register() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);
  
  // Use registration context
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    pickupLocation,
    isNavigating,
    isProcessing,
    errors,
    updateField,
    setNavigating,
    setProcessing,
    setErrors,
    clearFieldError,
    validateForm: contextValidateForm,
    getRegistrationData
  } = useBuyerRegistration();

  const handleChange = (key, value) => {
    updateField(key, value);
  };

  const handleFocus = (key) => {
    clearFieldError(key);
  };

  const validateForm = async () => {
    const isValid = await contextValidateForm();
    if (!isValid) return false;

    // Check if email already exists
    try {
      const response = await fetch(`${API_BASE_URL}/buyers/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (data.exists) {
        setErrors({ email: "Email already exists" });
        return false;
      }
    } catch (error) {
      console.error('Email check error:', error);
      setErrors({ email: "Unable to verify email. Please try again." });
      return false;
    }

    return true;
  };

  const handleBack = () => {
    if (isNavigating) return;
    setNavigating(true);
    router.replace('/landing');
    setTimeout(() => setNavigating(false), 1000);
  };
  
  const handleRegister = async () => {
    if (isNavigating || isProcessing) return;
    
    const isValid = await validateForm();
    if (!isValid) return;
    
    setProcessing(true);
    setNavigating(true);
    
    try {
      const registrationData = getRegistrationData();
      const response = await fetch(`${API_BASE_URL}/buyers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      const result = await response.json();
      
      if (result.success) {
        // Navigate to home with success message
        router.replace({
          pathname: "/home",
          params: { 
            userData: JSON.stringify({
              firstname: result.data.buyer.firstname,
              lastname: result.data.buyer.lastname,
              email: result.data.buyer.email,
              verified: result.data.buyer.verified,
              token: result.data.token
            })
          }
        });
      } else {
        setErrors({ general: result.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
    } finally {
      setProcessing(false);
      setTimeout(() => setNavigating(false), 1000);
    }
  };
  

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView 
        contentContainerStyle={[
          styles.scrollContainer,
          !isKeyboardVisible && styles.scrollContainerCentered
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerSection}>
          <View style={styles.topRow}>
            <TouchableOpacity 
              onPress={handleBack} 
              style={styles.backButton}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Let's{"\n"}Get Started</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.form}>
            <TextInput
              placeholder={errors.email || "Email"}
              placeholderTextColor={errors.email ? "#ff3333" : "#6a6a6a"}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={errors.email ? "" : email}
              onChangeText={(t) => handleChange("email", t)}
              onFocus={() => handleFocus("email")}
              style={[styles.input, errors.email && styles.inputError]}
              returnKeyType="next"
            />

            <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
              <TextInput
                placeholder={errors.password || "Password"}
                placeholderTextColor={errors.password ? "#ff3333" : "#6a6a6a"}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={errors.password ? "" : password}
                onChangeText={(t) => handleChange("password", t)}
                onFocus={() => handleFocus("password")}
                style={styles.inputFlex}
                returnKeyType="next"
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={errors.password ? "#ff3333" : "#6a6a6a"} 
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputWrapperError]}>
              <TextInput
                placeholder={errors.confirmPassword || "Confirm password"}
                placeholderTextColor={errors.confirmPassword ? "#ff3333" : "#6a6a6a"}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                value={errors.confirmPassword ? "" : confirmPassword}
                onChangeText={(t) => handleChange("confirmPassword", t)}
                onFocus={() => handleFocus("confirmPassword")}
                style={styles.inputFlex}
                returnKeyType="next"
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                  size={20} 
                  color={errors.confirmPassword ? "#ff3333" : "#6a6a6a"} 
                />
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={errors.firstName || "First name"}
              placeholderTextColor={errors.firstName ? "#ff3333" : "#6a6a6a"}
              value={errors.firstName ? "" : firstName}
              onChangeText={(t) => handleChange("firstName", t)}
              onFocus={() => handleFocus("firstName")}
              style={[styles.input, errors.firstName && styles.inputError]}
              returnKeyType="next"
            />

            <TextInput
              placeholder={errors.lastName || "Last name"}
              placeholderTextColor={errors.lastName ? "#ff3333" : "#6a6a6a"}
              value={errors.lastName ? "" : lastName}
              onChangeText={(t) => handleChange("lastName", t)}
              onFocus={() => handleFocus("lastName")}
              style={[styles.input, errors.lastName && styles.inputError]}
              returnKeyType="next"
            />

            <TextInput
              placeholder={errors.pickupLocation || "Delivery Pick-up Location"}
              placeholderTextColor={errors.pickupLocation ? "#ff3333" : "#6a6a6a"}
              value={errors.pickupLocation ? "" : pickupLocation}
              onChangeText={(t) => handleChange("pickupLocation", t)}
              onFocus={() => handleFocus("pickupLocation")}
              style={[styles.input, errors.pickupLocation && styles.inputError]}
              returnKeyType="next"
            />

            <TextInput
              placeholder={errors.phone || "Phone number"}
              placeholderTextColor={errors.phone ? "#ff3333" : "#6a6a6a"}
              keyboardType="phone-pad"
              value={errors.phone ? "" : phone}
              onChangeText={(t) => handleChange("phone", t)}
              onFocus={() => handleFocus("phone")}
              style={[styles.input, errors.phone && styles.inputError]}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            
          </View>

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={[styles.continueButton, (isNavigating || isProcessing) && styles.continueButtonDisabled]} 
              onPress={handleRegister}
              disabled={isNavigating || isProcessing}
            >
              {(isNavigating || isProcessing) ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.continueText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.continueText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By creating this account, you agree to the{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
