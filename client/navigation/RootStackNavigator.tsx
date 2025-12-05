import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

import LoginScreen from "@/screens/LoginScreen";
import GDPRConsentScreen from "@/screens/GDPRConsentScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import ClassDetailsScreen from "@/screens/ClassDetailsScreen";
import StudentTabNavigator from "@/navigation/StudentTabNavigator";
import FacultyTabNavigator from "@/navigation/FacultyTabNavigator";

export type RootStackParamList = {
  Login: undefined;
  GDPRConsent: undefined;
  Onboarding: undefined;
  StudentMain: undefined;
  FacultyMain: undefined;
  ClassDetails: { classId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  const { theme } = useTheme();
  return (
    <View style={[styles.loading, { backgroundColor: theme.backgroundRoot }]}>
      <ActivityIndicator size="large" color={theme.link} />
    </View>
  );
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isLoading, isAuthenticated, hasAcceptedGDPR, hasCompletedOnboarding, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!hasAcceptedGDPR) return "GDPRConsent";
    if (!isAuthenticated) return "Login";
    if (!hasCompletedOnboarding) return "Onboarding";
    return user?.role === "faculty" ? "FacultyMain" : "StudentMain";
  };

  return (
    <Stack.Navigator
      initialRouteName={getInitialRouteName()}
      screenOptions={screenOptions}
    >
      {!hasAcceptedGDPR ? (
        <Stack.Screen
          name="GDPRConsent"
          component={GDPRConsentScreen}
          options={{ headerShown: false }}
        />
      ) : !isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : !hasCompletedOnboarding ? (
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          {user?.role === "faculty" ? (
            <Stack.Screen
              name="FacultyMain"
              component={FacultyTabNavigator}
              options={{ headerShown: false }}
            />
          ) : (
            <Stack.Screen
              name="StudentMain"
              component={StudentTabNavigator}
              options={{ headerShown: false }}
            />
          )}
          <Stack.Screen
            name="ClassDetails"
            component={ClassDetailsScreen}
            options={{
              presentation: "modal",
              headerTitle: "Class Details",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
