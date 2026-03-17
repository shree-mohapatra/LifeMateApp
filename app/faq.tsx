// screens/FAQScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I track my daily habits?',
    answer: 'Go to the Home screen and you\'ll see your daily habits list. Tap the checkbox next to each habit to mark it as completed. Your progress will be automatically saved and reflected in your streak.',
  },
  {
    id: '2',
    question: 'What is the streak system?',
    answer: 'Your streak counts consecutive days where you complete all your daily habits. If you miss a day, your streak resets to 0. The longest streak you\'ve achieved is also recorded for motivation.',
  },
  {
    id: '3',
    question: 'How do I update my weight?',
    answer: 'Navigate to the Profile screen and tap on "Edit Profile". You can update your weight there. The weight history will be used to show your progress chart in the Progress screen.',
  },
  {
    id: '4',
    question: 'Can I customize my habits?',
    answer: 'Currently, habits are predefined based on your profile information. Future updates will include habit customization features.',
  },
  {
    id: '5',
    question: 'How is my daily water intake calculated?',
    answer: 'Your daily water intake is calculated based on your weight, activity level, and other factors from your profile. You can update these details in your profile settings.',
  },
  {
    id: '6',
    question: 'Is my data secure?',
    answer: 'Yes, all your personal data is securely stored in our encrypted database. We use Supabase with industry-standard security practices to protect your information.',
  },
  {
    id: '7',
    question: 'Can I use the app offline?',
    answer: 'Some features like viewing your habits and progress are available offline. However, syncing data and updating your profile requires an internet connection.',
  },
  {
    id: '8',
    question: 'How do I reset my streak?',
    answer: 'Streaks are automatically managed based on your daily habit completion. If you believe there\'s an error, please contact support through the Contact Us option.',
  },
  {
    id: '9',
    question: 'What do the different colors in the progress chart mean?',
    answer: 'In the weekly progress chart: Green indicates completed days, gray shows pending days, and a green border marks today. The weight chart shows your progress over time with gradient bars.',
  },
  {
    id: '10',
    question: 'How do I delete my account?',
    answer: 'To delete your account, please contact our support team through the Contact Us option in the Profile screen. We\'ll guide you through the account deletion process.',
  },
];

export default function FAQScreen() {
  const navigation = useNavigation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@yourapp.com?subject=Support%20Request');
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
            <Text style={styles.headerTitle}>FAQ</Text>
            <Text style={styles.headerSubtitle}>Frequently Asked Questions</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Search Bar - Optional */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <Text style={styles.searchPlaceholder}>Search questions...</Text>
          </View>

          {/* FAQ List */}
          <View style={styles.faqContainer}>
            {faqData.map((item) => (
              <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.questionContainer}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.questionText}>{item.question}</Text>
                  <Ionicons
                    name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#2E7D32"
                  />
                </TouchableOpacity>
                
                {expandedId === item.id && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Still Have Questions Card */}
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.supportCard}
          >
            <Ionicons name="help-buoy-outline" size={32} color="#2E7D32" />
            <Text style={styles.supportTitle}>Still have questions?</Text>
            <Text style={styles.supportText}>
              Can't find the answer you're looking for? Please contact our support team.
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleContactSupport}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </LinearGradient>

          {/* Version Info */}
          <Text style={styles.versionText}>Version 1.0.0</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: {
    marginLeft: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
  faqContainer: {
    gap: 12,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    flex: 1,
    marginRight: 12,
  },
  answerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  answerText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  supportCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginTop: 12,
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  supportButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 8,
  },
  supportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 20,
  },
});