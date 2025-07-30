import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import './Matches.css';

type MatchProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
};

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('Profiles')
        .select('id, name, age, bio')
        .neq('id', user.id); // Replace with real match logic

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      setMatches(data || []);
    };

    fetchMatches();
  }, []);

  return (
    <div className="matches-container">
      <h2>Your Matches</h2>
      <ul className="matches-list">
        {matches.map((match) => (
          <li key={match.id} className="match-card">
            <h3>{match.name}, {match.age}</h3>
            <p>{match.bio}</p>
            <div className="match-actions">
              <button onClick={() => navigate(`/profile/${match.id}`)}>View Profile</button>
              <button onClick={() => navigate(`/chat/${match.id}`)}>Message</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Matches;
