import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../lib/supabaseClient";
import ProfileIncomplete from "./ProfileIncomplete";

const { width: SCREEN_W } = Dimensions.get("window");

interface Exercise {
  name: string;
  gif: any;
  image: any;
  howTo: string[];
  worksOn: string;
  category: string;
}

// --------------------
// Assets (require all original files into assets/animations)
// --------------------
const AbdominalCruncheGif = require("../assets/animations/Abdominal_crunches.gif");
const AbdominalCruncheImg = require("../assets/images/ABDOMINAL_CRUNCHES.jpg");

const armCircleGif = require("../assets/animations/arm_circles.gif");
const armCircleImg = require("../assets/images/arm_circles.png");

const BackStretchGif = require("../assets/images/BACK_STRETCHF.jpg");
const BackStretchImg = require("../assets/images/BACK_STRETCHF.jpg");

const backwardLungeGif = require("../assets/animations/BACKWARD_LUNGEm.gif");
const backwardLungeImg = require("../assets/images/BACKWARD_LUNGEm.jpg");

const bentlegTwistGif = require("../assets/animations/BENT_LEG_TWIST.gif");
const bentlegTwistImg = require("../assets/images/BENT_LEG_TWIST.jpg");

const ButtocksGif = require("../assets/animations/BUTTOCKSw.gif");
const ButtocksImg = require("../assets/images/buttocksW.jpg");

const crossArmCruncheGif = require("../assets/animations/CROSS_ARM_CRUNCHES.gif");
const crossArmCruncheImg = require("../assets/images/CROSS_ARM_CRUNCHES.jpg");

const dumbbellGif = require("../assets/animations/Dumbbell.gif");
const dumbbelImg = require("../assets/images/DUMBBELL.jpg");

const girlDoingYogaGif = require("../assets/animations/Girl_doing_yoga.gif");
const girlDoingYogaImg = require("../assets/images/girl_doing_yoga.png");

const legRaises2Gif = require("../assets/animations/LEG_RISING2M.gif");
const legRaises2Img = require("../assets/images/LEG_RISING2M.png");

const skippingGif = require("../assets/images/skippingW.png");
const skippingImg = require("../assets/images/skippingW.png");

const plankJacksGif = require("../assets/animations/PLANK_JACKS.gif");
const plankJacksImg = require("../assets/images/PLANK_JACKS.jpg");

const plieSquatsGif = require("../assets/animations/PLIE_SQUATS.gif");
const plieSquatsImg = require("../assets/images/PLIE_SQUATS.jpg");

const RCWLRGif = require("../assets/animations/REVERSE_CRUNCHES_WITH_LEG_RAISED.gif");
const RCWLRImg = require("../assets/images/REVERSE_CRUNCHES_WITH_LEG_RAISED.jpg");

const sideLungesGif = require("../assets/animations/SIDE_LUNGES.gif");
const sideLungesImg = require("../assets/images/SIDE_LUNGES.jpg");

const SkippingGif = require("../assets/images/skippingW.png");
const SkippingImg = require("../assets/images/skippingW.png");

const SASGif = require("../assets/animations/STANDING_ADDUCTOR_STRETCH.gif");
const SASImg = require("../assets/images/STANDING_ADDUCTOR_STRETCH.jpg");

const stepUpOnChairGif = require("../assets/animations/stepup_onto_chair.gif");
const stepUpOnChairImg = require("../assets/images/STEP-UP_ONTO_CHAIR(1).jpg");

const tricepsDipsGif = require("../assets/animations/TRICEPS_DIPS.gif");
const tricepsDipsImg = require("../assets/images/TRICEPS_DIPS.jpg");

const warmUpGif = require("../assets/animations/warmupM.gif");
const warmUpImg = require("../assets/images/warmupM.png");

const yoga2Gif = require("../assets/animations/yoga2.gif");
const yoga2Img = require("../assets/images/yoga2.jpg");

const jumpingJackGif = require("../assets/animations/jumpingjack.gif");
const jumpingJackImg = require("../assets/images/jumpingjack.jpeg");

