import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback
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
    farmName: userData.farmName || "",
    farmLocation: userData.farmLocation || "",
    pickupLocation: userData.pickupLocation || "",
    customerEmail: userData.customerEmail || "", 
    businessDescription: userData.businessDescription || "",
    profileImage: userData.profileImage || null,
    profileImageName: userData.profileImageName || ""
  });

  const [locationDetails, setLocationDetails] = useState({
    farmLocation: userData.locationDetails?.farmLocation || null,
    pickupLocation: userData.locationDetails?.pickupLocation || null
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
  const [isNavigating, setIsNavigating] = useState(false);





  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const validations = {
      farmName: () => !form.farmName.trim() && "Farm/Business name is required",
      farmLocation: () => !form.farmLocation.trim() && "Farm location is required",
      pickupLocation: () => !form.pickupLocation.trim() && "Pickup location is required",
      customerEmail: () => !form.customerEmail.trim() ? "Customer email is required" : !/\S+@\S+\.\S+/.test(form.customerEmail) && "Please enter a valid email",
      businessDescription: () => !form.businessDescription.trim() && "Business description is required",
      profileImage: () => !form.profileImage && "Profile image is required"
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
    
    // Update form state directly for location fields
    setForm(prev => ({ ...prev, [key]: value }));
    
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
    
    // Update form state directly
    setForm(prev => {
      const newForm = { ...prev, [key]: selectedText };
      return newForm;
    });
    
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
    try {
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
        setForm(prev => ({
          ...prev,
          profileImage: asset.uri,
          profileImageName: asset.fileName || 'Profile Image'
        }));
        // Clear any existing error
        if (errors.profileImage) {
          setErrors(prev => ({ ...prev, profileImage: null }));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({
      ...prev,
      profileImage: null,
      profileImageName: ""
    }));
    // Set error if image is required
    setErrors(prev => ({ ...prev, profileImage: "Profile image is required" }));
  };

  const handleBack = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    setIsNavigating(true);
    router.push({
      pathname: "/auth/register1",
      params: { userData: JSON.stringify({ ...userData, ...form, locationDetails }) }
    });
    
    // Reset navigation state after a short delay
    setTimeout(() => setIsNavigating(false), 1000);
  };
  
  const handleContinue = () => {
    if (isNavigating) return; // Prevent multiple rapid clicks
    
    if (validateForm()) {
      setIsNavigating(true);
      // Use replace to prevent multiple register3 screens
      router.replace({
        pathname: "/auth/register3",
        params: { userData: JSON.stringify({ ...userData, ...form, locationDetails }) }
      });
      
      // Reset navigation state after a short delay
      setTimeout(() => setIsNavigating(false), 1000);
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
            value={errors.farmName ? "" : form.farmName}
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
              value={form.farmLocation}
              onChangeText={(value) => handleLocationChange('farmLocation', value)}
              onFocus={() => handleFocus('farmLocation')}
              onBlur={() => {
                // Hide suggestions after a short delay to allow for touch events
                // But only if no suggestion was just selected
                setTimeout(() => {
                  if (!form.farmLocation || form.farmLocation.trim() === '') {
                    setShowFarmSuggestions(false);
                  }
                }, 200);
              }}
            />
            {isLoadingFarm && (
              <ActivityIndicator size="small" color="#0b6623" style={styles.loadingIndicator} />
            )}
            {form.farmLocation.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setForm(prev => ({ ...prev, farmLocation: '' }));
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
              value={form.pickupLocation}
              onChangeText={(value) => handleLocationChange('pickupLocation', value)}
              onFocus={() => handleFocus('pickupLocation')}
              onBlur={() => {
                // Hide suggestions after a short delay to allow for touch events
                // But only if no suggestion was just selected
                setTimeout(() => {
                  if (!form.pickupLocation || form.pickupLocation.trim() === '') {
                    setShowPickupSuggestions(false);
                  }
                }, 200);
              }}
            />
            {isLoadingPickup && (
              <ActivityIndicator size="small" color="#0b6623" style={styles.loadingIndicator} />
            )}
            {form.pickupLocation.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setForm(prev => ({ ...prev, pickupLocation: '' }));
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
            value={errors.customerEmail ? "" : form.customerEmail}
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
            value={errors.businessDescription ? "" : form.businessDescription}
            onChangeText={(value) => handleChange('businessDescription', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => handleFocus('businessDescription')}
          />
          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>
              {form.businessDescription.length}/255
            </Text>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.inputContainer}>
          {!form.profileImage ? (
            <TouchableOpacity 
              style={[styles.imageUploadButton, errors.profileImage && styles.inputError]} 
              onPress={handleImageUpload}
            >
                             <View style={styles.imageUploadContent}>
                 <Ionicons name="image-outline" size={24} color={errors.profileImage ? "#FF3B30" : "#0b6623"} />
                 <Text style={[styles.imageUploadText, errors.profileImage && styles.errorText]}>
                   {errors.profileImage || "Browse (Profile Image)"}
                 </Text>
               </View>
            </TouchableOpacity>
                     ) : (
             <View style={[styles.imagePreviewContainer, errors.profileImage && styles.inputError]}>
               <View style={styles.imageInfoContainer}>
                 <Text style={styles.imageFileName} numberOfLines={1}>
                   {form.profileImageName}
                 </Text>
                 <TouchableOpacity onPress={handleRemoveImage} style={styles.cancelButton}>
                   <MaterialIcons name="close" size={20} color="#FF3B30" />
                 </TouchableOpacity>
               </View>
             </View>
           )}
        </View>
      </View>
      
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
