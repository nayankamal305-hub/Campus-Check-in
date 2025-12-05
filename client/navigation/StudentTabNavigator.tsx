import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import StudentHomeScreen from "@/screens/student/StudentHomeScreen";
import StudentAttendanceScreen from "@/screens/student/StudentAttendanceScreen";
import StudentProfileScreen from "@/screens/student/StudentProfileScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type StudentTabParamList = {
  HomeTab: undefined;
  AttendanceTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<StudentTabParamList>();

export default function StudentTabNavigator() {
  const { theme, isDark } = useTheme();
  const screenOptions = useScreenOptions();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
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
        name="HomeTab"
        component={StudentHomeScreen}
        options={{
          title: "Home",
          headerTitle: () => <HeaderTitle title="CampusCheck" />,
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={StudentAttendanceScreen}
        options={{
          headerTitle: "Attendance",
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={StudentProfileScreen}
        options={{
          headerTitle: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
