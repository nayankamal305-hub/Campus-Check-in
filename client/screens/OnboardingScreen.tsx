import React, { useState, useRef } from "react";
import { StyleSheet, View, Dimensions, FlatList, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  useSharedValue,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, Gradients } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    icon: "map-pin",
    title: "Automatic Attendance",
    description: "When you're within 50 meters of your classroom during class time, your attendance is marked automatically.",
  },
  {
    icon: "zap",
    title: "Background Tracking",
    description: "CampusCheck works in the background, so you don't need to open the app. Just be there on time!",
  },
  {
    icon: "bell",
    title: "Stay Notified",
    description: "Get instant notifications when your attendance is marked, and reminders for upcoming classes.",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const { completeOnboarding } = useAuth();

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useSharedValue(0);

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <Feather name={item.icon} size={60} color="#fff" />
      </LinearGradient>
      <ThemedText type="h2" style={styles.slideTitle}>
        {item.title}
      </ThemedText>
      <ThemedText style={[styles.slideDescription, { color: colors.textSecondary }]}>
        {item.description}
      </ThemedText>
    </View>
  );

  const Dot = ({ index }: { index: number }) => {
    const isActive = index === currentIndex;
    return (
      <View
        style={[
          styles.dot,
          {
            backgroundColor: isActive ? colors.primary : colors.border,
            width: isActive ? 24 : 8,
          },
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <ThemedText style={{ color: colors.textMuted }}>Skip</ThemedText>
        </Pressable>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={(e) => {
          scrollX.value = e.nativeEvent.contentOffset.x;
        }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(_, index) => index.toString()}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <Dot key={index} index={index} />
          ))}
        </View>

        <Button onPress={handleNext} style={styles.nextButton}>
          {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.xl,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  slide: {
    width,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["3xl"],
  },
  slideTitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  slideDescription: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {},
});
