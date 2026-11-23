
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

// ==========================================
// AUTH CONTEXT
// ==========================================

const AuthContext = createContext(null);

// ==========================================
// API URL
// ==========================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "");

// ==========================================
// ERROR HANDLING
// ==========================================

function formatError(data) {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again.";
  }

  if (data.error || data.detail) {
    return String(data.error || data.detail);
  }

  const first = Object.values(data)[0];

  if (Array.isArray(first)) {
    return first.join(" ");
  }

  if (typeof first === "string") {
    return first;
  }

  return "Something went wrong. Please try again.";
}

// ==========================================
// API REQUEST HELPER
// ==========================================

async function apiRequest(endpoint, options = {}) {
  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to the server. Please try again."
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(formatError(data));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ==========================================
// AUTH PROVIDER
// ==========================================

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [accessToken, setAccessToken] = useState(
    () => sessionStorage.getItem("roseva_access")
  );

  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = useCallback(() => {
    sessionStorage.removeItem("roseva_access");
    sessionStorage.removeItem("roseva_refresh");

    setAccessToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  // ==========================================
  // LOAD CUSTOMER PROFILE
  // ==========================================

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

      setLoading(true);

      try {
        const data = await apiRequest(
          "/customers/profile/",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (active) {
          setUser(data);
        }
      } catch {
        if (active) {
          sessionStorage.removeItem("roseva_access");
          sessionStorage.removeItem("roseva_refresh");

          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [accessToken]);

  // ==========================================
  // SAVE AUTHENTICATED SESSION
  // ==========================================

  const saveSession = (data) => {
    if (
      !data?.tokens?.access ||
      !data?.tokens?.refresh
    ) {
      throw new Error(
        "Authentication tokens were not returned by the server."
      );
    }

    sessionStorage.setItem(
      "roseva_access",
      data.tokens.access
    );

    sessionStorage.setItem(
      "roseva_refresh",
      data.tokens.refresh
    );

    setUser(data.user || null);
    setAccessToken(data.tokens.access);
    setLoading(false);
  };

  // ==========================================
  // CUSTOMER REGISTRATION
  // ==========================================

  const register = async (form) => {
    const data = await apiRequest(
      "/customers/register/",
      {
        method: "POST",
        body: JSON.stringify(form),
      }
    );

    // Registration requires OTP verification.
    // Do not log in or save JWT tokens yet.
    if (data.requires_verification) {
      return {
        ...data,
        email: data.email || form.email,
        requires_verification: true,
      };
    }

    // Support an older registration API response
    // only if it explicitly returns valid tokens.
    if (
      data.tokens?.access &&
      data.tokens?.refresh
    ) {
      saveSession(data);
      return data;
    }

    throw new Error(
      "Unexpected registration response from the server."
    );
  };

  // ==========================================
  // VERIFY EMAIL OTP
  // ==========================================

  const verifyOTP = async (email, otp) => {
    const data = await apiRequest(
      "/customers/verify-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          otp: String(otp).trim(),
        }),
      }
    );

    return data;
  };

  // ==========================================
  // RESEND EMAIL OTP
  // ==========================================

  const resendOTP = async (email) => {
    const data = await apiRequest(
      "/customers/resend-otp/",
      {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
        }),
      }
    );

    return data;
  };

  // ==========================================
  // CUSTOMER LOGIN
  // ==========================================

  const login = async (email, password) => {
    const data = await apiRequest(
      "/customers/login/",
      {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    saveSession(data);

    return data;
  };

  // ==========================================
  // CONTEXT PROVIDER
  // ==========================================

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        register,
        login,
        logout,
        verifyOTP,
        resendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ==========================================
// USE AUTH HOOK
// ==========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
