import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { User, AttendanceRecord, ClassRoom } from "@/types";

const KEYS = {
  USER: "@campuscheck_user",
  GDPR_ACCEPTED: "@campuscheck_gdpr",
  ONBOARDING_COMPLETE: "@campuscheck_onboarding",
  ATTENDANCE_CACHE: "@campuscheck_attendance",
  CLASSES_CACHE: "@campuscheck_classes",
  LOCATION_ENCRYPTED: "campuscheck_location",
  AUTH_TOKEN: "campuscheck_auth_token",
};

async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export const storage = {
  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
  },

  async setGDPRAccepted(accepted: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.GDPR_ACCEPTED, JSON.stringify(accepted));
  },

  async getGDPRAccepted(): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.GDPR_ACCEPTED);
    return data ? JSON.parse(data) : false;
  },

  async setOnboardingComplete(complete: boolean): Promise<void> {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, JSON.stringify(complete));
  },

  async getOnboardingComplete(): Promise<boolean> {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return data ? JSON.parse(data) : false;
  },

  async cacheAttendance(records: AttendanceRecord[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.ATTENDANCE_CACHE, JSON.stringify(records));
  },

  async getCachedAttendance(): Promise<AttendanceRecord[]> {
    const data = await AsyncStorage.getItem(KEYS.ATTENDANCE_CACHE);
    return data ? JSON.parse(data) : [];
  },

  async cacheClasses(classes: ClassRoom[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CLASSES_CACHE, JSON.stringify(classes));
  },

  async getCachedClasses(): Promise<ClassRoom[]> {
    const data = await AsyncStorage.getItem(KEYS.CLASSES_CACHE);
    return data ? JSON.parse(data) : [];
  },

  async saveEncryptedLocation(location: { latitude: number; longitude: number }): Promise<void> {
    await secureSet(KEYS.LOCATION_ENCRYPTED, JSON.stringify(location));
  },

  async getEncryptedLocation(): Promise<{ latitude: number; longitude: number } | null> {
    const data = await secureGet(KEYS.LOCATION_ENCRYPTED);
    return data ? JSON.parse(data) : null;
  },

  async saveAuthToken(token: string): Promise<void> {
    await secureSet(KEYS.AUTH_TOKEN, token);
  },

  async getAuthToken(): Promise<string | null> {
    return secureGet(KEYS.AUTH_TOKEN);
  },

  async clearAuthToken(): Promise<void> {
    await secureDelete(KEYS.AUTH_TOKEN);
  },

  async clearAll(): Promise<void> {
    await Promise.all([
      AsyncStorage.multiRemove([
        KEYS.USER,
        KEYS.ATTENDANCE_CACHE,
        KEYS.CLASSES_CACHE,
      ]),
      secureDelete(KEYS.LOCATION_ENCRYPTED),
      secureDelete(KEYS.AUTH_TOKEN),
    ]);
  },
};
