import { API_BASE_URL } from '../api';

export async function sendAudioMessage(chatId, audioFile, token) {
  const formData = new FormData();
  formData.append('chatId', chatId);
  formData.append('audio', audioFile);
  const res = await fetch(`${API_BASE_URL}/api/chats/send-audio`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return res.json();
}
