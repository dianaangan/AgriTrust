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
    const [errors, setErrors] = useState({});
    const router = useRouter();

    const handleBack = () => {
        if (isNavigating) return; // Prevent multiple rapid clicks
        
        setIsNavigating(true);
        // Use replace to go back to landing to prevent multiple instances
        router.replace("/landing");
        
        // Reset navigation state after a short delay
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const handleChange = (key, value) => {
        if (key === 'userName') {
            setUserName(value);
        } else if (key === 'password') {
            setPassword(value);
        }
        if (errors[key] || errors.general) {
            setErrors(prev => ({ ...prev, [key]: null, general: null }));
        }
    };

    const handleFocus = (key) => {
        if (errors[key] || errors.general) {
            setErrors(prev => ({ ...prev, [key]: null, general: null }));
        }
    };

    const handleLogin = async () => {
        if (isNavigating || isLoading) return; // Prevent multiple rapid clicks
        
        // Clear previous errors
        setErrors({});
        
        // Validate inputs
        const newErrors = {};
        if (!userName.trim()) {
            newErrors.userName = 'Username is required';
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
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
                // Handle different error types with inline errors
                if (response.status === 403) {
                    setErrors({ general: result.message || 'Your account is not yet verified. Please wait for admin verification.' });
                } else if (response.status === 401) {
                    setErrors({ userName: 'Invalid username', password: 'Invalid password' });
                } else {
                    setErrors({ general: result.message || 'An error occurred during login' });
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
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

                <View style={[styles.inputWrapper, errors.userName && styles.inputWrapperError]}>
                    <MaterialIcons name="person-outline" size={24} color={errors.userName ? "#ff3333" : "#0b6623"} />
                    <TextInput
                        style={[styles.input, errors.userName && styles.inputError]}
                        placeholder={errors.userName || "Username"}
                        placeholderTextColor={errors.userName ? "#ff3333" : "#999999"}
                        value={errors.userName ? "" : userName}
                        onChangeText={(value) => handleChange('userName', value)}
                        onFocus={() => handleFocus('userName')}
                    />
                </View>

                <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                    <MaterialIcons name="lock-outline" size={24} color={errors.password ? "#ff3333" : "#0b6623"} />
                    <TextInput
                        style={[styles.input, errors.password && styles.inputError]}
                        placeholder={errors.password || "Password"}
                        placeholderTextColor={errors.password ? "#ff3333" : "#999999"}
                        value={errors.password ? "" : password}
                        onChangeText={(value) => handleChange('password', value)}
                        onFocus={() => handleFocus('password')}
                        secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialIcons 
                            name={showPassword ? "visibility" : "visibility-off"} 
                            size={24} 
                            color={errors.password ? "#ff3333" : "#666666"} 
                        />
                    </TouchableOpacity>
                </View>

                {errors.general && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errors.general}</Text>
                        <TouchableOpacity 
                            style={styles.closeButton}
                            onPress={() => setErrors(prev => ({ ...prev, general: null }))}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="close" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                )}

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
