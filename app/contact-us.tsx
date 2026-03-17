// screens/ContactUsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function ContactUsScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    // Validate form
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    // Create email subject and body
    const subject = `Contact Form: Message from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    
    // Open email client
    Linking.openURL(`mailto:support@yourapp.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
      .then(() => {
        // Reset form
        setName('');
        setEmail('');
        setMessage('');
        setIsSubmitting(false);
      })
      .catch(() => {
        Alert.alert('Error', 'Could not open email client. Please try again.');
        setIsSubmitting(false);
      });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCallPress = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleChatPress = () => {
    // Open WhatsApp or other chat app
    Linking.openURL('https://wa.me/1234567890');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.yourapp.com');
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
            <Text style={styles.headerTitle}>Contact Us</Text>
            <Text style={styles.headerSubtitle}>We're here to help</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Contact Options */}
            <View style={styles.quickContactContainer}>
              <TouchableOpacity style={styles.quickContactItem} onPress={handleCallPress}>
                <LinearGradient
                  colors={['#2E7D32', '#4CAF50']}
                  style={styles.quickContactGradient}
                >
                  <Ionicons name="call-outline" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickContactLabel}>Call Us</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickContactItem} onPress={handleChatPress}>
                <LinearGradient
                  colors={['#2E7D32', '#4CAF50']}
                  style={styles.quickContactGradient}
                >
                  <Ionicons name="chatbubble-outline" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickContactLabel}>Live Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.quickContactItem} onPress={handleWebsitePress}>
                <LinearGradient
                  colors={['#2E7D32', '#4CAF50']}
                  style={styles.quickContactGradient}
                >
                  <Ionicons name="globe-outline" size={24} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.quickContactLabel}>Website</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Form Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="mail-outline" size={24} color="#2E7D32" />
                <Text style={styles.cardTitle}>Send us a Message</Text>
              </View>
              <Text style={styles.cardSubtitle}>
                Fill out the form below and we'll get back to you within 24 hours.
              </Text>

              {/* Name Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Message Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Message</Text>
                <View style={[styles.inputWrapper, styles.messageWrapper]}>
                  <Ionicons name="chatbubble-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, styles.messageInput]}
                    placeholder="Type your message here..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={['#2E7D32', '#4CAF50']}
                  style={styles.submitGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Text>
                  <Ionicons name="send-outline" size={18} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Contact Information Card */}
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.infoCard}
            >
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#2E7D32" />
                <Text style={styles.infoText}>support@yourapp.com</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color="#2E7D32" />
                <Text style={styles.infoText}>+1 (234) 567-890</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color="#2E7D32" />
                <Text style={styles.infoText}>Monday - Friday: 9AM - 6PM</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color="#2E7D32" />
                <Text style={styles.infoText}>123 Health Street, Wellness City, HC 12345</Text>
              </View>
            </LinearGradient>

            {/* Social Media Links */}
            <View style={styles.socialContainer}>
              <Text style={styles.socialTitle}>Follow Us</Text>
              <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://facebook.com/yourapp')}>
                  <Ionicons name="logo-facebook" size={24} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://twitter.com/yourapp')}>
                  <Ionicons name="logo-twitter" size={24} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://instagram.com/yourapp')}>
                  <Ionicons name="logo-instagram" size={24} color="#2E7D32" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialIcon} onPress={() => Linking.openURL('https://linkedin.com/company/yourapp')}>
                  <Ionicons name="logo-linkedin" size={24} color="#2E7D32" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Response Time Note */}
            <View style={styles.responseNote}>
              <Ionicons name="time-outline" size={16} color="#9CA3AF" />
              <Text style={styles.responseNoteText}>Typically replies within 24 hours</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  quickContactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickContactItem: {
    alignItems: 'center',
  },
  quickContactGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quickContactLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  messageWrapper: {
    alignItems: 'flex-start',
    minHeight: 100,
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  socialContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  responseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
  },
  responseNoteText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});