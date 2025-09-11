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
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register4.styles";
import { API_BASE_URL } from "../../constants/config";
import SuccessToast from "../../components/SuccessToast";
import { useFarmerRegistration } from "../../contexts/FarmerRegistrationContext";

export default function Register4() {
  const router = useRouter();
  const { 
    frontIdImage,
    frontIdImageName,
    backIdImage,
    backIdImageName,
    updateImage,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    validateCompleteRegistration,
    isProcessing,
    isRegistering,
    setRegistering,
    isUploadingFrontId,
    isUploadingBackId,
    setLoadingState,
    getRegistrationData,
    resetRegistration
  } = useFarmerRegistration();

  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);



  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setStep(3);
    router.replace("/auth/register3");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const validateForm = () => {
    return validateCurrentStep();
  };

  const handleImageUpload = async (imageType) => {
    try {
      const loadingField = imageType === 'front' ? 'isUploadingFrontId' : 'isUploadingBackId';
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

  const handleSuccessToastClose = () => {
    setShowSuccessToast(false);
    router.replace('/landing');
  };

  const handleContinue = async () => {
    if (isNavigating || isRegistering) return; // Prevent multiple rapid clicks
    
     console.log('Register4: handleContinue called');
    if (!validateForm()) {
      console.log('Register4: Form validation failed');
      return;
    }

    console.log('Register4: Form validation passed, starting registration...');
    setRegistering(true);
    setIsNavigating(true);

    try {
      // Get all registration data from context
      const registrationData = getRegistrationData();
      
      // Use comprehensive validation
      const validation = validateCompleteRegistration();
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      console.log('Register4: All validation passed, sending data to server...');
      console.log('Register4: Registration data keys:', Object.keys(registrationData));
      console.log('Register4: Image fields present:', Object.keys(registrationData).filter(key => key.includes('image')));

      const registerResponse = await fetch(`${API_BASE_URL}/farmers/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(registrationData)
      });

      console.log('Register4: Response status:', registerResponse.status);

      const result = await registerResponse.json();
      console.log('Register4: Response data:', result);
      
      if (!registerResponse.ok) {
        const serverMsg = result.message || result.error || result.details || `HTTP ${registerResponse.status}`;
        console.error('Register4: Registration failed:', serverMsg);
        throw new Error(serverMsg);
      }

      if (!result.success) {
        const serverMsg = result.message || result.error || 'Registration failed';
        console.error('Register4: Registration failed:', serverMsg);
        throw new Error(serverMsg);
      }

      console.log('Register4: Registration successful!');
      
      // Clear registration data after successful registration
      resetRegistration();
      
      // Success path: show toast
      setShowSuccessToast(true);
      
    } catch (error) {
      console.error('Register4: Registration error:', error);
      Alert.alert(
        'Registration Failed', 
        error.message || 'An error occurred during registration. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setRegistering(false);
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
        <Text style={styles.title}>Upload Photo for your Valid ID</Text>
        <Text style={styles.subtitle}>Upload clear front and back images of your valid id. Ensure all details are readable.</Text>
      </View>

      <View style={styles.section}>
        {/* Front ID Image */}
        <View style={styles.imageSection}>
          {!frontIdImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.frontIdImage && styles.inputError]} 
              onPress={() => handleImageUpload('front')}
              disabled={isUploadingFrontId}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingFrontId ? (
                  <ActivityIndicator size="small" color={errors.frontIdImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons name="image-outline" size={24} color={errors.frontIdImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadText, errors.frontIdImage && styles.errorText]}>
                  {isUploadingFrontId ? "Uploading..." : (errors.frontIdImage || "Browse (Front Valid ID Image)")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.frontIdImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {frontIdImageName}
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
          {!backIdImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.backIdImage && styles.inputError]} 
              onPress={() => handleImageUpload('back')}
              disabled={isUploadingBackId}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingBackId ? (
                  <ActivityIndicator size="small" color={errors.backIdImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons name="image-outline" size={24} color={errors.backIdImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadText, errors.backIdImage && styles.errorText]}>
                  {isUploadingBackId ? "Uploading..." : (errors.backIdImage || "Browse (Back Valid ID Image)")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.backIdImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {backIdImageName}
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
        style={[styles.registerButton, isRegistering && styles.registerButtonDisabled]} 
        onPress={handleContinue}
        disabled={isRegistering}
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
    </KeyboardAvoidingView>

    {/* Success Toast */}
    <SuccessToast
      visible={showSuccessToast}
      onClose={handleSuccessToastClose}
      title="Registration Successful"
      message="Your account has been created. Verification may take 1–2 business days, and you will be notified by email once completed.\nClick OK to proceed."
      duration={0}
    />
    </>
  );
}


