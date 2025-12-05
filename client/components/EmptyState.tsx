import React from "react";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + "15" }]}>
        <Feather name={icon} size={48} color={colors.primary} />
      </View>
      <ThemedText type="h3" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.description, { color: colors.textMuted }]}>
        {description}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  description: {
    textAlign: "center",
    maxWidth: 280,
  },
  button: {
    marginTop: Spacing.xl,
    minWidth: 160,
  },
});
