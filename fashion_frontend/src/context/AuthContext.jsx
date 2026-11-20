
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem("roseva_access")
  );
  const [loading, setLoading] = useState(true);

  const logout = () => {
    sessionStorage.removeItem("roseva_access");
    sessionStorage.removeItem("roseva_refresh");
    setAccessToken(null);
    setUser(null);
  };

  useEffect(() => {
    let active = true;

    async function loadUser() {
      if (!accessToken) {
        if (active) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/customers/profile/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Session expired");
        }

        const data = await response.json();

        if (active) setUser(data);
      } catch {
        if (active) logout();
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [accessToken]);

  const saveSession = (data) => {
    sessionStorage.setItem(
      "roseva_access",
      data.tokens.access
    );
    sessionStorage.setItem(
      "roseva_refresh",
      data.tokens.refresh
    );

    setUser(data.user);
    setAccessToken(data.tokens.access);
    setLoading(false);
  };

  const register = async (form) => {
    const response = await fetch(
      `${API_URL}/customers/register/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(formatError(data));
    }

    saveSession(data);
    return data;
  };

  const login = async (email, password) => {
    const response = await fetch(
      `${API_URL}/customers/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(formatError(data));
    }

    saveSession(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function formatError(data) {
  if (data.error || data.detail) {
    return data.error || data.detail;
  }

  const first = Object.values(data)[0];

  if (Array.isArray(first)) {
    return first.join(" ");
  }

  return typeof first === "string"
    ? first
    : "Something went wrong.";
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
