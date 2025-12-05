import React, { useMemo, useCallback, useState } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Dimensions, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatsCard } from "@/components/StatsCard";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getClasses, getDashboardStats, getWeeklyTrend, getClassBreakdown } from "@/services/data";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");

interface FacultyDashboardScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function FacultyDashboardScreen({ navigation }: FacultyDashboardScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const stats = useMemo(() => getDashboardStats(), []);
  const weeklyTrend = useMemo(() => getWeeklyTrend(), []);
  const classBreakdown = useMemo(() => getClassBreakdown(), []);
  const classes = useMemo(() => getClasses(), []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const maxTrend = Math.max(...weeklyTrend.map((t) => t.attendance));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="h2">{getGreeting()}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {user?.name || "Professor"}
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
        style={styles.statsScroll}
      >
        <StatsCard
          title="Total Classes"
          value={stats.totalClasses}
          icon="grid"
          gradient
        />
        <StatsCard
          title="Avg Attendance"
          value={`${stats.averageAttendance}%`}
          icon="trending-up"
        />
        <StatsCard
          title="Active Students"
          value={stats.activeStudents}
          icon="users"
        />
        <StatsCard
          title="Present Today"
          value={stats.presentToday}
          icon="check-circle"
          subtitle={`of ${stats.activeStudents}`}
        />
      </ScrollView>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Live Classes
        </ThemedText>
        {isLoading ? (
          <SkeletonCard lines={2} />
        ) : (
          classes.slice(0, 2).map((classItem, index) => (
            <Card
              key={classItem.id}
              style={[styles.liveClassCard, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => navigation.navigate("LiveAttendanceTab")}
            >
              <View style={styles.liveClassHeader}>
                <View style={styles.liveIndicator}>
                  <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
                  <ThemedText style={[styles.liveText, { color: colors.success }]}>
                    LIVE
                  </ThemedText>
                </View>
                <ThemedText style={[styles.studentCount, { color: colors.textSecondary }]}>
                  {Math.floor(Math.random() * 20 + 20)} students
                </ThemedText>
              </View>
              <ThemedText type="h4">{classItem.name}</ThemedText>
              <View style={styles.classInfo}>
                <Feather name="clock" size={12} color={colors.textMuted} />
                <ThemedText style={[styles.classTime, { color: colors.textMuted }]}>
                  {classItem.schedule[0]?.startTime} - {classItem.schedule[0]?.endTime}
                </ThemedText>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Weekly Trend
        </ThemedText>
        <View style={[styles.chartCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.chart}>
            {weeklyTrend.map((item, index) => (
              <View key={index} style={styles.barContainer}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${(item.attendance / maxTrend) * 100}%`,
                        backgroundColor: colors.primary,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.barLabel, { color: colors.textMuted }]}>
                  {item.day}
                </ThemedText>
                <ThemedText style={[styles.barValue, { color: colors.textSecondary }]}>
                  {item.attendance}%
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Class Performance
        </ThemedText>
        <View style={[styles.breakdownCard, { backgroundColor: theme.backgroundDefault }]}>
          {classBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                <ThemedText>{item.name}</ThemedText>
              </View>
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownProgress,
                    { width: `${item.attendance}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
              <ThemedText style={[styles.breakdownValue, { color: colors.textSecondary }]}>
                {item.attendance}%
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  subtitle: {
    marginTop: Spacing.xs,
  },
  statsScroll: {
    marginHorizontal: -Spacing.lg,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  liveClassCard: {
    marginBottom: Spacing.md,
  },
  liveClassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  studentCount: {
    fontSize: 12,
  },
  classInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  classTime: {
    fontSize: 12,
  },
  chartCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 150,
    alignItems: "flex-end",
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    height: 100,
    width: 24,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: Spacing.sm,
  },
  barValue: {
    fontSize: 10,
    marginTop: 2,
  },
  breakdownCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  breakdownInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    width: 100,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  breakdownBar: {
    flex: 1,
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    marginHorizontal: Spacing.md,
    overflow: "hidden",
  },
  breakdownProgress: {
    height: "100%",
    borderRadius: 4,
  },
  breakdownValue: {
    width: 40,
    textAlign: "right",
    fontSize: 13,
  },
});
