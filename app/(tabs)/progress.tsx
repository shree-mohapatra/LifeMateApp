import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from '../../lib/supabaseClient';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface WeightPoint {
  date: string;
  weight: number;
}

interface StreakData {
  count: number;
  lastDate: string | null;
  longest: number;
}

interface WeeklyData {
  weekStart: string | null;
  days: Record<string, boolean>;
}

interface WeightRecord {
  weight_kg: number;
  recorded_at: string;
}

export default function ProgressScreen() {
  const [weeklyCompletedDates, setWeeklyCompletedDates] = useState<string[]>([]);
  const [streak, setStreak] = useState<StreakData>({ count: 0, lastDate: null, longest: 0 });
  const [weightData, setWeightData] = useState<WeightPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weightHistoryExists, setWeightHistoryExists] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const todayISO = useCallback((): string => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const getYesterdayISO = useCallback((): string => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return y.toISOString().split("T")[0];
  }, []);

  const getWeekDates = useCallback((): string[] => {
    const dates: string[] = [];
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;

    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + mondayOffset + i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, []);

  const getWeekStart = useCallback((): string => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date();
    monday.setDate(today.getDate() + mondayOffset);
    return monday.toISOString().split("T")[0];
  }, []);

  const loadStreak = useCallback(async (uid: string): Promise<void> => {
    const streakKey = `streak-${uid}`;
    const stored = await AsyncStorage.getItem(streakKey);
    
    let streakData: StreakData = stored
      ? JSON.parse(stored)
      : { count: 0, lastDate: null, longest: 0 };

    // Check if streak is broken
    if (
      streakData.lastDate &&
      streakData.lastDate !== todayISO() &&
      streakData.lastDate !== getYesterdayISO()
    ) {
      // Streak broken - reset to 0
      streakData = { count: 0, lastDate: null, longest: streakData.longest };
      await AsyncStorage.setItem(streakKey, JSON.stringify(streakData));
    }

    setStreak(streakData);
  }, [todayISO, getYesterdayISO]);

  const loadWeeklyProgress = useCallback(async (uid: string): Promise<void> => {
    const weeklyKey = `weekly-progress-${uid}`;
    const storedWeeklyRaw = await AsyncStorage.getItem(weeklyKey);
    const currentWeekStart = getWeekStart();
    
    let weeklyData: WeeklyData = storedWeeklyRaw
      ? JSON.parse(storedWeeklyRaw)
      : { weekStart: null, days: {} };

    // If new week started, reset weekly data
    if (weeklyData.weekStart !== currentWeekStart) {
      weeklyData = { weekStart: currentWeekStart, days: {} };
      await AsyncStorage.setItem(weeklyKey, JSON.stringify(weeklyData));
    }

    const weekDates = getWeekDates();
    const completedThisWeek = weekDates.filter(
      (d) => weeklyData.days?.[d]
    );

    setWeeklyCompletedDates(completedThisWeek);
  }, [getWeekStart, getWeekDates]);

