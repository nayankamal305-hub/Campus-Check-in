import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Feather.glyphMap;
  subtitle?: string;
  gradient?: boolean;
}

export function StatsCard({ title, value, icon, subtitle, gradient = false }: StatsCardProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;

  if (gradient) {
    return (
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.iconContainer}>
          <Feather name={icon} size={20} color="#fff" />
        </View>
        <ThemedText style={styles.gradientValue}>{value}</ThemedText>
        <ThemedText style={styles.gradientTitle}>{title}</ThemedText>
        {subtitle ? (
          <ThemedText style={styles.gradientSubtitle}>{subtitle}</ThemedText>
        ) : null}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + "20" }]}>
        <Feather name={icon} size={18} color={colors.primary} />
      </View>
      <ThemedText type="h3" style={styles.value}>{value}</ThemedText>
      <ThemedText style={[styles.title, { color: colors.textMuted }]}>{title}</ThemedText>
      {subtitle ? (
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 140,
    alignItems: "center",
  },
  gradientCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 140,
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  value: {
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  gradientValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  gradientTitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  gradientSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginTop: Spacing.xs,
  },
});
