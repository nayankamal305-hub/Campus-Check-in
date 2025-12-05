import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { AttendanceRecord } from "@/types";

interface AttendanceItemProps {
  record: AttendanceRecord;
  onPress?: () => void;
}

export function AttendanceItem({ record, onPress }: AttendanceItemProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const formatTime = (timestamp: string) => {
    const time = timestamp.split("T")[1];
    if (!time) return "-";
    return time.substring(0, 5);
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.left}>
        <ThemedText type="body" style={styles.className}>
          {record.className}
        </ThemedText>
        <View style={styles.timeRow}>
          <Feather name="clock" size={12} color={colors.textMuted} />
          <ThemedText style={[styles.time, { color: colors.textMuted }]}>
            {formatTime(record.timestamp)}
          </ThemedText>
          {record.distance ? (
            <>
              <Feather name="map-pin" size={12} color={colors.textMuted} style={styles.distanceIcon} />
              <ThemedText style={[styles.time, { color: colors.textMuted }]}>
                {record.distance.toFixed(0)}m
              </ThemedText>
            </>
          ) : null}
        </View>
      </View>
      <StatusBadge status={record.status} size="small" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  left: {
    flex: 1,
  },
  className: {
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  time: {
    fontSize: 12,
  },
  distanceIcon: {
    marginLeft: Spacing.sm,
  },
});
