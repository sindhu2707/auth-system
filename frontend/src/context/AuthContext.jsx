import { createContext, useContext, useState, useEffect } from "react";
import api, { setAccessToken, setOnTokenRefreshed, setOnAuthFailure } from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check existing session on load

  // Wire up the axios interceptor callbacks once, on mount
  useEffect(() => {
    setOnTokenRefreshed(() => {
      // Token refreshed successfully in the background — nothing to do here,
      // axios.js already stored it. We just need this hook to exist.
    });

    setOnAuthFailure(() => {
      // Refresh token expired/invalid — force logout on the frontend
      setAccessToken(null);
      setUser(null);
    });
  }, []);

  // On app load: try to silently restore the session using the httpOnly cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.post("/refresh");
        setAccessToken(res.data.accessToken);

        // Now fetch the user's profile using the new access token
        const profileRes = await api.get("/profile");
        setUser(profileRes.data);
      } catch (err) {
        // No valid refresh cookie — user is simply not logged in. Not an error to show.
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const signup = async (name, email, password) => {
    const res = await api.post("/signup", { name, email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    const res = await api.post("/login", { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      // Even if this fails, clear local state anyway
    }
    setAccessToken(null);
    setUser(null);
  };

  const updateProfile = async (name) => {
    const res = await api.put("/profile", { name });
    setUser(res.data);
    return res.data;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};