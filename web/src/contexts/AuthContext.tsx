import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { ConnectResponse } from "../../../backend/types/auth";

interface User {
  id: string;
  username: string;
  email: string;
  role_id: string;
  role?: {
    id: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (authData: ConnectResponse) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

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
  const [token, setToken] = useState<string | null>(null);

  // Load user data from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        // Clear invalid data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (authData: ConnectResponse) => {
    const userData: User = {
      id: authData.user.id,
      username: authData.user.username,
      email: authData.user.email,
      role_id: authData.user.role_id,
      role: authData.user.role,
    };

    // Store in localStorage
    localStorage.setItem("accessToken", authData.accessToken);
    localStorage.setItem("refreshToken", authData.refreshToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Update state
    setToken(authData.accessToken);
    setUser(userData);
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Clear state
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
