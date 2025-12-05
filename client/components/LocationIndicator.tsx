import React from "react";
import { StyleSheet, View, Pressable, Platform, Linking } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface LocationIndicatorProps {
  isActive: boolean;
  accuracy?: number;
  onPress?: () => void;
}

export function LocationIndicator({ isActive, accuracy, onPress }: LocationIndicatorProps) {
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withTiming(1.2, { duration: 1000 }),
        -1,
        true
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isActive, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handlePress = async () => {
    if (onPress) {
      onPress();
    } else if (!isActive && Platform.OS !== "web") {
      try {
        await Linking.openSettings();
      } catch {}
    }
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: isActive ? colors.success + "20" : colors.error + "20" }]}>
        <Animated.View style={[styles.dot, { backgroundColor: isActive ? colors.success : colors.error }, pulseStyle]} />
        <ThemedText style={[styles.text, { color: isActive ? colors.success : colors.error }]}>
          {isActive ? "Location Active" : "Location Disabled"}
        </ThemedText>
        {accuracy && isActive ? (
          <ThemedText style={[styles.accuracy, { color: colors.textMuted }]}>
            {accuracy.toFixed(0)}m
          </ThemedText>
        ) : null}
        {!isActive ? (
          <Feather name="settings" size={14} color={colors.error} style={styles.icon} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
  accuracy: {
    fontSize: 11,
  },
  icon: {
    marginLeft: Spacing.xs,
  },
});
