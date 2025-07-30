import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import './Messages.css';

type Profile = {
  id: string;
  name: string;
  email: string;
};

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch distinct users you’ve chatted with
      const { data, error } = await supabase
        .from('messages')
        .select('receiver_id, sender_id')
        .or(`receiver_id.eq.${user.id},sender_id.eq.${user.id}`);

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      const userIds = new Set<string>();
      data?.forEach((msg) => {
        if (msg.sender_id !== user.id) userIds.add(msg.sender_id);
        if (msg.receiver_id !== user.id) userIds.add(msg.receiver_id);
      });

      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('Profiles')
        .select('id, name, email')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }

      setConversations(profiles || []);
    };

    fetchConversations();
  }, []);

  return (
    <div className="messages-container">
      <h2>Messages</h2>
      <ul className="conversation-list">
        {conversations.map((profile) => (
          <li key={profile.id} onClick={() => navigate(`/chat/${profile.id}`)}>
            <p>{profile.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Messages;
