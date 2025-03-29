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
  is2FAEnabled: boolean;
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
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
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
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
    };
    return result;
  },

  updateName: async (name: string, token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/profile/name`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update name');
    }

    const result = await response.json();
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
    };
    return result;
  },

  updatePhone: async (phone: string, token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/profile/phone`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update phone');
    }

    const result = await response.json();
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
    };
    return result;
  },

  toggle2FA: async (enabled: boolean, token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/profile/2fa/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ enabled }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle 2FA');
    }

    const result = await response.json();
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
    };
    return result;
  },

  verifyPhone: async (code: string, token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth/verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify phone');
    }

    const result = await response.json();
    result.user = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      phone: result.user.phone || null,
      isActive: result.user.isActive || false,
      isEmailVerified: result.user.isEmailVerified || false,
      isPhoneVerified: result.user.isPhoneVerified || false,
      is2FAEnabled: result.user.is2FAEnabled || false
    };
    return result;
  }
}; 