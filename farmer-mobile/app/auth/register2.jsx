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
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import styles from "../../assets/styles/register2.styles";
import getColors from "../../constants/colors";
import { API_BASE_URL } from "../../constants/config";
import { useFarmerRegistration } from "../../contexts/FarmerRegistrationContext";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";

const colors = getColors('light');

export default function Register2() {
  const router = useRouter();
  const { 
    farmName,
    farmLocation,
    pickupLocation,
    customerEmail,
    businessDescription,
    profileImage,
    profileImageName,
    updateField,
    updateImage,
    setStep,
    errors,
    setErrors,
    clearErrors,
    validateCurrentStep,
    isProcessing,
    isUploadingProfile,
    setLoadingState
  } = useFarmerRegistration();

  const [locationDetails, setLocationDetails] = useState({
    farmLocation: null,
    pickupLocation: null
  });

  // Location input states
  const [farmLocationSuggestions, setFarmLocationSuggestions] = useState([]);
  const [pickupLocationSuggestions, setPickupLocationSuggestions] = useState([]);
  const [showFarmSuggestions, setShowFarmSuggestions] = useState(false);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [isLoadingFarm, setIsLoadingFarm] = useState(false);
  const [isLoadingPickup, setIsLoadingPickup] = useState(false);
  const timeoutRef = useRef(null);
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false);
  const { isNavigating, navigate, cleanup } = useNavigationGuard();

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const validateForm = () => {
    return validateCurrentStep();
  };

  const handleChange = (key, value) => {
    updateField(key, value);
  };

  const searchLocations = async (query, locationType) => {
    if (!query || query.trim().length < 2) {
      if (locationType === 'farm') {
        setFarmLocationSuggestions([]);
        setShowFarmSuggestions(false);
      } else {
        setPickupLocationSuggestions([]);
        setShowPickupSuggestions(false);
      }
      return;
    }

    if (locationType === 'farm') {
      setIsLoadingFarm(true);
    } else {
      setIsLoadingPickup(true);
    }

    try {
      const url = `${API_BASE_URL}/location/autocomplete?input=${encodeURIComponent(query)}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.predictions || [];
        
        if (locationType === 'farm') {
          setFarmLocationSuggestions(suggestions);
          setShowFarmSuggestions(true);
        } else {
          setPickupLocationSuggestions(suggestions);
          setShowPickupSuggestions(true);
        }
      } else {
        if (locationType === 'farm') {
          setFarmLocationSuggestions([]);
        } else {
          setPickupLocationSuggestions([]);
        }
      }
    } catch (error) {
      
      if (locationType === 'farm') {
        setFarmLocationSuggestions([]);
      } else {
        setPickupLocationSuggestions([]);
      }
    } finally {
      if (locationType === 'farm') {
        setIsLoadingFarm(false);
      } else {
        setIsLoadingPickup(false);
      }
    }
  };

  const handleLocationChange = (key, value) => {
    // Don't update if we're currently selecting a suggestion
    if (isSelectingSuggestion) {
      return;
    }
    
    // Update form state directly for location fields via context
    updateField(key, value);
    
    // Clear any errors for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
    
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Only search if there's actual input
    if (value && value.trim().length >= 2) {
      // Debounce API calls
      timeoutRef.current = setTimeout(() => {
        const locationType = key === 'farmLocation' ? 'farm' : 'pickup';
        searchLocations(value, locationType);
      }, 300);
    } else {
      // Hide suggestions if input is too short
      const locationType = key === 'farmLocation' ? 'farm' : 'pickup';
      if (locationType === 'farm') {
        setShowFarmSuggestions(false);
        setFarmLocationSuggestions([]);
      } else {
        setShowPickupSuggestions(false);
        setPickupLocationSuggestions([]);
      }
    }
  };

  const handleSuggestionPress = (suggestion, locationType) => {
    // Set flag to prevent handleLocationChange from interfering
    setIsSelectingSuggestion(true);
    
    
    // Try different possible text fields from the suggestion
    let selectedText = '';
    
    // Google Places API autocomplete typically returns 'description' field
    if (suggestion.description) {
      selectedText = suggestion.description;
    } 
    // Fallback to structured formatting if available
    else if (suggestion.structured_formatting?.main_text) {
      selectedText = suggestion.structured_formatting.main_text;
      // Add secondary text if available for more context
      if (suggestion.structured_formatting?.secondary_text) {
        selectedText += ', ' + suggestion.structured_formatting.secondary_text;
      }
    } 
    // Other possible fields
    else if (suggestion.name) {
      selectedText = suggestion.name;
    } else if (suggestion.formatted_address) {
      selectedText = suggestion.formatted_address;
    } else if (typeof suggestion === 'string') {
      selectedText = suggestion;
    }
    
    // If we still don't have text, use a fallback
    if (!selectedText) {
      selectedText = 'Selected location';
    }
    
    
    const key = locationType === 'farm' ? 'farmLocation' : 'pickupLocation';
    
    // Update form state directly via context
    updateField(key, selectedText);
    
    // Clear any errors for this field
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: null }));
    }
    
    // Call the onLocationSelect callback
    handleLocationSelect(key, suggestion);
    
    // Hide suggestions
    if (locationType === 'farm') {
      setShowFarmSuggestions(false);
      setFarmLocationSuggestions([]);
    } else {
      setShowPickupSuggestions(false);
      setPickupLocationSuggestions([]);
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSelectingSuggestion(false);
    }, 100);
  };

  const handleLocationSelect = (key, locationData) => {
    setLocationDetails(prev => ({
      ...prev,
      [key]: locationData
    }));
  };

  const handleFocus = (key) => {
    // Only clear error when user focuses on an error field, don't clear the value
    if (errors[key]) {
      setErrors((s) => ({ ...s, [key]: null }));
    }
  };

  const handleImageUpload = async () => {
    const loadingField = 'isUploadingProfile';
    
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
        allowsEditing: false, // No cropping
        quality: 0.7, // Higher quality since no cropping
        base64: true, // This will return base64 data directly
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64DataUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        
        updateImage('profileImage', base64DataUri, asset.fileName || 'Profile Image');
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
      setLoadingState(loadingField, false);
    }
  };

  const handleRemoveImage = () => {
    const loadingField = 'isUploadingProfile';
    setLoadingState(loadingField, false);
    updateImage('profileImage', null, "");
  };

  const handleBack = () => {
    setStep(1);
    navigate(() => {
      router.replace("/auth/register1");
    });
  };
  
  const handleContinue = () => {
    if (isUploadingProfile) return;
    if (validateForm()) {
      setStep(3);
      navigate(() => {
        router.replace("/auth/register3");
      });
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
        <Text style={styles.title}>Enter Business Details{"\n"} & Profile Image</Text>
        <Text style={styles.subtitle}>
          Please provide your business details and upload a profile image for your business.
        </Text>
      </View>

      {/* Form Fields */}
      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.farmName && styles.inputError]}
            placeholder={errors.farmName || "Name of your Farm or Business"}
            placeholderTextColor={errors.farmName ? "#ff3333" : "#999999"}
            value={errors.farmName ? "" : farmName}
            onChangeText={(value) => handleChange('farmName', value)}
            onFocus={() => handleFocus('farmName')}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputContainer, errors.farmLocation && styles.inputError]}>
            <TextInput
              style={[styles.input, errors.farmLocation && styles.inputError]}
              placeholder={errors.farmLocation || "Farm Location"}
              placeholderTextColor={errors.farmLocation ? "#ff3333" : "#999999"}
              value={farmLocation}
              onChangeText={(value) => handleLocationChange('farmLocation', value)}
              onFocus={() => handleFocus('farmLocation')}
              onBlur={() => {
                // Hide suggestions after a short delay to allow for touch events
                // But only if no suggestion was just selected
                setTimeout(() => {
                  if (!farmLocation || farmLocation.trim() === '') {
                    setShowFarmSuggestions(false);
                  }
                }, 200);
              }}
            />
            {isLoadingFarm && (
              <ActivityIndicator size="small" color="#0b6623" style={styles.loadingIndicator} />
            )}
            {farmLocation.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  updateField('farmLocation', '');
                  setShowFarmSuggestions(false);
                  setFarmLocationSuggestions([]);
                }} 
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          
          {showFarmSuggestions && farmLocationSuggestions.length > 0 && (
            <TouchableWithoutFeedback onPress={() => setShowFarmSuggestions(false)}>
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {farmLocationSuggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item, 'farm')}
                    >
                      <MaterialIcons name="location-on" size={20} color="#0b6623" style={styles.locationIcon} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionMainText} numberOfLines={1}>
                          {item.structured_formatting?.main_text || item.description.split(',')[0]}
                        </Text>
                        <Text style={styles.suggestionSecondaryText} numberOfLines={2}>
                          {item.structured_formatting?.secondary_text || item.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        <View style={styles.inputContainer}>
          <View style={[styles.inputContainer, errors.pickupLocation && styles.inputError]}>
            <TextInput
              style={[styles.input, errors.pickupLocation && styles.inputError]}
              placeholder={errors.pickupLocation || "Delivery Pick-up Location"}
              placeholderTextColor={errors.pickupLocation ? "#ff3333" : "#999999"}
              value={pickupLocation}
              onChangeText={(value) => handleLocationChange('pickupLocation', value)}
              onFocus={() => handleFocus('pickupLocation')}
              onBlur={() => {
                // Hide suggestions after a short delay to allow for touch events
                // But only if no suggestion was just selected
                setTimeout(() => {
                  if (!pickupLocation || pickupLocation.trim() === '') {
                    setShowPickupSuggestions(false);
                  }
                }, 200);
              }}
            />
            {isLoadingPickup && (
              <ActivityIndicator size="small" color="#0b6623" style={styles.loadingIndicator} />
            )}
            {pickupLocation.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  updateField('pickupLocation', '');
                  setShowPickupSuggestions(false);
                  setPickupLocationSuggestions([]);
                }} 
                style={styles.clearButton}
              >
                <MaterialIcons name="close" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          
          {showPickupSuggestions && pickupLocationSuggestions.length > 0 && (
            <TouchableWithoutFeedback onPress={() => setShowPickupSuggestions(false)}>
              <View style={styles.suggestionsContainer}>
                <ScrollView 
                  style={styles.suggestionsList}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {pickupLocationSuggestions.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item, 'pickup')}
                    >
                      <MaterialIcons name="location-on" size={20} color="#0b6623" style={styles.locationIcon} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionMainText} numberOfLines={1}>
                          {item.structured_formatting?.main_text || item.description.split(',')[0]}
                        </Text>
                        <Text style={styles.suggestionSecondaryText} numberOfLines={2}>
                          {item.structured_formatting?.secondary_text || item.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.customerEmail && styles.inputError]}
            placeholder={errors.customerEmail || "Email address for customer inquiries"}
            placeholderTextColor={errors.customerEmail ? "#ff3333" : "#999999"}
            value={errors.customerEmail ? "" : customerEmail}
            onChangeText={(value) => handleChange('customerEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => handleFocus('customerEmail')}
          />
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textArea, errors.businessDescription && styles.inputError]}
            placeholder={errors.businessDescription || "Business Description"}
            placeholderTextColor={errors.businessDescription ? "#ff3333" : "#999999"}
            value={errors.businessDescription ? "" : businessDescription}
            onChangeText={(value) => handleChange('businessDescription', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => handleFocus('businessDescription')}
          />
          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {businessDescription.length}/255
            </Text>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.inputContainer}>
          {!profileImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.profileImage && styles.inputError]} 
              onPress={handleImageUpload}
              disabled={isUploadingProfile}
            >
              <View style={styles.imageUploadContent}>
                {isUploadingProfile ? (
                  <ActivityIndicator style={styles.imageUploadIconLeft} size="small" color={errors.profileImage ? "#FF3B30" : "#0b6623"} />
                ) : (
                  <Ionicons style={styles.imageUploadIconLeft} name="image-outline" size={24} color={errors.profileImage ? "#FF3B30" : "#0b6623"} />
                )}
                <Text style={[styles.imageUploadTextCenter, errors.profileImage && styles.errorText]}>
                  {isUploadingProfile ? "Uploading..." : (errors.profileImage || "Browse (Profile Image)")}
                </Text>
              </View>
            </TouchableOpacity>
                     ) : (
             <View style={[styles.imagePreviewContainer, errors.profileImage && styles.inputError]}>
               <View style={styles.imageInfoContainer}>
                 <Text style={styles.imageFileName} numberOfLines={1}>
                   {profileImageName}
                 </Text>
                 <TouchableOpacity onPress={handleRemoveImage} style={styles.cancelButton}>
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
