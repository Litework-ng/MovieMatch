import axios from 'axios';

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export const searchMovies = async (query: string) => {
  try {
    const res = await axios.get(`${BASE_URL}/search/movie`, {
      params: { api_key: TMDB_API_KEY, query },
    });
    return res.data.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const getPopularMovies = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/movie/popular`, {
      params: { api_key: TMDB_API_KEY },
    });
    return res.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    return [];
  }
};

export const getGenres = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: { api_key: TMDB_API_KEY },
    });
    return res.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getMovieById = async (id: number) => {
  try {
    const res = await axios.get(`${BASE_URL}/movie/${id}`, {
      params: { api_key: TMDB_API_KEY },
    });
    return res.data;
  } catch (error) {
    console.error(`Error fetching movie with ID ${id}:`, error);
    return null;
  }

  
};

export const getStreamingProviders = async (id: number) => {
  try {
    const res = await axios.get(`${BASE_URL}/movie/${id}/watch/providers`, {
      params: { api_key: TMDB_API_KEY },
    });
    return res.data.results;
  } catch (error) {
    console.error(`Error fetching streaming providers for movie ID ${id}:`, error);
    return {};
  }
};