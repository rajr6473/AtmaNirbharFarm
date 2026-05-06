import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://fna-2.onrender.com/';

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

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════');
  console.log('║ 🚀 API REQUEST');
  console.log('╠════════════════════════════════════════════════════════════');
  console.log('║ Endpoint:', endpoint);
  console.log('║ Method:', options.method || 'GET');
  console.log('║ Token:', token ? `${token.substring(0, 20)}...` : '❌ No token found');

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
  console.log('║ Full URL:', url);
  console.log('║ Headers:', JSON.stringify(headers, null, 2));
  if (options.body) {
    console.log('║ Body:', options.body);
  }
  console.log('╚════════════════════════════════════════════════════════════');
  console.log('');

  const startTime = Date.now();

  return fetch(url, {
    ...options,
    headers,
  }).then(async (response) => {
    const duration = Date.now() - startTime;
    const responseClone = response.clone();
    let responseBody = '';

    try {
      responseBody = await responseClone.text();
    } catch (e) {
      responseBody = '[Unable to read response body]';
    }

    console.log('');
    console.log('╔════════════════════════════════════════════════════════════');
    console.log('║ 📥 API RESPONSE');
    console.log('╠════════════════════════════════════════════════════════════');
    console.log('║ URL:', url);
    console.log('║ Status:', response.status, response.statusText);
    console.log('║ Duration:', duration, 'ms');
    console.log('║ Response Body:', responseBody.substring(0, 500));
    if (responseBody.length > 500) {
      console.log('║ ... (truncated)');
    }
    console.log('╚════════════════════════════════════════════════════════════');
    console.log('');

    return response;
  });
};

/**
 * API helper methods
 */
export const api = {
  get: async (endpoint: string) => {
    console.log('📤 GET Request to:', endpoint);
    return authenticatedFetch(endpoint, { method: 'GET' });
  },

  post: async (endpoint: string, body?: any) => {
    console.log('📤 POST Request to:', endpoint);
    console.log('📤 Request Body:', JSON.stringify(body, null, 2));
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
