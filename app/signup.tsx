import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabaseClient";

const { width, height } = Dimensions.get("window");

interface FormData {
  username: string;
  name: string;
  email: string;
  password: string;
  dob: string;
  gender: string;
}

interface GenderOption {
  label: string;
  value: string;
}

const Signup: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const genderOptions: GenderOption[] = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
  ];

  const [formData, setFormData] = useState<FormData>({
    username: "",
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
  });

  const handleChange = (field: keyof FormData, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      handleChange("dob", formattedDate);
    }
  };

  const openDatePicker = (): void => {
    setShowDatePicker(true);
  };

  const selectGender = (gender: string): void => {
    handleChange("gender", gender);
    setShowGenderDropdown(false);
  };

  const handleSignup = async (): Promise<void> => {
    setError("");

    const { username, name, email, password, dob, gender } = formData;

    if (!username || !name || !email || !password || !dob || !gender) {
      setError("Please fill all the fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    if (age < 10 || age > 100) {
      setError("Enter valid DOB. User must be between 10 and 100 years old.");
      return;
    }

    setLoading(true);

    try {
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

      if (existingUser) {
        setError("Username already exists, please choose another");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error("User not created");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        username,
        name,
        email,
        dob,
        gender: gender.toLowerCase(),
      });

      if (profileError) throw profileError;

      Alert.alert("Success!", "Account created successfully. Please sign in.", [
        { text: "OK", onPress: () => router.replace("/login") },
      ]);
    } catch (err: any) {
      console.error("SIGNUP ERROR:", err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const getGenderDisplayValue = (): string => {
    const selected = genderOptions.find((g) => g.value === formData.gender);
    return selected ? selected.label : "Select Gender";
  };

  // Format date for display
  const formatDisplayDate = (dateString: string): string => {
    if (!dateString) return "Select Date of Birth";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={["#2E7D32", "#4CAF50", "#81C784"]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar style="light" />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                {/* Header */}
                <View style={styles.headerContainer}>
                  <View style={styles.logoContainer}>
                    <Ionicons name="fitness" size={50} color="#2E7D32" />
                  </View>
                  <Text style={styles.title}>Create Account</Text>
                  <Text style={styles.subtitle}>Join Lifemate today</Text>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Form */}
                <View style={styles.formContainer}>
                  {/* Username */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Username"
                      placeholderTextColor="#999"
                      value={formData.username}
                      onChangeText={(value: string) =>
                        handleChange("username", value)
                      }
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Full Name */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="bag-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name"
                      placeholderTextColor="#999"
                      value={formData.name}
                      onChangeText={(value: string) =>
                        handleChange("name", value)
                      }
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Email Address"
                      placeholderTextColor="#999"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={formData.email}
                      onChangeText={(value: string) =>
                        handleChange("email", value)
                      }
                    />
                  </View>

                  {/* Password */}
                  <View style={styles.inputContainer}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      value={formData.password}
                      onChangeText={(value: string) =>
                        handleChange("password", value)
                      }
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color="#2E7D32"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Date of Birth - Calendar Button */}

                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={openDatePicker}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="calendar-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />

                    <Text
                      style={[
                        styles.input,
                        !formData.dob && styles.placeholderText,
                      ]}
                    >
                      {formatDisplayDate(formData.dob)}
                    </Text>

                    <Ionicons
                      name="calendar"
                      size={20}
                      color="#2E7D32"
                      style={styles.calendarIcon}
                    />
                  </TouchableOpacity>

                  {/* Gender Dropdown */}
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => setShowGenderDropdown(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="people-outline"
                      size={20}
                      color="#2E7D32"
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.input,
                        !formData.gender && styles.placeholderText,
                      ]}
                    >
                      {getGenderDisplayValue()}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={20}
                      color="#2E7D32"
                      style={styles.dropdownIcon}
                    />
                  </TouchableOpacity>

                  {/* Password Hint */}
                  <Text style={styles.hintText}>
                    Password must be at least 6 characters long
                  </Text>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignup}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#2E7D32" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Create Account</Text>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={20}
                          color="#2E7D32"
                        />
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Terms and Conditions */}
                  <Text style={styles.termsText}>
                    By signing up, you agree to our Terms of Service and Privacy
                    Policy
                  </Text>
                </View>

                {/* Sign In Link */}
                <View style={styles.signinContainer}>
                  <Text style={styles.signinText}>
                    Already have an account?{" "}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/login")}>
                    <Text style={styles.signinLink}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Gender Dropdown Modal */}
          <Modal
            visible={showGenderDropdown}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowGenderDropdown(false)}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowGenderDropdown(false)}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Gender</Text>
                  <TouchableOpacity
                    onPress={() => setShowGenderDropdown(false)}
                  >
                    <Ionicons name="close" size={24} color="#2E7D32" />
                  </TouchableOpacity>
                </View>
                {genderOptions.map((option: GenderOption) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.gender === option.value &&
                        styles.selectedGenderOption,
                    ]}
                    onPress={() => selectGender(option.value)}
                  >
                    <Text
                      style={[
                        styles.genderOptionText,
                        formData.gender === option.value &&
                          styles.selectedGenderOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {formData.gender === option.value && (
                      <Ionicons name="checkmark" size={20} color="#2E7D32" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>

          {/* Date Picker Modal for iOS */}
          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
            />
          )}
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 30,
  },
  content: {
    width: "90%",
    maxWidth: 400,
    padding: 25,
    borderRadius: 25,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#2E7D32",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFB8B8",
  },
  errorText: {
    color: "#FF6B6B",
    marginLeft: 10,
    fontSize: 14,
    flex: 1,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E8F5E9",
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
    minHeight: 55,
  },
  inputIcon: {
    paddingLeft: 15,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    textAlignVertical: "center",
  },
  placeholderText: {
    color: "#999",
  },
  eyeIcon: {
    paddingRight: 15,
  },
  dropdownIcon: {
    paddingRight: 15,
  },
  calendarIcon: {
    paddingRight: 15,
  },
  hintText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 20,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#E8F5E9",
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2E7D32",
    shadowColor: "#2E7D32",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#2E7D32",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  termsText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 10,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  signinText: {
    color: "#666",
    fontSize: 15,
  },
  signinLink: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: height * 0.5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  genderOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },
  selectedGenderOption: {
    backgroundColor: "#E8F5E9",
  },
  genderOptionText: {
    fontSize: 16,
    color: "#333",
  },
  selectedGenderOptionText: {
    color: "#2E7D32",
    fontWeight: "bold",
  },
  // iOS Picker Modal Styles
  pickerModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F5E9",
  },
  pickerCancelText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerDoneText: {
    color: "#2E7D32",
    fontSize: 16,
    fontWeight: "600",
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  datePicker: {
    height: 200,
    width: "100%",
  },
});

export default Signup;
