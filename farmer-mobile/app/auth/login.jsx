import { View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/login.styles";
import { MaterialIcons } from '@expo/vector-icons';
import { API_BASE_URL } from "../../constants/config";

export default function Login() {
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleBack = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        // Use replace to go back to landing to prevent multiple instances
        router.replace("/landing");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const handleLogin = async () => {
        if (isNavigating || isLoading) return; // Prevent multiple rapid clicks
        
        // Validate inputs
        if (!userName.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password');
            return;
        }
        
        setIsLoading(true);
        setIsNavigating(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/farmers/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: userName.trim(),
                    password: password.trim()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store token and user data (you might want to use AsyncStorage or secure storage)
                // Pass user data to home screen
                const userData = {
                    firstname: result.data.farmer.firstname,
                    lastname: result.data.farmer.lastname,
                    email: result.data.farmer.email,
                    username: result.data.farmer.username,
                    verified: result.data.farmer.verified,
                    token: result.data.token
                };
                
                // Navigate directly to home screen without toast
                router.replace({
                    pathname: "/home",
                    params: { userData: JSON.stringify(userData) }
                });
            } else {
                // Handle different error types
                if (response.status === 403) {
                    Alert.alert('Account Not Verified', result.message || 'Your account is not yet verified. Please wait for admin verification.');
                } else if (response.status === 401) {
                    Alert.alert('Login Failed', 'Invalid username or password');
                } else {
                    Alert.alert('Login Failed', result.message || 'An error occurred during login');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
        } finally {
            setIsLoading(false);
            // Reset navigation state after a short delay
            setTimeout(() => setIsNavigating(false), 1000);
        }
    };

    const handleRegister = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        // Use replace to prevent multiple register1 screens
        router.replace("/auth/register1");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
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
                    style={[styles.loginButton, (isLoading || isNavigating) && styles.loginButtonDisabled]}
                    activeOpacity={0.9}
                    onPress={handleLogin}
                    disabled={isLoading || isNavigating}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={styles.loginButtonText}>Logging in...</Text>
                        </View>
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
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
