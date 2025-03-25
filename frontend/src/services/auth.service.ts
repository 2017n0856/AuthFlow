interface SignupData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

interface AuthResponse {
  message: string;
  user: User;
  token?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authService = {
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to sign up');
    }

    const result = await response.json();
    // Ensure all required fields are present
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false
    };
    return result;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to login');
    }

    const result = await response.json();
    // Ensure all required fields are present
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false
    };
    return result;
  },
}; 