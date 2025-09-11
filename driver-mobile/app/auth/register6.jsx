import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Linking
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register6.styles";
import { resolveApiBaseUrl, API_BASE_URL } from "../../constants/config";
import SuccessToast from "../../components/SuccessToast";
import { useRegistration } from "../../contexts/RegistrationContext";
 

export default function Register6() {
  const router = useRouter();
  const { 
    vehicleRegistrationImage,
    vehicleRegistrationImageName,
    licensePlateImage,
    licensePlateImageName,
    phoneCompatibility,
    updateImage,
    updateField,
    setStep,
    errors,
    validateCurrentStep,
    isRegistering,
    setRegistering,
    isUploadingRegistration,
    isUploadingPlate,
    setLoadingState,
    getRegistrationData,
    resetRegistration,
    validateCompleteRegistration
  } = useRegistration();
  
  const [isNavigating, setIsNavigating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);


  const getImageConfig = (imageType) => {
    const configs = {
      registration: {
        field: 'vehicleRegistrationImage',
        nameField: 'vehicleRegistrationImageName',
        defaultName: 'Vehicle Registration Image',
        loadingField: 'isUploadingRegistration'
      },
      plate: {
        field: 'licensePlateImage',
        nameField: 'licensePlateImageName',
        defaultName: 'License Plate Image',
        loadingField: 'isUploadingPlate'
      }
    };
    return configs[imageType] || {};
  };

  const handleImageUpload = async (imageType) => {
    const config = getImageConfig(imageType);
    try {
      setLoadingState(config.loadingField, true);
      
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const base64DataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        updateImage(config.field, base64DataUri, asset.fileName || config.defaultName);
      } else if (!result.canceled) {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', `Failed to pick image: ${error.message}`);
    } finally {
      setLoadingState(config.loadingField, false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const config = getImageConfig(imageType);
    setLoadingState(config.loadingField, false);
    updateImage(config.field, null, "");
  };

  const renderUploadButton = (imageType, label) => {
    const config = getImageConfig(imageType);
    const hasImage = imageType === 'registration' ? vehicleRegistrationImage : licensePlateImage;
    const hasError = errors[config.field];
    const isUploading = imageType === 'registration' ? isUploadingRegistration : isUploadingPlate;
    const imageName = imageType === 'registration' ? vehicleRegistrationImageName : licensePlateImageName;

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
              <Text style={[styles.imageUploadText, hasError && styles.imageUploadErrorText]}>
                {isUploading ? 'Uploading...' : `Browse (${label})`}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.imagePreviewContainer, hasError && styles.inputError]}>
            <View style={styles.imageInfoContainer}>
              <Text style={styles.imageFileName} numberOfLines={1} ellipsizeMode="middle">
                {imageName}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveImage(imageType)} style={styles.cancelButton}>
                <MaterialIcons name="close" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  const validateForm = () => {
    return validateCurrentStep();
  };



  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    setStep(5);
    router.replace("/auth/register5");
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleToastClose = () => {
    setShowSuccessToast(false);
    router.replace('/landing');
  };

  const handleRegister = async () => {
    if (isNavigating || isRegistering) return;
    
    if (!validateForm()) return;

    setRegistering(true);
    setIsNavigating(true);

    try {
      const registrationData = getRegistrationData();
      const validation = validateCompleteRegistration();
      
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const apiBase = await resolveApiBaseUrl();
      const response = await fetch(`${apiBase}/deliverydrivers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();
      
      if (!response.ok || result.success === false) {
        throw new Error(result.message || result.error || 'Registration failed');
      }

      resetRegistration();
      setShowSuccessToast(true);
      
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setRegistering(false);
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {/* Navigation Bar */}
          <View style={styles.navBar}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />{/* 6/6 steps */}
              </View>
            </View>
          </View>

          {/* Header Section */}
          <Text style={styles.title}>Upload Registration, Plate photos & Check Compatibility</Text>
          <Text style={styles.subtitle}>
            Provide readable photos of your Vehicle Registration (OR/CR) and License Plate, and verify device compatibility.
          </Text>

          {/* Upload Sections */}
          {renderUploadButton('registration', 'Vehicle Registration Image')}
          {renderUploadButton('plate', 'License Plate Image')}

          {/* Compatibility Checkbox */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, errors.phoneCompatibility && styles.inputError]}
              onPress={() => updateField('phoneCompatibility', !phoneCompatibility)}
            >
              {phoneCompatibility && (
                <MaterialIcons name="check" size={16} color="#0b6623" />
              )}
            </TouchableOpacity>
            <Text style={[styles.checkboxText, errors.phoneCompatibility && styles.checkboxErrorText]}>
              I confirm that I have a smartphone with Android 8.0 or higher (or iOS 13 or higher) and internet access.
            </Text>
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, (isNavigating || isRegistering) && styles.registerButtonDisabled]} 
            onPress={handleRegister}
            disabled={isNavigating || isRegistering}
          >
            {isRegistering ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator size="small" color="white" />
                <Text style={[styles.registerButtonText, { marginLeft: 8 }]}>Registering...</Text>
              </View>
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            By creating this account, you agree to the 
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Service</Text> and 
            <Text style={styles.linkText} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>

      <SuccessToast
        visible={showSuccessToast}
        onClose={handleToastClose}
        title="Registration Successful"
        message="Your account has been created. Verification may take 1–2 business days, and you will be notified by email once completed.\nClick OK to proceed."
        duration={0}
      />
    </KeyboardAvoidingView>
  );
}
