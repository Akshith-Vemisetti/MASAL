export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005/api';
export const API_ORIGIN = new URL(API_BASE_URL).origin;

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Unable to reach the API. Check the backend URL and try again.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    const detail =
      data && typeof data === 'object' && 'detail' in data
        ? data.detail
        : undefined;
    const message = typeof detail === 'string'
      ? detail
      : `API request failed (HTTP ${response.status}).`;
    throw new Error(message);
  }

  if (data === null) {
    throw new Error('The API returned an unexpected response. Check the backend URL and try again.');
  }

  return data;
};
