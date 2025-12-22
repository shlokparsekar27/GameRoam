import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader2, MessageSquare, Trash2 } from 'lucide-react';

export default function PostDetails({ session }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef(null);

  const myId = session.user.id;

  useEffect(() => {
    fetchPostAndComments();

    // Subscribe to NEW comments on this post
    const channel = supabase.channel(`post_details:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, (payload) => {
        fetchSingleComment(payload.new.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  async function fetchPostAndComments() {
    try {
      // 1. Fetch Post
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('*, author:profiles(id, username, avatar_url)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData);

      // 2. Fetch Comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('community_comments')
        .select('*, author:profiles(id, username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading post:", error);
      navigate('/community'); // Go back if error
    } finally {
      setLoading(false);
    }
  }

  async function fetchSingleComment(commentId) {
    const { data } = await supabase.from('community_comments').select('*, author:profiles(id, username, avatar_url)').eq('id', commentId).single();
    if (data) {
      // Only add if not already there (prevents duplicates from realtime + local add)
      setComments(prev => prev.some(c => c.id === data.id) ? prev : [...prev, data]);
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  async function handleSendComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    
    const content = newComment;
    setNewComment(''); // Instant clear

    try {
      const { error } = await supabase.from('community_comments').insert({
        post_id: postId,
        user_id: myId,
        content: content
      });
      if (error) throw error;
    } catch (error) {
      alert("Failed to comment");
      setNewComment(content); // Restore if failed
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;
    await supabase.from('community_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-950"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!post) return null;

  return (
    <div className="min-h-screen bg-slate-950 animate-in fade-in duration-500">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header / Back */}
        <button onClick={() => navigate('/community')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
          <ArrowLeft size={20} /> Back to Community
        </button>

        {/* --- THE POST --- */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mb-8 shadow-xl">
          <div className="p-4 flex items-center gap-3 border-b border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
               {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white">{post.author?.username?.[0]}</div>}
            </div>
            <div>
              <p className="font-bold text-white">{post.author?.username}</p>
              <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()} at {new Date(post.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          
          <div className="p-4">
            <p className="text-slate-200 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
          </div>

          {post.image_url && (
            <div className="w-full bg-black">
              <img src={post.image_url} className="w-full max-h-[600px] object-contain" alt="Post" />
            </div>
          )}
          
          <div className="p-4 bg-slate-950/30 text-sm text-slate-400 flex items-center gap-2">
            <MessageSquare size={18} /> {comments.length} Comments
          </div>
        </div>

        {/* --- COMMENTS SECTION --- */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Discussion</h3>
          
          {/* Comment Input */}
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 mt-1">
              ME
            </div>
            <div className="flex-1 relative">
              <textarea 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add to the discussion..."
                className="w-full bg-slate-900 text-white p-4 pr-12 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none resize-none h-24 transition"
              />
              <button 
                onClick={handleSendComment}
                disabled={!newComment.trim() || submitting}
                className="absolute bottom-3 right-3 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"
              >
                {submitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 pb-20">
            {comments.map(c => (
              <div key={c.id} className="flex gap-4 group">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                   {c.author?.avatar_url ? <img src={c.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">{c.author?.username?.[0]}</div>}
                </div>
                <div className="flex-1">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-indigo-400 text-sm">{c.author?.username}</p>
                      <span className="text-[10px] text-slate-500">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{c.content}</p>
                    
                    {/* Delete Button (If Owner) */}
                    {c.user_id === myId && (
                      <button 
                        onClick={() => handleDeleteComment(c.id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={commentsEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}