import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import api, { setUnauthorizedCallback } from "../services/api";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
} from "../services/tokenStorage";
import type {
  User,
  UserLoginRequest,
  UserRegisterRequest,
  TokenResponse,
  AuthContextValue,
} from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    removeStoredToken();
    setUser(null);
  }, []);

  // Listen to centralized 401 unauthorized events from Axios interceptor
  useEffect(() => {
    setUnauthorizedCallback(logout);
    return () => {
      setUnauthorizedCallback(null);
    };
  }, [logout]);

  // Restore authenticated session on initial application mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get<User>("/api/auth/me");
        setUser(response.data);
      } catch {
        // Token was invalid, expired, or user not found
        removeStoredToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = useCallback(async (credentials: UserLoginRequest): Promise<void> => {
    const response = await api.post<TokenResponse>("/api/auth/login", credentials);
    const { access_token, user: userData } = response.data;
    setStoredToken(access_token);
    setUser(userData);
  }, []);

  const register = useCallback(
    async (payload: UserRegisterRequest): Promise<void> => {
      await api.post<User>("/api/auth/register", payload);
      // Auto-authenticate immediately following successful registration
      await login({
        email: payload.email,
        password: payload.password,
      });
    },
    [login]
  );

  const contextValue: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access the LifeFix frontend authentication state and actions.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
