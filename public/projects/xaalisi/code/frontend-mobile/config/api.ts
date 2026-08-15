import { getSecureItem, deleteSecureItem } from './storage';
import { Platform } from 'react-native';

// Set BASE_URL depending on environment.
// Production API URL pointing to the Azure VM
export const BASE_URL = 'https://xaalisi.tech/api';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = await getSecureItem('userToken');
  
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (options.body && options.body.constructor && options.body.constructor.name === 'URLSearchParams') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = options.body.toString();
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    body,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      await deleteSecureItem('userToken');
      await deleteSecureItem('username');
      try {
        const { router } = require('expo-router');
        router.replace('/auth');
      } catch (e) {
        console.error("Failed to redirect to auth", e);
      }
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.status}`);
  }

  return response.json();
}
