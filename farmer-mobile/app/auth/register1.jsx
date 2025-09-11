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
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../../assets/styles/register1.styles";
import { API_BASE_URL } from "../../constants/config";
import { useFarmerRegistration } from "../../contexts/FarmerRegistrationContext";

export default function Register1() {
  const router = useRouter();
  const { 
    firstName, 
    lastName, 
    email, 
    phone, 
    username, 
    password, 
    confirmPassword,
    updateField,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing
  } = useFarmerRegistration();
  
  const [isNavigating, setIsNavigating] = useState(false);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (!username || username.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/farmers/check-username?username=${encodeURIComponent(username)}`);
      const result = await response.json();
      
      if (result.success && result.available) {
        return { available: true, message: 'Username is available' };
      } else {
        return { available: false, message: 'Username is already taken' };
      }
    } catch (error) {
      console.error('Username check error:', error);
      return { available: false, message: 'Error checking username availability' };
    }
  };

  const validateForm = async () => {
    // Use context validation for basic fields
    const isValid = validateCurrentStep();
    
    if (!isValid) {
      return false;
    }

    // Check username availability if username is valid
    if (username.trim()) {
      try {
        const usernameCheck = await checkUsernameAvailability(username);
        if (!usernameCheck.available) {
          setErrors(prev => ({ ...prev, username: usernameCheck.message }));
          return false;
        }
      } catch (error) {
        console.error('Username validation error:', error);
        setErrors(prev => ({ ...prev, username: 'Error checking username availability' }));
        return false;
      }
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
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    // Always navigate to landing screen from register1
    router.replace('/landing');
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    const isValid = await validateForm();
    if (isValid) {
      setStep(2);
      setIsNavigating(true);
      router.replace("/auth/register2");
      
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };
  
  const handleLogin = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    // Use replace to prevent multiple login screens
    router.replace("/auth/login");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
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
              placeholder={errors.username || "User name"}
              placeholderTextColor={errors.username ? "#ff3333" : "#6a6a6a"}
              autoCapitalize="none"
              autoCorrect={false}
              value={errors.username ? "" : username}
              onChangeText={(t) => handleChange("username", t)}
              onFocus={() => handleFocus("username")}
              style={[styles.input, errors.username && styles.inputError]}
              returnKeyType="next"
            />

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

            <TextInput
              placeholder={errors.password || "Password"}
              placeholderTextColor={errors.password ? "#ff3333" : "#6a6a6a"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={errors.password ? "" : password}
              onChangeText={(t) => handleChange("password", t)}
              onFocus={() => handleFocus("password")}
              style={[styles.input, errors.password && styles.inputError]}
              returnKeyType="next"
            />

            <TextInput
              placeholder={errors.confirmPassword || "Confirm password"}
              placeholderTextColor={errors.confirmPassword ? "#ff3333" : "#6a6a6a"}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={errors.confirmPassword ? "" : confirmPassword}
              onChangeText={(t) => handleChange("confirmPassword", t)}
              onFocus={() => handleFocus("confirmPassword")}
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

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
              returnKeyType="next"
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