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
        router.push("/auth/login");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 100);
    };

    const handleGetStarted = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        router.push("/auth/register1");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 100);
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.imageContainer}>
                    <Image 
                        source={require('../assets/images/farmer-landing.png')} 
                        style={styles.illustration}
                    />
                </View>
                
                <View style={styles.bottomContent}>
                    <Text style={styles.title}>AgriTrust</Text>
                    <Text style={styles.description}>
                        Empowers farmers with secure crop tracking, fair pricing, and trusted sales through a blockchain-powered system—bringing transparency and control to every harvest.
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