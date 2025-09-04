const THEMES = {
  light: {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    primary: '#0b6623',     
    primaryDark: '#004b12',
    outline: '#0b6623',     
    track: 'rgba(11,102,35,0.12)',
    text: '#000000',
    muted: '#666666',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#0F0F0F',
    primary: '#68B34A',
    primaryDark: '#3f6f2a',
    outline: '#68B34A',
    track: 'rgba(104,179,74,0.12)',
    text: '#FFFFFF',
    muted: '#CCCCCC',
  }
};

export const getColors = (mode = 'light') => THEMES[mode] || THEMES.light;

export default getColors;