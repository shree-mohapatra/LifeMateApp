import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabaseClient";
import ProfileIncomplete from "../ProfileIncomplete";

const { width } = Dimensions.get("window");

interface WeeklyData {
  weekStart: string | null;
  days: Record<string, boolean>;
}

interface UserProfile {
  gender?: string;
  dob?: string;
  height_cm?: number;
  weight_kg?: number;
  skin_type?: "oily" | "dry" | "normal" | "pimple";
  avg_water_intake_liters?: number;
  activity_level?:
    | "sedentary"
    | "light"
    | "moderate"
    | "active"
    | "very_active";
  avg_sleep_hours?: number;
}

interface Habit {
  id: number;
  title: string;
  time: string;
  completed: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  reason: string;
}

interface StreakData {
  count: number;
  lastDate: string | null;
  longest: number;
}

export default function HabitsScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dayCompleted, setDayCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState<StreakData>({
    count: 0,
    lastDate: null,
    longest: 0,
  });

  const todayISO = new Date().toISOString().split("T")[0];
  const todayKey = userId ? `habits-${userId}-${todayISO}` : null;
  const streakKey = userId ? `streak-${userId}` : null;

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setLoading(false);
        return;
      }
      setUserId(data.user.id);
    };
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      reloadScreen();
    }, [userId]),
  );

  const reloadScreen = async () => {
    if (!userId || !todayKey || !streakKey) return;

    try {
      setLoading(true);

      const saved = await AsyncStorage.getItem(todayKey);
      const streakSaved = await AsyncStorage.getItem(streakKey);

      if (streakSaved) {
        setStreak(JSON.parse(streakSaved));
      }

      if (saved === "done") {
        setDayCompleted(true);
        setLoading(false);
        return;
      }

      if (saved) {
        setHabits(JSON.parse(saved));
      } else {
        await loadProfileAndHabits();
      }

      setLoading(false);
    } catch (error) {
      console.error("Reload error:", error);
      setLoading(false);
    }
  };

  const loadProfileAndHabits = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "gender, dob, height_cm, weight_kg, skin_type, avg_water_intake_liters, activity_level, avg_sleep_hours",
      )
      .eq("id", userId)
      .single();

    if (error) {
      console.log(error);
      setLoading(false);
      return;
    }

    setProfile(data);

    if (
      !data?.dob ||
      !data?.height_cm ||
      !data?.weight_kg ||
      !data?.gender ||
      !data?.skin_type ||
      !data?.avg_water_intake_liters ||
      !data?.activity_level ||
      !data?.avg_sleep_hours
    ) {
      setLoading(false);
      return;
    }

    const generated = generateDailyHabits(data);
    setHabits(generated);
    setLoading(false);
  };

  const getAge = (dob?: string) => {
    if (!dob) return 25;
    return Math.floor(
      (Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365),
    );
  };

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  };

  const updateWeeklyProgress = async () => {
    if (!userId) return;

    const weeklyKey = `weekly-progress-${userId}`;
    const weekStart = getWeekStart();

    const storedWeekly = await AsyncStorage.getItem(weeklyKey);
    let weeklyData: WeeklyData = storedWeekly
      ? JSON.parse(storedWeekly)
      : { weekStart: null, days: {} };

    // If new week started, reset
    if (weeklyData.weekStart !== weekStart) {
      weeklyData = { weekStart, days: {} };
    }

    // Mark today as completed
    weeklyData.days[todayISO] = true;

    await AsyncStorage.setItem(weeklyKey, JSON.stringify(weeklyData));
    console.log("Weekly progress updated:", weeklyData); // For debugging
  };

  const updateStreakAndProgress = async () => {
    if (!userId || !streakKey) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Update streak
    const storedStreak = await AsyncStorage.getItem(streakKey);
    const streakData: StreakData = storedStreak
      ? JSON.parse(storedStreak)
      : { count: 0, lastDate: null, longest: 0 };

    let newCount = 1;
    if (streakData.lastDate === yesterdayStr) {
      newCount = streakData.count + 1;
    } else if (streakData.lastDate === todayISO) {
      newCount = streakData.count;
    }

    const newStreakData: StreakData = {
      count: newCount,
      lastDate: todayISO,
      longest: Math.max(newCount, streakData.longest || 0),
    };

    await AsyncStorage.setItem(streakKey, JSON.stringify(newStreakData));
    setStreak(newStreakData);

    // IMPORTANT: Update weekly progress
    await updateWeeklyProgress();
  };

  useEffect(() => {
    if (!todayKey || habits.length === 0) return;

    const saveData = async () => {
      const allDone = habits.every((h) => h.completed);

      if (allDone) {
        await AsyncStorage.setItem(todayKey, "done");
        await updateStreakAndProgress(); // Changed from updateStreak
        setDayCompleted(true);
      } else {
        await AsyncStorage.setItem(todayKey, JSON.stringify(habits));
      }
    };

    saveData();
  }, [habits]);

  // Generate 5+ personalized habits based on user health data
  const generateDailyHabits = (profile: UserProfile): Habit[] => {
    let id = 1;
    const habits: Habit[] = [];

    const age = getAge(profile.dob);
    const heightM = (profile.height_cm || 170) / 100;
    const weight = profile.weight_kg || 65;
    const gender = profile.gender || "male";
    const bmi = Number((weight / (heightM * heightM)).toFixed(1));
    const activityLevel = profile.activity_level || "moderate";
    const avgSleep = profile.avg_sleep_hours || 7;
    const avgWater = profile.avg_water_intake_liters || 2.5;
    const skinType = profile.skin_type || "normal";

    // Calculate personalized values
    const recommendedWater =
      gender === "male"
        ? (weight * 0.04).toFixed(1)
        : (weight * 0.035).toFixed(1);

    const waterNeeded =
      Number(recommendedWater) > avgWater ? "increase" : "maintain";

    const sleepTarget = age < 18 ? 9 : age <= 40 ? 8 : 7;
    const sleepStatus = avgSleep < sleepTarget ? "increase" : "maintain";

    const bmiCategory =
      bmi < 18.5
        ? "underweight"
        : bmi < 25
          ? "healthy"
          : bmi < 30
            ? "overweight"
            : "obese";

    /* HABIT 1: Nutrition (based on BMI) */
    let nutritionHabit = "";
    if (bmiCategory === "underweight") {
      nutritionHabit = "Eat protein-rich meals + healthy fats (nuts, avocado)";
    } else if (bmiCategory === "healthy") {
      nutritionHabit =
        "Maintain balanced diet with fruits, veggies, lean protein";
    } else if (bmiCategory === "overweight") {
      nutritionHabit = "Focus on high-fiber foods, reduce processed carbs";
    } else {
      nutritionHabit = "Follow low-calorie diet, avoid sugary foods";
    }

    habits.push({
      id: id++,
      title: nutritionHabit,
      time: "Breakfast, Lunch, Dinner",
      completed: false,
      icon: "restaurant-outline",
      category: "nutrition",
      reason: `Based on your BMI: ${bmi} (${bmiCategory})`,
    });

    /* HABIT 2: Water Intake (based on weight, gender & current intake) */
    habits.push({
      id: id++,
      title:
        waterNeeded === "increase"
          ? `Drink ${recommendedWater}L water (currently ${avgWater}L) - try to increase`
          : `Maintain ${avgWater}L water intake`,
      time: "Throughout the day",
      completed: false,
      icon: "water-outline",
      category: "hydration",
      reason: `Based on your weight: ${weight}kg and gender: ${gender}`,
    });

    /* HABIT 3: Sleep (based on age & current sleep) */
    habits.push({
      id: id++,
      title:
        sleepStatus === "increase"
          ? `Sleep ${sleepTarget} hours (currently ${avgSleep}h) - aim for more rest`
          : `Maintain ${avgSleep}h sleep schedule`,
      time: "Night",
      completed: false,
      icon: "moon-outline",
      category: "sleep",
      reason: `Based on your age: ${age} years`,
    });

    /* HABIT 4: Skin Care (based on skin type) */
    const skinMessages = {
      oily: "Wash face 3x daily with gentle cleanser, use oil-free moisturizer",
      dry: "Moisturize twice daily, use hydrating face wash, avoid hot water",
      normal: "Wash face morning & night, use SPF moisturizer",
      pimple: "Use anti-acne face wash 3x daily, avoid touching face",
    };

    habits.push({
      id: id++,
      title: skinMessages[skinType],
      time: "Morning & Night",
      completed: false,
      icon: "leaf-outline",
      category: "skincare",
      reason: `Based on your skin type: ${skinType}`,
    });

    /* HABIT 5: Exercise (based on activity level) */
    const exerciseMessages = {
      sedentary: "Start with 20-30 min walking + basic stretches",
      light: "30-45 min moderate exercise (brisk walk, light jog)",
      moderate: "45-60 min active workout (cardio + strength)",
      active: "60+ min intense workout (HIIT, running, weights)",
      very_active: "Maintain 60-90 min varied workout routine",
    };

    habits.push({
      id: id++,
      title: exerciseMessages[activityLevel] || exerciseMessages.moderate,
      time: "Morning / Evening",
      completed: false,
      icon: "fitness-outline",
      category: "exercise",
      reason: `Based on your activity level: ${activityLevel}`,
    });

    /* HABIT 6: Screen Time (based on age) - extra habit */
    habits.push({
      id: id++,
      title: `Limit leisure screen time to ${
        age < 18 ? "2" : age <= 40 ? "3" : "2.5"
      } hours today`,
      time: "After work/school",
      completed: false,
      icon: "phone-portrait-outline",
      category: "wellness",
      reason: `Based on your age: ${age} years`,
    });

    return habits;
  };

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h)),
    );
  };

  const getProgressPercentage = () => {
    if (habits.length === 0) return 0;
    const completed = habits.filter((h) => h.completed).length;
    return Math.round((completed / habits.length) * 100);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#81C784"]}
          style={styles.loaderContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Personalizing your habits...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (
    profile &&
    (!profile.dob ||
      !profile.height_cm ||
      !profile.weight_kg ||
      !profile.gender ||
      !profile.skin_type ||
      !profile.avg_water_intake_liters ||
      !profile.activity_level ||
      !profile.avg_sleep_hours)
  ) {
    return (
      <ProfileIncomplete
        title="Profile Incomplete"
        message="Please complete your profile to access daily habits."
      />
    );
  }

  if (dayCompleted) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50"]}
          style={styles.successContainer}
        >
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={styles.successScroll}>
            <View style={styles.successCard}>
              <View style={styles.successIconContainer}>
                <Ionicons name="trophy" size={60} color="#FFD700" />
              </View>

              <Text style={styles.successTitle}>🎉 Great Job!</Text>
              <Text style={styles.successMessage}>
                You've completed all your personalized habits today!
              </Text>

              <View style={styles.streakContainer}>
                <View style={styles.streakBadge}>
                  <Ionicons name="flame" size={24} color="#FF6B6B" />
                  <Text style={styles.streakCount}>{streak.count}</Text>
                  <Text style={styles.streakLabel}>day streak</Text>
                </View>

                <View style={styles.streakBadge}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                  <Text style={styles.streakCount}>{streak.longest}</Text>
                  <Text style={styles.streakLabel}>longest</Text>
                </View>
              </View>

              <Text style={styles.comebackText}>See you tomorrow! 🌱</Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const progress = getProgressPercentage();
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Today's Habits</Text>
              <Text style={styles.headerSubtitle}>
                Personalized just for you
              </Text>
            </View>

            <View style={styles.streakHeader}>
              <Ionicons name="flame" size={24} color="#FF6B6B" />
              <Text style={styles.streakHeaderText}>{streak.count}</Text>
            </View>
          </View>

          {/* Progress Card */}
          <LinearGradient
            colors={["#2E7D32", "#4CAF50"]}
            style={styles.progressCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Daily Progress</Text>
              <Text style={styles.progressPercentage}>{progress}%</Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            <Text style={styles.progressText}>
              {completedCount} of {habits.length} habits completed
            </Text>
          </LinearGradient>

          {/* Habits List */}
          <View style={styles.habitsList}>
            {habits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={styles.habitCard}
                onPress={() => toggleHabit(habit.id)}
                activeOpacity={0.7}
              >
                <View style={styles.habitLeft}>
                  <View
                    style={[
                      styles.habitIcon,
                      habit.completed && styles.habitIconCompleted,
                    ]}
                  >
                    <Ionicons
                      name={habit.icon}
                      size={20}
                      color={habit.completed ? "#FFFFFF" : "#2E7D32"}
                    />
                  </View>

                  <View style={styles.habitInfo}>
                    <Text
                      style={[
                        styles.habitTitle,
                        habit.completed && styles.habitTitleCompleted,
                      ]}
                    >
                      {habit.title}
                    </Text>
                    <View style={styles.habitMeta}>
                      <Ionicons name="time-outline" size={12} color="#9CA3AF" />
                      <Text style={styles.habitTime}>{habit.time}</Text>
                    </View>
                    <Text style={styles.habitReason}>{habit.reason}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.checkbox,
                    habit.completed && styles.checkboxCompleted,
                  ]}
                >
                  {habit.completed && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Info Footer */}
          <View style={styles.infoFooter}>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#6B7280"
              />
              <Text style={styles.infoText}>
                Complete all habits to maintain your streak
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="flash-outline" size={16} color="#6B7280" />
              <Text style={styles.infoText}>
                Habits are personalized based on your health data
              </Text>
            </View>
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
    padding: 20,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
  },
  progressCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: "#2E7D32",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressPercentage: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  habitsList: {
    gap: 12,
    marginBottom: 20,
  },
  habitCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  habitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  habitIconCompleted: {
    backgroundColor: "#2E7D32",
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  habitTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
  },
  habitMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  habitTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  habitReason: {
    fontSize: 11,
    color: "#2E7D32",
    fontStyle: "italic",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  infoFooter: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },
  successContainer: {
    flex: 1,
  },
  successScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF9E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  successMessage: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 25,
  },
  streakContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginBottom: 25,
  },
  streakBadge: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    minWidth: 100,
  },
  streakCount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    marginVertical: 5,
  },
  streakLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  comebackText: {
    fontSize: 14,
    color: "#9CA3AF",
    fontStyle: "italic",
  },
});
