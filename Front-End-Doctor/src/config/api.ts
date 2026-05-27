import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HOST = Platform.OS === 'web' ? 'localhost' : '192.168.1.2';

// Single general-purpose API (port 5000) — handles both patients and doctors
const api = axios.create({
  baseURL: `http://${HOST}:5000`,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// export const doctorApi  = makeApi(5002);  // doctor-specific endpoint — disabled
// export const patientApi = makeApi(5000);   // kept as the general gate above

export default api;
