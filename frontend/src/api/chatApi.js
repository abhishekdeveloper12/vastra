import { API_BASE_URL } from '../api';

export async function getOrCreateChat(productId, otherUserId, token) {
  const res = await fetch(`${API_BASE_URL}/api/chats/get-or-create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, otherUserId }),
  });
  return res.json();
}

export async function getUserChats(token) {
  const res = await fetch(`${API_BASE_URL}/api/chats/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function sendMessage(chatId, text, token) {
  const res = await fetch(`${API_BASE_URL}/api/chats/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chatId, text }),
  });
  return res.json();
}

export async function markAsRead(chatId, token) {
  const res = await fetch(`${API_BASE_URL}/api/chats/read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chatId }),
  });
  return res.json();
}
