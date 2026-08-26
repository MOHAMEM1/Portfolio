import { handleMockRequest } from './mockApi';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  // Use local mock API for the portfolio demo because the backend server was deleted
  try {
    return await handleMockRequest(endpoint, options);
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('username');
      window.location.href = '/';
      return;
    }
    throw error;
  }
}
