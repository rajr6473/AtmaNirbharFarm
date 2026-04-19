import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://dhan-g618.onrender.com/';

/**
 * Get the auth token from AsyncStorage
 */
export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Make an authenticated API request
 */
export const authenticatedFetch = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = await getAuthToken();

  console.log('=== API Request ===');
  console.log('Endpoint:', endpoint);
  console.log('Token:', token ? `${token.substring(0, 20)}...` : 'No token found');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No auth token available for request');
  }

  // Handle URL construction to avoid double slashes
  let url: string;
  if (endpoint.startsWith('http')) {
    url = endpoint;
  } else {
    const baseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    url = `${baseUrl}${path}`;
  }
  console.log('Full URL:', url);
  console.log('Headers:', headers);

  return fetch(url, {
    ...options,
    headers,
  });
};

/**
 * API helper methods
 */
export const api = {
  get: async (endpoint: string) => {
    return authenticatedFetch(endpoint, { method: 'GET' });
  },

  post: async (endpoint: string, body?: any) => {
    const options: RequestInit = { method: 'POST' };
    // Only add body if it's provided and not empty
    if (body && Object.keys(body).length > 0) {
      options.body = JSON.stringify(body);
    }
    return authenticatedFetch(endpoint, options);
  },

  put: async (endpoint: string, body?: any) => {
    return authenticatedFetch(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete: async (endpoint: string) => {
    return authenticatedFetch(endpoint, { method: 'DELETE' });
  },
};
