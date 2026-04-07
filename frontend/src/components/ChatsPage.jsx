import React, { useEffect, useState } from 'react';
import { getUserChats, markAsRead } from '../api/chatApi';
import ChatModal from './ChatModal';

const ChatsPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const userId = localStorage.getItem('userId');
  // const userEmail = localStorage.getItem('email');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChats = async () => {
      if (!token) return;
      const data = await getUserChats(token);
      setChats(data);
      // Calculate unread count
      let count = 0;
      data.forEach(chat => {
        chat.messages?.forEach(msg => {
          if (String(msg.sender) !== String(userId) && !msg.read) count++;
        });
      });
      setUnreadCount(count);
    };
    fetchChats();
  }, [token]);

  const openChat = async (chat) => {
    setSelectedChat(chat);
    setModalOpen(true);
    // Mark messages as read when opening chat
    if (chat && chat._id) {
      await markAsRead(chat._id, token);
      // Refresh chats to update unread count
      const data = await getUserChats(token);
      setChats(data);
      let count = 0;
      data.forEach(chat => {
        chat.messages?.forEach(msg => {
          if (String(msg.sender) !== String(userId) && !msg.read) count++;
        });
      });
      setUnreadCount(count);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <h2>Your Chats {unreadCount > 0 && <span style={{color: 'red', fontSize: '0.7em'}}>({unreadCount} unread)</span>}</h2>
      {chats.length === 0 && <div>No chats found.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {chats.map((chat, idx) => {
          // Defensive: warn if chat is skipped due to missing user
          if (!chat.buyer || !chat.seller) {
            return (
              <div key={chat._id} style={{ color: 'red', marginBottom: 8 }}>
                Warning: Chat data is corrupted (missing buyer or seller). Please contact support or delete this chat.
              </div>
            );
          }
          const isBuyer = String(chat.buyer._id) === userId;
          const otherUserLabel = isBuyer ? 'Seller' : 'Buyer';
          const lastMsg = chat.messages?.[chat.messages.length - 1];
          return (
            <div key={chat._id} style={{
              border: '1px solid #cfd8dc', borderRadius: 8, padding: 16, cursor: 'pointer', background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }} onClick={() => openChat(chat)}>
              <div><b>Product:</b> {chat.product?.name || 'Product'}</div>
              <div><b>With:</b> {otherUserLabel}</div>
              <div style={{ color: '#555', marginTop: 6 }}>
                {lastMsg ? <>
                  <span style={{ fontWeight: lastMsg.read || String(lastMsg.sender) === userId ? 400 : 700 }}>
                    {String(lastMsg.sender) === userId ? 'You: ' : ''}{lastMsg.text}
                  </span>
                  <span style={{ marginLeft: 12, fontSize: '0.95em', color: '#888' }}>
                    {new Date(lastMsg.timestamp).toLocaleString()}
                  </span>
                </> : <i>No messages yet</i>}
              </div>
            </div>
          );
        })}
      </div>
      {selectedChat && selectedChat.buyer && selectedChat.seller && (
        <ChatModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          product={selectedChat.product}
          buyerId={selectedChat.buyer._id}
          sellerId={selectedChat.seller._id}
        />
      )}
    </div>
  );
};

export default ChatsPage;
