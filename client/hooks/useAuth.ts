import { useState, useEffect, useCallback } from "react";
import { storage } from "@/services/storage";
import type { User, UserRole, AuthState } from "@/types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasAcceptedGDPR: false,
  hasCompletedOnboarding: false,
};

let authStateListeners: Set<(state: AuthState) => void> = new Set();
let currentAuthState: AuthState = initialState;

function notifyListeners() {
  authStateListeners.forEach((listener) => listener(currentAuthState));
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(currentAuthState);

  useEffect(() => {
    const listener = (newState: AuthState) => setState(newState);
    authStateListeners.add(listener);
    
    return () => {
      authStateListeners.delete(listener);
    };
  }, []);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = useCallback(async () => {
    try {
      const [user, gdprAccepted, onboardingComplete] = await Promise.all([
        storage.getUser(),
        storage.getGDPRAccepted(),
        storage.getOnboardingComplete(),
      ]);

      currentAuthState = {
        user,
        isAuthenticated: !!user,
        isLoading: false,
        hasAcceptedGDPR: gdprAccepted,
        hasCompletedOnboarding: onboardingComplete,
      };
      notifyListeners();
    } catch (error) {
      console.error("Error loading auth state:", error);
      currentAuthState = { ...initialState, isLoading: false };
      notifyListeners();
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const mockUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        role: "student",
        createdAt: new Date().toISOString(),
      };

      await storage.saveUser(mockUser);
      
      currentAuthState = {
        ...currentAuthState,
        user: mockUser,
        isAuthenticated: true,
      };
      notifyListeners();
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, role: UserRole): Promise<boolean> => {
    try {
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        createdAt: new Date().toISOString(),
      };

      await storage.saveUser(newUser);
      
      currentAuthState = {
        ...currentAuthState,
        user: newUser,
        isAuthenticated: true,
      };
      notifyListeners();
      
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await storage.clearUser();
      await storage.clearAuthToken();
      
      currentAuthState = {
        ...currentAuthState,
        user: null,
        isAuthenticated: false,
      };
      notifyListeners();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, []);

  const acceptGDPR = useCallback(async (): Promise<void> => {
    await storage.setGDPRAccepted(true);
    currentAuthState = {
      ...currentAuthState,
      hasAcceptedGDPR: true,
    };
    notifyListeners();
  }, []);

  const completeOnboarding = useCallback(async (): Promise<void> => {
    await storage.setOnboardingComplete(true);
    currentAuthState = {
      ...currentAuthState,
      hasCompletedOnboarding: true,
    };
    notifyListeners();
  }, []);

  const updateUserRole = useCallback(async (role: UserRole): Promise<void> => {
    if (!currentAuthState.user) return;
    
    const updatedUser = { ...currentAuthState.user, role };
    await storage.saveUser(updatedUser);
    
    currentAuthState = {
      ...currentAuthState,
      user: updatedUser,
    };
    notifyListeners();
  }, []);

  return {
    ...state,
    login,
    signup,
    logout,
    acceptGDPR,
    completeOnboarding,
    updateUserRole,
    refreshAuth: loadAuthState,
  };
}
