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
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import styles from "../../assets/styles/register1.styles";
import { API_BASE_URL } from "../../constants/config";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";
import { useRegistration } from "../../contexts/RegistrationContext";

export default function Register1() {
  const router = useRouter();
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    password, 
    confirmPassword,
    updateField,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing,
    resetRegistration
  } = useRegistration();
  
  const { isNavigating, navigate, cleanup } = useNavigationGuard();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Username removed; email is the unique identifier

  const validateForm = async () => {
    // Use context validation for basic fields
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      return false;
    }

    // Check if email already exists
    try {
      const response = await fetch(`${API_BASE_URL}/deliverydrivers/check-email`, {
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

  const handleChange = (key, value) => {
    updateField(key, value);
  };

  const handleFocus = (key) => {
    if (errors[key]) {
      updateField(key, "");
    }
  };

  const handleBack = () => {
    // Reset the registration form when going back
    resetRegistration();
    navigate(() => {
      // Always navigate to landing screen from register1
      router.replace('/landing');
    });
  };
  
  const handleContinue = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    const isValid = await validateForm();
    if (isValid) {
      setStep(2);
      navigate(() => {
        router.replace("/auth/register2");
      });
    }
  };
  
  const handleLogin = () => {
    navigate(() => {
      // Use replace to prevent multiple login screens
      router.replace("/auth/login");
    });
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
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

            <View style={styles.progressWrapper}>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
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

          <View style={styles.bottomSection}>
            <TouchableOpacity 
              style={[styles.continueButton, (isNavigating || isProcessing) && styles.continueButtonDisabled]} 
              onPress={handleContinue}
              disabled={isNavigating || isProcessing}
            >
              {(isNavigating || isProcessing) ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.continueText}>Validating...</Text>
                </View>
              ) : (
                <Text style={styles.continueText}>Continue</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