const loadWeightHistory = useCallback(async (uid: string): Promise<void> => {
  const { data: weights, error } = await supabase
    .from("weight_history")
    .select("weight_kg, recorded_at")
    .eq("user_id", uid)
    .order("recorded_at", { ascending: false }) // newest first
    .limit(5);

  if (error) {
    console.log("Weight fetch error:", error);
    return;
  }

  if (!weights || weights.length === 0) {
    setWeightHistoryExists(false);
    setWeightData([]);
  } else {
    // Reverse so graph still shows oldest → newest
    const formatted = weights
      .reverse()
      .map((w) => ({
        date: w.recorded_at.split("T")[0],
        weight: parseFloat(w.weight_kg.toString()),
      }));

    setWeightData(formatted);
    setWeightHistoryExists(true);
  }
}, []);

  const loadProgress = useCallback(async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const uid = user.id;
      setUserId(uid);

      // Load all data in parallel for better performance
      await Promise.all([
        loadStreak(uid),
        loadWeeklyProgress(uid),
        loadWeightHistory(uid)
      ]);

    } catch (error) {
      console.error("Error loading progress:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadStreak, loadWeeklyProgress, loadWeightHistory]);

  // Using useCallback to memoize the refresh function
  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    loadProgress();
  }, [loadProgress]);

  // Load progress on initial mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={['#2E7D32', '#4CAF50', '#81C784']}
          style={styles.loaderContainer}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loaderText}>Loading your progress...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const weeklyPercent = Math.round((weeklyCompletedDates.length / 7) * 100);
  const weekDates = getWeekDates();
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

  // Get min and max weight for scaling
  const minWeight = weightData.length > 0 
    ? Math.min(...weightData.map(w => w.weight)) 
    : 0;
  const maxWeight = weightData.length > 0 
    ? Math.max(...weightData.map(w => w.weight)) 
    : 0;
  const weightRange = maxWeight - minWeight || 1;

  // Calculate weight change for display
  const weightChange = weightData.length >= 2
    ? (weightData[weightData.length - 1]?.weight - weightData[0]?.weight).toFixed(1)
    : "0.0";

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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2E7D32']}
              tintColor="#2E7D32"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Progress</Text>
            <Text style={styles.headerSubtitle}>Track your consistency</Text>
          </View>

          {/* Streak Card */}
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            style={styles.streakCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.streakHeader}>
              <View style={styles.streakIconContainer}>
                <Ionicons name="flame" size={32} color="#FFD700" />
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakLabel}>Current Streak</Text>
                <Text style={styles.streakCount}>{streak.count} days</Text>
              </View>
            </View>
            
            <View style={styles.streakFooter}>
              <View style={styles.streakStat}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.streakStatText}>Longest: {streak.longest} days</Text>
              </View>
              <View style={styles.streakStat}>
                <Ionicons name="calendar" size={16} color="#FFFFFF" />
                <Text style={styles.streakStatText}>
                  Last: {streak.lastDate ? new Date(streak.lastDate).toLocaleDateString() : 'Never'}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Weekly Progress Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Weekly Progress</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${weeklyPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {weeklyPercent}% ({weeklyCompletedDates.length}/7 days this week)
              </Text>
            </View>

            <View style={styles.weekGrid}>
              {weekDates.map((date, i) => {
                const isCompleted = weeklyCompletedDates.includes(date);
                const isToday = date === todayISO();
                
                return (
                  <View key={date} style={styles.weekItem}>
                    <View style={[
                      styles.weekBarContainer,
                      isToday && styles.weekBarToday
                    ]}>
                      <LinearGradient
                        colors={isCompleted ? ['#4CAF50', '#2E7D32'] : ['#E5E7EB', '#D1D5DB']}
                        style={styles.weekBar}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                      >
                        {isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </LinearGradient>
                    </View>
                    <Text style={[
                      styles.weekLabel,
                      isToday && styles.todayLabel
                    ]}>
                      {dayLabels[i]}
                    </Text>
                    <Text style={styles.weekDate}>
                      {new Date(date).getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
                <Text style={styles.legendText}>Pending</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
                <Text style={styles.legendText}>Today</Text>
              </View>
            </View>
          </View>

          {/* Weight Progress Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="scale-outline" size={24} color="#2E7D32" />
              <Text style={styles.cardTitle}>Weight Progress</Text>
            </View>

            {!weightHistoryExists ? (
              <View style={styles.emptyState}>
                <Ionicons name="alert-circle-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptyStateTitle}>No Weight Data</Text>
                <Text style={styles.emptyStateText}>
                  Update your weight in Profile to see progress.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.weightChart}>
                  {weightData.map((point, index) => {
                    // Scale height between 40 and 140
                    const scaledHeight = 40 + ((point.weight - minWeight) / weightRange) * 100;
                    
                    return (
                      <View key={`${point.date}-${index}`} style={styles.weightColumn}>
                        <View style={[styles.weightBar, { height: scaledHeight }]}>
                          <LinearGradient
                            colors={['#4CAF50', '#2E7D32']}
                            style={styles.weightBarFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                          />
                        </View>
                        <Text style={styles.weightValue}>{point.weight.toFixed(1)}</Text>
                        <Text style={styles.weightDate}>
                          {new Date(point.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={styles.weightStats}>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>Starting</Text>
                    <Text style={styles.weightStatValue}>{weightData[0]?.weight.toFixed(1)} kg</Text>
                  </View>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>Current</Text>
                    <Text style={styles.weightStatValue}>
                      {weightData[weightData.length - 1]?.weight.toFixed(1)} kg
                    </Text>
                  </View>
                  <View style={styles.weightStat}>
                    <Text style={styles.weightStatLabel}>Change</Text>
                    <Text style={[
                      styles.weightStatValue,
                      { color: Number(weightChange) < 0 ? '#10B981' : '#EF4444' }
                    ]}>
                      {weightChange} kg
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <LinearGradient
              colors={['#E8F5E9', '#C8E6C9']}
              style={styles.tipsGradient}
            >
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={24} color="#2E7D32" />
                <Text style={styles.tipsTitle}>Keep Going!</Text>
              </View>
              <Text style={styles.tipsText}>
                {streak.count > 0 
                  ? `You're on a ${streak.count}-day streak! Complete your habits today to maintain it.`
                  : 'Start your streak today by completing all your habits!'}
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// Styles remain exactly the same as in your original code
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    marginBottom: 20,
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
  streakCard: {
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  streakIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  streakInfo: {
    flex: 1,
  },
  streakLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 4,
  },
  streakCount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 15,
  },
  streakStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakStatText: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  weekGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  weekItem: {
    alignItems: 'center',
    width: (width - 60) / 7,
  },
  weekBarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekBarToday: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  weekBar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  weekDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  todayLabel: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  weightChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
    height: 200,
  },
  weightColumn: {
    alignItems: 'center',
    width: 50,
  },
  weightBar: {
    width: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 8,
  },
  weightBarFill: {
    width: '100%',
    height: '100%',
  },
  weightValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  weightDate: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  weightStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 15,
    borderRadius: 12,
  },
  weightStat: {
    alignItems: 'center',
  },
  weightStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  weightStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  tipsCard: {
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
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  tipsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});