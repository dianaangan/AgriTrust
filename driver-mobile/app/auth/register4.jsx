import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../../assets/styles/register4.styles";
import { useRegistration } from "../../contexts/RegistrationContext";

export default function Register4() {
  const router = useRouter();
  const { 
    brand,
    model,
    year,
    vehicleType,
    plateNumber,
    color,
    updateField,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing
  } = useRegistration();
  
  const [isNavigating, setIsNavigating] = useState(false);

  const handleChange = (key, value) => {
    updateField(key, value);
  };

  const handleFocus = (key) => {
    if (errors[key]) {
      updateField(key, "");
    }
  };

  const validateForm = () => {
    return validateCurrentStep();
  };

  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setStep(3);
    router.replace("/auth/register3");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      
      try {
        setStep(5);
        router.replace('/auth/register5');
      } finally {
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Enter Vehicle Details</Text>
          <Text style={styles.subtitle}>Please provide accurate information about the vehicle you'll use for deliveries.</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <TextInput
            placeholder={errors.brand || "Brand/Make"}
            placeholderTextColor={errors.brand ? "#ff3333" : "#6a6a6a"}
            value={errors.brand ? "" : brand}
            onChangeText={(value) => handleChange('brand', value)}
            onFocus={() => handleFocus('brand')}
            style={[styles.input, errors.brand && styles.inputError]}
            returnKeyType="next"
          />

          <TextInput
            placeholder={errors.model || "Vehicle Model"}
            placeholderTextColor={errors.model ? "#ff3333" : "#6a6a6a"}
            value={errors.model ? "" : model}
            onChangeText={(value) => handleChange('model', value)}
            onFocus={() => handleFocus('model')}
            style={[styles.input, errors.model && styles.inputError]}
            returnKeyType="next"
          />

          <TextInput
            placeholder={errors.year || "Year of Manufacture"}
            placeholderTextColor={errors.year ? "#ff3333" : "#6a6a6a"}
            keyboardType="number-pad"
            value={errors.year ? "" : year}
            onChangeText={(value) => handleChange('year', value)}
            onFocus={() => handleFocus('year')}
            style={[styles.input, errors.year && styles.inputError]}
            returnKeyType="next"
            maxLength={4}
          />

          <TextInput
            placeholder={errors.vehicleType || "Vehicle Type"}
            placeholderTextColor={errors.vehicleType ? "#ff3333" : "#6a6a6a"}
            value={errors.vehicleType ? "" : vehicleType}
            onChangeText={(value) => handleChange('vehicleType', value)}
            onFocus={() => handleFocus('vehicleType')}
            style={[styles.input, errors.vehicleType && styles.inputError]}
            returnKeyType="next"
          />

          <TextInput
            placeholder={errors.plateNumber || "Plate Number"}
            placeholderTextColor={errors.plateNumber ? "#ff3333" : "#6a6a6a"}
            value={errors.plateNumber ? "" : plateNumber}
            onChangeText={(value) => handleChange('plateNumber', value)}
            onFocus={() => handleFocus('plateNumber')}
            style={[styles.input, errors.plateNumber && styles.inputError]}
            returnKeyType="next"
          />

          <TextInput
            placeholder={errors.color || "Vehicle Color"}
            placeholderTextColor={errors.color ? "#ff3333" : "#6a6a6a"}
            value={errors.color ? "" : color}
            onChangeText={(value) => handleChange('color', value)}
            onFocus={() => handleFocus('color')}
            style={[styles.input, errors.color && styles.inputError]}
            returnKeyType="done"
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton} 
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
