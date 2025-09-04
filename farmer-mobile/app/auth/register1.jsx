import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../../assets/styles/register1.styles";

export default function Register1() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data if coming back from other steps
  const userData = params.userData ? JSON.parse(params.userData) : {};
  
  const [form, setForm] = useState({
    firstName: userData.firstName || "",
    lastName: userData.lastName || "",
    email: userData.email || "",
    phone: userData.phone || "",
    username: userData.username || "",
    password: userData.password || "",
    confirmPassword: userData.confirmPassword || "",
  });

  const [errors, setErrors] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      firstName: () => !form.firstName.trim() && "First name is required",
      lastName: () => !form.lastName.trim() && "Last name is required",
      email: () => !form.email.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(form.email) && "Please enter a valid email",
      phone: () => !form.phone.trim() ? "Phone number is required" : !/^\d{10,}$/.test(form.phone.replace(/\D/g, '')) && "Please enter a valid phone number",
      username: () => !form.username.trim() ? "User name is required" : form.username.length < 3 && "Username must be at least 3 characters",
      password: () => !form.password ? "Password is required" : form.password.length < 6 && "Password must be at least 6 characters",
      confirmPassword: () => !form.confirmPassword ? "Please confirm your password" : form.password !== form.confirmPassword && "Passwords do not match"
    };

    Object.entries(validations).forEach(([key, validate]) => {
      const error = validate();
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleFocus = (key) => {
    if (errors[key]) {
      setForm(prev => ({ ...prev, [key]: "" }));
      setErrors(prev => ({ ...prev, [key]: null }));
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
  
  const handleContinue = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      // Use replace to prevent multiple register2 screens
      router.replace({
        pathname: "/auth/register2",
        params: { userData: JSON.stringify({ ...userData, ...form }) }
      });
      
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
              value={errors.username ? "" : form.username}
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
              value={errors.email ? "" : form.email}
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
              value={errors.password ? "" : form.password}
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
              value={errors.confirmPassword ? "" : form.confirmPassword}
              onChangeText={(t) => handleChange("confirmPassword", t)}
              onFocus={() => handleFocus("confirmPassword")}
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            <TextInput
              placeholder={errors.firstName || "First name"}
              placeholderTextColor={errors.firstName ? "#ff3333" : "#6a6a6a"}
              value={errors.firstName ? "" : form.firstName}
              onChangeText={(t) => handleChange("firstName", t)}
              onFocus={() => handleFocus("firstName")}
              style={[styles.input, errors.firstName && styles.inputError]}
              returnKeyType="next"
            />

            <TextInput
              placeholder={errors.lastName || "Last name"}
              placeholderTextColor={errors.lastName ? "#ff3333" : "#6a6a6a"}
              value={errors.lastName ? "" : form.lastName}
              onChangeText={(t) => handleChange("lastName", t)}
              onFocus={() => handleFocus("lastName")}
              style={[styles.input, errors.lastName && styles.inputError]}
              returnKeyType="next"
            />


            <TextInput
              placeholder={errors.phone || "Phone number"}
              placeholderTextColor={errors.phone ? "#ff3333" : "#6a6a6a"}
              keyboardType="phone-pad"
              value={errors.phone ? "" : form.phone}
              onChangeText={(t) => handleChange("phone", t)}
              onFocus={() => handleFocus("phone")}
              style={[styles.input, errors.phone && styles.inputError]}
              returnKeyType="next"
            />
            
          </View>

          <View style={styles.bottomSection}>
            <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueText}>Continue</Text>
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