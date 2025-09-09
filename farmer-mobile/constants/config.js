// Minimal, deployment-friendly API base URL resolver
const DEFAULT_BASE = 'http://localhost:5001/api';

const fetchWithTimeout = (url, ms = 1500) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
};

export const getUserApiOverride = async () => {
  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    const url = await AsyncStorage.getItem('user_api_url');
    return url || null;
  } catch (e) {
    return null;
  }
};

export const resolveApiBaseUrl = async () => {
  const user = await getUserApiOverride();
  if (user) return user;

  try {
    const res = await fetchWithTimeout(`${DEFAULT_BASE.replace('/api','')}/api/config`, 1500);
    if (res?.ok) {
      const json = await res.json();
      if (json?.apiBaseUrl) return json.apiBaseUrl;
    }
  } catch {}

  return DEFAULT_BASE;
};

export const API_BASE_URL = DEFAULT_BASE;
