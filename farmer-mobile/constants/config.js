// API Configuration
// Update this URL to match your backend server
export const API_CONFIG = {
  // For local development (localhost)
  LOCAL: 'http://localhost:5001/api',
  
  // For production (your deployed backend)
  PRODUCTION: 'https://your-domain.com/api',
  
  // For testing with different devices
  // Replace with your actual IP address on the network
NETWORK: 'http://192.168.1.2:5001/api',
  
  // Auto-detect based on environment
  get BASE_URL() {
    return this.NETWORK; // Use network IP for mobile app
  }
};


// Dynamic IP detection function
export const detectBackendIP = async () => {
  // Common local network IP ranges to try
  const commonIPs = [
    '192.168.1.2',
    '192.168.1.100',
    '192.168.0.2',
    '192.168.0.100',
    '10.0.0.2',
    '10.0.0.100',
    '172.16.0.2',
    '172.16.0.100'
  ];
  
  const port = 5001; // Updated to match backend port
  
  for (const ip of commonIPs) {
    try {
      const response = await fetch(`http://${ip}:${port}/api/health`, { 
        method: 'GET',
        timeout: 2000 
      });
      
      if (response.ok) {
        return `http://${ip}:${port}/api`;
      }
    } catch (error) {
      // Continue to next IP
      continue;
    }
  }
  
  // Fallback to default
  return API_CONFIG.BASE_URL;
};

// User-configurable API URL (stored in AsyncStorage)
export const getUserConfigurableAPI = async () => {
  try {
    // Import AsyncStorage dynamically to avoid issues
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const userAPI = await AsyncStorage.getItem('user_api_url');
    
    if (userAPI) {
      return userAPI;
    }
  } catch (error) {
  }
  
  return API_CONFIG.BASE_URL;
};

// Export the base URL
export const API_BASE_URL = API_CONFIG.BASE_URL;
