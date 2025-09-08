import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../../assets/styles/register4.styles";
import { API_BASE_URL } from "../../constants/config";
import SuccessToast from "../../components/SuccessToast";

export default function Register4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from register3 - this should contain all data from register1, register2, and register3
  const userData = params.userData ? JSON.parse(params.userData) : {};

  const [cardNumber, setCardNumber] = useState(() => {
    const savedCardNumber = userData.cardNumber || "";
    // Format the saved card number with spaces every 4 digits
    if (savedCardNumber) {
      const digitsOnly = savedCardNumber.replace(/\D/g, '');
      return digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    }
    return "";
  });
  const [expiry, setExpiry] = useState(userData.expiry || "");
  const [cvc, setCvc] = useState(userData.cvc || "");
  const [cardEmail, setCardEmail] = useState(userData.cardEmail || "");

  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleCardChange = (value) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors(prev => ({ ...prev, cardNumber: null }));
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
    setExpiry(formatted);
    if (errors.expiry) setErrors(prev => ({ ...prev, expiry: null }));
  };

  const handleChange = (key, value) => {
    const setters = {
      cardNumber: setCardNumber,
      cvc: setCvc,
      cardEmail: setCardEmail
    };
    setters[key](value);
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      cardNumber: () => !cardNumber.trim() && "Valid card number",
      expiry: () => !expiry.trim() && "Valid expiry",
      cvc: () => !cvc.trim() && "Valid CVC",
      cardEmail: () => !cardEmail.trim() ? "Valid email" : !/\S+@\S+\.\S+/.test(cardEmail) && "Valid email"
    };

    Object.entries(validations).forEach(([key, validate]) => {
      const error = validate();
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to verify billing information with Stripe
  const verifyBillingInfo = async () => {
    try {
      setIsVerifying(true);
      
      // Parse expiry date
      const [month, year] = expiry.split('/');
      const fullYear = `20${year}`;
      
      const billingData = {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryMonth: month,
        expiryYear: fullYear,
        cvc: cvc,
        email: cardEmail,
        name: userData.firstName || userData.firstname || 'Cardholder'
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
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cardNumber;
          delete newErrors.expiry;
          delete newErrors.cvc;
          delete newErrors.cardEmail;
          return newErrors;
        });
        
        return { success: true, data: result };
      } else {
        // Set card number error for invalid card
        setErrors(prev => ({
          ...prev,
          cardNumber: "Valid card number"
        }));
        return { success: false, error: result.message };
      }
    } catch (error) {
      // Set card number error for network/server issues
      setErrors(prev => ({
        ...prev,
        cardNumber: "Valid card number"
      }));
      return { success: false, error: error.message };
    } finally {
      setIsVerifying(false);
    }
  };

  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    // Use replace to prevent navigation stack issues but preserve previous data
    router.replace({
      pathname: "/auth/register3",
      params: { userData: JSON.stringify({ ...userData }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // Helper function to convert image URI to base64
  const convertImageToBase64 = async (imageUri) => {
    try {
      if (!imageUri) return null;
      
      // If it's already a data URI, return as is
      if (imageUri.startsWith('data:image/')) {
        return imageUri;
      }
      
      // If it's a file URI, we need to read it and convert to base64
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        try {
          // For React Native, we can use fetch with the file URI
          const response = await fetch(imageUri);
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result;
              resolve(result);
            };
            reader.onerror = (error) => {
              reject(error);
            };
            reader.readAsDataURL(blob);
          });
        } catch (fetchError) {
          // Fallback: return the original URI and let backend handle it
          return imageUri;
        }
      }
      
      // If it's already a URL, return as is
      return imageUri;
    } catch (error) {
      // Fallback: return the original URI
      return imageUri;
    }
  };

  // Function to clear all forms and reset navigation stack
  const clearAllForms = () => {
    try {
      // Clear any errors
      setErrors({});
      
      // Clear any loading states
      setIsRegistering(false);
      setIsVerifying(false);
    } catch (error) {
    }
  };

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
    clearAllForms();
    // Use replace to prevent multiple landing screens
    router.replace('/landing');
  };

  const handleRegister = async () => {
    if (isNavigating || isRegistering) return; // Prevent multiple rapid clicks
    
    if (!validateForm()) return;
    
    setIsRegistering(true);
    setIsNavigating(true);
    
    try {
      // First verify billing information with Stripe
      const verificationResult = await verifyBillingInfo();
      
      if (verificationResult.success) {
        // Convert images to base64 format
        const profileImageBase64 = await convertImageToBase64(userData.profileImage);
        const licenseFrontImageBase64 = await convertImageToBase64(userData.licenseFrontImage);
        const licenseBackImageBase64 = await convertImageToBase64(userData.licenseBackImage);
        const vehicleRegistrationImageBase64 = await convertImageToBase64(userData.vehicleRegistrationImage);
        const vehicleFrontImageBase64 = await convertImageToBase64(userData.vehicleFrontImage);
        const vehicleBackImageBase64 = await convertImageToBase64(userData.vehicleBackImage);
        const vehicleLeftImageBase64 = await convertImageToBase64(userData.vehicleLeftImage);
        const vehicleRightImageBase64 = await convertImageToBase64(userData.vehicleRightImage);
        const licensePlateImageBase64 = await convertImageToBase64(userData.licensePlateImage);
        const insuranceImageBase64 = await convertImageToBase64(userData.insuranceImage);
        
        // Combine all data from register1, register2, register3, and register4
        const registrationData = {
          // From register1 (basic user info)
          firstname: userData.firstName || userData.firstname,
          lastname: userData.lastName || userData.lastname,
          email: userData.email,
          phonenumber: userData.phone || userData.phonenumber,
          username: userData.username,
          password: userData.password,
          
          // From register2 (profile and license images)
          profileimage: profileImageBase64,
          licensefrontimage: licenseFrontImageBase64,
          licensebackimage: licenseBackImageBase64,
          
          // From register3 (vehicle information)
          vehiclebrand: userData.vehicleBrand,
          vehiclemodel: userData.vehicleModel,
          vehicleyearmanufacture: userData.vehicleYear,
          vehicletype: userData.vehicleType,
          vehicleplatenumber: userData.vehiclePlateNumber,
          vehiclecolor: userData.vehicleColor,
          vehicleregistrationimage: vehicleRegistrationImageBase64,
          vehiclefrontimage: vehicleFrontImageBase64,
          vehiclebackimage: vehicleBackImageBase64,
          vehicleleftimage: vehicleLeftImageBase64,
          vehiclerightimage: vehicleRightImageBase64,
          licenseplateimage: licensePlateImageBase64,
          insuranceimage: insuranceImageBase64,
          phonecompatibility: true, // Default to true for drivers
          
          // From register4 (payment details)
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpiry: expiry,
          cardCVC: cvc,
          cardEmail: cardEmail,
          
          // Add Stripe verification data
          stripePaymentMethodId: verificationResult.data.paymentMethodId,
          stripePaymentIntentId: verificationResult.data.paymentIntentId,
          billingVerified: true
        };

        const registerResponse = await fetch(`${API_BASE_URL}/deliverydrivers/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });

        const result = await registerResponse.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Registration failed');
        }
        
        setShowSuccessToast(true);
      } else {
        // Error is already set in the verifyBillingInfo function
        // No need for Alert.alert - error is already displayed inline
      }
    } catch (error) {
      Alert.alert(
        'Registration Failed', 
        error.message || 'An error occurred during registration. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRegistering(false);
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  return (
    <>
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

      <View style={styles.header}>
        <Text style={styles.title}>Payment Information</Text>
        <Text style={styles.subtitle}>Provide your card details to complete the registration process.</Text>
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
              placeholder={errors.expiry || "MM/YY"}
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

      <TouchableOpacity 
        style={[styles.registerButton, (isVerifying || isRegistering) && styles.registerButtonDisabled]} 
        onPress={handleRegister}
        disabled={isVerifying || isRegistering}
      >
        {isVerifying || isRegistering ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.registerButtonText}>
              {isVerifying ? "Verifying..." : "Registering..."}
            </Text>
          </View>
        ) : (
          <Text style={styles.registerButtonText}>Complete Registration</Text>
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
      </ScrollView>
    </KeyboardAvoidingView>

    {/* Success Toast */}
    <SuccessToast
      visible={showSuccessToast}
      onClose={handleSuccessToastClose}
      title="Registration Confirmed"
      message="Your account verification is in progress and may take up to 24 hours. You'll be notified by email once it's complete."
    />
    </>
  );
}
