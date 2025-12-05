import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { Gradients } from "@/constants/theme";

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "primary" | "subtle";
}

export function GradientBackground({ children, style, variant = "primary" }: GradientBackgroundProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Gradients.primaryDark : Gradients.primary;

  if (variant === "subtle") {
    return (
      <View style={[styles.container, style]}>
        <LinearGradient
          colors={[colors[0] + "20", colors[1] + "10"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
