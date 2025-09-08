import { View, Text, TouchableOpacity, Image, SafeAreaView, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../assets/styles/landing.styles";

export default function Landing() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/auth/login");
  };

  const handleRegister = () => {
    router.push("/auth/register1");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b6623" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>AgriTrust</Text>
        <Text style={styles.subtitle}>Driver Portal</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/images/delivery-driver-landing-pic.png')} 
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.welcomeTitle}>Welcome to AgriTrust</Text>
          <Text style={styles.welcomeSubtitle}>
            Join our network of trusted delivery drivers and help connect farmers with customers across the region.
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          activeOpacity={0.8}
        >
          <Text style={styles.registerButtonText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}
