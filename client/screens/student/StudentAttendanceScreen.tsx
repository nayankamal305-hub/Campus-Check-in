import React, { useMemo, useState, useCallback } from "react";
import { StyleSheet, View, SectionList, RefreshControl, Platform, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { AttendanceItem } from "@/components/AttendanceItem";
import { SkeletonCard } from "@/components/SkeletonLoader";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getAttendanceRecords } from "@/services/data";
import type { AttendanceRecord, AttendanceStatus } from "@/types";

type FilterType = "all" | "present" | "absent";

export default function StudentAttendanceScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [isLoading, setIsLoading] = useState(false);

  const allRecords = useMemo(() => 
    getAttendanceRecords(user?.id || "", user?.name || "Student"),
    [user?.id, user?.name]
  );

  const filteredRecords = useMemo(() => {
    if (filter === "all") return allRecords;
    return allRecords.filter((r) => r.status === filter);
  }, [allRecords, filter]);

  const sections = useMemo(() => {
    const grouped = filteredRecords.reduce((acc, record) => {
      const date = record.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(record);
      return acc;
    }, {} as Record<string, AttendanceRecord[]>);

    return Object.entries(grouped)
      .map(([date, data]) => ({
        title: formatSectionDate(date),
        data,
      }))
      .sort((a, b) => new Date(b.data[0].date).getTime() - new Date(a.data[0].date).getTime());
  }, [filteredRecords]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const stats = useMemo(() => {
    const total = allRecords.length;
    const present = allRecords.filter((r) => r.status === "present").length;
    const absent = allRecords.filter((r) => r.status === "absent").length;
    return { total, present, absent };
  }, [allRecords]);

  function formatSectionDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split("T")[0]) {
      return "Today";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Yesterday";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  const FilterButton = ({ type, label }: { type: FilterType; label: string }) => {
    const isActive = filter === type;
    return (
      <Pressable
        onPress={() => setFilter(type)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive ? colors.primary : theme.backgroundDefault,
            borderColor: isActive ? colors.primary : colors.border,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.filterText,
            { color: isActive ? "#fff" : colors.textSecondary },
          ]}
        >
          {label}
        </ThemedText>
      </Pressable>
    );
  };

  const renderSectionHeader = ({ section }: { section: { title: string } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.backgroundRoot }]}>
      <ThemedText type="small" style={{ color: colors.textMuted }}>
        {section.title}
      </ThemedText>
    </View>
  );

  const renderItem = ({ item }: { item: AttendanceRecord }) => (
    <AttendanceItem record={item} />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.statsBar, { paddingTop: headerHeight + Spacing.lg }]}>
        <View style={styles.statItem}>
          <ThemedText type="h3">{stats.total}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>Total</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="h3" style={{ color: colors.success }}>{stats.present}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>Present</ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <ThemedText type="h3" style={{ color: colors.error }}>{stats.absent}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>Absent</ThemedText>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FilterButton type="all" label="All" />
        <FilterButton type="present" label="Present" />
        <FilterButton type="absent" label="Absent" />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} lines={1} />
          ))}
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="No Attendance Records"
          description="Your attendance history will appear here once you start attending classes."
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: tabBarHeight + Spacing.xl },
          ]}
          stickySectionHeadersEnabled
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
  },
  loadingContainer: {
    paddingHorizontal: Spacing.lg,
  },
});
