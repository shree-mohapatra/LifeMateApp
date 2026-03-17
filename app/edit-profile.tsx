import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { supabase } from '../lib/supabaseClient';
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

//keyboard
interface UserProfile {
  name: string;
  email: string;
  dob?: string;
  gender: string;
  heightCm: string;
  weightKg: string;
  avgSleepHours: string;
  avgWaterIntakeLiters: string;
  profileImageUrl: string | null;
  scalpType: string;
  faceSkinType: string;
  activityLevel: string;
}

const calculateAge = (dob?: string) => {
  if (!dob) return "—";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age.toString();
};

const capitalize = (s?: string) => {
  if (!s) return "—";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

const EditableField = React.memo(({
  label,
  value,
  editing,
  onChange,
  keyboard = "default",
  icon,
}: any) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelContainer}>
        <Ionicons name={icon} size={16} color="#2E7D32" />
        <Text style={styles.label}>{label}</Text>
      </View>

      {editing ? (
        <TextInput
          style={styles.input}
          value={value || ""}
          keyboardType={keyboard}
          onChangeText={onChange}
          placeholderTextColor="#9CA3AF"
        />
      ) : (
        <Text style={styles.value}>{value || "—"}</Text>
      )}
    </View>
  ));

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!data) {
      setLoading(false);
      return;
    }

    const mapped: UserProfile = {
      name: data.name,
      email: data.email,
      dob: data.dob,
      gender: data.gender || "",
      heightCm: data.height_cm?.toString() || "",
      weightKg: data.weight_kg?.toString() || "",
      avgSleepHours: data.avg_sleep_hours?.toString() || "",
      avgWaterIntakeLiters:
        data.avg_water_intake_liters?.toString() || "",
      profileImageUrl:
        data.profile_image_url ||null,
      scalpType: data.scalp_type || "",
      faceSkinType: data.skin_type || "",
      activityLevel: data.activity_level || "",
    };

    setProfile(mapped);
    setFormData(mapped);
    setLoading(false);
  };

  const handleChange = React.useCallback((field: string, value: string) => {
  setFormData(prev => {
    if (!prev) return prev;
    return { ...prev, [field]: value };
  });
}, []);

  // ✅ Upload Image to Supabase Storage
 const pickImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission required");
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });

  if (!result.canceled && result.assets?.length > 0) {
    uploadImage(result.assets[0].uri);
  }
};

  const uploadImage = async (uri: string) => {
  try {
    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const base64 = await FileSystem.readAsStringAsync(uri, {
  encoding: "base64",
});

    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const arrayBuffer = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) {
      console.log("Upload error:", error);
      Alert.alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ profile_image_url: publicUrl })
      .eq("id", user.id);

    setFormData(prev => ({
      ...prev!,
      profileImageUrl: publicUrl,
    }));

    setProfile(prev => ({
      ...prev!,
      profileImageUrl: publicUrl,
    }));

  } catch (err) {
    console.log("Image upload error:", err);
    Alert.alert("Image upload failed");
  } finally {
    setUploading(false);
  }
};
  // ✅ Save profile + weight history
  const handleSave = async () => {
    if (!formData) return;

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const newWeight = Number(formData.weightKg);
    const oldWeight = Number(profile?.weightKg);

    await supabase
      .from("profiles")
      .update({
        height_cm: Number(formData.heightCm),
        weight_kg: newWeight,
        avg_sleep_hours: Number(formData.avgSleepHours),
        avg_water_intake_liters: Number(
          formData.avgWaterIntakeLiters
        ),
        scalp_type: formData.scalpType,
        skin_type: formData.faceSkinType,
        activity_level: formData.activityLevel,
      })
      .eq("id", user.id);

    // Save weight history if changed
   // Save weight history for graph tracking
if (newWeight && newWeight !== oldWeight) {

  const { error } = await supabase
    .from("weight_history")
    .insert({
      user_id: user.id,
      weight_kg: newWeight,
      recorded_at: new Date().toISOString(),
    });

  if (error) {
    console.log("Weight history error:", error);
  } else {
    console.log("Weight history saved");
  }
}

    setProfile(formData);
    setIsEditing(false);
    setLoading(false);
    Alert.alert("Success", "Profile Updated");
  };


  if (loading || !profile || !formData) {
    return (
       <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#81C784']}
        style={styles.loaderContainer}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loaderText}>Loading your profile...</Text>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
     <SafeAreaView style={{ flex: 1 }}>
    <LinearGradient
      colors={['#F8FAFC', '#F1F5F9']}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Avatar */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
          >
           <Ionicons name="arrow-back" size={24} color="#2E7D32" />
          </TouchableOpacity>
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper}>
              <Image
                key={formData.profileImageUrl}
                source={
                  formData.profileImageUrl
                    ? { uri: formData.profileImageUrl, cache: "reload" }
                    : require("../assets/images/default-profile.jpg")
                    
                }
                style={styles.avatar}
              />
              
              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
            
            <TouchableOpacity
              style={[
                styles.editButton,
                isEditing && styles.saveButton
              ]}
              onPress={() =>
                isEditing ? handleSave() : setIsEditing(true)
              }
            >
              <Ionicons 
                name={isEditing ? "checkmark" : "create-outline"} 
                size={18} 
                color="#FFFFFF" 
              />
              <Text style={styles.editButtonText}>
                {isEditing ? "Save Changes" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Age Card */}
        <View style={styles.ageCard}>
          <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
          <Text style={styles.ageText}>Age: {calculateAge(profile.dob)} years</Text>
        </View>

        {/* Personal Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="person-outline" size={22} color="#2E7D32" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <EditableField
            label="Height"
            value={formData.heightCm}
            editing={isEditing}
            keyboard="number-pad"
            icon="resize-outline"
            onChange={(v: string) => handleChange("heightCm", v)}
          />

          <EditableField
            label="Weight"
            value={formData.weightKg}
            editing={isEditing}
            keyboard="number-pad"
            icon="scale-outline"
            onChange={(v: string) => handleChange("weightKg", v)}
          />

          <EditableField
            label="Average Sleep"
            value={formData.avgSleepHours}
            editing={isEditing}
            keyboard="number-pad"
            icon="moon-outline"
            onChange={(v: string) =>
              handleChange("avgSleepHours", v)
            }
          />

          <EditableField
            label="Water Intake"
            value={formData.avgWaterIntakeLiters}
            editing={isEditing}
            keyboard="number-pad"
            icon="water-outline"
            onChange={(v: string) =>
              handleChange("avgWaterIntakeLiters", v)
            }
          />
        </View>

        {/* Health Metrics Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="leaf-outline" size={22} color="#2E7D32" />
            <Text style={styles.cardTitle}>Health Metrics</Text>
          </View>

          {/* Scalp Type */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="water-outline" size={16} color="#2E7D32" />
              <Text style={styles.label}>Scalp Type</Text>
            </View>
            {isEditing ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.scalpType || ""}
                  onValueChange={(val) => handleChange("scalpType", val)}
                  style={styles.picker}
                  dropdownIconColor="#2E7D32"
                >
                  <Picker.Item label="Select scalp type..." value="" />
                  <Picker.Item label="Normal" value="normal" />
                  <Picker.Item label="Oily" value="oily" />
                  <Picker.Item label="Dry" value="dry" />
                  <Picker.Item label="Combination" value="combination" />
                  <Picker.Item label="Sensitive" value="sensitive" />
                </Picker>
              </View>
            ) : (
              <Text style={styles.value}>
                {formData.scalpType ? capitalize(formData.scalpType) : "—"}
              </Text>
            )}
          </View>

          {/* Face / Skin Type */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="flower-outline" size={16} color="#2E7D32" />
              <Text style={styles.label}>Face / Skin Type</Text>
            </View>
            {isEditing ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.faceSkinType || ""}
                  onValueChange={(val) => handleChange("faceSkinType", val)}
                  style={styles.picker}
                  dropdownIconColor="#2E7D32"
                >
                  <Picker.Item label="Select skin type..." value="" />
                  <Picker.Item label="Normal" value="normal" />
                  <Picker.Item label="Oily" value="oily" />
                  <Picker.Item label="Dry" value="dry" />
                  <Picker.Item label="Combination" value="combination" />
                  <Picker.Item label="Sensitive" value="sensitive" />
                </Picker>
              </View>
            ) : (
              <Text style={styles.value}>
                {formData.faceSkinType ? capitalize(formData.faceSkinType) : "—"}
              </Text>
            )}
          </View>

          {/* Activity Level */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="fitness-outline" size={16} color="#2E7D32" />
              <Text style={styles.label}>Activity Level</Text>
            </View>
            {isEditing ? (
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.activityLevel || ""}
                  onValueChange={(val) => handleChange("activityLevel", val)}
                  style={styles.picker}
                  dropdownIconColor="#2E7D32"
                >
                  <Picker.Item label="Select activity level..." value="" />
                  <Picker.Item label="Sedentary" value="sedentary" />
                  <Picker.Item label="Light" value="light" />
                  <Picker.Item label="Moderate" value="moderate" />
                  <Picker.Item label="Active" value="active" />
                  <Picker.Item label="Very active" value="very_active" />
                </Picker>
              </View>
            ) : (
              <Text style={styles.value}>
                {formData.activityLevel ? capitalize(formData.activityLevel.replace("_", " ")) : "—"}
              </Text>
            )}
          </View>
        </View>

        {/* Uploading Indicator */}
        {uploading && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.uploadingText}>Uploading image...</Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#2E7D32',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 15,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#10B981',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  ageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -15,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
  },
  ageText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  value: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  pickerWrapper: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#111827',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  uploadingContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  uploadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});