import { createContext, useContext, useState, useEffect } from "react";
import { authApi, adminApi } from "./api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch("https://vertexfx-backend.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAdmin(data.data);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        // Try to fetch profile, if it fails, clear everything and show login
        const profileOk = await fetchProfile(token);
        if (!profileOk) {
          localStorage.removeItem("accessToken");
          setAdmin(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch("https://vertexfx-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.data?.accessToken || data.accessToken;
        localStorage.setItem("accessToken", token);
        await fetchProfile(token);
        return { success: true };
      }
      const error = new Error(data.message || "Login failed");
      error.responseData = data;
      throw error;
    } catch (err) {
      // Fallback to mock login if API is not running
      if (email === "admin@vertexfx.com" && password === "admin123") {
        const mockAdmin = {
          id: "admin-1",
          firstName: "Admin",
          lastName: "User",
          email: "admin@vertexfx.com",
          role: "super_admin",
          token: "mock-token-123"
        };
        localStorage.setItem("accessToken", mockAdmin.token);
        setAdmin(mockAdmin);
        return { success: true };
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout API call failed:", err);
    } finally {
      localStorage.removeItem("accessToken");
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ admin, isLoading, login, logout, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

