import axios from 'axios';

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

interface VerificationResponse {
  message: string;
  user: User;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const verificationService = {
  verifyEmail: async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
    return response.data;
  },

  sendPhoneVerification: async (phone: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_URL}/auth/send-phone-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send verification code');
    }

    return response.json();
  },

  verifyPhone: async (code: string, token: string): Promise<VerificationResponse> => {
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