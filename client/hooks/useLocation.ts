import { useState, useEffect, useCallback, useRef } from "react";
import * as Location from "expo-location";
import { Platform, AppState, AppStateStatus } from "react-native";
import type { LocationState } from "@/types";
import { getCurrentLocation, requestLocationPermission } from "@/services/location";

interface UseLocationResult {
  location: LocationState | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: "granted" | "denied" | "undetermined" | null;
  requestPermission: () => Promise<boolean>;
  refreshLocation: () => Promise<void>;
}

export function useLocation(options?: { watchPosition?: boolean; interval?: number }): UseLocationResult {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "undetermined" | null>(null);
  const watchSubscription = useRef<Location.LocationSubscription | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status === "granted" ? "granted" : status === "denied" ? "denied" : "undetermined");
      return status === "granted";
    } catch {
      setPermissionStatus("undetermined");
      return false;
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const granted = await requestLocationPermission();
      setPermissionStatus(granted ? "granted" : "denied");
      if (granted) {
        await refreshLocation();
      }
      return granted;
    } catch {
      setPermissionStatus("denied");
      return false;
    }
  }, []);

  const refreshLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loc = await getCurrentLocation();
      if (loc) {
        setLocation(loc);
      } else {
        setError("Unable to get location");
      }
    } catch (err) {
      setError("Location error occurred");
      console.error("Location refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initLocation = async () => {
      const hasPermission = await checkPermission();
      if (hasPermission) {
        await refreshLocation();
      } else {
        setIsLoading(false);
      }
    };

    initLocation();
  }, [checkPermission, refreshLocation]);

  useEffect(() => {
    if (!options?.watchPosition || permissionStatus !== "granted") return;

    const startWatching = async () => {
      try {
        if (Platform.OS === "web") {
          intervalRef.current = setInterval(async () => {
            const loc = await getCurrentLocation();
            if (loc) setLocation(loc);
          }, options.interval || 30000);
        } else {
          watchSubscription.current = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: options.interval || 30000,
              distanceInterval: 10,
            },
            (newLocation) => {
              setLocation({
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                accuracy: newLocation.coords.accuracy || 0,
                timestamp: newLocation.timestamp,
              });
            }
          );
        }
      } catch (err) {
        console.error("Watch position error:", err);
      }
    };

    startWatching();

    return () => {
      if (watchSubscription.current) {
        watchSubscription.current.remove();
        watchSubscription.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options?.watchPosition, options?.interval, permissionStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === "active") {
        if (permissionStatus === "granted") {
          refreshLocation();
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [permissionStatus, refreshLocation]);

  return {
    location,
    isLoading,
    error,
    permissionStatus,
    requestPermission,
    refreshLocation,
  };
}
