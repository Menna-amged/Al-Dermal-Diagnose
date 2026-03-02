import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', data.token);
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