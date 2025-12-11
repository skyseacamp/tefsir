"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthContextType, RegisterData, AuthResponse } from "@/types";
import { apiClient } from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("burada")
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          apiClient.setToken(token);
          const response = (await apiClient.getCurrentUser()) as AuthResponse;
          setUser(response.user);
        }
        else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        apiClient.removeToken();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = (await apiClient.login({
        email,
        password,
      })) as AuthResponse;
      console.log("Login response:", response);
      if (response.token) {
        apiClient.setToken(response.token);
        console.log("Token set in apiClient");
      } else {
        console.error("No token in login response");
      }
      setUser(response.user);
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = (await apiClient.register(userData)) as AuthResponse;
      apiClient.setToken(response.token);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const logout = () => {
    apiClient.removeToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
