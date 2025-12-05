import React, { useState } from "react";
import { StyleSheet, View, Pressable, Image, Platform, Linking, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Gradients } from "@/constants/theme";
import type { UserRole } from "@/types";

type AuthMode = "login" | "signup";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const gradientColors = isDark ? Gradients.primaryDark : Gradients.primary;
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (mode === "signup" && !name.trim()) {
      newErrors.name = "Name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      let success: boolean;
      if (mode === "login") {
        success = await login(email, password);
      } else {
        success = await signup(email, password, name, role);
      }
      
      if (success) {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else {
        if (Platform.OS !== "web") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        Alert.alert("Error", mode === "login" ? "Invalid credentials" : "Could not create account");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setErrors({});
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={styles.appName}>CampusCheck</ThemedText>
          <ThemedText style={styles.tagline}>
            Smart Attendance, Simplified
          </ThemedText>
        </View>

        <View style={[styles.formContainer, { backgroundColor: theme.backgroundRoot }]}>
          <ThemedText type="h2" style={styles.formTitle}>
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </ThemedText>

          {mode === "signup" ? (
            <>
              <Input
                label="Full Name"
                placeholder="Enter your name"
                icon="user"
                value={name}
                onChangeText={setName}
                error={errors.name}
                autoCapitalize="words"
              />
              
              <View style={styles.roleSelector}>
                <ThemedText style={[styles.roleLabel, { color: colors.textSecondary }]}>
                  I am a
                </ThemedText>
                <View style={styles.roleButtons}>
                  <Pressable
                    onPress={() => setRole("student")}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === "student" ? colors.primary : theme.backgroundDefault,
                        borderColor: role === "student" ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name="book-open"
                      size={16}
                      color={role === "student" ? "#fff" : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.roleText,
                        { color: role === "student" ? "#fff" : colors.textSecondary },
                      ]}
                    >
                      Student
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setRole("faculty")}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: role === "faculty" ? colors.primary : theme.backgroundDefault,
                        borderColor: role === "faculty" ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Feather
                      name="briefcase"
                      size={16}
                      color={role === "faculty" ? "#fff" : colors.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.roleText,
                        { color: role === "faculty" ? "#fff" : colors.textSecondary },
                      ]}
                    >
                      Faculty
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </>
          ) : null}

          <Input
            label="Email"
            placeholder="Enter your email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            placeholder="Enter your password"
            icon="lock"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            autoCapitalize="none"
          />

          <Button onPress={handleSubmit} disabled={isLoading} style={styles.submitButton}>
            {isLoading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </Button>

          <Pressable onPress={toggleMode} style={styles.switchMode}>
            <ThemedText style={{ color: colors.textSecondary }}>
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            </ThemedText>
            <ThemedText style={{ color: colors.primary, fontWeight: "600" }}>
              {mode === "login" ? "Sign Up" : "Sign In"}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 15,
  },
  appName: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: Spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
  },
  formContainer: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    flex: 1,
  },
  formTitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  roleSelector: {
    marginBottom: Spacing.lg,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  roleButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  switchMode: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
