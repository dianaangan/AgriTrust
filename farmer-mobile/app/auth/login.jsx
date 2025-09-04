import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/login.styles";
import { MaterialIcons } from '@expo/vector-icons';

export default function Login() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        router.back();
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 100);
    };

    const handleLogin = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        router.push("/home");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 100);
    };

    const handleRegister = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        router.push("/auth/register1");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 100);
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                activeOpacity={0.8}
            >
                <MaterialIcons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <Text style={styles.welcomeText}>Hey Farmer,</Text>
                <Text style={styles.welcomeSubText}>Welcome to{'\n'}AgriTrust</Text>

                <View style={styles.inputWrapper}>
                    <MaterialIcons name="person-outline" size={24} color="#0b6623" />
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#999999"
                        value={userName}
                        onChangeText={setUserName}
                    />
                </View>

                <View style={styles.inputWrapper}>
                    <MaterialIcons name="lock-outline" size={24} color="#0b6623" />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#999999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialIcons 
                            name={showPassword ? "visibility" : "visibility-off"} 
                            size={24} 
                            color="#666666" 
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.loginButton}
                    activeOpacity={0.9}
                    onPress={handleLogin}
                >
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={handleRegister}>
                        <Text style={styles.registerLink}>Register</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
