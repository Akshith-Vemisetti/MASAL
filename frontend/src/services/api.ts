const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api';

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'API request failed');
  }

  return data;
};
