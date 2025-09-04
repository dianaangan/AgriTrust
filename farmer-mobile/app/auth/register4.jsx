import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  Alert,
  Image,
  ActivityIndicator
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register4.styles";
import { API_BASE_URL } from "../../constants/config";
import SuccessToast from "../../components/SuccessToast";

export default function Register4() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from register3 - this should contain all data from register1, register2, and register3
  const userData = params.userData ? JSON.parse(params.userData) : {};

  const [form, setForm] = useState({
    frontIdImage: userData.frontIdImage || null,
    frontIdImageName: userData.frontIdImageName || "",
    backIdImage: userData.backIdImage || null,
    backIdImageName: userData.backIdImageName || ""
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);



  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    router.push({
      pathname: "/auth/register3",
      params: { userData: JSON.stringify({ ...userData, ...form }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 100);
  };

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      frontIdImage: () => !form.frontIdImage && "Front ID image is required",
      backIdImage: () => !form.backIdImage && "Back ID image is required"
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
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // No cropping
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
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = imageType === 'front' ? 'frontIdImage' : 'backIdImage';
    const fileNameField = imageType === 'front' ? 'frontIdImageName' : 'backIdImageName';
    setForm(prev => ({ ...prev, [fieldName]: null, [fileNameField]: "" }));
    setErrors(prev => ({ ...prev, [fieldName]: `${imageType === 'front' ? 'Front' : 'Back'} ID image is required` }));
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
      console.error('Error converting image to base64:', error);
      // Fallback: return the original URI
      return imageUri;
    }
  };

  // Function to clear all forms and reset navigation stack
  const clearAllForms = () => {
    try {
      // Reset the current form state
      setForm({
        frontIdImage: null,
        frontIdImageName: "",
        backIdImage: null,
        backIdImageName: ""
      });
      
      // Clear any errors
      setErrors({});
      
      // Clear any loading states
      setIsRegistering(false);
      setIsUploading(false);
    } catch (error) {
      console.error('Error clearing forms:', error);
    }
  };

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
    clearAllForms();
    router.replace('/landing');
  };

  const handleContinue = async () => {
    if (isNavigating || isRegistering) return; // Prevent multiple rapid clicks
    
    if (!validateForm()) return;
    
    setIsRegistering(true);
    setIsNavigating(true);
    
    try {
      // Convert images to base64 format
      const profileImageBase64 = await convertImageToBase64(userData.profileImage || userData.profileimage);
      const frontIdImageBase64 = await convertImageToBase64(form.frontIdImage);
      const backIdImageBase64 = await convertImageToBase64(form.backIdImage);
      
      // Combine all data from register1, register2, register3, and register4
      const registrationData = {
        // From register1 (basic user info)
        firstname: userData.firstName || userData.firstname,
        lastname: userData.lastName || userData.lastname,
        email: userData.email,
        phonenumber: userData.phone || userData.phonenumber,
        username: userData.username,
        password: userData.password,
        
        // From register2 (business details)
        farmname: userData.farmName || userData.farmname,
        farmlocation: userData.farmLocation || userData.farmlocation,
        pickuplocation: userData.pickupLocation || userData.pickuplocation,
        inquiryemail: userData.customerEmail || userData.inquiryemail,
        profileimage: profileImageBase64,
        businessdescription: userData.businessDescription || userData.businessdescription,
        
        // From register3 (payment details)
        cardNumber: userData.cardNumber,
        cardExpiry: userData.expiry,
        cardCVC: userData.cvc,
        cardEmail: userData.cardEmail,
        
        // From register4 (ID images)
        frontIdImage: frontIdImageBase64,
        backIdImage: backIdImageBase64
      };

      const registerResponse = await fetch(`${API_BASE_URL}/farmers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const result = await registerResponse.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Registration failed');
      }
      
      setShowSuccessToast(true);
      
    } catch (error) {
      console.error('Registration error:', error);
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.title}>Upload Photo for your Valid ID</Text>
        <Text style={styles.subtitle}>Upload clear front and back images of your valid id. Ensure all details are readable.</Text>
      </View>

      <View style={styles.section}>
        {/* Front ID Image */}
        <View style={styles.imageSection}>
          {!form.frontIdImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.frontIdImage && styles.inputError]} 
              onPress={() => handleImageUpload('front')}
              disabled={isUploading}
            >
              <View style={styles.imageUploadContent}>
                <Ionicons name="image-outline" size={24} color={errors.frontIdImage ? "#FF3B30" : "#0b6623"} />
                <Text style={[styles.imageUploadText, errors.frontIdImage && styles.errorText]}>
                  {errors.frontIdImage || "Browse (Front Valid ID Image)"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.frontIdImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {form.frontIdImageName}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveImage('front')} style={styles.cancelButton}>
                  <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Back ID Image */}
        <View style={styles.imageSection}>
          {!form.backIdImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.backIdImage && styles.inputError]} 
              onPress={() => handleImageUpload('back')}
              disabled={isUploading}
            >
              <View style={styles.imageUploadContent}>
                <Ionicons name="image-outline" size={24} color={errors.backIdImage ? "#FF3B30" : "#0b6623"} />
                <Text style={[styles.imageUploadText, errors.backIdImage && styles.errorText]}>
                  {errors.backIdImage || "Browse (Back Valid ID Image)"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.backIdImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {form.backIdImageName}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveImage('back')} style={styles.cancelButton}>
                  <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.registerButton, (isRegistering || isUploading) && styles.registerButtonDisabled]} 
        onPress={handleContinue}
        disabled={isRegistering || isUploading}
      >
        {isRegistering ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="white" />
            <Text style={styles.registerButtonText}>Registering...</Text>
          </View>
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
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


