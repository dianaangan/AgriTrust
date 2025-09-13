import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register3.styles";
import { API_BASE_URL, resolveApiBaseUrl } from "../../constants/config";
import { useFarmerRegistration } from "../../contexts/FarmerRegistrationContext";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";

export default function Register3() {
  const router = useRouter();
  const { 
    frontIdImage,
    frontIdImageName,
    backIdImage,
    backIdImageName,
    cardNumber,
    expiry,
    cvc,
    cardEmail,
    updateField,
    updateImage,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing,
    isVerifying,
    setVerifying,
    isUploadingFrontId,
    isUploadingBackId,
    setLoadingState
  } = useFarmerRegistration();
  
  const { isNavigating, navigate, cleanup } = useNavigationGuard();

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

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
    
    // Validate month and year when user has entered complete date
    if (formatted.length === 5) {
      const [month, year] = formatted.split('/');
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      const currentYear = new Date().getFullYear() % 100; // Get last 2 digits of current year
      const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
      
      // Validate month (1-12)
      if (monthNum < 1 || monthNum > 12) {
        setErrors({ expiry: "Invalid month" });
        return;
      }
      
      // Validate year (not in the past, not too far in future)
      if (yearNum < currentYear || yearNum > currentYear + 20) {
        setErrors({ expiry: "Invalid year" });
        return;
      }
      
      // Check if card is expired (same year but past month)
      if (yearNum === currentYear && monthNum < currentMonth) {
        setErrors({ expiry: "Card expired" });
        return;
      }
      
      // Clear any existing expiry errors if validation passes
      if (errors.expiry) {
        clearErrors();
      }
    }
    
    updateField('expiry', formatted);
  };

  const handleChange = (key, value) => {
    updateField(key, value);
  };
  


  const validateForm = () => {
    return validateCurrentStep();
  };

  const handleImageUpload = async (imageType) => {
    const loadingField = imageType === 'front' ? 'isUploadingFrontId' : 'isUploadingBackId';
    
    try {
      setLoadingState(loadingField, true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        setLoadingState(loadingField, false);
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Disable cropping/editing
        quality: 0.7, // Higher quality since no cropping
        base64: true, // This will return base64 data directly
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fieldName = imageType === 'front' ? 'frontIdImage' : 'backIdImage';
        const base64DataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        
        updateImage(fieldName, base64DataUri, asset.fileName || `${imageType === 'front' ? 'Front' : 'Back'} ID Image`);
      } else if (result.canceled) {
        // User cancelled, just reset loading state
        console.log('Image picker cancelled by user');
      } else {
        // No assets returned, reset loading state
        console.log('No assets returned from image picker');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      const loadingField = imageType === 'front' ? 'isUploadingFrontId' : 'isUploadingBackId';
      setLoadingState(loadingField, false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = imageType === 'front' ? 'frontIdImage' : 'backIdImage';
    const loadingField = imageType === 'front' ? 'isUploadingFrontId' : 'isUploadingBackId';
    
    // Clear any loading state for this image type
    setLoadingState(loadingField, false);
    
    // Remove the image
    updateImage(fieldName, null, "");
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
        name: 'Cardholder'
      };

      const apiBase = await resolveApiBaseUrl();
      const response = await fetch(`${apiBase}/stripe/verify-billing`, {
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
    setStep(2);
    navigate(() => {
      router.replace("/auth/register2");
    });
  };
  
  const handleRegister = async () => {
    if (!validateForm()) return;
    try {
      const verificationResult = await verifyBillingInfo();
      if (verificationResult.success) {
        updateField('stripePaymentMethodId', verificationResult.data.paymentMethodId);
        updateField('stripePaymentIntentId', verificationResult.data.paymentIntentId);
        updateField('billingVerified', true);
        setStep(4);
        navigate(() => {
          router.replace('/auth/register4');
        });
      }
    } finally {
      // no-op
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
            placeholderTextColor={errors.cardNumber ? "#ff3333" : styles.__placeholderColor}
            style={[styles.textInput, styles.textInputFlex]}
            maxLength={19}
          />
          <Image source={require('../../assets/images/cardsFixed.png')} style={styles.inlineCardLogos} resizeMode="contain" />
        </View>
        <View style={[styles.inputRow, {marginBottom: 20}]}> 
          <View style={[styles.input, styles.inputHalf, errors.expiry && styles.inputError]}> 
            <TextInput
              value={errors.expiry ? "" : expiry}
              onChangeText={handleExpiryChange}
              placeholder={errors.expiry || "MM / YY"}
              keyboardType="number-pad"
              placeholderTextColor={errors.expiry ? "#ff3333" : styles.__placeholderColor}
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
              placeholderTextColor={errors.cvc ? "#ff3333" : styles.__placeholderColor}
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
            placeholderTextColor={errors.cardEmail ? "#ff3333" : styles.__placeholderColor}
            style={styles.textInput}
          />
        </View>
      </View>



      {/* Removed ID upload section to match final design */}

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, isVerifying && styles.continueButtonDisabled]} 
          onPress={handleRegister}
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