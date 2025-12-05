import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import FacultyDashboardScreen from "@/screens/faculty/FacultyDashboardScreen";
import FacultyLiveAttendanceScreen from "@/screens/faculty/FacultyLiveAttendanceScreen";
import FacultyReportsScreen from "@/screens/faculty/FacultyReportsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type FacultyTabParamList = {
  DashboardTab: undefined;
  LiveAttendanceTab: undefined;
  ReportsTab: undefined;
};

const Tab = createBottomTabNavigator<FacultyTabParamList>();

export default function FacultyTabNavigator() {
  const { theme, isDark } = useTheme();
  const screenOptions = useScreenOptions();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Spacing.tabBarHeight + (Platform.OS === "ios" ? 20 : 0),
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        ...screenOptions,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={FacultyDashboardScreen}
        options={{
          title: "Dashboard",
          headerTitle: () => <HeaderTitle title="CampusCheck" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LiveAttendanceTab"
        component={FacultyLiveAttendanceScreen}
        options={{
          headerTitle: "Live Attendance",
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={FacultyReportsScreen}
        options={{
          headerTitle: "Reports",
          tabBarIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
