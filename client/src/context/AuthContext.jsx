import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api, { setAuthToken } from "../api/axios";

const AuthContext = createContext(null);
const TOKEN_KEY = "ramixaq_token";
const USER_KEY = "ramixaq_user";

const readStorage = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep the authenticated session in React state when storage is unavailable.
  }
};

const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // The in-memory session is still cleared below.
  }
};

const readStoredUser = () => {
  try {
    return JSON.parse(readStorage(USER_KEY));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const storedToken = readStorage(TOKEN_KEY);
  const [token, setToken] = useState(storedToken);
  const [user, setUser] = useState(readStoredUser());
  const [loading, setLoading] = useState(Boolean(storedToken));

  const persistSession = (session) => {
    if (!session?.token || !session?.user) {
      throw new Error("The authentication response did not include a valid session.");
    }

    setToken(session.token);
    setUser(session.user);
    setAuthToken(session.token);
    writeStorage(TOKEN_KEY, session.token);
    writeStorage(USER_KEY, JSON.stringify(session.user));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
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
        writeStorage(USER_KEY, JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);

    if (response.status !== 201) {
      throw new Error(`Registration returned an unexpected status: ${response.status}`);
    }

    const { data } = response;
    persistSession(data);
    return data;
  };

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);

    if (response.status !== 200) {
      throw new Error(`Login returned an unexpected status: ${response.status}`);
    }

    const { data } = response;
    persistSession(data);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put("/auth/profile", payload);
    setUser(data.user);
    writeStorage(USER_KEY, JSON.stringify(data.user));
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
