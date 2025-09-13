import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import styles from "../assets/styles/home.styles";

export default function Home() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (params.userData) {
            try {
                setUserData(JSON.parse(params.userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
    }, [params.userData]);

    const handleLogout = () => {
        router.replace("/landing");
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>
                    Welcome, {userData?.firstname || 'Buyer'}!
                </Text>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Buyer Dashboard</Text>
                <Text style={styles.subtitle}>
                    This is your buyer home screen. The full dashboard will be implemented here.
                </Text>
                
                <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>
                        Dashboard features will be added here:
                        {'\n'}• Browse products
                        {'\n'}• View farmer profiles
                        {'\n'}• Place orders
                        {'\n'}• Track deliveries
                    </Text>
                </View>
            </View>
        </View>
    );
}
