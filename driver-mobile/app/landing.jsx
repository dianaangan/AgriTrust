import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import styles from "../assets/styles/landing.styles";

export default function Landing() {
    const router = useRouter();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleLoginPress = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        // Use replace to prevent multiple login screens
        router.replace("/auth/login");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const handleGetStarted = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        // Use replace to prevent multiple register1 screens
        router.replace("/auth/register1");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.imageContainer}>
                    <Image 
                        source={require('../assets/images/delivery-driver-landing-pic.png')} 
                        style={styles.illustration}
                    />
                </View>
                
                <View style={styles.bottomContent}>
                    <Text style={styles.title}>AgriTrust</Text>
                    <Text style={styles.description}>
                        Join our network of trusted delivery drivers and help connect farmers with customers across the region—bringing fresh produce to every doorstep.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity 
                            style={styles.getStartedButton}
                            onPress={handleGetStarted}
                        >
                            <Text style={styles.getStartedText}>Get Started</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.loginButton}
                            onPress={handleLoginPress}
                        >
                            <Text style={styles.loginText}>I Already Have an Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}
