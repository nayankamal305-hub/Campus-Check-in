import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, FlatList, RefreshControl, Pressable, Platform, Share } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients, Shadows } from "@/constants/theme";
import { getClasses, getLiveAttendance, generateCSVReport } from "@/services/data";
import type { ClassRoom, AttendanceStatus } from "@/types";

export default function FacultyLiveAttendanceScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const classes = useMemo(() => getClasses(), []);
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const liveStudents = useMemo(
    () => getLiveAttendance(selectedClass?.id || ""),
    [selectedClass?.id]
  );

  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withTiming(1.2, { duration: 1000 }),
      -1,
      true
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleExport = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    const csvData = `Student,Status,Time,Distance\n${liveStudents
      .map((s) => `${s.studentName},${s.status},${s.time},${s.distance}m`)
      .join("\n")}`;

    try {
      await Share.share({
        message: csvData,
        title: `${selectedClass?.name} Attendance`,
      });
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  const presentCount = liveStudents.filter((s) => s.status === "present").length;
  const absentCount = liveStudents.filter((s) => s.status === "absent").length;
  const pendingCount = liveStudents.filter((s) => s.status === "pending").length;

  const renderStudent = ({
    item,
  }: {
    item: { studentId: string; studentName: string; status: string; time: string; distance: number };
  }) => (
    <View style={[styles.studentRow, { backgroundColor: theme.backgroundDefault }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.studentAvatar}
      >
        <ThemedText style={styles.avatarText}>
          {item.studentName.charAt(0)}
        </ThemedText>
      </LinearGradient>
      <View style={styles.studentInfo}>
        <ThemedText style={styles.studentName}>{item.studentName}</ThemedText>
        <View style={styles.studentMeta}>
          {item.time !== "-" ? (
            <>
              <Feather name="clock" size={10} color={colors.textMuted} />
              <ThemedText style={[styles.metaText, { color: colors.textMuted }]}>
                {item.time}
              </ThemedText>
            </>
          ) : null}
          {item.distance > 0 ? (
            <>
              <Feather name="map-pin" size={10} color={colors.textMuted} style={styles.metaIcon} />
              <ThemedText style={[styles.metaText, { color: colors.textMuted }]}>
                {item.distance}m
              </ThemedText>
            </>
          ) : null}
        </View>
      </View>
      <StatusBadge status={item.status as AttendanceStatus} size="small" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}>
        <View style={styles.classSelector}>
          {classes.map((classItem) => (
            <Pressable
              key={classItem.id}
              onPress={() => setSelectedClassId(classItem.id)}
              style={[
                styles.classTab,
                {
                  backgroundColor:
                    (selectedClassId || classes[0]?.id) === classItem.id
                      ? colors.primary
                      : theme.backgroundDefault,
                  borderColor:
                    (selectedClassId || classes[0]?.id) === classItem.id
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.classTabText,
                  {
                    color:
                      (selectedClassId || classes[0]?.id) === classItem.id
                        ? "#fff"
                        : colors.textSecondary,
                  },
                ]}
              >
                {classItem.name}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.liveIndicator}>
            <Animated.View style={[styles.liveDot, { backgroundColor: colors.success }, pulseStyle]} />
            <ThemedText style={[styles.liveText, { color: colors.success }]}>
              LIVE
            </ThemedText>
          </View>
          <View style={styles.statsPills}>
            <View style={[styles.statPill, { backgroundColor: colors.success + "20" }]}>
              <ThemedText style={[styles.statPillText, { color: colors.success }]}>
                {presentCount} Present
              </ThemedText>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.error + "20" }]}>
              <ThemedText style={[styles.statPillText, { color: colors.error }]}>
                {absentCount} Absent
              </ThemedText>
            </View>
            <View style={[styles.statPill, { backgroundColor: colors.warning + "20" }]}>
              <ThemedText style={[styles.statPillText, { color: colors.warning }]}>
                {pendingCount} Pending
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} lines={1} />
          ))}
        </View>
      ) : (
        <FlatList
          data={liveStudents}
          keyExtractor={(item) => item.studentId}
          renderItem={renderStudent}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xl + 70 },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        onPress={handleExport}
        style={({ pressed }) => [
          styles.fab,
          {
            bottom: tabBarHeight + Spacing.xl,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.95 : 1 }],
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Feather name="download" size={22} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  classSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  classTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  classTabText: {
    fontSize: 13,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  statsPills: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  studentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  studentName: {
    fontWeight: "500",
  },
  studentMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  metaIcon: {
    marginLeft: Spacing.sm,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.lg,
  },
  fab: {
    position: "absolute",
    right: Spacing.xl,
    ...Shadows.fab,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
