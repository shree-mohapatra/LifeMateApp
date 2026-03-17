import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../../lib/supabaseClient";

const { width } = Dimensions.get("window");

interface UserProfile {
  name?: string;
  username?: string;
  dob?: string;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  avg_sleep_hours?: number;
  avg_water_intake_liters?: number;
  scalp_type?: string;
  skin_type?: string;
}

const scalpTipsMap: Record<string, string[]> = {
  dry: [
    "Use a moisturizing shampoo",
    "Oil your scalp twice a week",
    "Avoid hot water while washing hair",
  ],
  oily: [
    "Wash hair 3–4 times a week",
    "Avoid heavy oils",
    "Use a mild clarifying shampoo",
  ],
  dandruff: [
    "Use anti-dandruff shampoo",
    "Avoid scratching the scalp",
    "Keep scalp clean and dry",
  ],
  normal: [
    "Maintain regular hair wash routine",
    "Use gentle hair products",
    "Massage scalp for blood circulation",
  ],
};

const skinTipsMap: Record<string, string[]> = {
  dry: [
    "Use a gentle hydrating cleanser",
    "Apply moisturizer twice daily",
    "Avoid hot showers",
  ],
  oily: [
    "Wash face twice daily",
    "Use oil-free moisturizer",
    "Avoid touching your face frequently",
  ],
  combination: [
    "Use lightweight gel-based moisturizer",
    "Avoid harsh cleansers",
    "Balance oily and dry areas separately",
  ],
  sensitive: [
    "Use fragrance-free products",
    "Do a patch test before new products",
    "Avoid harsh exfoliation",
  ],
  normal: [
    "Maintain basic skincare routine",
    "Use sunscreen daily",
    "Stay hydrated",
  ],
};

