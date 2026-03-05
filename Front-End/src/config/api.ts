import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const Base_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : 'http://192.168.1.15:5000';

const api = axios.create({
    baseURL: Base_URL,
    timeout: 10000,
    headers: {'Content-Type':'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
