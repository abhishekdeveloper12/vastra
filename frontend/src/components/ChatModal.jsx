import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './ChatModal.css';
import { getOrCreateChat, sendMessage as sendMessageApi } from '../api/chatApi';
import { sendAudioMessage } from '../api/sendAudioMessage';


const SOCKET_URL = 'http://localhost:5000'; // Update if backend runs elsewhere

const ChatModal = ({ open, onClose, product, buyerId, sellerId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const socketRef = useRef();
  const chatBottomRef = useRef();
  const userId = localStorage.getItem('userId');
  const roomId = `product_${product._id}_${buyerId}_${sellerId}`;

  // Audio recording state (must be inside component)
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  // Use a ref for audio chunks to avoid async state issues
  const audioChunksRef = useRef([]);
  const [audioPreview, setAudioPreview] = useState(null); // Blob for preview

  // Audio recording handlers (must be inside component)
  const startRecording = async () => {
    console.log('[Audio] Start recording...');
    if (!navigator.mediaDevices) {
      alert('Audio recording not supported');
      console.error('[Audio] MediaDevices not supported');
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new window.MediaRecorder(stream);
    setMediaRecorder(recorder);
    audioChunksRef.current = [];
    recorder.start();
    setRecording(true);
    recorder.ondataavailable = (e) => {
      console.log('[Audio] Data available', e.data);
      audioChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      setRecording(false);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      console.log('[Audio] Recording stopped. Blob size:', audioBlob.size);
      if (audioBlob.size > 0) {
        setAudioPreview(audioBlob); // Set for preview and send
        console.log('[Audio] Preview ready');
      } else {
        console.warn('[Audio] Blob size is 0, no preview');
      }
      audioChunksRef.current = [];
    };
    console.log('[Audio] MediaRecorder started');
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      console.log('[Audio] Stopping recorder...');
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const sendAudio = async (audioBlob, token) => {
    if (!audioBlob || !chatId) {
      console.error('[Audio] No audioBlob or chatId');
      return;
    }
    console.log('[Audio] Sending audio...');
    const file = new File([audioBlob], 'audio-message.webm', { type: 'audio/webm' });
    try {
      const updatedChat = await sendAudioMessage(chatId, file, token);
      setMessages(updatedChat.messages);
      setAudioPreview(null);
      console.log('[Audio] Audio sent and chat updated');
    } catch (err) {
      console.error('[Audio] Error sending audio:', err);
    }
  };

  useEffect(() => {
    if (!open) return;
    // Get or create chat from backend
    const token = localStorage.getItem('token');
    // Determine other user
    const otherUserId = userId === buyerId ? sellerId : buyerId;
    getOrCreateChat(product._id, otherUserId, token).then(chat => {
      setChatId(chat._id);
      setMessages(chat.messages || []);
    });
    // Setup socket.io
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinRoom', { roomId });
    socketRef.current.on('chatMessage', (msg) => {
      // Ensure the received message matches backend structure
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [open, roomId, product._id, buyerId, sellerId]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    const token = localStorage.getItem('token');
    // Save to backend, which returns the updated chat with the new message
    const updatedChat = await sendMessageApi(chatId, input.trim(), token);
    const newMsg = updatedChat.messages[updatedChat.messages.length - 1];
    // Emit via socket.io only the new message, matching backend structure
    socketRef.current.emit('chatMessage', {
      roomId,
      sender: newMsg.sender,
      text: newMsg.text,
      timestamp: newMsg.timestamp,
      read: newMsg.read,
    });
    setMessages(updatedChat.messages);
    setInput('');
  };

  if (!open) return null;
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-modal-header">
          <span>Chat</span>
          <button className="chat-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="chat-modal-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-msg${msg.sender === userId ? ' self' : ''}`}>
              {msg.text && <span>{msg.text}</span>}
              {msg.audio && (
                <audio controls src={msg.audio} style={{ maxWidth: 200, marginTop: 4 }} />
              )}
            </div>
          ))}
          <div ref={chatBottomRef} />
        </div>
        <form className="chat-modal-input-row" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            autoFocus
            disabled={recording || !!audioPreview}
          />
          <button type="submit" disabled={recording || !!audioPreview}>Send</button>
          {!recording && !audioPreview && (
            <button type="button" onClick={startRecording} title="Record audio" style={{ marginLeft: 8 }}>
              🎤
            </button>
          )}
          {recording && (
            <button type="button" onClick={stopRecording} title="Stop recording" style={{ marginLeft: 8, color: 'red' }}>
              ⏹️
            </button>
          )}
        </form>
        {audioPreview && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <audio controls src={URL.createObjectURL(audioPreview)} style={{ maxWidth: 200 }} />
            <button
              type="button"
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px' }}
              onClick={async () => {
                const token = localStorage.getItem('token');
                console.log('[Audio] Send Audio button clicked');
                await sendAudio(audioPreview, token);
              }}
            >Send Audio</button>
            <button
              type="button"
              style={{ background: '#eee', color: '#333', border: 'none', borderRadius: 4, padding: '4px 12px' }}
              onClick={() => {
                setAudioPreview(null);
                console.log('[Audio] Cancelled preview');
              }}
            >Cancel</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
