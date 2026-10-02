import { fetchApi } from './api';

export const authApi = {
  login: async (credentials: any) => {
    return fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  register: async (userData: any) => {
    return fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
};
