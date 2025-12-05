import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    buttonText: "#FFFFFF",
    tabIconDefault: "#94a3b8",
    tabIconSelected: "#667eea",
    link: "#667eea",
    backgroundRoot: "#ffffff",
    backgroundDefault: "#f8fafc",
    backgroundSecondary: "#f1f5f9",
    backgroundTertiary: "#e2e8f0",
    border: "#e2e8f0",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    primary: "#667eea",
    primaryEnd: "#764ba2",
    cardShadow: "rgba(0, 0, 0, 0.05)",
  },
  dark: {
    text: "#f8fafc",
    textSecondary: "#cbd5e1",
    textMuted: "#64748b",
    buttonText: "#FFFFFF",
    tabIconDefault: "#64748b",
    tabIconSelected: "#818cf8",
    link: "#818cf8",
    backgroundRoot: "#0f172a",
    backgroundDefault: "#1e293b",
    backgroundSecondary: "#334155",
    backgroundTertiary: "#475569",
    border: "#334155",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
    primary: "#818cf8",
    primaryEnd: "#a78bfa",
    cardShadow: "rgba(0, 0, 0, 0.3)",
  },
};

export const Gradients = {
  primary: ["#667eea", "#764ba2"] as const,
  primaryDark: ["#818cf8", "#a78bfa"] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
  tabBarHeight: 60,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 16,
    fontWeight: "400" as const,
  },
};

export const Shadows = {
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  fab: {
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
