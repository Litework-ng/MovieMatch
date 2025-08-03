import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase'; // ensure this import is correct in your project
import './ProfileSetup.css';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [genresList, setGenresList] = useState<{ id: number; name: string }[]>([]);
  const [movieSearch, setMovieSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    genres: [] as number[],
    favoriteMovies: [] as any[],
    recentWatches: [] as any[],
  });

  useEffect(() => {
    if (step === 2) {
      const fetchGenres = async () => {
        const res = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
        const data = await res.json();
        setGenresList(data.genres);
      };
      fetchGenres();
    }
  }, [step]);

  useEffect(() => {
    const fetchMovies = async () => {
      if (movieSearch.trim() === '') {
        setSearchResults([]);
        return;
      }

      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieSearch)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    };

    fetchMovies();
  }, [movieSearch]);

  const handleGenreToggle = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.includes(id)
        ? prev.genres.filter((genreId) => genreId !== id)
        : [...prev.genres, id],
    }));
  };

  const handleMovieSelect = (movie: any) => {
    if (!formData.favoriteMovies.find((m) => m.id === movie.id)) {
      setFormData((prev) => ({
        ...prev,
        favoriteMovies: [...prev.favoriteMovies, movie],
      }));
    }
    setMovieSearch(''); 
    setSearchResults([]);
  };

  const handleRemoveMovie = (movieId: number) => {
    setFormData((prev) => ({
      ...prev,
      favoriteMovies: prev.favoriteMovies.filter((m) => m.id !== movieId),
    }));
  };

  const handleRecentWatchSelect = (movie: any) => {
    if (!formData.recentWatches.find((m) => m.id === movie.id)) {
      setFormData((prev) => ({
        ...prev,
        recentWatches: [...prev.recentWatches, movie],
        
      }));
    }
    setMovieSearch(''); 
       setSearchResults([]);
  };

  const handleRemoveRecentWatch = (movieId: number) => {
    setFormData((prev) => ({
      ...prev,
      recentWatches: prev.recentWatches.filter((m) => m.id !== movieId),
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('User not authenticated');
      return;
    }

   const { error } = await supabase.from('Profiles').upsert({
  id: user.id,
  name: formData.name,
  age: Number(formData.age),
  bio: formData.bio,
  top_genres: formData.genres, // assuming array of IDs
  favorite_movies: formData.favoriteMovies.map(movie => movie.id), // array of IDs
  recent_watches: formData.recentWatches.map(movie => movie.id),   // array of IDs
  email: user.email,
});

    if (error) {
      console.error('Error saving profile:', error);
      toast.error('Error saving profile: ' + error.message);
    } else {
      toast.success('Profile saved!');
      navigate('/home');
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="progress-indicator">Step {step} of 5</div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="step">
          <h2>Personal Info</h2>
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <textarea name="bio" placeholder="Bio" value={formData.bio} onChange={handleChange} required />

          <div className="navigation-buttons">
            <button onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* Step 2: Favorite Genres */}
      {step === 2 && (
        <div className="step">
          <h2>Select Favorite Genres</h2>
          <div className="genres-list">
            {genresList.map((genre) => (
              <div
                key={genre.id}
                className={`genre-chip ${formData.genres.includes(genre.id) ? 'selected' : ''}`}
                onClick={() => handleGenreToggle(genre.id)}
              >
                {genre.name}
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* Step 3: Favorite Movies */}
      {step === 3 && (
        <div className="step">
          <h2>Select Favorite Movies</h2>
          <input
            type="text"
            placeholder="Search for movies..."
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
          />
          <div className="search-results">
            {searchResults.map((movie) => (
              <div key={movie.id} className="search-result-item" onClick={() => handleMovieSelect(movie)}>
                {movie.title}
              </div>
            ))}
          </div>

          <div className="selected-movies">
            {formData.favoriteMovies.map((movie) => (
              <div key={movie.id} className="selected-movie">
                {movie.title}
                <button onClick={() => handleRemoveMovie(movie.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* Step 4: Recent Watches */}
      {step === 4 && (
        <div className="step">
          <h2>Select Recent Watches</h2>
          <input
            type="text"
            placeholder="Search for movies..."
            value={movieSearch}
            onChange={(e) => setMovieSearch(e.target.value)}
          />
          <div className="search-results">
            {searchResults.map((movie) => (
              <div key={movie.id} className="search-result-item" onClick={() => handleRecentWatchSelect(movie)}>
                {movie.title}
              </div>
            ))}
          </div>

          <div className="selected-movies">
            {formData.recentWatches.map((movie) => (
              <div key={movie.id} className="selected-movie">
                {movie.title}
                <button onClick={() => handleRemoveRecentWatch(movie.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="navigation-buttons">
            <button onClick={handleBack}>Back</button>
            <button onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && (
        <div className="step">
          <h2>Review & Submit</h2>

          <div className="review-section">
            <p><strong>Name:</strong> {formData.name}</p>
            <p><strong>Age:</strong> {formData.age}</p>
            <p><strong>Bio:</strong> {formData.bio}</p>
            <p><strong>Favorite Genres:</strong> 
            {formData.genres.map((id) => {
              const genre = genresList.find((g) => g.id === id);
              return <li key={id}>{genre ? genre.name : 'Unknown'}</li>;
            })}</p>

            <div>
              <strong>Favorite Movies:</strong>
              <ul>
                {formData.favoriteMovies.map((movie) => (
                  <li key={movie.id}>{movie.title}</li>
                ))}
              </ul>
            </div>

            <div>
              <strong>Recent Watches:</strong>
              <ul>
                {formData.recentWatches.map((movie) => (
                  <li key={movie.id}>{movie.title}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="navigation-buttons">
            <button onClick={handleBack}>Back</button>
            <button onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;
