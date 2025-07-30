import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

type Profile = {
  id: string;
  name: string;
  favorite_movie_id: number | null;
  recent_watch_id: number | null;
  top_genres: number[] | null;
  email: string | null;
};

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch current user's profile
      const { data: myProfile, error: myError } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (myError || !myProfile) {
        console.error('Error fetching current user profile:', myError);
        setLoading(false);
        return;
      }

      // Fetch other users' profiles
      const { data: otherProfiles, error: othersError } = await supabase
        .from('Profiles')
        .select('*')
        .neq('id', user.id);

      if (othersError) {
        console.error('Error fetching other profiles:', othersError);
        setLoading(false);
        return;
      }

      // Simple match logic: same favorite movie or recent watch
      const filtered = otherProfiles.filter((profile) =>
        profile.favorite_movie_id === myProfile.favorite_movie_id ||
        profile.recent_watch_id === myProfile.recent_watch_id
      );

      setMatches(filtered);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) return <p>Loading matches...</p>;

  return (
    <div>
      <h1>Your Matches</h1>
      {matches.length === 0 ? (
        <p>No matches found yet.</p>
      ) : (
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              <p>{match.name}</p>
              <p>Email: {match.email}</p>
              <button onClick={() => navigate(`/messages/${match.id}`)}>
                Message
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MatchList;
