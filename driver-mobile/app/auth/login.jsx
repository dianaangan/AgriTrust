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
            const response = await fetch(`${API_BASE_URL}/deliverydrivers/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: userName.trim(), // Driver login uses email instead of username
                    password: password.trim()
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store token and user data (you might want to use AsyncStorage or secure storage)
                // Pass user data to home screen
                const userData = {
                    firstname: result.data.deliveryDriver.firstname,
                    lastname: result.data.deliveryDriver.lastname,
                    email: result.data.deliveryDriver.email,
                    username: result.data.deliveryDriver.username,
                    verified: result.data.deliveryDriver.verified,
                    token: result.data.token
                };
                
                // Navigate directly to home screen without toast
                router.replace({
                    pathname: "/home",
                    params: { userData: JSON.stringify(userData) }
                });
            } else {
                
                if (response.status === 403) {
                    setErrors({ general: result.message || 'Your account is not yet verified. Please wait for admin verification.' });
                } else if (response.status === 401) {
                    setErrors({ userName: 'Invalid email', password: 'Invalid password' });
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
            <View style={styles.headerSection}>
                <View style={styles.topRow}>
                    <TouchableOpacity 
                        onPress={handleBack} 
                        style={styles.backButton}
                        activeOpacity={0.8}
                    >
                        <MaterialIcons name="arrow-back" size={18} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.progressWrapper}>
                        <View style={styles.progressTrack}>
                            <View style={styles.progressFill} />
                        </View>
                    </View>
                </View>

                <Text style={styles.title}>Welcome{"\n"}Back</Text>
                <Text style={styles.subtitle}>Sign in to your driver account</Text>
            </View>

            <View style={styles.formSection}>
                <View style={styles.form}>
                    {errors.general && (
                        <View style={styles.errorContainer}>
                            <Text style={styles.errorText}>{errors.general}</Text>
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder={errors.userName || "Email"}
                            placeholderTextColor={errors.userName ? "#ff3333" : "#6a6a6a"}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="email-address"
                            value={errors.userName ? "" : userName}
                            onChangeText={(t) => handleChange("userName", t)}
                            onFocus={() => handleFocus("userName")}
                            style={[styles.input, errors.userName && styles.inputError]}
                            returnKeyType="next"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            placeholder={errors.password || "Password"}
                            placeholderTextColor={errors.password ? "#ff3333" : "#6a6a6a"}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={errors.password ? "" : password}
                            onChangeText={(t) => handleChange("password", t)}
                            onFocus={() => handleFocus("password")}
                            style={[styles.input, errors.password && styles.inputError]}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <MaterialIcons 
                                name={showPassword ? "visibility" : "visibility-off"} 
                                size={20} 
                                color="#6a6a6a" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    <TouchableOpacity 
                        style={[styles.loginButton, (isLoading || isNavigating) && styles.loginButtonDisabled]} 
                        onPress={handleLogin}
                        disabled={isLoading || isNavigating}
                    >
                        {isLoading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color="#ffffff" />
                                <Text style={styles.loginText}>Signing in...</Text>
                            </View>
                        ) : (
                            <Text style={styles.loginText}>Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerRow}>
                        <Text style={styles.registerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleRegister}>
                            <Text style={styles.registerLink}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
