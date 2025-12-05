import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, ScrollView, Pressable, Share, Platform, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";
import { getClasses, getAttendanceRecords, generateCSVReport, getWeeklyTrend } from "@/services/data";
import type { AttendanceRecord } from "@/types";

type DateRange = "today" | "week" | "month" | "all";

export default function FacultyReportsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState<DateRange>("week");
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const classes = useMemo(() => getClasses(), []);
  const allRecords = useMemo(
    () => getAttendanceRecords(user?.id || "", user?.name || "Faculty"),
    [user?.id, user?.name]
  );

  const filteredRecords = useMemo(() => {
    let records = allRecords;

    if (selectedClasses.length > 0) {
      records = records.filter((r) => selectedClasses.includes(r.classId));
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (dateRange) {
      case "today":
        records = records.filter((r) => new Date(r.date) >= today);
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        records = records.filter((r) => new Date(r.date) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        records = records.filter((r) => new Date(r.date) >= monthAgo);
        break;
    }

    return records;
  }, [allRecords, selectedClasses, dateRange]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const present = filteredRecords.filter((r) => r.status === "present").length;
    const absent = filteredRecords.filter((r) => r.status === "absent").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, rate };
  }, [filteredRecords]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const csvContent = generateCSVReport(filteredRecords);

      await Share.share({
        message: csvContent,
        title: "Attendance Report",
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to generate report");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleClassFilter = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const DateRangeButton = ({ range, label }: { range: DateRange; label: string }) => (
    <Pressable
      onPress={() => setDateRange(range)}
      style={[
        styles.rangeButton,
        {
          backgroundColor: dateRange === range ? colors.primary : theme.backgroundDefault,
          borderColor: dateRange === range ? colors.primary : colors.border,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.rangeButtonText,
          { color: dateRange === range ? "#fff" : colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
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
      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Date Range
        </ThemedText>
        <View style={styles.rangeButtons}>
          <DateRangeButton range="today" label="Today" />
          <DateRangeButton range="week" label="This Week" />
          <DateRangeButton range="month" label="This Month" />
          <DateRangeButton range="all" label="All Time" />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Filter by Class
        </ThemedText>
        <View style={styles.classFilters}>
          {classes.map((classItem) => {
            const isSelected = selectedClasses.includes(classItem.id);
            return (
              <Pressable
                key={classItem.id}
                onPress={() => toggleClassFilter(classItem.id)}
                style={[
                  styles.classFilter,
                  {
                    backgroundColor: isSelected ? colors.primary + "20" : theme.backgroundDefault,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                {isSelected ? (
                  <Feather name="check" size={14} color={colors.primary} />
                ) : null}
                <ThemedText
                  style={[
                    styles.classFilterText,
                    { color: isSelected ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {classItem.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h2">{stats.total}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textMuted }]}>
            Total Records
          </ThemedText>
        </View>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <ThemedText style={styles.gradientStatValue}>{stats.rate}%</ThemedText>
          <ThemedText style={styles.gradientStatLabel}>Attendance Rate</ThemedText>
        </LinearGradient>
        <View style={[styles.statCard, { backgroundColor: colors.success + "15" }]}>
          <ThemedText type="h2" style={{ color: colors.success }}>{stats.present}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.success }]}>
            Present
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.error + "15" }]}>
          <ThemedText type="h2" style={{ color: colors.error }}>{stats.absent}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.error }]}>
            Absent
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="h4" style={styles.sectionTitle}>
          Recent Records
        </ThemedText>
        <View style={[styles.table, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
            <ThemedText style={[styles.tableHeaderText, { color: colors.textMuted }, { flex: 2 }]}>
              Student
            </ThemedText>
            <ThemedText style={[styles.tableHeaderText, { color: colors.textMuted }, { flex: 1 }]}>
              Class
            </ThemedText>
            <ThemedText style={[styles.tableHeaderText, { color: colors.textMuted }, { flex: 1 }]}>
              Date
            </ThemedText>
            <ThemedText style={[styles.tableHeaderText, { color: colors.textMuted }, { flex: 1, textAlign: "right" }]}>
              Status
            </ThemedText>
          </View>
          {filteredRecords.slice(0, 10).map((record) => (
            <View key={record.id} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.tableCell, { flex: 2 }]} numberOfLines={1}>
                {record.studentName}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1, color: colors.textSecondary }]} numberOfLines={1}>
                {record.className}
              </ThemedText>
              <ThemedText style={[styles.tableCell, { flex: 1, color: colors.textMuted }]}>
                {new Date(record.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </ThemedText>
              <View style={[styles.tableCellStatus, { flex: 1 }]}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor:
                        record.status === "present"
                          ? colors.success
                          : record.status === "absent"
                          ? colors.error
                          : colors.warning,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.exportButtons}>
        <Button
          onPress={handleGenerateReport}
          disabled={isGenerating}
          style={styles.exportButton}
        >
          {isGenerating ? "Generating..." : "Export CSV Report"}
        </Button>
      </View>
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  rangeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  rangeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  rangeButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  classFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  classFilter: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  classFilterText: {
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  gradientStatValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
  },
  gradientStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: Spacing.xs,
  },
  table: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  tableHeaderText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    padding: Spacing.md,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 13,
  },
  tableCellStatus: {
    alignItems: "flex-end",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  exportButtons: {
    marginTop: Spacing.lg,
  },
  exportButton: {},
});
