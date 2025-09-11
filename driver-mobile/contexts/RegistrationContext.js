import React, { createContext, useContext, useReducer } from 'react';

const RegistrationContext = createContext();

// Initial state with all registration data
const initialState = {
  // Step 1: Basic Info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  
  // Step 2: Payment Info
  cardNumber: '',
  expiry: '',
  cvc: '',
  cardEmail: '',
  stripePaymentMethodId: '',
  stripePaymentIntentId: '',
  billingVerified: false,
  
  // Step 3: Identity Images
  profileImage: null,
  profileImageName: '',
  licenseFrontImage: null,
  licenseFrontImageName: '',
  licenseBackImage: null,
  licenseBackImageName: '',
  insuranceImage: null,
  insuranceImageName: '',
  
  // Step 4: Vehicle Details
  brand: '',
  model: '',
  year: '',
  vehicleType: '',
  plateNumber: '',
  color: '',
  
  // Step 5: Vehicle Images
  frontVehicleImage: null,
  frontVehicleImageName: '',
  backVehicleImage: null,
  backVehicleImageName: '',
  rightVehicleImage: null,
  rightVehicleImageName: '',
  leftVehicleImage: null,
  leftVehicleImageName: '',
  
  // Step 6: Final Documents
  vehicleRegistrationImage: null,
  vehicleRegistrationImageName: '',
  licensePlateImage: null,
  licensePlateImageName: '',
  phoneCompatibility: false,
  
  // Processing states
  isProcessing: false,
  currentStep: 1,
  errors: {},
  
  // Loading states for individual operations
  isUploadingProfile: false,
  isUploadingLicenseFront: false,
  isUploadingLicenseBack: false,
  isUploadingInsurance: false,
  isUploadingFrontVehicle: false,
  isUploadingBackVehicle: false,
  isUploadingRightVehicle: false,
  isUploadingLeftVehicle: false,
  isUploadingRegistration: false,
  isUploadingPlate: false,
  isVerifying: false,
  isRegistering: false
};

// Action types
const REGISTRATION_ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_IMAGE: 'UPDATE_IMAGE',
  UPDATE_MULTIPLE_FIELDS: 'UPDATE_MULTIPLE_FIELDS',
  SET_PROCESSING: 'SET_PROCESSING',
  SET_STEP: 'SET_STEP',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  CLEAR_FIELD_ERROR: 'CLEAR_FIELD_ERROR',
  RESET_REGISTRATION: 'RESET_REGISTRATION',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  SET_VERIFYING: 'SET_VERIFYING',
  SET_REGISTERING: 'SET_REGISTERING'
};

// Reducer
function registrationReducer(state, action) {
  switch (action.type) {
    case REGISTRATION_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: null // Clear error when field is updated
        }
      };
      
    case REGISTRATION_ACTIONS.UPDATE_IMAGE:
      return {
        ...state,
        [action.imageField]: action.imageData,
        [action.nameField]: action.imageName,
        errors: {
          ...state.errors,
          [action.imageField]: null // Clear error when image is updated
        }
      };
      
    case REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS:
      return {
        ...state,
        ...action.fields,
        errors: {
          ...state.errors,
          ...Object.keys(action.fields).reduce((acc, key) => {
            acc[key] = null; // Clear errors for updated fields
            return acc;
          }, {})
        }
      };
      
    case REGISTRATION_ACTIONS.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.isProcessing
      };
      
    case REGISTRATION_ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.step
      };
      
    case REGISTRATION_ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors
      };
      
    case REGISTRATION_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };
      
    case REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: null
        }
      };
      
    case REGISTRATION_ACTIONS.SET_LOADING_STATE:
      return {
        ...state,
        [action.loadingField]: action.isLoading
      };
      
    case REGISTRATION_ACTIONS.SET_VERIFYING:
      return {
        ...state,
        isVerifying: action.isVerifying
      };
      
    case REGISTRATION_ACTIONS.SET_REGISTERING:
      return {
        ...state,
        isRegistering: action.isRegistering
      };
      
    case REGISTRATION_ACTIONS.RESET_REGISTRATION:
      return initialState;
      
    default:
      return state;
  }
}

