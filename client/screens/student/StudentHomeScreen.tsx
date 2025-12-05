import React, { useMemo, useCallback } from "react";
import { StyleSheet, View, ScrollView, RefreshControl, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { ClassCard } from "@/components/ClassCard";
import { StatsCard } from "@/components/StatsCard";
import { LocationIndicator } from "@/components/LocationIndicator";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { getClasses, getTodayAttendance, getStudentStats } from "@/services/data";
import { calculateDistance, getNextSession, isClassInSession } from "@/services/location";
import type { ClassWithDistance } from "@/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface StudentHomeScreenProps {
  navigation: NativeStackNavigationProp<any>;
}

export default function StudentHomeScreen({ navigation }: StudentHomeScreenProps) {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();
  const { location, isLoading: locationLoading, permissionStatus, requestPermission, refreshLocation } = useLocation({
    watchPosition: true,
    interval: 30000,
  });

  const [refreshing, setRefreshing] = React.useState(false);

  const classes = useMemo(() => getClasses(), []);
  const todayAttendance = useMemo(() => getTodayAttendance(user?.id || ""), [user?.id]);
  const stats = useMemo(() => getStudentStats(user?.id || ""), [user?.id]);

  const classesWithDistance: ClassWithDistance[] = useMemo(() => {
    if (!location) {
      return classes.map((c) => ({
        ...c,
        distance: 0,
        isInRange: false,
        nextSession: getNextSession(c.schedule),
        attendanceToday: todayAttendance.get(c.id)?.status,
      }));
    }

    return classes.map((c) => {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        c.latitude,
        c.longitude
      );
      return {
        ...c,
        distance,
        isInRange: distance <= c.radius,
        nextSession: getNextSession(c.schedule),
        attendanceToday: todayAttendance.get(c.id)?.status,
      };
    }).sort((a, b) => a.distance - b.distance);
  }, [classes, location, todayAttendance]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await refreshLocation();
    setRefreshing(false);
  }, [refreshLocation]);

  const handleClassPress = (classData: ClassWithDistance) => {
    navigation.navigate("ClassDetails", { classId: classData.id });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

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
      <View style={styles.greeting}>
        <View>
          <ThemedText type="h2">{getGreeting()}</ThemedText>
          <ThemedText style={[styles.name, { color: colors.textSecondary }]}>
            {user?.name || "Student"}
          </ThemedText>
        </View>
        <ThemedText style={[styles.date, { color: colors.textMuted }]}>
          {formatDate()}
        </ThemedText>
      </View>

      <LocationIndicator
        isActive={permissionStatus === "granted" && !!location}
        accuracy={location?.accuracy}
        onPress={permissionStatus !== "granted" ? requestPermission : undefined}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
        style={styles.statsScroll}
      >
        <StatsCard
          title="Attendance"
          value={`${stats.attendancePercentage}%`}
          icon="check-circle"
          gradient
        />
        <StatsCard
          title="Classes Attended"
          value={stats.classesAttended}
          icon="calendar"
          subtitle={`of ${stats.totalClasses} total`}
        />
        <StatsCard
          title="Streak"
          value={`${stats.streak} days`}
          icon="zap"
          subtitle="Keep it up!"
        />
      </ScrollView>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Today's Classes</ThemedText>
          <ThemedText style={[styles.classCount, { color: colors.textMuted }]}>
            {classesWithDistance.length} classes
          </ThemedText>
        </View>

        {locationLoading ? (
          <>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={2} />
          </>
        ) : classesWithDistance.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No Classes Today"
            description="Enjoy your day off! Check back tomorrow for your scheduled classes."
          />
        ) : (
          classesWithDistance.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onPress={() => handleClassPress(classData)}
            />
          ))
        )}
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
  greeting: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  name: {
    marginTop: Spacing.xs,
  },
  date: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statsScroll: {
    marginHorizontal: -Spacing.lg,
    marginTop: Spacing.lg,
  },
  statsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  classCount: {
    fontSize: 14,
  },
});
