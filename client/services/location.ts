import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";
import type { LocationState, ClassRoom } from "@/types";

const LOCATION_TASK_NAME = "campuscheck-background-location";
const GEOFENCE_RADIUS = 50;

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function isWithinGeofence(
  userLat: number,
  userLon: number,
  classLat: number,
  classLon: number,
  radius: number = GEOFENCE_RADIUS
): boolean {
  const distance = calculateDistance(userLat, userLon, classLat, classLon);
  return distance <= radius;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (foregroundStatus !== "granted") {
    return false;
  }

  if (Platform.OS !== "web") {
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === "granted";
  }

  return true;
}

export async function getCurrentLocation(): Promise<LocationState | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

export async function startBackgroundLocationUpdates(
  onLocationUpdate: (location: LocationState) => void
): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      return false;
    }

    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 30000,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: "CampusCheck",
        notificationBody: "Tracking attendance in background",
        notificationColor: "#667eea",
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });

    return true;
  } catch (error) {
    console.error("Error starting background location:", error);
    return false;
  }
}

export async function stopBackgroundLocationUpdates(): Promise<void> {
  if (Platform.OS === "web") {
    return;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch (error) {
    console.error("Error stopping background location:", error);
  }
}

export function findNearbyClasses(
  location: LocationState,
  classes: ClassRoom[]
): { classRoom: ClassRoom; distance: number; isInRange: boolean }[] {
  return classes.map((classRoom) => {
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      classRoom.latitude,
      classRoom.longitude
    );
    return {
      classRoom,
      distance,
      isInRange: distance <= classRoom.radius,
    };
  }).sort((a, b) => a.distance - b.distance);
}

export function isClassInSession(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): boolean {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  return schedule.some((s) => {
    if (s.dayOfWeek !== currentDay) return false;
    return currentTime >= s.startTime && currentTime <= s.endTime;
  });
}

export function getNextSession(schedule: { dayOfWeek: number; startTime: string; endTime: string }[]): { dayOfWeek: number; startTime: string; endTime: string } | undefined {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  const sortedSchedule = [...schedule].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.startTime.localeCompare(b.startTime);
  });

  const todayUpcoming = sortedSchedule.find(
    (s) => s.dayOfWeek === currentDay && s.startTime > currentTime
  );
  if (todayUpcoming) return todayUpcoming;

  const futureDay = sortedSchedule.find((s) => s.dayOfWeek > currentDay);
  if (futureDay) return futureDay;

  return sortedSchedule[0];
}

export { LOCATION_TASK_NAME, GEOFENCE_RADIUS };
