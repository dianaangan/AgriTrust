import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  TextInput
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register3.styles";
import { API_BASE_URL } from "../../constants/config";
import {StripeProvider} from '@stripe/stripe-react-native';

export default function Register3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from register2
  const userData = params.userData ? JSON.parse(params.userData) : {};
  
  const [form, setForm] = useState({
    frontIdImage: userData.frontIdImage || null,
    frontIdImageName: userData.frontIdImageName || "",
    backIdImage: userData.backIdImage || null,
    backIdImageName: userData.backIdImageName || ""
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
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

  const handleImageUpload = async (imageType) => {
    try {
      setIsUploading(true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        // Set card number error for permission issues (since this is the main field)
        setErrors(prev => ({ ...prev, cardNumber: 'Valid card number' }));
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fieldName = imageType === 'front' ? 'frontIdImage' : 'backIdImage';
        const fileNameField = imageType === 'front' ? 'frontIdImageName' : 'backIdImageName';
        
        setForm(prev => ({
          ...prev,
          [fieldName]: asset.uri,
          [fileNameField]: asset.fileName || `${imageType === 'front' ? 'Front' : 'Back'} ID Image`
        }));
        
        // Clear any existing error
        if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, cardNumber: 'Valid card number' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = imageType === 'front' ? 'frontIdImage' : 'backIdImage';
    const fileNameField = imageType === 'front' ? 'frontIdImageName' : 'backIdImageName';
    
    setForm(prev => ({
      ...prev,
      [fieldName]: null,
      [fileNameField]: ""
    }));
    
    // Set error if image is required
    setErrors(prev => ({ ...prev, [fieldName]: `${imageType === 'front' ? 'Front' : 'Back'} ID image is required` }));
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
        name: userData.fullName || userData.fullname || 'Cardholder'
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
    router.push({
      pathname: "/auth/register2",
      params: { userData: JSON.stringify({ ...userData, ...form, cardNumber, expiry, cvc, cardEmail }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleRegister = async () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      
      try {
        // First verify billing information with Stripe
        const verificationResult = await verifyBillingInfo();
        
        if (verificationResult.success) {
          const cardData = {
            cardNumber: cardNumber.replace(/\s/g, ''),
            expiry, cvc, cardEmail,
            farmname: userData.farmName || userData.farmname,
            farmlocation: userData.farmLocation || userData.farmlocation,
            pickuplocation: userData.pickupLocation || userData.pickuplocation,
            inquiryemail: userData.customerEmail || userData.inquiryemail,
            profileimage: userData.profileImage || userData.profileimage,
            businessdescription: userData.businessDescription || userData.businessdescription,
            // Add Stripe verification data
            stripePaymentMethodId: verificationResult.data.paymentMethodId,
            stripePaymentIntentId: verificationResult.data.paymentIntentId,
            billingVerified: true
          };
          
          // Use replace to prevent multiple register4 screens
          router.replace({
            pathname: '/auth/register4',
            params: { userData: JSON.stringify({ ...userData, ...cardData }) }
          });
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.title}>Provide your card to continue the transaction</Text>
        <Text style={styles.subtitle}>Input your stripes card details to proceed with the transaction.</Text>
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



      {/* Removed ID upload section to match final design */}

      {/* Continue Button */}
      <TouchableOpacity 
        style={[styles.continueButton, (isVerifying || isUploading) && styles.continueButtonDisabled]} 
        onPress={handleRegister}
        disabled={isVerifying || isUploading}
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
  );
}