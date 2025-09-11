import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles, { PLACEHOLDER_COLOR } from "../../assets/styles/register2.styles";
import { API_BASE_URL } from "../../constants/config";
import { useRegistration } from "../../contexts/RegistrationContext";

export default function Register2() {
  const router = useRouter();
  const { 
    cardNumber,
    expiry,
    cvc,
    cardEmail,
    firstName,
    lastName,
    updateField,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isVerifying,
    setVerifying,
    isProcessing
  } = useRegistration();
  
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCardChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    updateField('cardNumber', formatted);
  };

  const handleExpiryChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);
    let formatted = digitsOnly;
    if (digitsOnly.length >= 3) {
      formatted = `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
    } else if (digitsOnly.length >= 1 && digitsOnly.length <= 2) {
      formatted = digitsOnly;
    }
    // Auto-prepend 0 if first month digit is >1
    if (formatted.length === 1 && parseInt(formatted, 10) > 1) {
      formatted = `0${formatted}`;
    }
    updateField('expiry', formatted);
  };

  const handleChange = (key, value) => {
    updateField(key, value);
  };

  const validateForm = () => {
    return validateCurrentStep();
  };

  // Function to verify billing information with Stripe
  const verifyBillingInfo = async () => {
    try {
      setVerifying(true);
      
      // Parse expiry date
      const [month, year] = expiry.split('/');
      const fullYear = `20${year}`;
      
      const billingData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth: month,
        expiryYear: fullYear,
        cvc: cvc,
        email: cardEmail,
        name: `${firstName} ${lastName}` || 'Cardholder'
      };

      const response = await fetch(`${API_BASE_URL}/stripe/verify-billing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billingData),
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        throw new Error(`Server returned ${response.status}: ${textResponse.substring(0, 100)}...`);
      }

      const result = await response.json();

      if (result.success) {
        // Clear any existing card errors
        clearErrors();
        
        return { success: true, data: result };
      } else {
        // Set card number error for invalid card
        setErrors({ cardNumber: "Valid card number" });
        return { success: false, error: result.message };
      }
    } catch (error) {
      // Set card number error for network/server issues
      setErrors({ cardNumber: "Valid card number" });
      return { success: false, error: error.message };
    } finally {
      setVerifying(false);
    }
  };

  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setStep(1);
    router.replace("/auth/register1");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      
      try {
        // First verify billing information with Stripe
        const verificationResult = await verifyBillingInfo();
        
        if (verificationResult.success) {
          // Update context with Stripe verification data
          updateField('stripePaymentMethodId', verificationResult.data.paymentMethodId);
          updateField('stripePaymentIntentId', verificationResult.data.paymentIntentId);
          updateField('billingVerified', true);
          
          setStep(3);
          router.replace('/auth/register3');
        } else {
          // Error is already set in the verifyBillingInfo function
          // No need for Alert.alert - error is already displayed inline
        }
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
          <Text style={styles.title}>Transaction Methods</Text>
          <Text style={styles.subtitle}>Please enter your transaction method and select your preferred mode.</Text>
        </View>

        {/* Card information */}
        <View style={styles.section}>
          <Text style={styles.imageLabel}>Card information</Text>
          <View style={[styles.input, styles.inputWithIcon, {marginBottom: 10}, errors.cardNumber && styles.inputError]}> 
            <TextInput
              value={errors.cardNumber ? "" : cardNumber}
              onChangeText={handleCardChange}
              placeholder={errors.cardNumber || "1234 1234 1234 1234"}
              keyboardType="number-pad"
              placeholderTextColor={errors.cardNumber ? "#ff3333" : PLACEHOLDER_COLOR}
              style={[styles.textInput, styles.textInputFlex]}
              maxLength={19}
            />
            <Image source={require('../../assets/images/cardsFixed.png')} style={styles.inlineCardLogos} resizeMode="contain" />
          </View>
          <View style={[styles.inputRow, {marginBottom: 20}]}> 
            <View style={[styles.input, styles.inputHalf, errors.expiry && styles.inputError, { marginRight: 6 }]}> 
              <TextInput
                value={errors.expiry ? "" : expiry}
                onChangeText={handleExpiryChange}
                placeholder={errors.expiry || "MM / YY"}
                keyboardType="number-pad"
                placeholderTextColor={errors.expiry ? "#ff3333" : PLACEHOLDER_COLOR}
                style={styles.textInput}
                maxLength={5}
              />
            </View>
            <View style={[styles.input, styles.inputHalf, styles.inputWithIcon, errors.cvc && styles.inputError]}> 
              <TextInput
                value={errors.cvc ? "" : cvc}
                onChangeText={(value) => handleChange('cvc', value)}
                placeholder={errors.cvc || "CVC"}
                keyboardType="number-pad"
                placeholderTextColor={errors.cvc ? "#ff3333" : PLACEHOLDER_COLOR}
                style={[styles.textInput, styles.textInputFlex]}
                maxLength={4}
              />
              <Image source={require('../../assets/images/creditCardCvc.png')} style={styles.cvcIcon} resizeMode="contain" />
            </View>
          </View>
          <Text style={styles.imageLabel}>Cardholder email</Text>
          <View style={[styles.input, errors.cardEmail && styles.inputError]}> 
            <TextInput
              value={errors.cardEmail ? "" : cardEmail}
              onChangeText={(value) => handleChange('cardEmail', value)}
              placeholder={errors.cardEmail || "Email"}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={errors.cardEmail ? "#ff3333" : PLACEHOLDER_COLOR}
              style={styles.textInput}
            />
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, isVerifying && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="white" />
              <Text style={styles.continueButtonText}>Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
