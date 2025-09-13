import React, { createContext, useContext, useReducer } from 'react';

const BuyerRegistrationContext = createContext();

// Initial state with all buyer registration data
const initialState = {
  // Basic Info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  pickupLocation: '',
  
  // Processing states
  isProcessing: false,
  isNavigating: false,
  errors: {},
  
  // Loading states for individual operations
  isRegistering: false
};

// Action types
const BUYER_REGISTRATION_ACTIONS = {
  UPDATE_FIELD: 'UPDATE_FIELD',
  UPDATE_MULTIPLE_FIELDS: 'UPDATE_MULTIPLE_FIELDS',
  SET_PROCESSING: 'SET_PROCESSING',
  SET_NAVIGATING: 'SET_NAVIGATING',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  CLEAR_FIELD_ERROR: 'CLEAR_FIELD_ERROR',
  RESET_REGISTRATION: 'RESET_REGISTRATION',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  SET_REGISTERING: 'SET_REGISTERING'
};

// Reducer
function buyerRegistrationReducer(state, action) {
  switch (action.type) {
    case BUYER_REGISTRATION_ACTIONS.UPDATE_FIELD:
      return {
        ...state,
        [action.field]: action.value,
        errors: {
          ...state.errors,
          [action.field]: null // Clear error when field is updated
        }
      };
      
    case BUYER_REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS:
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
      
    case BUYER_REGISTRATION_ACTIONS.SET_PROCESSING:
      return {
        ...state,
        isProcessing: action.isProcessing
      };
      
    case BUYER_REGISTRATION_ACTIONS.SET_NAVIGATING:
      return {
        ...state,
        isNavigating: action.isNavigating
      };
      
    case BUYER_REGISTRATION_ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors
      };
      
    case BUYER_REGISTRATION_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };
      
    case BUYER_REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: null
        }
      };
      
    case BUYER_REGISTRATION_ACTIONS.SET_LOADING_STATE:
      if (!action.loadingField) {
        console.error('Reducer: action.loadingField is undefined');
        return state;
      }
      return {
        ...state,
        [action.loadingField]: action.isLoading
      };
      
    case BUYER_REGISTRATION_ACTIONS.SET_REGISTERING:
      return {
        ...state,
        isRegistering: action.isRegistering
      };
      
    case BUYER_REGISTRATION_ACTIONS.RESET_REGISTRATION:
      return initialState;
      
    default:
      return state;
  }
}

// Provider component
export function BuyerRegistrationProvider({ children }) {
  const [state, dispatch] = useReducer(buyerRegistrationReducer, initialState);

  const updateField = (field, value) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.UPDATE_FIELD,
      field,
      value
    });
  };

  const updateMultipleFields = (fields) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.UPDATE_MULTIPLE_FIELDS,
      fields
    });
  };

  const setProcessing = (isProcessing) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.SET_PROCESSING,
      isProcessing
    });
  };

  const setNavigating = (isNavigating) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.SET_NAVIGATING,
      isNavigating
    });
  };

  const setErrors = (errors) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.SET_ERRORS,
      errors
    });
  };

  const clearErrors = () => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.CLEAR_ERRORS
    });
  };

  const clearFieldError = (field) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.CLEAR_FIELD_ERROR,
      field
    });
  };

  const setLoadingState = (loadingField, isLoading) => {
    if (!loadingField) {
      console.error('setLoadingState: loadingField is undefined or null');
      return;
    }
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.SET_LOADING_STATE,
      loadingField,
      isLoading
    });
  };

  const setRegistering = (isRegistering) => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.SET_REGISTERING,
      isRegistering
    });
  };

  const resetRegistration = () => {
    dispatch({
      type: BUYER_REGISTRATION_ACTIONS.RESET_REGISTRATION
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
      phone: cleanString(state.phone),
      password: state.password, // Don't trim password
      pickupLocation: cleanString(state.pickupLocation),
      
      // Additional metadata for database
      registrationDate: new Date().toISOString(),
      registrationSource: 'mobile_app',
      status: 'active' // Default status for new buyer registrations
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
      phone: state.phone,
      password: state.password,
      pickupLocation: state.pickupLocation
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
    
    // Validate password
    if (state.password && state.password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }
    
    // Validate password confirmation
    if (state.password !== state.confirmPassword) {
      errors.push('Passwords do not match');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Helper function to validate current form
  const validateForm = async () => {
    const newErrors = {};
    
    // Basic validation
    if (!state.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!state.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!state.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(state.email.trim())) {
      newErrors.email = 'Enter a valid email';
    }
    if (!state.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!state.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (state.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!state.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (state.password !== state.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Pick-up location validation
    if (!state.pickupLocation.trim()) newErrors.pickupLocation = 'Delivery Pick-up Location is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    return true;
  };

  const value = {
    ...state,
    updateField,
    updateMultipleFields,
    setProcessing,
    setNavigating,
    setErrors,
    clearErrors,
    clearFieldError,
    setLoadingState,
    setRegistering,
    resetRegistration,
    getRegistrationData,
    validateForm,
    validateCompleteRegistration
  };

  return (
    <BuyerRegistrationContext.Provider value={value}>
      {children}
    </BuyerRegistrationContext.Provider>
  );
}

// Custom hook to use the buyer registration context
export function useBuyerRegistration() {
  const context = useContext(BuyerRegistrationContext);
  if (!context) {
    throw new Error('useBuyerRegistration must be used within a BuyerRegistrationProvider');
  }
  return context;
}

export default BuyerRegistrationContext;
