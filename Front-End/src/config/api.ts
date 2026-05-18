import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const HOST = Platform.OS === 'web' ? 'localhost' : '192.168.1.8';

const makeApi = (port: number) => {
  const instance = axios.create({
    baseURL: `http://${HOST}:${port}`,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  });
  instance.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
};

export const patientApi = makeApi(5000);
export const doctorApi  = makeApi(5002);

export default patientApi;
