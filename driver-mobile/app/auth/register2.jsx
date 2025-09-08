import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register2.styles";
import getColors from "../../constants/colors";
import { API_BASE_URL } from "../../constants/config";

const colors = getColors('light');

export default function Register2() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get user data from register1
  const userData = params.userData ? JSON.parse(params.userData) : {};
  
  const [form, setForm] = useState({
    vehicleType: userData.vehicleType || "",
    vehicleModel: userData.vehicleModel || "",
    vehicleYear: userData.vehicleYear || "",
    vehicleColor: userData.vehicleColor || "",
    licensePlate: userData.licensePlate || "",
    profileImage: userData.profileImage || null,
    profileImageName: userData.profileImageName || "",
    licenseFrontImage: userData.licenseFrontImage || null,
    licenseFrontImageName: userData.licenseFrontImageName || "",
    licenseBackImage: userData.licenseBackImage || null,
    licenseBackImageName: userData.licenseBackImageName || ""
  });

  const [errors, setErrors] = useState({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      vehicleType: () => !form.vehicleType.trim() && "Vehicle type is required",
      vehicleModel: () => !form.vehicleModel.trim() && "Vehicle model is required",
      vehicleYear: () => !form.vehicleYear.trim() && "Vehicle year is required",
      vehicleColor: () => !form.vehicleColor.trim() && "Vehicle color is required",
      licensePlate: () => !form.licensePlate.trim() && "License plate is required",
      profileImage: () => !form.profileImage && "Profile image is required",
      licenseFrontImage: () => !form.licenseFrontImage && "Driver's license front image is required",
      licenseBackImage: () => !form.licenseBackImage && "Driver's license back image is required"
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

  const handleFocus = (key) => {
    if (errors[key]) {
      setErrors((s) => ({ ...s, [key]: null }));
    }
  };

  const handleImageUpload = async (imageType) => {
    try {
      setIsUploadingImage(true);
      
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
        const fieldName = imageType === 'profile' ? 'profileImage' : 
                         imageType === 'licenseFront' ? 'licenseFrontImage' : 'licenseBackImage';
        const fileNameField = imageType === 'profile' ? 'profileImageName' : 
                             imageType === 'licenseFront' ? 'licenseFrontImageName' : 'licenseBackImageName';
        
        setForm(prev => ({
          ...prev,
          [fieldName]: asset.uri,
          [fileNameField]: asset.fileName || `${imageType === 'profile' ? 'Profile' : 
                          imageType === 'licenseFront' ? 'License Front' : 'License Back'} Image`
        }));
        // Clear any existing error
        if (errors[fieldName]) {
          setErrors(prev => ({ ...prev, [fieldName]: null }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = (imageType) => {
    const fieldName = imageType === 'profile' ? 'profileImage' : 
                     imageType === 'licenseFront' ? 'licenseFrontImage' : 'licenseBackImage';
    const fileNameField = imageType === 'profile' ? 'profileImageName' : 
                         imageType === 'licenseFront' ? 'licenseFrontImageName' : 'licenseBackImageName';
    
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
    // Use replace to prevent navigation stack issues but preserve register1 data
    router.replace({
      pathname: "/auth/register1",
      params: { userData: JSON.stringify({ ...userData }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = () => {
    if (isNavigating || isUploadingImage) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      // Use replace to prevent multiple register3 screens
      router.replace({
        pathname: "/auth/register3",
        params: { userData: JSON.stringify({ ...userData, ...form }) }
      });
      
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  return (
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
        <Text style={styles.title}>Enter Vehicle Details{"\n"} & Upload Documents</Text>
        <Text style={styles.subtitle}>
          Please provide your vehicle information and upload required documents.
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.vehicleType && styles.inputError]}
            placeholder={errors.vehicleType || "Vehicle Type (e.g., Car, Motorcycle, Van)"}
            placeholderTextColor={errors.vehicleType ? "#ff3333" : "#999999"}
            value={errors.vehicleType ? "" : form.vehicleType}
            onChangeText={(value) => handleChange('vehicleType', value)}
            onFocus={() => handleFocus('vehicleType')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.vehicleModel && styles.inputError]}
            placeholder={errors.vehicleModel || "Vehicle Model"}
            placeholderTextColor={errors.vehicleModel ? "#ff3333" : "#999999"}
            value={errors.vehicleModel ? "" : form.vehicleModel}
            onChangeText={(value) => handleChange('vehicleModel', value)}
            onFocus={() => handleFocus('vehicleModel')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.vehicleYear && styles.inputError]}
            placeholder={errors.vehicleYear || "Vehicle Year"}
            placeholderTextColor={errors.vehicleYear ? "#ff3333" : "#999999"}
            value={errors.vehicleYear ? "" : form.vehicleYear}
            onChangeText={(value) => handleChange('vehicleYear', value)}
            keyboardType="numeric"
            onFocus={() => handleFocus('vehicleYear')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.vehicleColor && styles.inputError]}
            placeholder={errors.vehicleColor || "Vehicle Color"}
            placeholderTextColor={errors.vehicleColor ? "#ff3333" : "#999999"}
            value={errors.vehicleColor ? "" : form.vehicleColor}
            onChangeText={(value) => handleChange('vehicleColor', value)}
            onFocus={() => handleFocus('vehicleColor')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.licensePlate && styles.inputError]}
            placeholder={errors.licensePlate || "License Plate Number"}
            placeholderTextColor={errors.licensePlate ? "#ff3333" : "#999999"}
            value={errors.licensePlate ? "" : form.licensePlate}
            onChangeText={(value) => handleChange('licensePlate', value)}
            onFocus={() => handleFocus('licensePlate')}
          />
        </View>

        {/* Profile Image Upload Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.imageLabel}>Profile Image</Text>
          {!form.profileImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.profileImage && styles.inputError]} 
              onPress={() => handleImageUpload('profile')}
              disabled={isUploadingImage}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color={errors.profileImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons name="image-outline" size={24} color={errors.profileImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadText, errors.profileImage && styles.errorText]}>
                  {isUploadingImage ? "Uploading..." : (errors.profileImage || "Browse (Profile Image)")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.profileImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {form.profileImageName}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveImage('profile')} style={styles.cancelButton}>
                  <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* License Front Image Upload Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.imageLabel}>Driver's License (Front)</Text>
          {!form.licenseFrontImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.licenseFrontImage && styles.inputError]} 
              onPress={() => handleImageUpload('licenseFront')}
              disabled={isUploadingImage}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color={errors.licenseFrontImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons name="image-outline" size={24} color={errors.licenseFrontImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadText, errors.licenseFrontImage && styles.errorText]}>
                  {isUploadingImage ? "Uploading..." : (errors.licenseFrontImage || "Browse (License Front)")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.licenseFrontImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {form.licenseFrontImageName}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveImage('licenseFront')} style={styles.cancelButton}>
                  <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* License Back Image Upload Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.imageLabel}>Driver's License (Back)</Text>
          {!form.licenseBackImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.licenseBackImage && styles.inputError]} 
              onPress={() => handleImageUpload('licenseBack')}
              disabled={isUploadingImage}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingImage ? (
                  <ActivityIndicator size="small" color={errors.licenseBackImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons name="image-outline" size={24} color={errors.licenseBackImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadText, errors.licenseBackImage && styles.errorText]}>
                  {isUploadingImage ? "Uploading..." : (errors.licenseBackImage || "Browse (License Back)")}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.imagePreviewContainer, errors.licenseBackImage && styles.inputError]}>
              <View style={styles.imageInfoContainer}>
                <Text style={styles.imageFileName} numberOfLines={1}>
                  {form.licenseBackImageName}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveImage('licenseBack')} style={styles.cancelButton}>
                  <MaterialIcons name="close" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
      
        <TouchableOpacity 
          style={[styles.continueButton, isNavigating && styles.continueButtonDisabled]} 
          onPress={handleContinue}
          disabled={isNavigating}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
