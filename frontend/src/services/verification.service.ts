import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const verificationService = {
  verifyEmail: async (token: string) => {
    const response = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
    return response.data;
  },

  sendPhoneVerification: async (phone: string, token: string) => {
    const response = await axios.post(
      `${API_URL}/auth/send-phone-verification`,
      { phone },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  },

  verifyPhone: async (code: string, token: string) => {
    const response = await axios.post(
      `${API_URL}/auth/verify-phone`,
      { code },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  }
}; 