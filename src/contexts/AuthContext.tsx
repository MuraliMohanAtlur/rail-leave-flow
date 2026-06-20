import React, { createContext, useContext, useEffect, useState } from "react";
import { apiUrl } from "@/lib/api";
import { useRouter } from "@tanstack/react-router";

type User = {
  id: string;
  name: string;
  email: string;
  stationName?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("authToken"));
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      localStorage.setItem("authToken", token);
      fetchUser(token);
    } else {
      localStorage.removeItem("authToken");
      setUser(null);
      setIsLoading(false);
    }
  }, [token]);

  const fetchUser = async (authToken: string) => {
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setToken(null); // Invalid token
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    setToken(null);
    router.navigate({ to: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
