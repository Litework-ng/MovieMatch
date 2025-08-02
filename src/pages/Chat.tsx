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

  // 1) Load current user once
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, []);

  // 2) Fetch history + subscribe, but only after we know currentUserId
  useEffect(() => {
    if (!currentUserId || !userId) return;

    // --- fetch conversation history ---
    supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (data) {
          const convo = data.filter(
            (m) =>
              (m.sender_id === currentUserId && m.receiver_id === userId) ||
              (m.sender_id === userId && m.receiver_id === currentUserId)
          );
          setMessages(convo);
        }
      });

    // --- realtime subscription for only this convo ---
   

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId},sender_id=eq.${userId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId},sender_id=eq.${currentUserId}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    // cleanup
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId, userId]);

  // auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const sendMessage = async () => {
  if (!newMessage.trim() || !currentUserId || !userId) return;

  console.log('Inserting message:', {
    sender_id: currentUserId,
    receiver_id: userId,
    content: newMessage.trim(),
  });

  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: currentUserId,
      receiver_id: userId,
      content: newMessage.trim(),
    })
    .select();  // return the inserted row

  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Inserted row:', data);
    setNewMessage('');
  }
};


  if (!currentUserId) return <p>Loading chat...</p>;

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