const lowEnergyTips: string[] = [
  "Get at least 7–8 hours of sleep daily",
  "Stay hydrated throughout the day",
  "Eat balanced meals with protein and fiber",
  "Avoid skipping breakfast",
  "Do light exercise or walking daily",
  "Reduce excessive screen time before sleep",
];

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const hasHealthInfo = profile?.height_cm && profile?.weight_kg;

  const scalpTips =
    profile?.scalp_type && scalpTipsMap[profile.scalp_type]
      ? scalpTipsMap[profile.scalp_type]
      : [];

  const skinTips =
    profile?.skin_type && skinTipsMap[profile.skin_type]
      ? skinTipsMap[profile.skin_type]
      : [];

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const fetchProfile = async () => {
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

    setProfile(data);
    setLoading(false);
  };

  const calculateAge = (dob?: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#81C784"]}
          style={styles.loaderContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Loading your health data...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const age = calculateAge(profile?.dob);
  const heightM = profile?.height_cm ? profile.height_cm / 100 : 0;

  const bmi =
    profile?.height_cm && profile?.weight_kg
      ? Number((profile.weight_kg / (heightM * heightM)).toFixed(1))
      : null;

  const getBmiStatus = (bmi: number | null) => {
    if (bmi === null) return { status: "—", color: "#9CA3AF" };
    if (bmi < 18.5) return { status: "Underweight", color: "#F59E0B" };
    if (bmi < 25) return { status: "Healthy", color: "#10B981" };
    if (bmi < 30) return { status: "Overweight", color: "#F97316" };
    return { status: "Obese", color: "#EF4444" };
  };

  const bmiInfo = getBmiStatus(bmi);

  const recommendedWater = profile?.weight_kg
    ? Number((profile.weight_kg * 0.033).toFixed(1))
    : 2.5;

  const currentWater = profile?.avg_water_intake_liters ?? 0;
  const waterProgress = Math.min(
    100,
    Math.round((currentWater / recommendedWater) * 100),
  );

  const getWaterStatus = () => {
    if (!profile?.avg_water_intake_liters)
      return { text: "Add water intake data", color: "#9CA3AF" };
    if (waterProgress >= 90) return { text: "Excellent! 🌟", color: "#10B981" };
    if (waterProgress >= 70) return { text: "Good 👍", color: "#3B82F6" };
    if (waterProgress >= 50) return { text: "Average", color: "#F59E0B" };
    return { text: "Needs Improvement", color: "#EF4444" };
  };
  const waterStatus = getWaterStatus();

  const getSleepStatus = () => {
    if (!profile?.avg_sleep_hours)
      return { text: "Add sleep data", color: "#9CA3AF" };
    if (profile.avg_sleep_hours >= 8)
      return { text: "Excellent! 🌟", color: "#10B981" };
    if (profile.avg_sleep_hours >= 7)
      return { text: "Good 👍", color: "#3B82F6" };
    if (profile.avg_sleep_hours >= 6)
      return { text: "Average", color: "#F59E0B" };
    return { text: "Needs Improvement", color: "#EF4444" };
  };

  const sleepStatus = getSleepStatus();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* HEADER WITH GRADIENT */}
          <LinearGradient
            colors={["#2E7D32", "#4CAF50"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.userName}>
                  {profile?.username || "User"}! 👋
                </Text>
                <View style={styles.userInfoRow}>
                  {age && (
                    <View style={styles.userInfoBadge}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.userInfoText}>{age} years</Text>
                    </View>
                  )}
                  {profile?.gender && (
                    <View style={styles.userInfoBadge}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#FFFFFF"
                      />
                      <Text style={styles.userInfoText}>{profile.gender}</Text>
                    </View>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.editProfileButton}
                onPress={() => router.push("/(tabs)/profile")}
              >
                <Ionicons name="create-outline" size={18} color="#2E7D32" />
                <Text style={styles.editProfileText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* QUICK STATS CARDS */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="resize-outline" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.statLabel}>Height</Text>
              <Text style={styles.statValue}>
                {profile?.height_cm ?? "—"}{" "}
                <Text style={styles.statUnit}>cm</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="fitness-outline" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.statLabel}>Weight</Text>
              <Text style={styles.statValue}>
                {profile?.weight_kg ?? "—"}{" "}
                <Text style={styles.statUnit}>kg</Text>
              </Text>
            </View>

            <View style={styles.statCard}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: "#E8F5E9" },
                ]}
              >
                <Ionicons name="calculator-outline" size={20} color="#2E7D32" />
              </View>
              <Text style={styles.statLabel}>BMI</Text>
              <Text style={styles.statValue}>{bmi ?? "—"}</Text>
              <Text style={[styles.bmiStatus, { color: bmiInfo.color }]}>
                {bmiInfo.status}
              </Text>
            </View>
          </View>

          {/* WATER INTAKE CARD */}
          <View style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="water-outline" size={22} color="#2E7D32" />
                <Text style={styles.cardTitle}>Water Intake</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: waterStatus.color + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: waterStatus.color }]}>
                  {waterStatus.text}
                </Text>
              </View>
            </View>

            <View style={styles.progressSection}>
              <Text style={styles.trackingValue}>
                {currentWater.toFixed(1)} L
              </Text>
              <Text style={styles.trackingTarget}>
                Target: {recommendedWater} L
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${waterProgress}%`, backgroundColor: "#4CAF50" },
                ]}
              />
            </View>

            <Text style={styles.progressText}>
              {waterProgress}% of daily goal
            </Text>
          </View>

          {/* SLEEP CARD */}
          <View style={styles.trackingCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Ionicons name="moon-outline" size={22} color="#2E7D32" />
                <Text style={styles.cardTitle}>Sleep Quality</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: sleepStatus.color + "20" },
                ]}
              >
                <Text style={[styles.statusText, { color: sleepStatus.color }]}>
                  {sleepStatus.text}
                </Text>
              </View>
            </View>

            <View style={styles.sleepSection}>
              <Text style={styles.trackingValue}>
                {profile?.avg_sleep_hours ?? "—"}{" "}
                <Text style={styles.sleepUnit}>hours</Text>
              </Text>
              <Text style={styles.sleepRecommendation}>
                Recommended: 7-8 hours
              </Text>
            </View>
          </View>

          {/* HEALTH INSIGHTS SECTION */}
          <Text style={styles.sectionMainTitle}>Health Insights</Text>

          <View style={styles.insightsGrid}>
            {/* Scalp Health */}
            <View style={styles.insightCard}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.insightGradient}
              >
                <View style={styles.insightHeader}>
                  <Ionicons name="leaf-outline" size={24} color="#2E7D32" />
                  <Text style={styles.insightTitle}>Scalp Health</Text>
                </View>
                {scalpTips.length > 0 ? (
                  scalpTips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>
                    Add scalp type in profile
                  </Text>
                )}
              </LinearGradient>
            </View>

            {/* Skin Health */}
            <View style={styles.insightCard}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.insightGradient}
              >
                <View style={styles.insightHeader}>
                  <Ionicons name="flower-outline" size={24} color="#2E7D32" />
                  <Text style={styles.insightTitle}>Skin Health</Text>
                </View>
                {skinTips.length > 0 ? (
                  skinTips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>
                    Add skin type in profile
                  </Text>
                )}
              </LinearGradient>
            </View>

            {/* Energy Tips */}
            <View style={[styles.insightCard, styles.fullWidthCard]}>
              <LinearGradient
                colors={["#E8F5E9", "#C8E6C9"]}
                style={styles.insightGradient}
              >
                <View style={styles.insightHeader}>
                  <Ionicons name="flash-outline" size={24} color="#2E7D32" />
                  <Text style={styles.insightTitle}>Energy Boost Tips</Text>
                </View>
                {hasHealthInfo ? (
                  lowEnergyTips.map((tip, index) => (
                    <View key={index} style={styles.tipRow}>
                      <Text style={styles.tipBullet}>•</Text>
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>
                    Add health informations to see tips
                  </Text>
                )}
              </LinearGradient>
            </View>
          </View>

          {/* DAILY HABITS */}
          <Text style={styles.sectionMainTitle}>Daily Habits</Text>
          <Text style={styles.sectionSubTitle}>
            (click here to see personalised recommendations)
          </Text>

          <View style={styles.habitsGrid}>
            <TouchableOpacity
              style={styles.habitCard}
              onPress={() => router.push("/diet")}
            >
              <LinearGradient
                colors={["#f5a056", "#cc8603"]}
                style={styles.habitGradient}
              >
                <Ionicons name="restaurant-outline" size={32} color="#FFFFFF" />
                <Text style={styles.habitText}>Balanced Diet</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.habitCard}
              onPress={() => router.push("/exercise")}
            >
              <LinearGradient
                colors={["#4CAF50", "#2E7D32"]}
                style={styles.habitGradient}
              >
                <Ionicons name="fitness-outline" size={32} color="#FFFFFF" />
                <Text style={styles.habitText}>Morning Exercise</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.habitCard}
              onPress={() => router.push("/hydrate")}
            >
              <LinearGradient
                colors={["#4fc8fb", "#048ec9"]}
                style={styles.habitGradient}
              >
                <Ionicons name="water-outline" size={32} color="#FFFFFF" />
                <Text style={styles.habitText}>Hydrate More</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* HABIT IMPACT PREDICTION */}
          <Text style={styles.sectionMainTitle}>Future Impact</Text>

          <View style={styles.impactContainer}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={[styles.impactCard, styles.goodImpact]}
            >
              <Ionicons name="checkmark-circle" size={32} color="#2E7D32" />
              <Text style={styles.impactTitle}>With Good Habits</Text>
              <View style={styles.impactList}>
                <Text style={styles.impactItem}>✓ Healthy weight</Text>
                <Text style={styles.impactItem}>✓ High energy levels</Text>
                <Text style={styles.impactItem}>✓ Reduced hair fall</Text>
                <Text style={styles.impactItem}>✓ Glowing skin</Text>
              </View>
            </LinearGradient>

            <LinearGradient
              colors={["#FFECEC", "#FFE5E5"]}
              style={[styles.impactCard, styles.badImpact]}
            >
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
              <Text style={[styles.impactTitle, styles.badTitle]}>
                With Bad Habits
              </Text>
              <View style={styles.impactList}>
                <Text style={styles.impactItem}>✗ Weight gain</Text>
                <Text style={styles.impactItem}>✗ Weakness</Text>
                <Text style={styles.impactItem}>✗ Increased hair fall</Text>
                <Text style={styles.impactItem}>✗ Skin issues</Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    marginRight: 8,
  },
  userInfoText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 4,
  },
  editProfileButton: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  editProfileText: {
    color: "#2E7D32",
    fontSize: 14,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: -15,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#FFFFFF",
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  statUnit: {
    fontSize: 10,
    fontWeight: "normal",
    color: "#9CA3AF",
  },
  bmiStatus: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  trackingCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  progressSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 12,
  },
  trackingValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  trackingTarget: {
    fontSize: 13,
    color: "#6B7280",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "right",
  },
  sleepSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sleepUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#6B7280",
  },
  sleepRecommendation: {
    fontSize: 12,
    color: "#6B7280",
  },
  sectionMainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionSubTitle: {
    fontSize: 15,
    color: "#727272",
    marginHorizontal: 20,
    marginBottom: 12,
  },
  insightsGrid: {
    paddingHorizontal: 20,
  },
  insightCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  fullWidthCard: {
    width: "100%",
  },
  insightGradient: {
    padding: 16,
  },
  insightHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: "#2E7D32",
    marginRight: 6,
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 18,
  },
  emptyStateText: {
    fontSize: 13,
    color: "#9CA3AF",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  habitsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 25,
  },

  habitCard: {
    width: (width - 60) / 3,
    aspectRatio: 1,
    borderRadius: 18,
    backgroundColor: "#fff",

    // Android shadow
    elevation: 10,
  },

  habitGradient: {
    flex: 1,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },

  habitText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
  },
  impactContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  impactCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  goodImpact: {
    alignItems: "flex-start",
  },
  badImpact: {
    alignItems: "flex-start",
  },
  impactTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 8,
    marginBottom: 10,
  },
  badTitle: {
    color: "#EF4444",
  },
  impactList: {
    width: "100%",
  },
  impactItem: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
    paddingLeft: 4,
  },
});
