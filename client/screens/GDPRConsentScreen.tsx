import React from "react";
import { StyleSheet, View, ScrollView, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";

export default function GDPRConsentScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const { acceptGDPR } = useAuth();

  const handleAccept = async () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await acceptGDPR();
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL("https://example.com/privacy");
  };

  const features = [
    {
      icon: "map-pin" as const,
      title: "Location Tracking",
      description: "We use your location to automatically mark attendance when you're within 50 meters of your classroom.",
    },
    {
      icon: "shield" as const,
      title: "Data Security",
      description: "Your location data is encrypted and stored securely. We never share your data with third parties.",
    },
    {
      icon: "clock" as const,
      title: "Background Updates",
      description: "Location is checked every 30 seconds in the background during class hours only.",
    },
    {
      icon: "trash-2" as const,
      title: "Data Control",
      description: "You can delete your data at any time from the settings. Location history is retained for 30 days.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Feather name="shield" size={40} color="#fff" />
        </LinearGradient>

        <ThemedText type="h2" style={styles.title}>
          Your Privacy Matters
        </ThemedText>

        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          Before you start using CampusCheck, please review how we handle your location data.
        </ThemedText>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View
              key={index}
              style={[styles.featureCard, { backgroundColor: theme.backgroundDefault }]}
            >
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + "20" }]}>
                <Feather name={feature.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.featureContent}>
                <ThemedText type="h4" style={styles.featureTitle}>
                  {feature.title}
                </ThemedText>
                <ThemedText style={[styles.featureDescription, { color: colors.textSecondary }]}>
                  {feature.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <ThemedText style={[styles.legalText, { color: colors.textMuted }]}>
          By continuing, you agree to our Terms of Service and acknowledge that you have read our{" "}
          <ThemedText
            onPress={handlePrivacyPolicy}
            style={[styles.link, { color: colors.primary }]}
          >
            Privacy Policy
          </ThemedText>
          .
        </ThemedText>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            backgroundColor: theme.backgroundRoot,
            paddingBottom: insets.bottom + Spacing.lg,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Button onPress={handleAccept} style={styles.acceptButton}>
          I Understand and Accept
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
  },
  features: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  featureCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: 14,
  },
  legalText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  link: {
    textDecorationLine: "underline",
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  acceptButton: {},
});
