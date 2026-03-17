// screens/PrivacyPolicyScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const lastUpdated = 'March 11, 2026';

  const handleEmailPress = () => {
    Linking.openURL('mailto:privacy@yourapp.com');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        style={styles.container}
      >
        <StatusBar style="dark" />
        
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <Text style={styles.headerSubtitle}>Last Updated: {lastUpdated}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Introduction</Text>
            </View>
            <Text style={styles.cardText}>
              Your privacy is important to us. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our mobile application. 
              Please read this privacy policy carefully. If you do not agree with the terms of 
              this privacy policy, please do not access the application.
            </Text>
          </View>

          {/* Information We Collect */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Information We Collect</Text>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Data</Text>
              <Text style={styles.cardText}>
                While using our application, we may ask you to provide us with certain 
                personally identifiable information that can be used to contact or identify you. 
                This may include:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={styles.bulletPoint}>• Name and email address</Text>
                <Text style={styles.bulletPoint}>• Age and date of birth</Text>
                <Text style={styles.bulletPoint}>• Gender</Text>
                <Text style={styles.bulletPoint}>• Height and weight</Text>
                <Text style={styles.bulletPoint}>• Skin type</Text>
                <Text style={styles.bulletPoint}>• Activity level</Text>
                <Text style={styles.bulletPoint}>• Sleep hours</Text>
                <Text style={styles.bulletPoint}>• Water intake data</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Usage Data</Text>
              <Text style={styles.cardText}>
                We may also collect information on how the application is accessed and used. 
                This usage data may include information such as:
              </Text>
              <View style={styles.bulletPoints}>
                <Text style={styles.bulletPoint}>• Habit completion patterns</Text>
                <Text style={styles.bulletPoint}>• Streak information</Text>
                <Text style={styles.bulletPoint}>• Weight history</Text>
                <Text style={styles.bulletPoint}>• App interaction data</Text>
              </View>
            </View>
          </View>

          {/* How We Use Your Information */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>How We Use Your Information</Text>
            </View>
            <Text style={styles.cardText}>
              We use the information we collect for various purposes:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• To provide and maintain our application</Text>
              <Text style={styles.bulletPoint}>• To calculate personalized health recommendations</Text>
              <Text style={styles.bulletPoint}>• To track your progress and streaks</Text>
              <Text style={styles.bulletPoint}>• To generate insights and analytics</Text>
              <Text style={styles.bulletPoint}>• To improve user experience</Text>
              <Text style={styles.bulletPoint}>• To communicate with you about updates</Text>
            </View>
          </View>

          {/* Data Storage and Security */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="lock-closed-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Data Storage and Security</Text>
            </View>
            <Text style={styles.cardText}>
              Your data is securely stored using industry-standard encryption and security 
              measures. We use Supabase, a secure backend platform, to store your information. 
              While we strive to use commercially acceptable means to protect your personal data, 
              no method of transmission over the internet or electronic storage is 100% secure.
            </Text>
          </View>

          {/* Data Sharing */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="share-social-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Data Sharing</Text>
            </View>
            <Text style={styles.cardText}>
              We do not sell, trade, or rent your personal information to third parties. We may 
              share anonymous, aggregated data for analytical purposes. Your individual data is 
              never shared without your explicit consent.
            </Text>
          </View>

          {/* Your Rights */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="people-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Your Rights</Text>
            </View>
            <Text style={styles.cardText}>
              You have the right to:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Access your personal data</Text>
              <Text style={styles.bulletPoint}>• Correct inaccurate data</Text>
              <Text style={styles.bulletPoint}>• Request deletion of your data</Text>
              <Text style={styles.bulletPoint}>• Export your data</Text>
              <Text style={styles.bulletPoint}>• Withdraw consent at any time</Text>
            </View>
          </View>

          {/* Changes to Policy */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="git-compare-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Changes to This Policy</Text>
            </View>
            <Text style={styles.cardText}>
              We may update our Privacy Policy from time to time. We will notify you of any 
              changes by posting the new Privacy Policy on this page and updating the "Last Updated" 
              date at the top. You are advised to review this Privacy Policy periodically for any changes.
            </Text>
          </View>

          {/* Contact Us */}
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.contactCard}
          >
            <Ionicons name="mail-outline" size={32} color="#2E7D32" />
            <Text style={styles.contactTitle}>Contact Us</Text>
            <Text style={styles.contactText}>
              If you have any questions about this Privacy Policy, please contact us:
            </Text>
            <TouchableOpacity onPress={handleEmailPress}>
              <Text style={styles.contactEmail}>privacy@yourapp.com</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Acceptance */}
          <View style={styles.acceptanceContainer}>
            <Text style={styles.acceptanceText}>
              By using our application, you agree to the collection and use of information 
              in accordance with this policy.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  bulletPoints: {
    marginTop: 8,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
    marginLeft: 8,
  },
  contactCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  acceptanceContainer: {
    padding: 16,
    marginBottom: 20,
  },
  acceptanceText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});