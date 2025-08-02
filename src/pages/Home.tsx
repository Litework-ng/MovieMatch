import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { supabase } from '../services/supabase';
import { getStreamingAvailability } from '../services/streaming';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [movieOfWeek, setMovieOfWeek] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [topTenMovies, setTopTenMovies] = useState<any[]>([]);
  const [topTenTV, setTopTenTV] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [streamingProviders, setStreamingProviders] = useState<any[]>([]);
  const [showStreamModal, setShowStreamModal] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      const [movieRes, tvRes] = await Promise.all([
        fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
        fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`),
      ]);

      const movieData = await movieRes.json();
      const tvData = await tvRes.json();

      setMovieOfWeek(movieData.results[0]);

      // Mix first 5 of each for recommendations
      const mixedRecs = [...movieData.results.slice(1, 6), ...tvData.results.slice(0, 5)];
      setRecommendations(mixedRecs.sort(() => Math.random() - 0.5));

      setTopTenMovies(movieData.results.slice(6, 16));
      setTopTenTV(tvData.results.slice(5, 15));
    };

    fetchContent();
  }, []);

  const getItemTitle = (item: any) => item.title || item.name;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="logo">CineMatch</h1>
        <div className="header-icons">
          <span className="icon" onClick={() => navigate('/messages')}>💬</span>
          <span className="icon" onClick={() => currentUserId && navigate(`/profile/${currentUserId}`)}>👤</span>
        </div>
      </header>

      <main className="home-main">
        {movieOfWeek && (
          <section className="movie-of-week">
            <h2>Movie of the Week</h2>
            <div className="movie-content">
              <img src={`https://image.tmdb.org/t/p/w500${movieOfWeek.poster_path}`} alt={movieOfWeek.title} />
              <div className="movie-details">
                <h3>{movieOfWeek.title}</h3>
                <p>{movieOfWeek.overview}</p>
                <button onClick={() => navigate(`/discussion/${movieOfWeek.id}`)}>💭 See Discussions</button>
                <button
                onClick={async () => {
                  if (movieOfWeek) {
                    const platforms = await getStreamingAvailability(movieOfWeek.title);
                    setStreamingProviders(platforms);
                    console.log(platforms)
                    setShowStreamModal(true);
                  }
                }}
              >
                🔗 Where to Stream
              </button>
              </div>
            </div>
          </section>
        )}

        <section className="recommendations">
          <h2>Recommended for You</h2>
          <div className="carousel">
            {recommendations.map((item) => (
              <div key={item.id} className="carousel-item">
                <img src={`https://image.tmdb.org/t/p/w200${item.poster_path}`} alt={getItemTitle(item)} />
                <p>{getItemTitle(item)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="top-ten">
          <h2>Top 10 Movies</h2>
          <div className="carousel">
            {topTenMovies.map((movie) => (
              <div key={movie.id} className="carousel-item">
                <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} />
                <p>{movie.title}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="top-ten">
          <h2>Top 10 TV Shows</h2>
          <div className="carousel">
            {topTenTV.map((tv) => (
              <div key={tv.id} className="carousel-item">
                <img src={`https://image.tmdb.org/t/p/w200${tv.poster_path}`} alt={tv.name} />
                <p>{tv.name}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <button className="floating-matches-button" onClick={() => navigate('/matches')}>
        🔍 Matches
      </button>

        {showStreamModal && (
  <div className="modal-overlay" onClick={() => setShowStreamModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Watch on:</h3>
      {streamingProviders.length > 0 ? (
        <ul className="stream-links">
          {streamingProviders.map((provider: any, idx: number) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={provider.logo || '/fallback-logo.png'}
                alt={provider.service}
                style={{ width: 82, height: 82, marginRight: 8 }}
              />
              <a href={provider.link} target="_blank" rel="noopener noreferrer" style={{ color:'black', fontSize:'22px'}}>
                {provider.service.charAt(0).toUpperCase() + provider.service.slice(1)}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No streaming platforms found for this region.</p>
      )}
      <button onClick={() => setShowStreamModal(false)}>Close</button>
    </div>
  </div>
)}



    </div>
  );
};

export default Home;
