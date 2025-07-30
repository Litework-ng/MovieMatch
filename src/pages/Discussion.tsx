import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { getMovieById } from '../services/tmdb'; // your TMDB service
import './Discussion.css';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  profile_id: string;
  Profiles: {
    name: string;
  };
};

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
}

const DiscussionScreen = () => {
  const { movieId } = useParams<{ movieId: string}>();
  const movieIdNumber = Number(movieId);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  // Fetch movie details from TMDB
  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;
      const movieData = await getMovieById(movieIdNumber); // from TMDB
      setMovie(movieData);
    };

    const fetchProfileId = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentProfileId(data?.user?.id ?? null);
    };

    fetchMovie();
    fetchProfileId();
  }, [movieIdNumber, movieId]);

  // Fetch and subscribe to comments
  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('Comments')
        .select(`
          id,
          content,
          created_at,
          profile_id,
          Profiles (
            name
          )
        `)
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (!error && data) {
       const normalized = data.map((comment) => ({
  ...comment,
  Profiles: Array.isArray(comment.Profiles)
    ? comment.Profiles[0] ?? { name: 'Unknown' }
    : comment.Profiles ?? { name: 'Unknown' },
}));

        setComments(normalized);
      } else {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();

    const subscription = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Comments' },
        fetchComments
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [movieId]);

  const handlePostComment = async () => {
  if (!newComment.trim() || !movieId) return;

  const { error } = await supabase.from('Comments').insert({
    content: newComment,
    movie_id: Number(movieId), 
    profile_id: currentProfileId,
  });

  if (error) {
    console.error('Error posting comment:', error.message);
  } else {
    setNewComment('');
  }
};


  const handleDeleteComment = async (id: string) => {
    console.log('Deleting comment ID:', id);
  const { error } = await supabase.from('Comments').delete().eq('id', id);
  if (error) {
    console.error('Error deleting comment:', error);
  } else {
    setComments((prev) => prev.filter((comment) => comment.id !== id));
  }
};


  return (
    <div className="discussion-container">
      {movie && (
        <div className="movie-info">
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="movie-poster"
          />
          <div>
            <h2>{movie.title}</h2>
            <p>{movie.overview}</p>
          </div>
        </div>
      )}

      <div className="comment-section">
        <h3>Discussion</h3>

        <div className="comment-input">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handlePostComment}>Post</button>
        </div>

        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id} className="comment-card">
              <div className="comment-header">
                <strong>{comment.Profiles.name}</strong>
                <small>{new Date(comment.created_at).toLocaleString()}</small>
              </div>
              <p>{comment.content}</p>
              {comment.profile_id === currentProfileId && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiscussionScreen;
