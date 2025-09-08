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
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register3.styles";
import { API_BASE_URL } from "../../constants/config";

export default function Register3() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from register2
  const userData = params.userData ? JSON.parse(params.userData) : {};
  
  const [form, setForm] = useState({
    vehicleBrand: userData.vehicleBrand || "",
    vehicleModel: userData.vehicleModel || "",
    vehicleYear: userData.vehicleYear || "",
    vehicleType: userData.vehicleType || "",
    vehiclePlateNumber: userData.vehiclePlateNumber || "",
    vehicleColor: userData.vehicleColor || "",
    vehicleRegistrationImage: userData.vehicleRegistrationImage || null,
    vehicleRegistrationImageName: userData.vehicleRegistrationImageName || "",
    vehicleFrontImage: userData.vehicleFrontImage || null,
    vehicleFrontImageName: userData.vehicleFrontImageName || "",
    vehicleBackImage: userData.vehicleBackImage || null,
    vehicleBackImageName: userData.vehicleBackImageName || "",
    vehicleLeftImage: userData.vehicleLeftImage || null,
    vehicleLeftImageName: userData.vehicleLeftImageName || "",
    vehicleRightImage: userData.vehicleRightImage || null,
    vehicleRightImageName: userData.vehicleRightImageName || "",
    licensePlateImage: userData.licensePlateImage || null,
    licensePlateImageName: userData.licensePlateImageName || "",
    insuranceImage: userData.insuranceImage || null,
    insuranceImageName: userData.insuranceImageName || ""
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      vehicleBrand: () => !form.vehicleBrand.trim() && "Vehicle brand is required",
      vehicleModel: () => !form.vehicleModel.trim() && "Vehicle model is required",
      vehicleYear: () => !form.vehicleYear.trim() && "Vehicle year is required",
      vehicleType: () => !form.vehicleType.trim() && "Vehicle type is required",
      vehiclePlateNumber: () => !form.vehiclePlateNumber.trim() && "Vehicle plate number is required",
      vehicleColor: () => !form.vehicleColor.trim() && "Vehicle color is required",
      vehicleRegistrationImage: () => !form.vehicleRegistrationImage && "Vehicle registration image is required",
      vehicleFrontImage: () => !form.vehicleFrontImage && "Vehicle front image is required",
      vehicleBackImage: () => !form.vehicleBackImage && "Vehicle back image is required",
      vehicleLeftImage: () => !form.vehicleLeftImage && "Vehicle left side image is required",
      vehicleRightImage: () => !form.vehicleRightImage && "Vehicle right side image is required",
      licensePlateImage: () => !form.licensePlateImage && "License plate image is required",
      insuranceImage: () => !form.insuranceImage && "Insurance image is required"
    };

    Object.entries(validations).forEach(([key, validate]) => {
      const error = validate();
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
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
        const fieldName = `${imageType}Image`;
        const fileNameField = `${imageType}ImageName`;
        
        setForm(prev => ({
          ...prev,
          [fieldName]: asset.uri,
          [fileNameField]: asset.fileName || `${imageType} Image`
        }));
        
        // Clear any existing error
        if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = `${imageType}Image`;
    const fileNameField = `${imageType}ImageName`;
    
    setForm(prev => ({
      ...prev,
      [fieldName]: null,
      [fileNameField]: ""
    }));
    
    // Clear any existing error when removing image
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    // Use replace to prevent navigation stack issues but preserve previous data
    router.replace({
      pathname: "/auth/register2",
      params: { userData: JSON.stringify({ ...userData }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = () => {
    if (isNavigating || isUploading) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      // Use replace to prevent multiple register4 screens
      router.replace({
        pathname: "/auth/register4",
        params: { userData: JSON.stringify({ ...userData, ...form }) }
      });
      
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const renderImageUpload = (imageType, label, required = true) => {
    const fieldName = `${imageType}Image`;
    const fileNameField = `${imageType}ImageName`;
    const hasImage = form[fieldName];
    const hasError = errors[fieldName];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.imageLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
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
                {form[fileNameField]}
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
        <Text style={styles.title}>Vehicle Information &{"\n"}Documentation</Text>
        <Text style={styles.subtitle}>Please provide your vehicle details and upload all required vehicle documentation.</Text>
      </View>

      {/* Vehicle Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Details</Text>
        
        <View style={styles.inputRow}>
          <View style={[styles.input, styles.inputHalf, errors.vehicleBrand && styles.inputError]}>
            <TextInput
              value={errors.vehicleBrand ? "" : form.vehicleBrand}
              onChangeText={(value) => handleChange('vehicleBrand', value)}
              placeholder={errors.vehicleBrand || "Brand"}
              placeholderTextColor={errors.vehicleBrand ? "#ff3333" : "#999999"}
              style={styles.textInput}
            />
          </View>
          <View style={[styles.input, styles.inputHalf, errors.vehicleModel && styles.inputError]}>
            <TextInput
              value={errors.vehicleModel ? "" : form.vehicleModel}
              onChangeText={(value) => handleChange('vehicleModel', value)}
              placeholder={errors.vehicleModel || "Model"}
              placeholderTextColor={errors.vehicleModel ? "#ff3333" : "#999999"}
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.input, styles.inputHalf, errors.vehicleYear && styles.inputError]}>
            <TextInput
              value={errors.vehicleYear ? "" : form.vehicleYear}
              onChangeText={(value) => handleChange('vehicleYear', value)}
              placeholder={errors.vehicleYear || "Year"}
              placeholderTextColor={errors.vehicleYear ? "#ff3333" : "#999999"}
              keyboardType="numeric"
              style={styles.textInput}
            />
          </View>
          <View style={[styles.input, styles.inputHalf, errors.vehicleType && styles.inputError]}>
            <TextInput
              value={errors.vehicleType ? "" : form.vehicleType}
              onChangeText={(value) => handleChange('vehicleType', value)}
              placeholder={errors.vehicleType || "Type"}
              placeholderTextColor={errors.vehicleType ? "#ff3333" : "#999999"}
              style={styles.textInput}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={[styles.input, styles.inputHalf, errors.vehiclePlateNumber && styles.inputError]}>
            <TextInput
              value={errors.vehiclePlateNumber ? "" : form.vehiclePlateNumber}
              onChangeText={(value) => handleChange('vehiclePlateNumber', value)}
              placeholder={errors.vehiclePlateNumber || "Plate Number"}
              placeholderTextColor={errors.vehiclePlateNumber ? "#ff3333" : "#999999"}
              style={styles.textInput}
            />
          </View>
          <View style={[styles.input, styles.inputHalf, errors.vehicleColor && styles.inputError]}>
            <TextInput
              value={errors.vehicleColor ? "" : form.vehicleColor}
              onChangeText={(value) => handleChange('vehicleColor', value)}
              placeholder={errors.vehicleColor || "Color"}
              placeholderTextColor={errors.vehicleColor ? "#ff3333" : "#999999"}
              style={styles.textInput}
            />
          </View>
        </View>
      </View>

      {/* Vehicle Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Images</Text>
        {renderImageUpload('vehicleRegistration', 'Vehicle Registration', true)}
        {renderImageUpload('vehicleFront', 'Vehicle Front View', true)}
        {renderImageUpload('vehicleBack', 'Vehicle Back View', true)}
        {renderImageUpload('vehicleLeft', 'Vehicle Left Side', true)}
        {renderImageUpload('vehicleRight', 'Vehicle Right Side', true)}
        {renderImageUpload('licensePlate', 'License Plate', true)}
        {renderImageUpload('insurance', 'Insurance Document', true)}
      </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={[styles.continueButton, (isUploading || isNavigating) && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isUploading || isNavigating}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
