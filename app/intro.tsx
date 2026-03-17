import React, { useState } from "react";
import {
  ScrollView,
  StatusBar,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Text,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");

/* ---------- SLIDE DATA (colors + content) ---------- */
const slides = [
  {
    id: "welcome",
    gradient: ["#2FAF8A", "#14B8A6"], // warm green → teal
    title: "Your Personal\nHealth Lifemate",
    subtitle:
      "Get personalized diet plans, daily habits, and future health predictions based on your body stats — in minutes.",
    accent: "white",
  },
  {
    id: "features",
    gradient: ["#06B6D4", "#6366F1"], // aqua → indigo
    title: "Features",
    features: [
      "🥗 Personalized Diet Plans",
      "📊 Daily Habit Tracking",
      "👟 AI Exercise Recommendations",
      "🧠 Smart Lifestyle Insights",
    ],
    accent: "white",
  },
  {
    id: "how",
    gradient: ["#FDE68A", "#F97316"], // warm orange (light)
    title: "How it Works",
    steps: [
      "Enter your body details and health goals",
      "Track daily habits and activities",
      "Receive AI-powered insights and predictions",
      "Improve your health with small daily changes",
    ],
    accent: "#111827",
  },
  {
    id: "about",
    gradient: ["#F3F4F6", "#FFFFFF"], // soft light for final slide
    title: "About Lifemate",
    subtitle:
      "Lifemate is a smart, personalized health companion designed to help you understand, improve and sustain a healthier lifestyle.",
    accent: "#0F172A",
    isFinal: true,
  },
];

/* ---------- helper: compute luminance of hex color (0..1) ---------- */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}
function luminanceOfHex(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  // linear luminance formula (sRGB)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}
function slideIsLight(index: number) {
  const g = slides[index].gradient;
  // average luminance of first two gradient stops (if present)
  const l1 = luminanceOfHex(g[0] || "#ffffff");
  const l2 = luminanceOfHex(g[1] || g[0] || "#ffffff");
  const avg = (l1 + l2) / 2;
  // threshold tuned: > 0.65 considered "light"
  return avg >= 0.65;
}

export default function Intro() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slide);
  };

  const completeIntro = async () => {
    try {
      await AsyncStorage.setItem("hasSeenIntro", "true");
      router.replace("/login");
    } catch (e) {
      console.warn("Could not save intro flag", e);
      router.replace("/login");
    }
  };

  // dynamic flag based on visible slide
  const currentSlideIsLight = slideIsLight(currentSlide);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle={currentSlideIsLight ? "dark-content" : "light-content"}
      />

      {/* Skip */}
      <TouchableOpacity
        accessibilityRole="button"
        onPress={completeIntro}
        style={styles.skipButton}
        hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
      >
        <Text
          style={[
            styles.skipText,
            currentSlideIsLight ? { color: "#374151" } : undefined,
          ]}
        >
          Skip
        </Text>
      </TouchableOpacity>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={{ width: width * slides.length }}
      >
        {slides.map((s, i) => (
          <View key={s.id} style={[styles.slide, { width, height }]}>
            <LinearGradient
              colors={s.gradient as [string, string, ...string[]]}
              start={[0.0, 0.0]}
              end={[1.0, 1.0]}
              style={[StyleSheet.absoluteFill]}
            />

            {/* soft decorative shapes */}
            <View style={[styles.decorTop, { opacity: i % 2 === 0 ? 0.12 : 0.08 }]} />
            <View style={[styles.decorBottom, { opacity: i % 2 === 0 ? 0.08 : 0.06 }]} />

            <View style={styles.contentWrap}>
              {/* Title */}
              <Text
                style={[
                  styles.title,
                  { color: s.accent === "white" ? "#fff" : s.accent },
                ]}
              >
                {s.title}
              </Text>

              {/* Subtitle / Features / Steps */}
              {s.subtitle ? (
                <Text
                  style={[
                    styles.subtitle,
                    { color: s.accent === "white" ? "rgba(255,255,255,0.92)" : "#374151" },
                  ]}
                >
                  {s.subtitle}
                </Text>
              ) : null}

              {s.features ? (
                <View style={styles.listWrap}>
                  {s.features.map((f, idx) => (
                    <View key={idx} style={styles.featureCard}>
                      <Text style={styles.featureText}>{f}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {s.steps ? (
                <View style={styles.listWrap}>
                  {s.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepCard}>
                      <Text style={styles.stepIndex}>{idx + 1}</Text>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Final slide CTA */}
              {s.isFinal && (
                <TouchableOpacity
                  style={styles.finalCTA}
                  onPress={completeIntro}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={["#34D399", "#10B981"]}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={styles.ctaGradient}
                  >
                    <Text style={styles.ctaText}>Get Started</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Adaptive indicators */}
      <View style={styles.indicatorContainer}>
        {slides.map((_, i) => {
          const active = i === currentSlide;
          const activeColor = currentSlideIsLight ? "#111827" : "#FFFFFF";
          const inactiveColor = currentSlideIsLight ? "#9CA3AF" : "rgba(255,255,255,0.5)";
          const borderColor = currentSlideIsLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.12)";

          return (
            <View
              key={i}
              style={[
                styles.indicator,
                {
                  backgroundColor: active ? activeColor : inactiveColor,
                  transform: [{ scale: active ? 1.3 : 1 }],
                  borderColor,
                  borderWidth: 0.6,
                },
                active ? styles.indicatorActiveShadow : undefined,
              ]}
            />
          );
        })}
      </View>
    </SafeAreaView>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },

  slide: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  // decorative soft shapes for depth
  decorTop: {
    position: "absolute",
    top: -height * 0.08,
    left: -width * 0.15,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: "#FFFFFF",
  },

  decorBottom: {
    position: "absolute",
    bottom: -height * 0.08,
    right: -width * 0.12,
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
    backgroundColor: "#FFFFFF",
  },

  contentWrap: {
    width: Math.min(width * 0.9, 760),
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 14,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 26,
    maxWidth: 720,
    paddingHorizontal: 8,
  },

  // features/cards
  listWrap: {
    width: "100%",
    marginTop: 6,
  },

  featureCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.92)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 6,
  },

  featureText: {
    fontSize: 16,
    color: "#0F172A",
    textAlign: "left",
  },

  // steps style
  stepCard: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },

  stepIndex: {
    width: 34,
    height: 34,
    borderRadius: 18,
    backgroundColor: "#10B981",
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 34,
    marginRight: 12,
  },

  stepText: {
    flex: 1,
    color: "#0F172A",
    fontSize: 15,
  },

  // final CTA
  finalCTA: {
    marginTop: 26,
    borderRadius: 999,
    overflow: "hidden",
  },

  ctaGradient: {
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  skipButton: {
    position: "absolute",
    top: 48,
    right: 20,
    zIndex: 50,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  skipText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  indicatorContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  indicator: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginHorizontal: 6,
  },

  indicatorActiveShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
  },
});