import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";

// Exportamos el contexto como named export y como default export
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      logout();
      return false;
    }

    try {
      const response = await axios.get("/api/check-session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsAuthenticated(true);
      setUser(response.data.user);
      return true;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const login = useCallback((token, userData) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setUser(userData);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      loading,
      login,
      logout,
      checkAuth,
    }),
    [isAuthenticated, user, loading, login, logout, checkAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

// Exportación default para compatibilidad con imports existentes
export default AuthContext;
