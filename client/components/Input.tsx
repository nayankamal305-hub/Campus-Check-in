import React, { useState } from "react";
import { StyleSheet, View, TextInput, Pressable, TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const { theme, isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.primary
    : colors.border;

  return (
    <View style={styles.container}>
      {label ? (
        <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor,
          },
        ]}
      >
        {icon ? (
          <Feather name={icon} size={20} color={colors.textMuted} style={styles.leftIcon} />
        ) : null}
        <TextInput
          style={[
            styles.input,
            { color: theme.text },
            icon ? styles.inputWithLeftIcon : null,
            rightIcon ? styles.inputWithRightIcon : null,
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} style={styles.rightIconButton}>
            <Feather name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <ThemedText style={[styles.error, { color: colors.error }]}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    height: Spacing.inputHeight,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  leftIcon: {
    marginLeft: Spacing.lg,
  },
  rightIconButton: {
    padding: Spacing.md,
  },
  error: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
});