// Provider component
export function RegistrationProvider({ children }) {
  const [state, dispatch] = useReducer(registrationReducer, initialState);

  const updateField = (field, value) => {
    dispatch({
      type: REGISTRATION_ACTIONS.UPDATE_FIELD,
      field,
      value
    });
  };

  const updateImage = (imageField, imageData, imageName) => {
    dispatch({
      type: REGISTRATION_ACTIONS.UPDATE_IMAGE,
      imageField,
      imageData,
      nameField: `${imageField}Name`,
      imageName
    });
  };

  const updateMultipleFields = (fields) => {
    dispatch({
      type: REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS,
      fields
    });
  };

  const setProcessing = (isProcessing) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_PROCESSING,
      isProcessing
    });
  };

  const setStep = (step) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_STEP,
      step
    });
  };

  const setErrors = (errors) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_ERRORS,
      errors
    });
  };

  const clearErrors = () => {
    dispatch({
      type: REGISTRATION_ACTIONS.CLEAR_ERRORS
    });
  };

  const clearFieldError = (field) => {
    dispatch({
      type: REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR,
      field
    });
  };

  const setLoadingState = (loadingField, isLoading) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_LOADING_STATE,
      loadingField,
      isLoading
    });
  };

  const setVerifying = (isVerifying) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_VERIFYING,
      isVerifying
    });
  };

  const setRegistering = (isRegistering) => {
    dispatch({
      type: REGISTRATION_ACTIONS.SET_REGISTERING,
      isRegistering
    });
  };

  const resetRegistration = () => {
    dispatch({
      type: REGISTRATION_ACTIONS.RESET_REGISTRATION
    });
  };

  // Helper function to get all registration data for API submission
  const getRegistrationData = () => {
    // Clean and format data for database submission
    const cleanString = (str) => str ? str.toString().trim() : '';
    const cleanNumber = (num) => num ? parseInt(num.toString()) : null;
    
    return {
      // Basic info - ensure all required fields are present and clean
      firstname: cleanString(state.firstName),
      lastname: cleanString(state.lastName),
      email: cleanString(state.email).toLowerCase(),
      phonenumber: cleanString(state.phone),
      username: cleanString(state.username),
      password: state.password, // Don't trim password
      
      // Payment info
      cardNumber: cleanString(state.cardNumber),
      cardExpiry: cleanString(state.expiry),
      cardCVC: cleanString(state.cvc),
      cardEmail: cleanString(state.cardEmail).toLowerCase(),
      stripePaymentMethodId: state.stripePaymentMethodId || null,
      stripePaymentIntentId: state.stripePaymentIntentId || null,
      billingVerified: Boolean(state.billingVerified),
      
      // Identity images - ensure base64 data is present
      profileimage: state.profileImage || null,
      licensefrontimage: state.licenseFrontImage || null,
      licensebackimage: state.licenseBackImage || null,
      insuranceimage: state.insuranceImage || null,
      
      // Vehicle details - clean and format
      vehiclebrand: cleanString(state.brand),
      vehiclemodel: cleanString(state.model),
      vehicleyearmanufacture: cleanNumber(state.year),
      vehicletype: cleanString(state.vehicleType),
      vehicleplatenumber: cleanString(state.plateNumber),
      vehiclecolor: cleanString(state.color),
      
      // Vehicle images - ensure base64 data is present
      vehiclefrontimage: state.frontVehicleImage || null,
      vehiclebackimage: state.backVehicleImage || null,
      vehiclerightimage: state.rightVehicleImage || null,
      vehicleleftimage: state.leftVehicleImage || null,
      
      // Final documents - ensure base64 data is present
      vehicleregistrationimage: state.vehicleRegistrationImage || null,
      licenseplateimage: state.licensePlateImage || null,
      phonecompatibility: Boolean(state.phoneCompatibility),
      
      // Additional metadata for database
      registrationDate: new Date().toISOString(),
      registrationSource: 'mobile_app',
      status: 'pending_approval' // Default status for new registrations
    };
  };

  // Helper function to validate complete registration data
  const validateCompleteRegistration = () => {
    const errors = [];
    
    // Validate required text fields
    const requiredFields = {
      firstname: state.firstName,
      lastname: state.lastName,
      email: state.email,
      phonenumber: state.phone,
      username: state.username,
      password: state.password,
      vehiclebrand: state.brand,
      vehiclemodel: state.model,
      vehicleyearmanufacture: state.year,
      vehicletype: state.vehicleType,
      vehicleplatenumber: state.plateNumber,
      vehiclecolor: state.color
    };
    
    Object.entries(requiredFields).forEach(([field, value]) => {
      if (!value || value.toString().trim() === '') {
        errors.push(`${field} is required`);
      }
    });
    
    // Validate email format
    if (state.email && !/\S+@\S+\.\S+/.test(state.email)) {
      errors.push('Invalid email format');
    }
    
    // Validate phone number
    if (state.phone && !/^\d{10,}$/.test(state.phone.replace(/\D/g, ''))) {
      errors.push('Invalid phone number format');
    }
    
    // Validate year
    if (state.year) {
      const year = parseInt(state.year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear + 1) {
        errors.push('Invalid vehicle year');
      }
    }
    
    // Validate required images
    const requiredImages = {
      profileimage: state.profileImage,
      licensefrontimage: state.licenseFrontImage,
      licensebackimage: state.licenseBackImage,
      insuranceimage: state.insuranceImage,
      vehiclefrontimage: state.frontVehicleImage,
      vehiclebackimage: state.backVehicleImage,
      vehiclerightimage: state.rightVehicleImage,
      vehicleleftimage: state.leftVehicleImage,
      vehicleregistrationimage: state.vehicleRegistrationImage,
      licenseplateimage: state.licensePlateImage
    };
    
    Object.entries(requiredImages).forEach(([field, value]) => {
      if (!value) {
        errors.push(`${field} is required`);
      }
    });
    
    // Validate phone compatibility
    if (!state.phoneCompatibility) {
      errors.push('Phone compatibility must be confirmed');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Helper function to validate current step
  const validateCurrentStep = () => {
    const newErrors = {};
    
    switch (state.currentStep) {
      case 1: // Basic Info
        const basicValidations = {
          firstName: () => !state.firstName.trim() && "First name is required",
          lastName: () => !state.lastName.trim() && "Last name is required",
          email: () => !state.email.trim() ? "Email is required" : !/\S+@\S+\.\S+/.test(state.email) && "Please enter a valid email",
          phone: () => !state.phone.trim() ? "Phone number is required" : !/^\d{10,}$/.test(state.phone.replace(/\D/g, '')) && "Please enter a valid phone number",
          username: () => !state.username.trim() ? "User name is required" : state.username.length < 3 && "Username must be at least 3 characters",
          password: () => !state.password ? "Password is required" : state.password.length < 6 && "Password must be at least 6 characters",
          confirmPassword: () => !state.confirmPassword ? "Please confirm your password" : state.password !== state.confirmPassword && "Passwords do not match"
        };
        Object.entries(basicValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 2: // Payment Info
        const paymentValidations = {
          cardNumber: () => !state.cardNumber.trim() && "Valid card number",
          expiry: () => !state.expiry.trim() && "Valid expiry",
          cvc: () => !state.cvc.trim() && "Valid CVC",
          cardEmail: () => !state.cardEmail.trim() ? "Valid email" : !/\S+@\S+\.\S+/.test(state.cardEmail) && "Valid email"
        };
        Object.entries(paymentValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 3: // Identity Images
        const imageValidations = {
          profileImage: () => !state.profileImage && "Profile image is required",
          licenseFrontImage: () => !state.licenseFrontImage && "License front image is required",
          licenseBackImage: () => !state.licenseBackImage && "License back image is required",
          insuranceImage: () => !state.insuranceImage && "Insurance image is required"
        };
        Object.entries(imageValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 4: // Vehicle Details
        const vehicleValidations = {
          brand: () => !state.brand.trim() && "Brand/Make is required",
          model: () => !state.model.trim() && "Vehicle Model is required",
          year: () => !state.year.trim() ? "Year of Manufacture is required" : 
            (!/^\d{4}$/.test(state.year) || parseInt(state.year) < 1900 || parseInt(state.year) > new Date().getFullYear() + 1) && "Please enter a valid year",
          vehicleType: () => !state.vehicleType.trim() && "Vehicle Type is required",
          plateNumber: () => !state.plateNumber.trim() && "Plate Number is required",
          color: () => !state.color.trim() && "Vehicle Color is required"
        };
        Object.entries(vehicleValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 5: // Vehicle Images
        const vehicleImageValidations = {
          frontVehicleImage: () => !state.frontVehicleImage && "Front vehicle image is required",
          backVehicleImage: () => !state.backVehicleImage && "Back vehicle image is required",
          rightVehicleImage: () => !state.rightVehicleImage && "Right vehicle image is required",
          leftVehicleImage: () => !state.leftVehicleImage && "Left vehicle image is required"
        };
        Object.entries(vehicleImageValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 6: // Final Documents
        const finalValidations = {
          vehicleRegistrationImage: () => !state.vehicleRegistrationImage && "Vehicle Registration Image is required",
          licensePlateImage: () => !state.licensePlateImage && "License Plate Image is required",
          phoneCompatibility: () => !state.phoneCompatibility && "You must confirm device compatibility"
        };
        Object.entries(finalValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const value = {
    ...state,
    updateField,
    updateImage,
    updateMultipleFields,
    setProcessing,
    setStep,
    setErrors,
    clearErrors,
    clearFieldError,
    setLoadingState,
    setVerifying,
    setRegistering,
    resetRegistration,
    getRegistrationData,
    validateCurrentStep,
    validateCompleteRegistration
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  );
}

// Custom hook to use the registration context
export function useRegistration() {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within a RegistrationProvider');
  }
  return context;
}

export default RegistrationContext;
