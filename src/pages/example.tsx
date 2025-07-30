import { useEffect, useState } from 'react';
import { searchMovies } from '../services/tmdb';

const Example = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const results = await searchMovies('Inception');
      setMovies(results);
    };
    fetchData();
  }, []);

  return (
    <div>
      {movies.map((movie: any) => (
        <div key={movie.id}>{movie.title}</div>
      ))}
    </div>
  );
};

export default Example;
