import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register3.styles";
import { API_BASE_URL } from "../../constants/config";
import { useRegistration } from "../../contexts/RegistrationContext";
 

export default function Register3() {
  const router = useRouter();
  const { 
    profileImage,
    profileImageName,
    licenseFrontImage,
    licenseFrontImageName,
    licenseBackImage,
    licenseBackImageName,
    insuranceImage,
    insuranceImageName,
    updateImage,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing,
    setProcessing,
    isUploadingProfile,
    isUploadingLicenseFront,
    isUploadingLicenseBack,
    isUploadingInsurance,
    setLoadingState
  } = useRegistration();

  

  const compressBase64Image = (base64String, maxSizeKB = 1000) => {
    try {
      if (!base64String || !base64String.startsWith('data:image/')) return base64String;
      
      // Calculate current size in KB
      const currentSizeKB = (base64String.length * 0.75) / 1024;
      console.log('Current image size:', currentSizeKB.toFixed(2), 'KB');
      
      if (currentSizeKB <= maxSizeKB) {
        console.log('Image size is acceptable, no compression needed');
        return base64String;
      }
      
      // If image is too large, we'll need to recompress it
      // For now, return the original and let the image picker quality setting handle it
      console.log('Image size is large, but using picker compression');
      return base64String;
    } catch (error) {
      console.error('Error compressing image:', error);
      return base64String;
    }
  };

  const handleImageUpload = async (imageType) => {
    // Simple mapping approach - moved outside try block for scope
    const loadingFieldMap = {
      'profile': 'isUploadingProfile',
      'licenseFront': 'isUploadingLicenseFront', 
      'licenseBack': 'isUploadingLicenseBack',
      'insurance': 'isUploadingInsurance'
    };
    
    const loadingField = loadingFieldMap[imageType];
    if (!loadingField) {
      console.error('Invalid image type:', imageType);
      return;
    }
    
    try {
      setLoadingState(loadingField, true);
      
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        setLoadingState(loadingField, false);
        return;
      }

      // Launch image picker with base64 option and compression
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false, // Disable cropping/editing
        quality: 0.7, // Higher quality since no cropping
        base64: true, // This will return base64 data directly
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fieldName = getFieldName(imageType);
        const fileNameField = getFileNameField(imageType);

        // Create base64 data URI from the base64 data and compress it
        const base64DataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        const compressedImage = compressBase64Image(base64DataUri);

        updateImage(fieldName, compressedImage, asset.fileName || getDefaultFileName(imageType));
      } else if (result.canceled) {
        // User cancelled, just reset loading state
        console.log('Image picker cancelled by user');
      } else {
        // No assets returned, reset loading state
        console.log('No assets returned from image picker');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingState(loadingField, false);
    }
  };

  const getFieldName = (imageType) => {
    const fieldMap = {
      'profile': 'profileImage',
      'licenseFront': 'licenseFrontImage',
      'licenseBack': 'licenseBackImage',
      'insurance': 'insuranceImage'
    };
    return fieldMap[imageType];
  };

  const getFileNameField = (imageType) => {
    const fieldMap = {
      'profile': 'profileImageName',
      'licenseFront': 'licenseFrontImageName',
      'licenseBack': 'licenseBackImageName',
      'insurance': 'insuranceImageName'
    };
    return fieldMap[imageType];
  };

  const getDefaultFileName = (imageType) => {
    const nameMap = {
      'profile': 'Profile Image',
      'licenseFront': 'License Front Image',
      'licenseBack': 'License Back Image',
      'insurance': 'Insurance Image'
    };
    return nameMap[imageType];
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = getFieldName(imageType);
    const loadingFieldMap = {
      'profile': 'isUploadingProfile',
      'licenseFront': 'isUploadingLicenseFront', 
      'licenseBack': 'isUploadingLicenseBack',
      'insurance': 'isUploadingInsurance'
    };
    
    const loadingField = loadingFieldMap[imageType];
    if (loadingField) {
      setLoadingState(loadingField, false);
    }
    
    updateImage(fieldName, null, "");
  };

  const validateForm = () => {
    return validateCurrentStep();
  };

  const handleBack = () => {
    if (isProcessing) return; // Prevent multiple rapid clicks
    
    setStep(2);
    router.replace("/auth/register2");
  };
  
  const handleContinue = async () => {
    console.log('Register3: handleContinue called');
    if (isProcessing) return; // Prevent multiple rapid clicks
    
    console.log('Register3: Validating form...');
    if (!validateForm()) {
      console.log('Register3: Form validation failed');
      return;
    }

    console.log('Register3: Form validation passed, proceeding to next step...');
    setProcessing(true);
    
    try {
      console.log('Register3: Images in context:', {
        profileimage: profileImage?.substring(0, 50) + '...',
        licensefrontimage: licenseFrontImage?.substring(0, 50) + '...',
        licensebackimage: licenseBackImage?.substring(0, 50) + '...',
        insuranceimage: insuranceImage?.substring(0, 50) + '...'
      });

      setStep(4);
      router.replace('/auth/register4');
    } catch (error) {
      console.error('Error processing images:', error);
      Alert.alert('Error', 'Failed to process images. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const renderUploadButton = (imageType, label, errorKey) => {
    const fieldName = getFieldName(imageType);
    const fileNameField = getFileNameField(imageType);
    const hasImage = fieldName === 'profileImage' ? profileImage : 
                    fieldName === 'licenseFrontImage' ? licenseFrontImage :
                    fieldName === 'licenseBackImage' ? licenseBackImage :
                    fieldName === 'insuranceImage' ? insuranceImage : null;
    const hasError = errors[fieldName];
    
    // Get the appropriate loading state for this image type
    let isUploading = false;
    if (imageType === 'profile') {
      isUploading = isUploadingProfile;
    } else if (imageType === 'licenseFront') {
      isUploading = isUploadingLicenseFront;
    } else if (imageType === 'licenseBack') {
      isUploading = isUploadingLicenseBack;
    } else if (imageType === 'insurance') {
      isUploading = isUploadingInsurance;
    }

    return (
      <View style={styles.imageSection}>
        {!hasImage ? (
          <TouchableOpacity 
            style={[styles.imageUploadButton, hasError && styles.inputError]} 
            onPress={() => handleImageUpload(imageType)}
            disabled={isUploading}
          >
            <View style={styles.imageUploadContent}>
              {isUploading ? (
                <ActivityIndicator size="small" color={hasError ? "#FF3B30" : "#0b6623"} />
              ) : (
                <Ionicons name="image-outline" size={24} color={hasError ? "#FF3B30" : "#0b6623"} />
              )}
              <Text style={[styles.imageUploadText, hasError && styles.errorText]}>
                {isUploading ? "Uploading..." : (hasError || `Browse (${label})`)}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.imagePreviewContainer, hasError && styles.inputError]}>
            <View style={styles.imageInfoContainer}>
              <Text style={styles.imageFileName} numberOfLines={1}>
                {fieldName === 'profileImage' ? profileImageName : 
                 fieldName === 'licenseFrontImage' ? licenseFrontImageName :
                 fieldName === 'licenseBackImage' ? licenseBackImageName :
                 fieldName === 'insuranceImage' ? insuranceImageName : ''}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveImage(imageType)} style={styles.cancelButton}>
                <MaterialIcons name="close" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
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
          <Text style={styles.title}>Provide your photo, Driver's License, and Insurance.</Text>
          <Text style={styles.subtitle}>Submit a formal photo, Driver's License (front & back), and Insurance with all details visible.</Text>
        </View>

        {/* Upload Sections */}
        <View style={styles.section}>
          {renderUploadButton('profile', 'Profile Image', 'profileImage')}
          {renderUploadButton('licenseFront', 'License Front Image', 'licenseFrontImage')}
          {renderUploadButton('licenseBack', 'License Back Image', 'licenseBackImage')}
          {renderUploadButton('insurance', 'Insurance Image', 'insuranceImage')}
        </View>

         {/* Continue Button */}
         <TouchableOpacity 
           style={[styles.continueButton, isProcessing && styles.continueButtonDisabled]} 
           onPress={handleContinue}
           disabled={isProcessing}
         >
           {isProcessing ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="small" color="#ffffff" />
               <Text style={styles.continueText}>Processing...</Text>
             </View>
           ) : (
             <Text style={styles.continueButtonText}>Continue</Text>
           )}
         </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}