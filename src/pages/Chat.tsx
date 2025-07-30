import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import './Chat.css';

type Message = {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
};

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUserId || !userId) return;

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        const filtered = data?.filter(
          (msg: Message) =>
            (msg.sender_id === currentUserId && msg.receiver_id === userId) ||
            (msg.sender_id === userId && msg.receiver_id === currentUserId)
        );
        setMessages(filtered || []);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('messages-room')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const msg: Message = payload.new as Message;
        if (
          (msg.sender_id === currentUserId && msg.receiver_id === userId) ||
          (msg.sender_id === userId && msg.receiver_id === currentUserId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, currentUserId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '' || !currentUserId) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: userId,
      content: newMessage,
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
