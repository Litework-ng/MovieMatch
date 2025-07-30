import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { getMovieById, getGenres } from '../services/tmdb';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfileScreen.css';

type ProfileData = {
  id: string;
  name: string;
  age: number;
  bio: string;
  top_genres: number[];
  favorite_movies: number[];
  recent_watches: number[];
  email: string;
};
type Genre = {
  id: number;
  name: string;
};

const ProfileScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [favoriteMovieTitles, setFavoriteMovieTitles] = useState<string[]>([]);
  const [recentWatchTitles, setRecentWatchTitles] = useState<string[]>([]);
  const [genreNames, setGenreNames] = useState<string[]>([]);
 
useEffect(() => {
  const fetchProfileAndData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const loggedInUserId = user?.id || null;
    setCurrentUserId(loggedInUserId);

    const profileIdToUse = id || loggedInUserId;

    if (!profileIdToUse) {
      console.error('No profile ID available');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('Profiles')
      .select('*')
      .eq('id', profileIdToUse)
      .single();

    if (error || !profileData) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(profileData);

    // Fetch related movie and genre names
    if (profileData.favorite_movies?.length) {
      const favoritePromises = profileData.favorite_movies.map((id: number) =>
        getMovieById(id)
      );
      const favoriteMovies = await Promise.all(favoritePromises);
      setFavoriteMovieTitles(favoriteMovies.filter(Boolean).map((movie) => movie.title));
    }

    if (profileData.recent_watches?.length) {
      const recentWatchPromises = profileData.recent_watches.map((id: number) =>
        getMovieById(id)
      );
      const recentWatches = await Promise.all(recentWatchPromises);
      setRecentWatchTitles(recentWatches.filter(Boolean).map((movie) => movie.title));
    }

   if (profileData.top_genres?.length) {
      const genresList = await getGenres(); // fetch genre list from TMDB
      const matchedGenres = profileData.top_genres.map((id: number) => {
        const found = genresList.find((g: Genre) => g.id === id);
        return found ? found.name : 'Unknown Genre';
      });
      setGenreNames(matchedGenres || []);
    }
    };

  fetchProfileAndData();
}, [id]);


  if (!profile) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <h2>{profile.name}</h2>
      <p>Age: {profile.age}</p>
      <p>Bio: {profile.bio}</p>
      <p>Email: {profile.email}</p>

      <h3>Top Genres</h3>
      <p>{genreNames.join(', ')}</p>

      <h3>Favorite Movies</h3>
      <p>{favoriteMovieTitles.join(', ') || 'None listed'}</p>

      <h3>Recent Watches</h3>
      <p>{recentWatchTitles.join(', ') || 'None listed'}</p>

      {currentUserId === profile.id ? (
        <button onClick={() => navigate('/edit-profile')}>Edit Profile</button>
      ) : (
        <button onClick={() => navigate(`/chat/${profile.id}`)}>Message</button>
      )}
    </div>
  );
};

export default ProfileScreen;
