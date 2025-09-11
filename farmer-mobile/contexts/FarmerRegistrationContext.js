import React, { createContext, useContext, useReducer } from 'react';

const FarmerRegistrationContext = createContext();

// Initial state with all farmer registration data
const initialState = {
  // Step 1: Basic Info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  confirmPassword: '',
  
  // Step 2: Business Details
  farmName: '',
  farmLocation: '',
  pickupLocation: '',
  customerEmail: '',
  businessDescription: '',
  profileImage: null,
  profileImageName: '',
  
  // Step 3: Payment Info
  cardNumber: '',
  expiry: '',
  cvc: '',
  cardEmail: '',
  stripePaymentMethodId: '',
  stripePaymentIntentId: '',
  billingVerified: false,
  
  // Step 4: ID Images
  frontIdImage: null,
  frontIdImageName: '',
  backIdImage: null,
  backIdImageName: '',
  
  // Processing states
  isProcessing: false,
  currentStep: 1,
  errors: {},
  
  // Loading states for individual operations
  isUploadingProfile: false,
  isUploadingFrontId: false,
  isUploadingBackId: false,
  isVerifying: false,
  isRegistering: false
};

// Action types
const FARMER_REGISTRATION_ACTIONS = {
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
function farmerRegistrationReducer(state, action) {
  switch (action.type) {
    case FARMER_REGISTRATION_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: null // Clear error when field is updated
        }
      };
      
    case FARMER_REGISTRATION_ACTIONS.UPDATE_IMAGE:
      return {
        ...state,
        [action.imageField]: action.imageData,
        [action.nameField]: action.imageName,
        errors: {
          ...state.errors,
          [action.imageField]: null // Clear error when image is updated
        }
      };
      
    case FARMER_REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS:
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
      
    case FARMER_REGISTRATION_ACTIONS.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.isProcessing
      };
      
    case FARMER_REGISTRATION_ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.step
      };
      
    case FARMER_REGISTRATION_ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors
      };
      
    case FARMER_REGISTRATION_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };
      
    case FARMER_REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: null
        }
      };
      
    case FARMER_REGISTRATION_ACTIONS.SET_LOADING_STATE:
      return {
        ...state,
        [action.loadingField]: action.isLoading
      };
      
    case FARMER_REGISTRATION_ACTIONS.SET_VERIFYING:
      return {
        ...state,
        isVerifying: action.isVerifying
      };
      
    case FARMER_REGISTRATION_ACTIONS.SET_REGISTERING:
      return {
        ...state,
        isRegistering: action.isRegistering
      };
      
    case FARMER_REGISTRATION_ACTIONS.RESET_REGISTRATION:
      return initialState;
      
    default:
      return state;
  }
}

