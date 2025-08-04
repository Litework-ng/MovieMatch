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
  const [partnerName, setPartnerName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load current user and chat partner's name
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
      if (userId) {
        // Fetch chat partner's name from Profiles
        const { data: profile } = await supabase
          .from('Profiles')
          .select('name')
          .eq('id', userId)
          .single();
        setPartnerName(profile?.name || 'User');
      }
    });
  }, [userId]);

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

  // Helper: group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    return msgs.reduce((acc, msg) => {
      const date = new Date(msg.created_at).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
    }, {} as Record<string, Message[]>);
  };

  const grouped = groupMessagesByDate(messages);

  return (
    <div className="chat-container">
      <div className="messages">
        <div className="chat-header" style={{textAlign:'center', marginBottom:10, fontWeight:'bold'}}>
          Chatting with {partnerName}
        </div>
        {Object.entries(grouped).map(([date, msgs]) => (
          <div key={date} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="date-group-label" style={{ textAlign: 'center', color: '#888', fontSize: '0.9em', margin: '10px 0' }}>{date}</div>
            {msgs.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.sender_id === currentUserId ? 'sent' : 'received'}`}
                title={new Date(msg.created_at).toLocaleString()}
              >
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.75em', color: '#bbb', marginTop: 2, textAlign: msg.sender_id === currentUserId ? 'right' : 'left' }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
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
