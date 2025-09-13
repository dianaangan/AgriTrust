import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register5.styles";
import { useRegistration } from "../../contexts/RegistrationContext";
 

export default function Register5() {
  const router = useRouter();
  const { 
    frontVehicleImage,
    frontVehicleImageName,
    backVehicleImage,
    backVehicleImageName,
    rightVehicleImage,
    rightVehicleImageName,
    leftVehicleImage,
    leftVehicleImageName,
    updateImage,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing,
    setProcessing,
    isUploadingFrontVehicle,
    isUploadingBackVehicle,
    isUploadingRightVehicle,
    isUploadingLeftVehicle,
    setLoadingState
  } = useRegistration();
  
  const [isNavigating, setIsNavigating] = useState(false);


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
      'front': 'isUploadingFrontVehicle',
      'back': 'isUploadingBackVehicle', 
      'right': 'isUploadingRightVehicle',
      'left': 'isUploadingLeftVehicle'
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
        // User cancelled the picker, just reset loading state
        console.log('Image picker cancelled by user');
      } else {
        // No assets returned
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
      'front': 'frontVehicleImage',
      'back': 'backVehicleImage',
      'right': 'rightVehicleImage',
      'left': 'leftVehicleImage'
    };
    return fieldMap[imageType];
  };

  const getFileNameField = (imageType) => {
    const fieldMap = {
      'front': 'frontVehicleImageName',
      'back': 'backVehicleImageName',
      'right': 'rightVehicleImageName',
      'left': 'leftVehicleImageName'
    };
    return fieldMap[imageType];
  };

  const getDefaultFileName = (imageType) => {
    const nameMap = {
      'front': 'Front Vehicle Image',
      'back': 'Back Vehicle Image',
      'right': 'Right Vehicle Image',
      'left': 'Left Vehicle Image'
    };
    return nameMap[imageType];
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = getFieldName(imageType);
    const loadingFieldMap = {
      'front': 'isUploadingFrontVehicle',
      'back': 'isUploadingBackVehicle', 
      'right': 'isUploadingRightVehicle',
      'left': 'isUploadingLeftVehicle'
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
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setStep(4);
    router.replace("/auth/register4");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = async () => {
    console.log('Register5: handleContinue called');
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    console.log('Register5: Validating form...');
    if (validateForm()) {
      console.log('Register5: Form validation passed, passing data forward...');
      setIsNavigating(true);
      
      console.log('Register5: Images being passed:', {
        vehiclefrontimage: frontVehicleImage?.substring(0, 50) + '...',
        vehiclebackimage: backVehicleImage?.substring(0, 50) + '...',
        vehiclerightimage: rightVehicleImage?.substring(0, 50) + '...',
        vehicleleftimage: leftVehicleImage?.substring(0, 50) + '...'
      });

      setStep(6);
      router.replace('/auth/register6');
    }
  };

  const renderUploadButton = (imageType, label, errorKey) => {
    const fieldName = getFieldName(imageType);
    const fileNameField = getFileNameField(imageType);
    const hasImage = fieldName === 'frontVehicleImage' ? frontVehicleImage : 
                    fieldName === 'backVehicleImage' ? backVehicleImage :
                    fieldName === 'rightVehicleImage' ? rightVehicleImage :
                    fieldName === 'leftVehicleImage' ? leftVehicleImage : null;
    const hasError = errors[fieldName];
    
    // Get the appropriate loading state for this image type
    let isUploading = false;
    if (imageType === 'front') {
      isUploading = isUploadingFrontVehicle;
    } else if (imageType === 'back') {
      isUploading = isUploadingBackVehicle;
    } else if (imageType === 'right') {
      isUploading = isUploadingRightVehicle;
    } else if (imageType === 'left') {
      isUploading = isUploadingLeftVehicle;
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
                {fieldName === 'frontVehicleImage' ? frontVehicleImageName : 
                 fieldName === 'backVehicleImage' ? backVehicleImageName :
                 fieldName === 'rightVehicleImage' ? rightVehicleImageName :
                 fieldName === 'leftVehicleImage' ? leftVehicleImageName : ''}
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
          <Text style={styles.title}>Upload Vehicle Photos</Text>
          <Text style={styles.subtitle}>Submit well-lit vehicle photos: front, back, sides (Left, Right).</Text>
        </View>

        {/* Upload Sections */}
        <View style={styles.section}>
          {renderUploadButton('front', 'Front Vehicle Image', 'frontVehicleImage')}
          {renderUploadButton('back', 'Back Vehicle Image', 'backVehicleImage')}
          {renderUploadButton('right', 'Right Vehicle Image', 'rightVehicleImage')}
          {renderUploadButton('left', 'Left Vehicle Image', 'leftVehicleImage')}
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