// Provider component
export function FarmerRegistrationProvider({ children }) {
  const [state, dispatch] = useReducer(farmerRegistrationReducer, initialState);

  const updateField = (field, value) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.UPDATE_FIELD,
      field,
      value
    });
  };

  const updateImage = (imageField, imageData, imageName) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.UPDATE_IMAGE,
      imageField,
      imageData,
      nameField: `${imageField}Name`,
      imageName
    });
  };

  const updateMultipleFields = (fields) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS,
      fields
    });
  };

  const setProcessing = (isProcessing) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_PROCESSING,
      isProcessing
    });
  };

  const setStep = (step) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_STEP,
      step
    });
  };

  const setErrors = (errors) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_ERRORS,
      errors
    });
  };

  const clearErrors = () => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.CLEAR_ERRORS
    });
  };

  const clearFieldError = (field) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR,
      field
    });
  };

  const setLoadingState = (loadingField, isLoading) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_LOADING_STATE,
      loadingField,
      isLoading
    });
  };

  const setVerifying = (isVerifying) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_VERIFYING,
      isVerifying
    });
  };

  const setRegistering = (isRegistering) => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.SET_REGISTERING,
      isRegistering
    });
  };

  const resetRegistration = () => {
    dispatch({
      type: FARMER_REGISTRATION_ACTIONS.RESET_REGISTRATION
    });
  };

  // Helper function to get all registration data for API submission
  const getRegistrationData = () => {
    // Clean and format data for database submission
    const cleanString = (str) => str ? str.toString().trim() : '';
    
    return {
      // Basic info - ensure all required fields are present and clean
      firstname: cleanString(state.firstName),
      lastname: cleanString(state.lastName),
      email: cleanString(state.email).toLowerCase(),
      phonenumber: cleanString(state.phone),
      username: cleanString(state.username),
      password: state.password, // Don't trim password
      
      // Business details
      farmname: cleanString(state.farmName),
      farmlocation: cleanString(state.farmLocation),
      pickuplocation: cleanString(state.pickupLocation),
      inquiryemail: cleanString(state.customerEmail).toLowerCase(),
      businessdescription: cleanString(state.businessDescription),
      
      // Images - ensure base64 data is present
      profileimage: state.profileImage || null,
      frontIdImage: state.frontIdImage || null,
      backIdImage: state.backIdImage || null,
      
      // Payment info
      cardNumber: cleanString(state.cardNumber),
      cardExpiry: cleanString(state.expiry),
      cardCVC: cleanString(state.cvc),
      cardEmail: cleanString(state.cardEmail).toLowerCase(),
      stripePaymentMethodId: state.stripePaymentMethodId || null,
      stripePaymentIntentId: state.stripePaymentIntentId || null,
      billingVerified: Boolean(state.billingVerified),
      
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
      farmname: state.farmName,
      farmlocation: state.farmLocation,
      pickuplocation: state.pickupLocation,
      inquiryemail: state.customerEmail,
      businessdescription: state.businessDescription
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
    
    // Validate customer email format
    if (state.customerEmail && !/\S+@\S+\.\S+/.test(state.customerEmail)) {
      errors.push('Invalid customer email format');
    }
    
    // Validate phone number
    if (state.phone && !/^\d{10,}$/.test(state.phone.replace(/\D/g, ''))) {
      errors.push('Invalid phone number format');
    }
    
    // Validate required images
    const requiredImages = {
      profileimage: state.profileImage,
      frontIdImage: state.frontIdImage,
      backIdImage: state.backIdImage
    };
    
    Object.entries(requiredImages).forEach(([field, value]) => {
      if (!value) {
        errors.push(`${field} is required`);
      }
    });
    
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
        
      case 2: // Business Details
        const businessValidations = {
          farmName: () => !state.farmName.trim() && "Farm name is required",
          farmLocation: () => !state.farmLocation.trim() && "Farm location is required",
          pickupLocation: () => !state.pickupLocation.trim() && "Pickup location is required",
          customerEmail: () => !state.customerEmail.trim() ? "Customer email is required" : !/\S+@\S+\.\S+/.test(state.customerEmail) && "Please enter a valid email",
          businessDescription: () => !state.businessDescription.trim() && "Business description is required",
          profileImage: () => !state.profileImage && "Profile image is required"
        };
        Object.entries(businessValidations).forEach(([key, validate]) => {
          const error = validate();
          if (error) newErrors[key] = error;
        });
        break;
        
      case 3: // Payment Info
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
        
      case 4: // ID Images
        const idImageValidations = {
          frontIdImage: () => !state.frontIdImage && "Front ID image is required",
          backIdImage: () => !state.backIdImage && "Back ID image is required"
        };
        Object.entries(idImageValidations).forEach(([key, validate]) => {
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
    <FarmerRegistrationContext.Provider value={value}>
      {children}
    </FarmerRegistrationContext.Provider>
  );
}

// Custom hook to use the farmer registration context
export function useFarmerRegistration() {
  const context = useContext(FarmerRegistrationContext);
  if (!context) {
    throw new Error('useFarmerRegistration must be used within a FarmerRegistrationProvider');
  }
  return context;
}

export default FarmerRegistrationContext;
