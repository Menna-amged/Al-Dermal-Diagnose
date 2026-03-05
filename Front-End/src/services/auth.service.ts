import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('isPremium', JSON.stringify(data.isPremium));
  return data;
};

export const register = async (payload: {
  email: string; password: string; confirmPassword: string;
  firstName: string; lastName?: string;
  gender?: string; age?: number; location?: string;
}) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp });
  return data;
};

export const resendOtp = async (email: string) => {
  const { data } = await api.post('/auth/resend-otp', { email });
  return data;
};

export const checkEmail = async (email: string) => {
  const { data } = await api.post('/auth/check-email', { email });
  return data;
};

export const verifyResetOtp = async (email: string, otp: string) => {
  const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
  return data;
};

export const forgotPassword = async (email: string) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (email: string, newPassword: string, confirmPassword: string) => {
  const { data } = await api.post('/auth/reset-password', { email, newPassword, confirmPassword });
  return data;
};