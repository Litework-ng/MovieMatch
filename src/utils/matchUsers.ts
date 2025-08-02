export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  favoriteGenres: string[];
  favoriteMovies: string[];
  favoriteTVShows?: string[]; // Optional
}

export interface MatchResult {
  user: User;
  matchScore: number;
  genreMatch: number;
  movieMatch: number;
  showMatch: number;
  reason: string;
};

export function calculateMatch(currentUser: User, allUsers: User[]): MatchResult[] {
  return allUsers.map((user: User) => {
    const genreIntersection = currentUser.favoriteGenres?.filter(genre =>
      user.favoriteGenres?.includes(genre)
    ) || [];

    const movieIntersection = currentUser.favoriteMovies?.filter(movie =>
      user.favoriteMovies?.includes(movie)
    ) || [];

    const totalInterestCount =
      (currentUser.favoriteGenres?.length || 0) +
      (currentUser.favoriteMovies?.length || 0);

    const matchScore =
      ((genreIntersection.length + movieIntersection.length) / (totalInterestCount || 1)) * 100;

    let reasons: string[] = [];

    if (genreIntersection.length) {
      reasons.push(`you both like genres like ${genreIntersection.slice(0, 2).join(', ')}`);
    }

    if (movieIntersection.length) {
      reasons.push(`you both enjoy movies like ${movieIntersection.slice(0, 2).join(', ')}`);
    }

    const reason = reasons.length
      ? `Because ${reasons.join(', ')}.`
      : 'You have some shared interests!';

    return {
      user,
      genreMatch: Math.round((genreIntersection.length / (currentUser.favoriteGenres?.length || 1)) * 100),
      movieMatch: Math.round((movieIntersection.length / (currentUser.favoriteMovies?.length || 1)) * 100),
      showMatch: 0,
      matchScore: Math.round(matchScore),
      reason,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
