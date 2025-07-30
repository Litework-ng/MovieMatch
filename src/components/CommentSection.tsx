import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  name: string;
};

export const CommentSection = ({ discussionId }: { discussionId: string }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('Comments')
      .select(`
        id,
        content,
        created_at,
        Profiles ( name )
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error.message);
      return;
    }

    const formatted = data.map((c: any) => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      name: c.Profiles?.name ?? 'Anonymous',
    }));

    setComments(formatted);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const user = supabase.auth.getUser();
    const { data: sessionData } = await user;

    const { error } = await supabase.from('Comments').insert({
      content: newComment,
      profile_id: sessionData?.user?.id,
      discussion_id: discussionId,
    });

    if (error) console.error('Add comment error:', error.message);
    else setNewComment('');
  };

  useEffect(() => {
    fetchComments();

    const subscription = supabase
      .channel('realtime-comments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Comments' },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, );

  return (
    <div>
      <h4>Comments</h4>
      <ul>
        {comments.map((c) => (
          <li key={c.id}>
            <strong>{c.name}:</strong> {c.content}
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Add your comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
      />
      <button onClick={handleAddComment}>Post</button>
    </div>
  );
};
