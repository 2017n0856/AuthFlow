import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { verificationService } from '../services/verification.service';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  is2FAEnabled: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  verifyPhone: (code: string, token: string) => Promise<void>;
  sendPhoneVerification: (phone: string, token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user and token are stored in localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Ensure all required fields are present
        const userData: User = {
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          phone: parsedUser.phone || null,
          isActive: parsedUser.isActive || false,
          isEmailVerified: parsedUser.isEmailVerified || false,
          isPhoneVerified: parsedUser.isPhoneVerified || false,
          is2FAEnabled: parsedUser.is2FAEnabled || false
        };
        setUser(userData);
        setToken(storedToken);
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login({ email, password });
      setUser(response.user);
      setToken(response.token || null);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
      throw err;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const response = await authService.signup({ name, email, password });
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const verifyPhone = async (code: string, token: string) => {
    try {
      setError(null);
      const response = await verificationService.verifyPhone(code, token);
      setUser(response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify phone');
      throw err;
    }
  };

  const sendPhoneVerification = async (phone: string, token: string) => {
    try {
      setError(null);
      await verificationService.sendPhoneVerification(phone, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send verification code');
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    setUser,
    verifyPhone,
    sendPhoneVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 