import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { supabase } from '../lib/supabaseClient';
import ProfileIncomplete from "./ProfileIncomplete";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Profile {
  dob: string;
  height_cm: number;
  weight_kg: number;
  gender: "male" | "female";
}

export default function HydrateMoreScreen() {
  const router = useRouter();
  const { age: passedAge } = useLocalSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("dob, height_cm, weight_kg, gender")
        .eq("id", authData.user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      setError("Unable to fetch hydration data");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateWaterIntake = () => {
    if (!profile) return 0;

    const age =
      passedAge !== undefined
        ? Number(passedAge)
        : calculateAge(profile.dob);

    let waterMl = profile.weight_kg * 35;

    if (age > 45) waterMl -= 300;
    if (age < 18) waterMl -= 500;
    if (profile.gender === "male") waterMl += 250;

    return Math.max(waterMl, 1500);
  };

  const generateSchedule = (glasses: number) => {
    const startHour = 6.5;
    const endHour = 21.5;
    const interval = (endHour - startHour) / glasses;
    const times: string[] = [];

    for (let i = 0; i < glasses; i++) {
      const time = startHour + interval * i;
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 === 0 ? 12 : hours % 12;

      times.push(
        `${displayHour}:${minutes.toString().padStart(2, "0")} ${ampm}`
      );
    }

    return times;
  };

  const getHydrationStatus = (waterMl: number) => {
    if (waterMl >= 3000) return { text: "High Intake Needed", color: "#3B82F6", icon: "water" as const };
    if (waterMl >= 2500) return { text: "Moderate Intake", color: "#10B981", icon: "water" as const };
    if (waterMl >= 2000) return { text: "Standard Intake", color: "#F59E0B", icon: "water" as const };
    return { text: "Low Intake", color: "#EF4444", icon: "water" as const };
  };

  if (loading) {
    return (
       <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#81C784']}
        style={styles.loaderContainer}
      >

        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loaderText}>Calculating your hydration needs...</Text>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  if (!profile?.dob || !profile?.weight_kg || !profile?.gender) {
    return (
      <ProfileIncomplete
        title="Profile Incomplete"
        message="Please complete your profile to see hydration plan."
      />
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  const totalWater = calculateWaterIntake();
  const glasses = Math.round(totalWater / 250);
  const schedule = generateSchedule(glasses);
  const hydrationStatus = getHydrationStatus(totalWater);

  // Define rules with valid icon names
  const rules = [
    { rule: "Start your day with one glass after waking up.", icon: "sunny-outline" as const },
    { rule: "Drink 30 minutes before meals.", icon: "restaurant-outline" as const },
    { rule: "Sip slowly — avoid chugging.", icon: "speedometer-outline" as const },
    { rule: "Increase intake if you exercise.", icon: "fitness-outline" as const },
    { rule: "Reduce water 1 hour before sleep.", icon: "moon-outline" as const },
    { rule: "Avoid drinking immediately after meals.", icon: "close-circle-outline" as const },
    { rule: "Avoid sugary drinks instead of water.", icon: "warning-outline" as const },
  ];

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
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#2E7D32', '#4CAF50']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            <Text style={styles.backText}>Dashboard</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Ionicons name="water-outline" size={40} color="#FFFFFF" />
            <Text style={styles.headerTitle}>Hydration Plan</Text>
            <Text style={styles.headerSubtitle}>Stay hydrated, stay healthy</Text>
          </View>
        </LinearGradient>

        {/* Water Intake Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.waterIconContainer}>
            <LinearGradient
              colors={['#2E7D32', '#4CAF50']}
              style={styles.waterIconGradient}
            >
              <Ionicons name="water" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          
          <Text style={styles.summaryLabel}>Daily Water Target</Text>
          <Text style={styles.liters}>{(totalWater / 1000).toFixed(1)} Liters</Text>
          
          <View style={styles.glassesContainer}>
            <Text style={styles.glassesText}>{glasses} glasses</Text>
            <Text style={styles.glassesUnit}>· 250ml each</Text>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: hydrationStatus.color + '20' }]}>
            <Ionicons name={hydrationStatus.icon} size={16} color={hydrationStatus.color} />
            <Text style={[styles.statusText, { color: hydrationStatus.color }]}>
              {hydrationStatus.text}
            </Text>
          </View>
        </View>

        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <Text style={styles.cardTitle}>Your Profile</Text>
          <View style={styles.profileGrid}>
            <View style={styles.profileItem}>
              <Ionicons name="scale-outline" size={20} color="#2E7D32" />
              <Text style={styles.profileLabel}>Weight</Text>
              <Text style={styles.profileValue}>{profile.weight_kg} kg</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
              <Text style={styles.profileLabel}>Age</Text>
              <Text style={styles.profileValue}>
                {passedAge !== undefined ? passedAge : calculateAge(profile.dob)} years
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Ionicons name="person-outline" size={20} color="#2E7D32" />
              <Text style={styles.profileLabel}>Gender</Text>
              <Text style={styles.profileValue}>
                {profile.gender === "male" ? "Male" : "Female"}
              </Text>
            </View>
          </View>
        </View>

        {/* Schedule Card */}
        <View style={styles.scheduleCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>Drinking Schedule</Text>
          </View>
          
          <View style={styles.timeline}>
            {schedule.map((time, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeText}>{time}</Text>
                  </View>
                  <View style={styles.glassIcon}>
                    <Ionicons name="water-outline" size={16} color="#2E7D32" />
                  </View>
                </View>
                <View style={styles.timelineRight}>
                  <Text style={styles.glassText}>1 glass</Text>
                  {index < schedule.length - 1 && (
                    <View style={styles.timelineDot} />
                  )}
                </View>
              </View>
            ))}
          </View>
          
          <Text style={styles.note}>
            <Ionicons name="information-circle-outline" size={14} /> Sip slowly. Avoid drinking large amounts right before sleep.
          </Text>
        </View>

        {/* Hydration Rules Card */}
        <View style={styles.rulesCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bulb-outline" size={24} color="#2E7D32" />
            <Text style={styles.cardTitle}>Smart Hydration Rules</Text>
          </View>
          
          <View style={styles.rulesList}>
            {rules.map((item, index) => (
              <View key={index} style={styles.ruleItem}>
                <View style={styles.ruleIconContainer}>
                  <Ionicons name={item.icon} size={18} color="#2E7D32" />
                </View>
                <Text style={styles.ruleText}>{item.rule}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hydration Tips */}
        <View style={styles.tipsCard}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.tipsGradient}
          >
            <View style={styles.tipsHeader}>
              <Ionicons name="heart-outline" size={24} color="#2E7D32" />
              <Text style={styles.tipsTitle}>Benefits of Staying Hydrated</Text>
            </View>
            
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Boosts energy and brain function</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Helps maintain healthy skin</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Aids digestion and nutrient absorption</Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Regulates body temperature</Text>
            </View>
          </LinearGradient>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: 'center',
  },
  waterIconContainer: {
    marginTop: -40,
    marginBottom: 15,
  },
  waterIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 5,
  },
  liters: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  glassesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  glassesText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  glassesUnit: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileCard: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  profileGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileItem: {
    alignItems: 'center',
    gap: 4,
  },
  profileLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  scheduleCard: {
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
  timeline: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    minWidth: 85,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2E7D32',
    textAlign: 'center',
  },
  glassIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineRight: {
    alignItems: 'center',
    position: 'relative',
  },
  glassText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  timelineDot: {
    width: 4,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  note: {
    marginTop: 20,
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  rulesCard: {
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
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ruleIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsGradient: {
    padding: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: '#2E7D32',
    marginRight: 8,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
    lineHeight: 20,
  },
});