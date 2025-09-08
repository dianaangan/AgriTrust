import React from 'react';
import { SafeAreaView, StatusBar, Platform } from 'react-native';
import getColors from '../constants/colors';

const colors = getColors('light');

const SafeScreen = ({ children, style, statusBarStyle = 'light-content', backgroundColor = colors.primary }) => {
  return (
    <>
      <StatusBar 
        barStyle={statusBarStyle} 
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <SafeAreaView style={[{ flex: 1, backgroundColor }, style]}>
        {children}
      </SafeAreaView>
    </>
  );
};

export default SafeScreen;
