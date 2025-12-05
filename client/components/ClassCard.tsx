import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Shadows } from "@/constants/theme";
import type { ClassWithDistance } from "@/types";

interface ClassCardProps {
  classData: ClassWithDistance;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function ClassCard({ classData, onPress }: ClassCardProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const getNextSessionText = () => {
    if (!classData.nextSession) return "No upcoming sessions";
    const day = DAYS[classData.nextSession.dayOfWeek];
    return `${day} ${classData.nextSession.startTime} - ${classData.nextSession.endTime}`;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.backgroundDefault,
          ...Shadows.card,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText type="h4" style={styles.name}>
            {classData.name}
          </ThemedText>
          <View style={styles.scheduleRow}>
            <Feather name="clock" size={12} color={colors.textMuted} />
            <ThemedText style={[styles.schedule, { color: colors.textMuted }]}>
              {getNextSessionText()}
            </ThemedText>
          </View>
        </View>
        {classData.attendanceToday ? (
          <StatusBadge status={classData.attendanceToday} size="small" />
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.distanceContainer}>
          <Feather
            name="map-pin"
            size={14}
            color={classData.isInRange ? colors.success : colors.textMuted}
          />
          <ThemedText
            style={[
              styles.distance,
              { color: classData.isInRange ? colors.success : colors.textSecondary },
            ]}
          >
            {formatDistance(classData.distance)}
          </ThemedText>
          {classData.isInRange ? (
            <View style={[styles.inRangeBadge, { backgroundColor: colors.success + "20" }]}>
              <ThemedText style={[styles.inRangeText, { color: colors.success }]}>
                In Range
              </ThemedText>
            </View>
          ) : null}
        </View>
        <View style={styles.instructorContainer}>
          <Feather name="user" size={12} color={colors.textMuted} />
          <ThemedText style={[styles.instructor, { color: colors.textMuted }]}>
            {classData.instructorName}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  schedule: {
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  distance: {
    fontSize: 14,
    fontWeight: "500",
  },
  inRangeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  inRangeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  instructor: {
    fontSize: 12,
  },
});
