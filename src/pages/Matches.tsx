import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import './Matches.css';
import { calculateMatch, MatchResult } from '../utils/matchUsers';
import { enrichUserProfile } from '../utils/enrichUserProfile';

const Matches: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: myProfileRaw } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: othersRaw } = await supabase
        .from('Profiles')
        .select('*')
        .neq('id', user.id);

      if (!myProfileRaw || !othersRaw) return;

      const myProfile = await enrichUserProfile(myProfileRaw);
      const otherProfiles = await Promise.all(othersRaw.map(enrichUserProfile));

      const scoredMatches = calculateMatch(myProfile, otherProfiles);
      setMatches(scoredMatches);
    };

    fetchMatches();
  }, []);

  return (
    <div className="matches-container">
      <h2>Your Matches</h2>
      <ul className="matches-list">
        {matches.map(({ user, reason }) => (
          <li key={user.id} className="match-card">
            <h3>{user.name}, {user.age}</h3>
            <p>{user.bio}</p>
            <p className="match-reason">{reason}</p>
            <div className="match-actions">
              <button onClick={() => navigate(`/profile/${user.id}`)}>View Profile</button>
              <button onClick={() => navigate(`/chat/${user.id}`)}>Message</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Matches;
