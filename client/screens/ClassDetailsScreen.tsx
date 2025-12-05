import React, { useMemo } from "react";
import { StyleSheet, View, ScrollView, Dimensions, Platform, Linking, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { AttendanceItem } from "@/components/AttendanceItem";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@/hooks/useLocation";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";
import { getClassById, getAttendanceRecords } from "@/services/data";
import { calculateDistance } from "@/services/location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

let MapView: any = null;
let Marker: any = null;
let Circle: any = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  Circle = Maps.Circle;
}

const { width } = Dimensions.get("window");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Props = NativeStackScreenProps<any, "ClassDetails">;

function MapFallback({ classData, colors, distance, isInRange, onOpenMaps }: {
  classData: any;
  colors: any;
  distance: number | null;
  isInRange: boolean;
  onOpenMaps: () => void;
}) {
  return (
    <Pressable onPress={onOpenMaps} style={styles.mapFallback}>
      <LinearGradient
        colors={[colors.primary + "40", colors.secondary + "40"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.mapFallbackContent, { backgroundColor: colors.backgroundDefault + "80" }]}>
        <View style={[styles.mapFallbackIcon, { backgroundColor: colors.primary + "20" }]}>
          <Feather name="map-pin" size={32} color={colors.primary} />
        </View>
        <ThemedText type="h4">{classData.name}</ThemedText>
        <ThemedText style={{ color: colors.textSecondary, textAlign: "center" }}>
          {classData.radius}m geofence radius
        </ThemedText>
        <View style={[styles.distanceBadge, { backgroundColor: isInRange ? colors.success : colors.backgroundDefault, marginTop: Spacing.md }]}>
          <Feather
            name="navigation"
            size={14}
            color={isInRange ? "#fff" : colors.textSecondary}
          />
          <ThemedText style={[styles.distanceText, { color: isInRange ? "#fff" : colors.textSecondary }]}>
            {distance !== null ? `${Math.round(distance)}m away` : "Location unavailable"}
          </ThemedText>
        </View>
        <ThemedText style={{ color: colors.link, marginTop: Spacing.sm, fontSize: 12 }}>
          Tap to view in Maps
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function ClassDetailsScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const { user } = useAuth();
  const { location } = useLocation();

  const classId = route.params?.classId;
  const classData = useMemo(() => getClassById(classId), [classId]);
  const attendanceRecords = useMemo(
    () => getAttendanceRecords(user?.id || "", user?.name || "Student")
      .filter((r) => r.classId === classId)
      .slice(0, 5),
    [classId, user?.id, user?.name]
  );

  const distance = useMemo(() => {
    if (!location || !classData) return null;
    return calculateDistance(
      location.latitude,
      location.longitude,
      classData.latitude,
      classData.longitude
    );
  }, [location, classData]);

  const isInRange = distance !== null && classData ? distance <= classData.radius : false;

  if (!classData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>Class not found</ThemedText>
      </View>
    );
  }

  const openMaps = () => {
    const url = Platform.select({
      ios: `maps:?q=${classData.name}&ll=${classData.latitude},${classData.longitude}`,
      android: `geo:${classData.latitude},${classData.longitude}?q=${classData.latitude},${classData.longitude}(${classData.name})`,
      default: `https://maps.google.com/?q=${classData.latitude},${classData.longitude}`,
    });
    Linking.openURL(url);
  };

  const renderMap = () => {
    if (Platform.OS === "web" || !MapView) {
      return (
        <MapFallback
          classData={classData}
          colors={colors}
          distance={distance}
          isInRange={isInRange}
          onOpenMaps={openMaps}
        />
      );
    }

    return (
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: classData.latitude,
            longitude: classData.longitude,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          <Circle
            center={{
              latitude: classData.latitude,
              longitude: classData.longitude,
            }}
            radius={classData.radius}
            fillColor={colors.primary + "30"}
            strokeColor={colors.primary}
            strokeWidth={2}
          />
          <Marker
            coordinate={{
              latitude: classData.latitude,
              longitude: classData.longitude,
            }}
            title={classData.name}
          />
          {location ? (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              pinColor={isInRange ? colors.success : colors.error}
            />
          ) : null}
        </MapView>
        <View style={styles.mapOverlay}>
          <View style={[styles.distanceBadge, { backgroundColor: isInRange ? colors.success : theme.backgroundDefault }]}>
            <Feather
              name="map-pin"
              size={14}
              color={isInRange ? "#fff" : colors.textSecondary}
            />
            <ThemedText style={[styles.distanceText, { color: isInRange ? "#fff" : colors.textSecondary }]}>
              {distance !== null ? `${Math.round(distance)}m away` : "Location unavailable"}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.xl }]}
      showsVerticalScrollIndicator={false}
    >
      {renderMap()}

      <View style={styles.details}>
        <View style={styles.titleRow}>
          <ThemedText type="h2">{classData.name}</ThemedText>
          {isInRange ? (
            <StatusBadge status="present" size="medium" showIcon={false} />
          ) : null}
        </View>

        <View style={styles.infoCards}>
          <Card style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={[styles.infoIcon, { backgroundColor: colors.primary + "20" }]}>
              <Feather name="user" size={18} color={colors.primary} />
            </View>
            <ThemedText style={[styles.infoLabel, { color: colors.textMuted }]}>
              Instructor
            </ThemedText>
            <ThemedText style={styles.infoValue}>{classData.instructorName}</ThemedText>
          </Card>
          <Card
            style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}
            onPress={openMaps}
          >
            <View style={[styles.infoIcon, { backgroundColor: colors.info + "20" }]}>
              <Feather name="navigation" size={18} color={colors.info} />
            </View>
            <ThemedText style={[styles.infoLabel, { color: colors.textMuted }]}>
              Geofence
            </ThemedText>
            <ThemedText style={styles.infoValue}>{classData.radius}m radius</ThemedText>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Schedule
          </ThemedText>
          <View style={[styles.scheduleCard, { backgroundColor: theme.backgroundDefault }]}>
            {classData.schedule.map((session, index) => (
              <View
                key={index}
                style={[
                  styles.scheduleRow,
                  index < classData.schedule.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={styles.scheduleDay}>
                  <Feather name="calendar" size={14} color={colors.primary} />
                  <ThemedText style={styles.scheduleDayText}>
                    {DAYS[session.dayOfWeek]}
                  </ThemedText>
                </View>
                <View style={styles.scheduleTime}>
                  <Feather name="clock" size={14} color={colors.textMuted} />
                  <ThemedText style={[styles.scheduleTimeText, { color: colors.textSecondary }]}>
                    {session.startTime} - {session.endTime}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        {attendanceRecords.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Recent Attendance
            </ThemedText>
            {attendanceRecords.map((record) => (
              <AttendanceItem key={record.id} record={record} />
            ))}
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {},
  mapContainer: {
    height: 250,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapFallback: {
    height: 250,
    position: "relative",
    overflow: "hidden",
  },
  mapFallbackContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  mapFallbackIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  mapOverlay: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
  },
  distanceBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "500",
  },
  details: {
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  infoCards: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  scheduleCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
  },
  scheduleDay: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scheduleDayText: {
    fontWeight: "500",
  },
  scheduleTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  scheduleTimeText: {
    fontSize: 14,
  },
});