const bicycleCrunchesGif = require("../assets/animations/BICYCLE_CRUNCHES.gif");
const bicycleCrunchesImg = require("../assets/images/BICYCLE_CRUNCHES.jpg");

const pushUpsGif = require("../assets/animations/PUSH-UPS.gif");
const pushUpsImg = require("../assets/images/PUSH-UPS.jpg");

const squatsGif = require("../assets/animations/SQUATSm.gif");
const squatsImg = require("../assets/images/SQUATSM.jpg");

const wallSitImg = require("../assets/images/Wwall_sit.jpg");
const wallSitGif = require("../assets/images/Wwall_sit.jpg");

const legRaisesGif = require("../assets/animations/LEG_RAISES.gif");
const legRaisesImg = require("../assets/images/LEG_RAISES.jpg");

const buttBridgeGif = require("../assets/animations/BUTT_BRIDGEw.gif");
const buttBridgeImg = require("../assets/images/BUTT_BRIDGE.jpg");

const yogaGif = require("../assets/animations/yoga.gif");
const yogaImg = require("../assets/images/yoga.jpg");

// --------------------
// Exercises array (converted, using require() assets above)
// --------------------
const exercises: Exercise[] = [
  // Balanced Strength + Cardio
  {
    name: "Jumping Jacks",
    gif: jumpingJackGif,
    image: jumpingJackImg,
    howTo: [
      "Stand upright with feet together",
      "Jump and spread legs apart",
      "Raise arms overhead",
      "Jump back to starting position",
    ],
    worksOn: "Full body",
    category: "Balanced Strength + Cardio",
  },
  {
    name: "Plank Jacks",
    gif: plankJacksGif,
    image: plankJacksImg,
    howTo: [
      "Start in plank position",
      "Jump feet apart and together",
      "Keep back straight",
      "Continue steadily",
    ],
    worksOn: "Core, shoulders, legs",
    category: "Balanced Strength + Cardio",
  },
  {
    name: "Squats",
    gif: squatsGif,
    image: squatsImg,
    howTo: [
      "Stand with feet shoulder-width apart",
      "Lower hips by bending knees",
      "Keep chest up",
      "Push through heels to stand",
    ],
    worksOn: "Thighs, glutes",
    category: "Balanced Strength + Cardio",
  },
  {
    name: "Push-Ups",
    gif: pushUpsGif,
    image: pushUpsImg,
    howTo: [
      "Place hands shoulder-width apart",
      "Lower chest toward the floor",
      "Keep body straight",
      "Push back up",
    ],
    worksOn: "Chest, shoulders, triceps",
    category: "Balanced Strength + Cardio",
  },

  // Low-Impact Mixed
  {
    name: "Step Up On Chair",
    gif: stepUpOnChairGif,
    image: stepUpOnChairImg,
    howTo: [
      "Stand in front of a chair",
      "Step up with one foot",
      "Bring other foot up",
      "Step down carefully",
    ],
    worksOn: "Legs, glutes",
    category: "Low-Impact Mixed (walking + light strength)",
  },
  {
    name: "Wall Sit",
    gif: wallSitGif,
    image: wallSitImg,
    howTo: [
      "Stand with back against wall",
      "Slide down until knees form 90°",
      "Keep back flat",
      "Hold position",
    ],
    worksOn: "Thighs, glutes",
    category: "Low-Impact Mixed (walking + light strength)",
  },
  {
    name: "Butt Bridge",
    gif: buttBridgeGif,
    image: buttBridgeImg,
    howTo: [
      "Lie on back with knees bent",
      "Lift hips upward",
      "Squeeze glutes",
      "Lower slowly",
    ],
    worksOn: "Glutes, lower back",
    category: "Low-Impact Mixed (walking + light strength)",
  },
  {
    name: "Arm Circles",
    gif: armCircleGif,
    image: armCircleImg,
    howTo: [
      "Stand straight with arms extended",
      "Rotate arms forward",
      "Rotate arms backward",
      "Keep movements controlled",
    ],
    worksOn: "Shoulders",
    category: "Low-Impact Mixed (walking + light strength)",
  },

  // Cardio
  {
    name: "Skipping",
    gif: SkippingGif,
    image: SkippingImg,
    howTo: [
      "Hold skipping rope",
      "Jump lightly on toes",
      "Swing rope using wrists",
      "Maintain steady pace",
    ],
    worksOn: "Full body",
    category: "Cardio (Weight Loss focus)",
  },
  {
    name: "Warm Up",
    gif: warmUpGif,
    image: warmUpImg,
    howTo: [
      "Move arms and legs gently",
      "Increase heart rate slightly",
      "Loosen joints",
      "Prepare body",
    ],
    worksOn: "Full body",
    category: "Cardio (Weight Loss focus)",
  },
  {
    name: "Side Lunges",
    gif: sideLungesGif,
    image: sideLungesImg,
    howTo: [
      "Stand straight",
      "Step sideways",
      "Bend one knee",
      "Return and switch sides",
    ],
    worksOn: "Legs, glutes",
    category: "Cardio (Weight Loss focus)",
  },
  {
    name: "Backward Lunge",
    gif: backwardLungeGif,
    image: backwardLungeImg,
    howTo: [
      "Stand upright",
      "Step one leg backward",
      "Lower hips",
      "Return to standing",
    ],
    worksOn: "Legs, glutes",
    category: "Cardio (Weight Loss focus)",
  },

  // Yoga / Recovery / Mobility
  {
    name: "Tree Pose",
    gif: girlDoingYogaGif,
    image: girlDoingYogaImg,
    howTo: [
      "Stand straight on one leg",
      "Place other foot on inner thigh",
      "Bring hands together",
      "Maintain balance",
    ],
    worksOn: "Balance, legs",
    category: "Yoga / Recovery / Mobility",
  },
  {
    name: "Back Stretch",
    gif: BackStretchGif,
    image: BackStretchImg,
    howTo: [
      "Stretch arms forward",
      "Round back gently",
      "Hold for few seconds",
    ],
    worksOn: "Lower back",
    category: "Yoga / Recovery / Mobility",
  },
  {
    name: "Buttocks Stretch",
    gif: ButtocksGif,
    image: ButtocksImg,
    howTo: [
      "Cross one leg over the other",
      "Pull knee toward chest",
      "Hold and switch sides",
    ],
    worksOn: "Glutes",
    category: "Yoga / Recovery / Mobility",
  },
  {
    name: "Yoga Stretch",
    gif: yogaGif,
    image: yogaImg,
    howTo: [
      "Move into a comfortable pose",
      "Focus on breathing",
      "Hold and relax",
    ],
    worksOn: "Flexibility",
    category: "Yoga / Recovery / Mobility",
  },

  // Strength Training
  {
    name: "Step Up On Chair With Dumbbells",
    gif: dumbbellGif,
    image: dumbbelImg,
    howTo: [
      "Hold dumbbells",
      "Step onto chair",
      "Bring other foot up",
      "Step down slowly",
    ],
    worksOn: "Legs, glutes",
    category: "Strength Training (build muscle)",
  },
  {
    name: "Triceps Dips",
    gif: tricepsDipsGif,
    image: tricepsDipsImg,
    howTo: ["Place hands on chair", "Lower body", "Push back up"],
    worksOn: "Triceps",
    category: "Strength Training (build muscle)",
  },
  {
    name: "Bicycle Crunches",
    gif: bicycleCrunchesGif,
    image: bicycleCrunchesImg,
    howTo: ["Bring opposite elbow to knee", "Switch sides continuously"],
    worksOn: "Abs",
    category: "Strength Training (build muscle)",
  },
  {
    name: "Leg Raises",
    gif: legRaisesGif,
    image: legRaisesImg,
    howTo: ["Lift legs upward", "Lower slowly"],
    worksOn: "Lower abs",
    category: "Strength Training (build muscle)",
  },

  // Mixed Workout
  {
    name: "Abdominal Crunches With Hands Back",
    gif: yoga2Gif,
    image: yoga2Img,
    howTo: [
      "Lie on your back",
      "Place hands behind head",
      "Lift shoulders upward",
      "Lower slowly",
    ],
    worksOn: "Abs",
    category: "Mixed Workout (general fitness)",
  },
  {
    name: "Bent Leg Twist",
    gif: bentlegTwistGif,
    image: bentlegTwistImg,
    howTo: ["Bend knees", "Twist legs side to side"],
    worksOn: "Core",
    category: "Mixed Workout (general fitness)",
  },
  {
    name: "Cross Arm Crunch",
    gif: crossArmCruncheGif,
    image: crossArmCruncheImg,
    howTo: ["Cross arms", "Lift shoulders", "Lower slowly"],
    worksOn: "Abs",
    category: "Mixed Workout (general fitness)",
  },
  {
    name: "Plie Squats",
    gif: plieSquatsGif,
    image: plieSquatsImg,
    howTo: ["Feet wide apart", "Lower hips", "Push up"],
    worksOn: "Inner thighs",
    category: "Mixed Workout (general fitness)",
  },
  {
    name: "Abdominal Crunches",
    gif: AbdominalCruncheGif,
    image: AbdominalCruncheImg,
    howTo: ["Lift shoulders", "Lower slowly"],
    worksOn: "Abs",
    category: "Mixed Workout (general fitness)",
  },

  // HIIT / High Intensity
  {
    name: "Fast Skipping",
    gif: skippingGif,
    image: skippingImg,
    howTo: ["Jump quickly", "Maintain high pace", "Land softly"],
    worksOn: "Full body",
    category: "HIIT / High Intensity",
  },
  {
    name: "Reverse Crunches With Leg Raised",
    gif: RCWLRGif,
    image: RCWLRImg,
    howTo: ["Lift hips off floor", "Lower slowly"],
    worksOn: "Lower abs",
    category: "HIIT / High Intensity",
  },
  {
    name: "Reverse Crunches With Straight Leg Raised",
    gif: legRaises2Gif,
    image: legRaises2Img,
    howTo: ["Raise straight legs", "Lift hips", "Lower slowly"],
    worksOn: "Core",
    category: "HIIT / High Intensity",
  },
  {
    name: "Standing Adductor Stretch (Dynamic)",
    gif: SASGif,
    image: SASImg,
    howTo: ["Shift weight side to side", "Maintain quick rhythm"],
    worksOn: "Inner thighs",
    category: "HIIT / High Intensity",
  },
];

