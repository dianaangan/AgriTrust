import { View, Text, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { MaterialIcons } from '@expo/vector-icons';
import styles from "../assets/styles/home.styles";
import { useNavigationGuard } from "../hooks/useNavigationGuard";

export default function Home() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { navigate, cleanup } = useNavigationGuard();
  
  // Get user data from login
  const userData = params.userData ? JSON.parse(params.userData) : {};

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleLogout = () => {
    navigate(() => {
      // Clear any stored data and navigate to landing
      router.replace("/landing");
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b6623" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>
              {userData.firstname} {userData.lastname}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <MaterialIcons name="verified" size={24} color={userData.verified ? "#4CAF50" : "#FF9800"} />
            <Text style={styles.statusTitle}>Account Status</Text>
          </View>
          <Text style={[styles.statusText, { color: userData.verified ? "#4CAF50" : "#FF9800" }]}>
            {userData.verified ? "Verified" : "Pending Verification"}
          </Text>
          {!userData.verified && (
            <Text style={styles.statusSubtext}>
              Your account is under review. You'll be notified once verification is complete.
            </Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionCard} disabled={!userData.verified}>
            <MaterialIcons name="local-shipping" size={32} color="#0b6623" />
            <Text style={styles.actionTitle}>Available Deliveries</Text>
            <Text style={styles.actionSubtitle}>
              {userData.verified ? "View available delivery jobs" : "Complete verification to access"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} disabled={!userData.verified}>
            <MaterialIcons name="history" size={32} color="#0b6623" />
            <Text style={styles.actionTitle}>Delivery History</Text>
            <Text style={styles.actionSubtitle}>
              {userData.verified ? "View your delivery history" : "Complete verification to access"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MaterialIcons name="account-circle" size={32} color="#0b6623" />
            <Text style={styles.actionTitle}>Profile Settings</Text>
            <Text style={styles.actionSubtitle}>Update your profile information</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <MaterialIcons name="help" size={32} color="#0b6623" />
            <Text style={styles.actionTitle}>Help & Support</Text>
            <Text style={styles.actionSubtitle}>Get help and contact support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
