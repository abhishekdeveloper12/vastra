import { API_BASE_URL } from './api';

export async function getUserByEmail(email) {
  const response = await fetch(`${API_BASE_URL}/api/users/by-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'User fetch failed');
  }
  return data;
}
