// Utility to validate JWT token with backend
import { API_BASE_URL } from '../api';

export async function validateToken(token) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/validate-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid === true;
  } catch {
    return false;
  }
}
