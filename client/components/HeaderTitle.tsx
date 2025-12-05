import React from "react";
import { View, StyleSheet, Image } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";

interface HeaderTitleProps {
  title?: string;
}

export function HeaderTitle({ title = "CampusCheck" }: HeaderTitleProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={[styles.title, { color: colors.primary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    width: 28,
    height: 28,
    marginRight: Spacing.sm,
    borderRadius: 6,
  },
  title: {
    fontWeight: "700",
  },
});
