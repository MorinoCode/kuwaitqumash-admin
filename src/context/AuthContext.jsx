import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    return !!localStorage.getItem("admin_token");
  });

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      return;
    }
    api
      .get("/me")
      .then((res) => {
        setUser(res.data?.data ?? null);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (token) => {
    localStorage.setItem("admin_token", token);
    return api.get("/me").then((res) => {
      setUser(res.data?.data ?? null);
    });
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    setUser(null);
    api.post("/logout").catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
