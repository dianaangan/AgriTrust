import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import styles from "../../assets/styles/login.styles";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from "../../constants/config";
import { useNavigationGuard } from "../../hooks/useNavigationGuard";
import getColors from "../../constants/colors";

const C = getColors('light');

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const { isNavigating, navigate, cleanup } = useNavigationGuard();

    // Cleanup on component unmount
    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const handleBack = () => {
        navigate(() => {
            // Use replace to go back to landing to prevent multiple instances
            router.replace("/landing");
        });
    };

    const handleChange = (key, value) => {
        if (key === 'email') {
            setEmail(value);
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
        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            newErrors.email = 'Enter a valid email';
        }
        if (!password.trim()) {
            newErrors.password = 'Password is required';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await fetch(`${API_BASE_URL}/deliverydrivers/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
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
                    verified: result.data.deliveryDriver.verified,
                    token: result.data.token
                };
                
                // Navigate directly to home screen without toast
                navigate(() => {
                    router.replace({
                        pathname: "/home",
                        params: { userData: JSON.stringify(userData) }
                    });
                });
            } else {
                // Handle different error types with inline errors
                if (response.status === 403) {
                    setErrors({ general: result.message || 'Your account is not yet verified. Please wait for admin verification.' });
                } else if (response.status === 401) {
                    setErrors({ email: 'Invalid email', password: 'Invalid password' });
                } else {
                    setErrors({ general: result.message || 'An error occurred during login' });
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ general: 'Unable to connect to server. Please check your internet connection.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = () => {
        navigate(() => {
            // Use replace to prevent multiple register1 screens
            router.replace("/auth/register1");
        });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={handleBack}
                activeOpacity={0.8}
            >
                <MaterialIcons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <Text style={styles.welcomeText}>Hey Driver,</Text>
                <Text style={styles.welcomeSubText}>Welcome to{'\n'}AgriTrust</Text>

                <View style={[styles.inputWrapper, errors.email && styles.inputWrapperError]}>
                    <Ionicons name="mail-outline" size={20} color={errors.email ? "#ff3333" : C.muted} />
                    <TextInput
                        style={[styles.input, errors.email && styles.inputError]}
                        placeholder={errors.email || "Email"}
                        placeholderTextColor={errors.email ? "#ff3333" : "#999999"}
                        value={errors.email ? "" : email}
                        onChangeText={(value) => handleChange('email', value)}
                        onFocus={() => handleFocus('email')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={[styles.inputWrapper, errors.password && styles.inputWrapperError]}>
                    <Ionicons name="lock-closed-outline" size={20} color={errors.password ? "#ff3333" : C.muted} />
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
                        <Ionicons 
                            name={showPassword ? "eye-outline" : "eye-off-outline"} 
                            size={20} 
                            color={errors.password ? "#ff3333" : C.muted} 
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

                <TouchableOpacity onPress={() => router.push('/password-reset/forgot-password')}>
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
        </View>
    );
}
