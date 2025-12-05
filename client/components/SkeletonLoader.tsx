import React, { useEffect } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius } from "@/constants/theme";

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonLoader({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}: SkeletonLoaderProps) {
  const { theme } = useTheme();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSecondary,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ lines = 3, style }: SkeletonCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="40%" height={12} style={styles.spacer} />
        </View>
      </View>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          width={i === lines - 1 ? "70%" : "100%"}
          height={14}
          style={styles.line}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {},
  card: {
    padding: 16,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  spacer: {
    marginTop: 6,
  },
  line: {
    marginTop: 8,
  },
});
