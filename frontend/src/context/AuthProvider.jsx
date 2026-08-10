import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "./auth-context";
import { apiFetch, ensureCsrfCookie } from "../lib/api";

const PROFILE_API = "/api/accounts/profile/";
const LOGOUT_API = "/api/accounts/logout/";
const AUTH_STORAGE_KEY = "user";
const AUTH_SAVED_AT_KEY = "auth_saved_at";
const AUTH_MAX_AGE_MS = 1000 * 60 * 60 * 12;

function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(AUTH_SAVED_AT_KEY);
  localStorage.removeItem("token");
}

function isStoredAuthExpired() {
  const savedAt = Number(localStorage.getItem(AUTH_SAVED_AT_KEY) || 0);
  return !savedAt || Date.now() - savedAt > AUTH_MAX_AGE_MS;
}

function persistAuthUser(userData) {
  const normalizedUser = normalizeAuthUser(userData);

  if (!normalizedUser) {
    clearStoredAuth();
    return null;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalizedUser));
  localStorage.setItem(AUTH_SAVED_AT_KEY, String(Date.now()));
  return normalizedUser;
}

function normalizeAuthUser(userData) {
  if (!userData) return null;

  const fullNameParts = String(userData.full_name || "").trim().split(/\s+/).filter(Boolean);
  const firstName = userData.first_name || fullNameParts[0] || "";
  const lastName = userData.last_name || fullNameParts.slice(1).join(" ");
  const fullName = userData.full_name || `${firstName} ${lastName}`.trim() || userData.username || "";

  return {
    ...userData,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
  };
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      if (isStoredAuthExpired()) {
        clearStoredAuth();
        return null;
      }

      return normalizeAuthUser(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null"));
    } catch {
      clearStoredAuth();
      return null;
    }
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        await ensureCsrfCookie();

        const storedUser = normalizeAuthUser(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null"));
        if (!storedUser) return;

        const response = await apiFetch(PROFILE_API);

        if (!response.ok) {
          clearStoredAuth();
          if (isMounted) {
            setUser(null);
          }
          return;
        }

        const freshUser = persistAuthUser(await response.json());
        if (isMounted) {
          setUser(freshUser);
        }
      } catch {
        clearStoredAuth();
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (userData, redirectTo = "/dashboard") => {
    const normalizedUser = persistAuthUser(userData);
    setUser(normalizedUser);
    navigate(redirectTo, { replace: true });
  };

  const updateUser = (userData) => {
    const normalizedUser = persistAuthUser(userData);
    setUser(normalizedUser);
  };

  const logout = async () => {
    try {
      await apiFetch(LOGOUT_API, { method: "POST" });
    } catch {
      // Local cleanup below is the source of truth for the frontend session.
    }

    clearStoredAuth();
    setUser(null);
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAuthLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
