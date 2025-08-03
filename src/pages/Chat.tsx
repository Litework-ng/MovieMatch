import React, { useEffect, useRef, useState } from 'react';
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // Fetch history and subscribe to live inserts
  useEffect(() => {
    if (!currentUserId || !userId) return;

    // 1) Fetch existing conversation
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const convo = data.filter(
            (m) =>
              (m.sender_id === currentUserId && m.receiver_id === userId) ||
              (m.sender_id === userId && m.receiver_id === currentUserId)
          );
          setMessages(convo);
        }
      });

    // 2) Subscribe to ALL new messages, filter in JS using Realtime channel
    const channel = supabase.channel('messages-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message;
          if (
            (m.sender_id === currentUserId && m.receiver_id === userId) ||
            (m.sender_id === userId && m.receiver_id === currentUserId)
          ) {
            setMessages((prev) => [...prev, m]);
          }
        }
      )
      .subscribe();

    // Cleanup on unmount or deps change
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, userId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !userId) return;

    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: userId,
      content: newMessage.trim(),
    });

    setNewMessage('');
  };

  if (!currentUserId) return <p>Loading chat…</p>;

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
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
