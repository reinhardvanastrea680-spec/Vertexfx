import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const API_BASE_URL = "https://vertexfx-backend.onrender.com/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setUser({ token });
      fetchProfile(token);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.data?.accessToken || data.accessToken;
        localStorage.setItem("accessToken", token);
        setUser({ token });
        await fetchProfile(token);
        return { success: true };
      }
      const error = new Error(data.message || "Login failed");
      error.responseData = data;
      throw error;
    } catch (err) {
      throw err;
    }
  };

  const register = async (
    firstName,
    lastName,
    email,
    password,
    dateOfBirth,
    nationality,
    address,
    city,
    state,
    country,
    phone,
    postalCode,
    referralCode,
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          dateOfBirth,
          nationality,
          address,
          city,
          state,
          country,
          phone,
          postalCode,
          referralCode,
        }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true };
      }
      const error = new Error(data.message || "Registration failed");
      error.responseData = data;
      throw error;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, isLoading, login, register, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

