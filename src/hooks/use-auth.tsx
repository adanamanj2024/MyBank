import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { User } from "@/lib/types";
import { storage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => void;
  register: (username: string, password: string) => void;
  logout: () => void;
  refreshUser: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => storage.getCurrentUser());
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback((username: string, password: string) => {
    try {
      setError(null);
      const u = storage.login(username, password);
      storage.setCurrentUser(u);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  }, []);

  const register = useCallback((username: string, password: string) => {
    try {
      setError(null);
      const u = storage.register(username, password);
      storage.setCurrentUser(u);
      setUser(u);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  }, []);

  const logout = useCallback(() => {
    storage.setCurrentUser(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(() => {
    const u = storage.getCurrentUser();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
