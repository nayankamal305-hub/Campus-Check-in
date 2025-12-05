import React, { useState } from "react";
import { StyleSheet, View, ScrollView, Pressable, Switch, Alert, Platform } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";
import { getStudentStats } from "@/services/data";

export default function StudentProfileScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const colorScheme = useColorScheme();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);

  const stats = getStudentStats(user?.id || "");

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            await logout();
          },
        },
      ]
    );
  };

  const SettingRow = ({
    icon,
    label,
    value,
    onPress,
    showSwitch,
    switchValue,
    onSwitchChange,
    destructive,
  }: {
    icon: keyof typeof Feather.glyphMap;
    label: string;
    value?: string;
    onPress?: () => void;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    destructive?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        { backgroundColor: theme.backgroundDefault, opacity: pressed && onPress ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? colors.error + "20" : colors.primary + "20" }]}>
        <Feather name={icon} size={18} color={destructive ? colors.error : colors.primary} />
      </View>
      <ThemedText style={[styles.settingLabel, destructive && { color: colors.error }]}>
        {label}
      </ThemedText>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
      ) : value ? (
        <ThemedText style={[styles.settingValue, { color: colors.textMuted }]}>
          {value}
        </ThemedText>
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHeader}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <ThemedText style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "S"}
          </ThemedText>
        </LinearGradient>
        <ThemedText type="h2" style={styles.userName}>
          {user?.name || "Student"}
        </ThemedText>
        <ThemedText style={[styles.userEmail, { color: colors.textSecondary }]}>
          {user?.email || "student@example.com"}
        </ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="book-open" size={12} color={colors.primary} />
          <ThemedText style={[styles.roleText, { color: colors.primary }]}>
            Student
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: colors.success }}>
            {stats.attendancePercentage}%
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>
            Attendance
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2">
            {stats.classesAttended}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>
            Classes
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2" style={{ color: colors.warning }}>
            {stats.streak}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>
            Day Streak
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: colors.textMuted }]}>
          PREFERENCES
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="moon"
            label="Dark Mode"
            value={isDark ? "On" : "Off"}
          />
          <SettingRow
            icon="bell"
            label="Notifications"
            showSwitch
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <SettingRow
            icon="map-pin"
            label="Location Tracking"
            showSwitch
            switchValue={locationEnabled}
            onSwitchChange={setLocationEnabled}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: colors.textMuted }]}>
          SUPPORT
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="help-circle"
            label="Help Center"
            onPress={() => {}}
          />
          <SettingRow
            icon="shield"
            label="Privacy Policy"
            onPress={() => {}}
          />
          <SettingRow
            icon="file-text"
            label="Terms of Service"
            onPress={() => {}}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: colors.textMuted }]}>
          ACCOUNT
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="log-out"
            label="Sign Out"
            onPress={handleLogout}
            destructive
          />
        </View>
      </View>

      <ThemedText style={[styles.version, { color: colors.textMuted }]}>
        CampusCheck v1.0.0
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userEmail: {
    marginBottom: Spacing.md,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 1,
  },
  settingsGroup: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    gap: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    marginTop: Spacing.lg,
  },
});
