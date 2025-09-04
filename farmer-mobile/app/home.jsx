import { View, Text, TouchableOpacity, SafeAreaView, Alert, StatusBar } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import styles from "../assets/styles/home.styles";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function Home() {
    const [isNavigating, setIsNavigating] = useState(false);
    const [userData, setUserData] = useState({
        firstName: "Farmer",
        lastName: "",
        isOnline: true
    });
    const router = useRouter();
    const params = useLocalSearchParams();

    // Get user data from login response
    useEffect(() => {
        if (params.userData) {
            try {
                const loginData = JSON.parse(params.userData);
                setUserData({
                    firstName: loginData.firstname || loginData.firstName || "Farmer",
                    lastName: loginData.lastname || loginData.lastName || "",
                    email: loginData.email || "",
                    username: loginData.username || "",
                    verified: loginData.verified || false,
                    token: loginData.token || "",
                    isOnline: true
                });
            } catch (error) {
                console.error('Error parsing user data:', error);
                // Fallback to default values
                setUserData({
                    firstName: "Farmer",
                    lastName: "",
                    isOnline: true
                });
            }
        }
    }, [params.userData]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    const handleCardPress = (cardName) => {
        if (isNavigating) return;
        
        setIsNavigating(true);
        
        switch (cardName) {
            case 'My Products':
                // Navigate to products screen
                console.log('Navigate to My Products');
                break;
            case 'Add Products':
                // Navigate to add products screen
                console.log('Navigate to Add Products');
                break;
            case 'My Orders':
                // Navigate to orders screen
                console.log('Navigate to My Orders');
                break;
            case 'Delivery Tracker':
                // Navigate to delivery tracker
                console.log('Navigate to Delivery Tracker');
                break;
            case 'Sales Summary':
                // Navigate to sales summary
                console.log('Navigate to Sales Summary');
                break;
            case 'Notification':
                // Navigate to notifications
                console.log('Navigate to Notifications');
                break;
            case 'Transaction History':
                // Navigate to transaction history
                console.log('Navigate to Transaction History');
                break;
            case 'Account':
                // Navigate to account settings
                console.log('Navigate to Account');
                break;
            case 'Transaction Method':
                // Navigate to transaction method
                console.log('Navigate to Transaction Method');
                break;
            case 'Sign Out':
                handleSignOut();
                break;
            default:
                console.log(`Navigate to ${cardName}`);
        }
        
        setTimeout(() => setIsNavigating(false), 1000);
    };

    const handleSignOut = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: () => {
                        // Clear user data and navigate to landing
                        setUserData({
                            firstName: "Farmer",
                            lastName: "",
                            isOnline: false
                        });
                        router.replace('/landing');
                    },
                },
            ]
        );
    };

    const menuCards = [
        { name: 'My Products', icon: 'inventory', iconType: 'MaterialIcons' },
        { name: 'Add Products', icon: 'add-box', iconType: 'MaterialIcons' },
        { name: 'My Orders', icon: 'shopping-cart', iconType: 'MaterialIcons' },
        { name: 'Delivery Tracker', icon: 'local-shipping', iconType: 'MaterialIcons' },
        { name: 'Sales Summary', icon: 'bar-chart', iconType: 'MaterialIcons' },
        { name: 'Notification', icon: 'notifications', iconType: 'MaterialIcons' },
        { name: 'Transaction History', icon: 'account-balance-wallet', iconType: 'MaterialIcons' },
        { name: 'Account', icon: 'person', iconType: 'MaterialIcons' },
        { name: 'Transaction Method', icon: 'payment', iconType: 'MaterialIcons' },
        { name: 'Sign Out', icon: 'exit-to-app', iconType: 'MaterialIcons' },
    ];

    const renderIcon = (card) => {
        if (card.iconType === 'Ionicons') {
            return (
                <Ionicons 
                    name={card.icon} 
                    size={32} 
                    color="#0b6623" 
                    style={styles.cardIcon}
                />
            );
        }
        return (
            <MaterialIcons 
                name={card.icon} 
                size={32} 
                color="#0b6623" 
                style={styles.cardIcon}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#004b12" />
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.greeting}>{getGreeting()}, Farmer!</Text>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                        {userData.firstName && userData.lastName 
                            ? `${userData.firstName} ${userData.lastName}`.trim()
                            : userData.firstName || "Farmer"
                        }
                    </Text>
                    <View style={[styles.statusIndicator, { backgroundColor: userData.isOnline ? '#4CAF50' : '#FF5722' }]} />
                </View>
            </View>

            {/* Main Content - Grid of Cards */}
            <View style={styles.contentContainer}>
                <View style={styles.gridContainer}>
                    {menuCards.map((card, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => handleCardPress(card.name)}
                            activeOpacity={0.7}
                        >
                            {renderIcon(card)}
                            <Text style={styles.cardText}>{card.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}
