import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/axios";

const AuthContext = createContext(null);
const TOKEN_KEY = "ramixaq_token";
const USER_KEY = "ramixaq_user";

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser());
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  const persistSession = (session) => {
    setToken(session.token);
    setUser(session.user);
    setAuthToken(session.token);
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  useEffect(() => {
    const hydrateUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(token);
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    persistSession(data);
  };

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    persistSession(data);
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    setUser(data.user);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data.user;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      register,
      login,
      logout,
      updateProfile
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