// --------------------
// Exercise Screen (default export)
// --------------------
export default function ExerciseScreen() {
  const [loading, setLoading] = useState(true);
  const [mlExercises, setMlExercises] = useState<Exercise[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [ageState, setAgeState] = useState<number | null>(null);
  const [bmiState, setBmiState] = useState<number | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingMessage, setLoadingMessage] = useState(
    "Analyzing your profile...",
  );
  const router = useRouter();

  function calculateAge(dob: string) {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function calculateBMI(weight: number, heightCm: number) {
    const h = heightCm / 100;
    return +(weight / (h * h)).toFixed(2);
  }

  useEffect(() => {
    let mounted = true;
    async function callML() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // fetch profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (!profileData) return;
        if (!mounted) return;

        setProfile(profileData);

        // if required fields missing -> stop
        if (
          !profileData.dob ||
          !profileData.weight_kg ||
          !profileData.height_cm ||
          !profileData.gender ||
          !profileData.activity_level ||
          !profileData.avg_sleep_hours ||
          !profileData.avg_water_intake_liters
        ) {
          setLoading(false);
          return;
        }

        const age = calculateAge(profileData.dob);
        const bmi = calculateBMI(profileData.weight_kg, profileData.height_cm);

        setAgeState(age);
        setBmiState(bmi);

        const res = await fetch(
          "https://lifemate-backend-d5xy.onrender.com/predict",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              age,
              bmi,
              gender: profileData.gender,
              activity_level: profileData.activity_level,
              avg_sleep_hours: profileData.avg_sleep_hours,
              avg_water_intake_liters: profileData.avg_water_intake_liters,
            }),
          },
        );

        const data = await res.json();
        const category = data.exercise?.trim();
        if (!category) {
          setLoading(false);
          return;
        }

        // update DB if changed
        if (profileData.recommended_exercise !== category) {
          await supabase
            .from("profiles")
            .update({ recommended_exercise: category })
            .eq("id", user.id);
        }

        // match exercises
        const matched = exercises.filter(
          (e) => e.category.trim().toLowerCase() === category.toLowerCase(),
        );
        setMlExercises(matched);
      } catch (err) {
        console.log("ML error:", err);
      } finally {
        setLoading(false);
      }
    }

    callML();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setLoadingMessage("Generating your exercise plan...");
      }, 6000); // change message after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [loading]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#2E7D32", "#4CAF50", "#81C784"]}
          style={styles.loaderContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>{loadingMessage}</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // profile incomplete
  if (
    !profile ||
    !profile.dob ||
    !profile.weight_kg ||
    !profile.height_cm ||
    !profile.gender ||
    !profile.activity_level ||
    !profile.avg_sleep_hours ||
    !profile.avg_water_intake_liters
  ) {
    return (
      <ProfileIncomplete
        title="Profile Incomplete"
        message="Please complete your profile to see exercise plan."
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#F8FAFC", "#F1F5F9"]} style={styles.container}>
        <StatusBar style="dark" />
        {/* Header with Gradient */}
        <LinearGradient
          colors={["#2E7D32", "#4CAF50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.push("/(tabs)")}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Recommended Exercises</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBadge}>
              <Ionicons name="fitness-outline" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>BMI: {bmiState ?? "—"}</Text>
            </View>
            <View style={styles.statBadge}>
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <Text style={styles.statText}>Age: {ageState ?? "—"}</Text>
            </View>
          </View>
        </LinearGradient>

        <FlatList
          contentContainerStyle={styles.listContainer}
          data={mlExercises}
          keyExtractor={(_, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.reason}>
              ✨ Personalized based on your health metrics
            </Text>
          }
          ListFooterComponent={
            <Text style={styles.guidance}>
              <Ionicons name="hand-left-outline" size={14} /> Tap any exercise
              to see animated guidance
            </Text>
          }
          renderItem={({ item, index }) => {
            const isExpanded = expandedIndex === index;
            return (
              <TouchableOpacity
                style={[styles.card, isExpanded && styles.cardExpanded]}
                activeOpacity={0.9}
                onPress={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <Image
                  source={isExpanded ? item.gif : item.image}
                  style={styles.image}
                  resizeMode="cover"
                />

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.expandIcon}>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#2E7D32"
                      />
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.info}>
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>How to Perform:</Text>
                        {item.howTo.map((step, i) => (
                          <View key={i} style={styles.stepRow}>
                            <Text style={styles.stepBullet}>•</Text>
                            <Text style={styles.stepText}>{step}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Works On:</Text>
                        <View style={styles.worksOnContainer}>
                          <Ionicons
                            name="body-outline"
                            size={16}
                            color="#2E7D32"
                          />
                          <Text style={styles.worksOnText}>{item.worksOn}</Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

// --------------------
// Styles
// --------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
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
  incompleteCard: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 25,
    alignItems: "center",
    width: "80%",
    maxWidth: 350,
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  reason: {
    fontSize: 14,
    color: "#2E7D32",
    marginBottom: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  cardExpanded: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    width: "100%",
    height: 400,
    backgroundColor: "#F3F4F6",
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  expandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    paddingRight: 10,
  },
  stepBullet: {
    fontSize: 14,
    color: "#2E7D32",
    marginRight: 8,
    lineHeight: 20,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  worksOnContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
    gap: 8,
  },
  worksOnText: {
    fontSize: 14,
    color: "#2E7D32",
    fontWeight: "500",
  },
  guidance: {
    textAlign: "center",
    marginTop: 8,
    color: "#6B7280",
    fontSize: 13,
  },
  incompleteTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
    marginTop: 16,
  },
  incompleteMsg: {
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryBtn: {
    backgroundColor: "#2E7D32",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
