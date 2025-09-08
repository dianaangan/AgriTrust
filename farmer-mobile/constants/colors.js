const colors = {
  light: {
    primary: '#0b6623',
    primaryDark: '#004d00',
    secondary: '#4CAF50',
    accent: '#8BC34A',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: '#333333',
    textSecondary: '#666666',
    textLight: '#999999',
    border: '#E0E0E0',
    outline: '#E0E0E0',
    track: '#E0E0E0',
    muted: '#999999',
    error: '#FF3B30',
    success: '#4CAF50',
    warning: '#FF9800',
    info: '#2196F3',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#9E9E9E',
    lightGray: '#F5F5F5',
    darkGray: '#424242',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)',
    gradient: {
      primary: ['#0b6623', '#4CAF50'],
      secondary: ['#4CAF50', '#8BC34A'],
      background: ['#FFFFFF', '#F5F5F5']
    }
  },
  dark: {
    primary: '#4CAF50',
    primaryDark: '#2E7D32',
    secondary: '#8BC34A',
    accent: '#CDDC39',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FFFFFF',
    textSecondary: '#B3B3B3',
    textLight: '#808080',
    border: '#333333',
    outline: '#333333',
    track: '#333333',
    muted: '#808080',
    error: '#FF5252',
    success: '#4CAF50',
    warning: '#FFB74D',
    info: '#64B5F6',
    white: '#FFFFFF',
    black: '#000000',
    gray: '#616161',
    lightGray: '#2C2C2C',
    darkGray: '#1A1A1A',
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    gradient: {
      primary: ['#4CAF50', '#8BC34A'],
      secondary: ['#8BC34A', '#CDDC39'],
      background: ['#121212', '#1E1E1E']
    }
  }
};

function getColors(theme = 'light') {
  return colors[theme];
}

export default getColors;
