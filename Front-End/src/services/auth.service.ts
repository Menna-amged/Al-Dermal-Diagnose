import AsyncStorage from '@react-native-async-storage/async-storage';
import { patientApi, doctorApi } from '../config/api';

const getApi = (userType: 'patient' | 'doctor') =>
  userType === 'doctor' ? doctorApi : patientApi;

export const login = async (email: string, password: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/login', { email, password });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('isPremium', JSON.stringify(data.isPremium ?? false));
  await AsyncStorage.setItem('premiumExpiresAt', data.premiumExpiresAt ?? '');
  await AsyncStorage.setItem('firstName', data.firstName ?? '');
  await AsyncStorage.setItem('lastName', data.lastName ?? '');
  await AsyncStorage.setItem('userType', userType);
  await AsyncStorage.setItem('isProfileComplete', JSON.stringify(data.isProfileComplete ?? true));
  await AsyncStorage.setItem('user_tokens', String(data.tokens ?? 0));
  return data;
};

export const register = async (payload: {
  email: string; password: string; confirmPassword: string;
  firstName: string; lastName?: string;
  gender?: string; age?: number; location?: string;
}) => {
  const { data } = await patientApi.post('/auth/register', payload);
  return data;
};

export const verifyOtp = async (email: string, otp: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/verify-otp', { email, otp });
  return data;
};

export const resendOtp = async (email: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/resend-otp', { email });
  return data;
};

export const checkEmail = async (email: string) => {
  const { data } = await patientApi.post('/auth/check-email', { email });
  return data;
};

export const verifyResetOtp = async (email: string, otp: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/verify-reset-otp', { email, otp });
  return data;
};

export const forgotPassword = async (email: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (email: string, newPassword: string, confirmPassword: string, userType: 'patient' | 'doctor' = 'patient') => {
  const { data } = await getApi(userType).post('/auth/reset-password', { email, newPassword, confirmPassword });
  return data;
};