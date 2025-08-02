// src/utils/enrichUserProfile.ts
import { getGenres, getMovieById } from '../services/tmdb';

type RawProfile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  top_genres: number[];
  favorite_movies: number[];
};

export async function enrichUserProfile(profile: RawProfile) {
  const genreList = await getGenres(); // [{ id: number, name: string }]
interface Genre {
    id: number;
    name: string;
}



const genreMap: Record<number, string> = Object.fromEntries(
    (genreList as Genre[]).map((g: Genre) => [g.id, g.name])
);

  const favoriteGenres = profile.top_genres?.map(id => genreMap[id]) || [];

  const movieDetails = await Promise.all(
    profile.favorite_movies?.map(id => getMovieById(id)) || []
  );
  const favoriteMovies = movieDetails
    .filter(movie => movie !== null)
    .map(movie => movie.title);

  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    bio: profile.bio,
    favoriteGenres,
    favoriteMovies,
  };
}
