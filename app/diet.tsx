import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
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
import { supabase } from "../lib/supabaseClient";
import ProfileIncomplete from "./ProfileIncomplete";

const { width } = Dimensions.get("window");

interface UserProfile {
  dob: string;
  height_cm: number;
  weight_kg: number;
  gender: "male" | "female";
  activity_level: "sedentary" | "light" | "moderate" | "active";
}

type CalorieLevel = "very_low" | "low" | "moderate" | "high";

export default function DietScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("dob, height_cm, weight_kg, gender, activity_level")
        .eq("id", authData.user.id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#81C784"]}
          style={styles.loaderContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Preparing your diet plan...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (
    !profile?.dob ||
    !profile?.height_cm ||
    !profile?.weight_kg ||
    !profile?.gender ||
    !profile?.activity_level
  ) {
    return (
      <ProfileIncomplete
        title="Profile Incomplete"
        message="Please complete your profile to see diet plan."
      />
    );
  }

  /* AGE */
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

  const age = calculateAge(profile.dob);

  /* BMR */
  const bmr =
    profile.gender === "male"
      ? 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age + 5
      : 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age - 161;

  const activityMultiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const tdee = bmr * activityMultiplier[profile.activity_level];
  const minCalories = Math.round(tdee - 400);
  const maxCalories = Math.round(tdee + 200);

  const getCalorieLevel = (calories: number): CalorieLevel => {
    if (calories <= 1400) return "very_low";
    if (calories <= 1800) return "low";
    if (calories <= 2200) return "moderate";
    return "high";
  };

  const calorieLevel = getCalorieLevel(minCalories);

  const getCalorieLevelLabel = (level: CalorieLevel): string => {
    switch (level) {
      case "very_low":
        return "Low Calorie Plan";
      case "low":
        return "Mild Weight Loss";
      case "moderate":
        return "Maintenance Plan";
      case "high":
        return "High Energy Plan";
    }
  };

  const getCalorieLevelColor = (level: CalorieLevel): string => {
    switch (level) {
      case "very_low":
        return "#EF4444";
      case "low":
        return "#F59E0B";
      case "moderate":
        return "#10B981";
      case "high":
        return "#3B82F6";
    }
  };

  const vegFoodMap: Record<CalorieLevel, string[]> = {
    very_low: [
      "Vegetable soup",
      "Steamed vegetables",
      "Fruit salad",
      "Buttermilk",
    ],
    low: ["Roti (1–2)", "Dal", "Vegetable curry", "Curd"],
    moderate: ["Brown rice", "Paneer", "Dal", "Mixed vegetables", "Fruits"],
    high: ["Rice / Roti", "Paneer", "Dal", "Vegetables", "Milk", "Nuts"],
  };

  const nonVegFoodMap: Record<CalorieLevel, string[]> = {
    very_low: ["Boiled egg whites", "Grilled fish", "Chicken soup"],
    low: ["Boiled eggs", "Grilled chicken", "Fish curry (light)"],
    moderate: ["Eggs", "Chicken breast", "Fish", "Curd"],
    high: ["Eggs", "Chicken", "Fish", "Lean mutton", "Milk"],
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={["#2E7D32", "#4CAF50"]}
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

            <Text style={styles.headerTitle}>Personalized Diet Plan</Text>
            <Text style={styles.headerSubtitle}>Tailored just for you</Text>
          </LinearGradient>

          {/* Calorie Summary Card */}
          <View style={styles.calorieCard}>
            <View style={styles.calorieHeader}>
              <Ionicons name="flame" size={28} color="#2E7D32" />
              <Text style={styles.calorieTitle}>Daily Calorie Target</Text>
            </View>

            <View style={styles.calorieRange}>
              <Text style={styles.calorieMin}>{minCalories}</Text>
              <Text style={styles.calorieSeparator}>to</Text>
              <Text style={styles.calorieMax}>{maxCalories}</Text>
            </View>
            <Text style={styles.calorieUnit}>kcal per day</Text>

            <View style={styles.planBadge}>
              <View
                style={[
                  styles.levelDot,
                  { backgroundColor: getCalorieLevelColor(calorieLevel) },
                ]}
              />
              <Text style={styles.planText}>
                {getCalorieLevelLabel(calorieLevel)}
              </Text>
            </View>
          </View>

          {/* Profile Summary */}
          <View style={styles.profileCard}>
            <Text style={styles.profileCardTitle}>Your Profile</Text>

            <View style={styles.profileGrid}>
              <View style={styles.profileItem}>
                <Ionicons name="calendar-outline" size={20} color="#2E7D32" />
                <Text style={styles.profileLabel}>Age</Text>
                <Text style={styles.profileValue}>{age} years</Text>
              </View>

              <View style={styles.profileItem}>
                <Ionicons name="body-outline" size={20} color="#2E7D32" />
                <Text style={styles.profileLabel}>Activity</Text>
                <Text style={styles.profileValue}>
                  {profile.activity_level}
                </Text>
              </View>

              <View style={styles.profileItem}>
                <Ionicons name="scale-outline" size={20} color="#2E7D32" />
                <Text style={styles.profileLabel}>Weight</Text>
                <Text style={styles.profileValue}>{profile.weight_kg} kg</Text>
              </View>

              <View style={styles.profileItem}>
                <Ionicons name="resize-outline" size={20} color="#2E7D32" />
                <Text style={styles.profileLabel}>Height</Text>
                <Text style={styles.profileValue}>{profile.height_cm} cm</Text>
              </View>
            </View>
          </View>

          {/* Food Recommendations */}
          <Text style={styles.sectionMainTitle}>Recommended Foods</Text>

          {/* Vegetarian Card */}
          <View style={styles.foodCard}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.foodGradient}
            >
              <View style={styles.foodHeader}>
                <View style={styles.foodTitleContainer}>
                  <Ionicons name="leaf" size={24} color="#2E7D32" />
                  <Text style={styles.foodTitle}>Vegetarian Options</Text>
                </View>
                <View style={styles.foodCountBadge}>
                  <Text style={styles.foodCountText}>
                    {vegFoodMap[calorieLevel].length} items
                  </Text>
                </View>
              </View>

              <View style={styles.foodList}>
                {vegFoodMap[calorieLevel].map((food, i) => (
                  <View key={i} style={styles.foodItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2E7D32"
                    />
                    <Text style={styles.foodItemText}>{food}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Non-Vegetarian Card */}
          <View style={styles.foodCard}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.foodGradient}
            >
              <View style={styles.foodHeader}>
                <View style={styles.foodTitleContainer}>
                  <Ionicons name="fish" size={24} color="#2E7D32" />
                  <Text style={styles.foodTitle}>Non-Vegetarian Options</Text>
                </View>
                <View style={styles.foodCountBadge}>
                  <Text style={styles.foodCountText}>
                    {nonVegFoodMap[calorieLevel].length} items
                  </Text>
                </View>
              </View>

              <View style={styles.foodList}>
                {nonVegFoodMap[calorieLevel].map((food, i) => (
                  <View key={i} style={styles.foodItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color="#2E7D32"
                    />
                    <Text style={styles.foodItemText}>{food}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Meal Timing Tips */}
          <View style={styles.tipsCard}>
            <LinearGradient
              colors={["#E8F5E9", "#C8E6C9"]}
              style={styles.tipsGradient}
            >
              <View style={styles.tipsHeader}>
                <Ionicons name="time-outline" size={24} color="#2E7D32" />
                <Text style={styles.tipsTitle}>Meal Timing Tips</Text>
              </View>

              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Eat every 3-4 hours to maintain energy
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Don't skip breakfast - it's the most important meal
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>
                  Have dinner at least 2-3 hours before sleep
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>Stay hydrated between meals</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimerCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6B7280"
            />
            <Text style={styles.disclaimerText}>
              This is a general recommendation. Please consult a nutritionist
              for personalized advice.
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
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  calorieCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: -20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  calorieTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 8,
  },
  calorieRange: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 5,
  },
  calorieMin: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  calorieSeparator: {
    fontSize: 16,
    color: "#9CA3AF",
    marginHorizontal: 8,
  },
  calorieMax: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  calorieUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 15,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  planText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 15,
  },
  profileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  profileItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  profileLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 2,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  sectionMainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginHorizontal: 20,
    marginTop: 25,
    marginBottom: 15,
  },
  foodCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodGradient: {
    padding: 20,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  foodTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  foodCountBadge: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  foodCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2E7D32",
  },
  foodList: {
    gap: 10,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  foodItemText: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  tipsCard: {
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsGradient: {
    padding: 20,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingRight: 10,
  },
  tipBullet: {
    fontSize: 14,
    color: "#2E7D32",
    marginRight: 8,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 20,
  },
  disclaimerCard: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
  },
});
