import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { AttendanceStatus } from "@/types";

interface StatusBadgeProps {
  status: AttendanceStatus;
  size?: "small" | "medium" | "large";
  showIcon?: boolean;
}

export function StatusBadge({ status, size = "medium", showIcon = true }: StatusBadgeProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const getStatusConfig = () => {
    switch (status) {
      case "present":
        return {
          color: colors.success,
          backgroundColor: colors.success + "20",
          icon: "check-circle" as const,
          label: "Present",
        };
      case "absent":
        return {
          color: colors.error,
          backgroundColor: colors.error + "20",
          icon: "x-circle" as const,
          label: "Absent",
        };
      case "pending":
        return {
          color: colors.warning,
          backgroundColor: colors.warning + "20",
          icon: "clock" as const,
          label: "Pending",
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === "small" ? 12 : size === "medium" ? 14 : 16;
  const fontSize = size === "small" ? 10 : size === "medium" ? 12 : 14;

  return (
    <View style={[styles.container, { backgroundColor: config.backgroundColor }, styles[size]]}>
      {showIcon ? <Feather name={config.icon} size={iconSize} color={config.color} /> : null}
      <ThemedText style={[styles.label, { color: config.color, fontSize }]}>
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  small: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  large: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  label: {
    fontWeight: "600",
  },
});
