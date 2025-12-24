import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader2, MessageSquare, Trash2, Calendar, Clock, Heart, Radio } from 'lucide-react';
import { useToast } from '../components/TacticalToast'; // <--- IMPORT

export default function PostDetails({ session }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  const toast = useToast(); // <--- HOOK

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myProfile, setMyProfile] = useState(null);

  const commentsContainerRef = useRef(null);
  const myId = session.user.id;

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyProfile();
    fetchPostAndComments();
    fetchLikeStatus();

    const channel = supabase.channel(`post_details:${postId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_comments', filter: `post_id=eq.${postId}` }, (payload) => {
        fetchSingleComment(payload.new.id);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts', filter: `id=eq.${postId}` }, (payload) => {
        setLikesCount(payload.new.likes_count);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  useEffect(() => {
    if (comments.length > 0 && commentsContainerRef.current) {
      const container = commentsContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [comments.length, comments]);

  async function fetchMyProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', myId).single();
    if (data) setMyProfile(data);
  }

  async function fetchPostAndComments() {
    try {
      const { data: postData, error: postError } = await supabase.from('community_posts').select('*, author:profiles(id, username, avatar_url)').eq('id', postId).single();
      if (postError) throw postError;
      setPost(postData);
      setLikesCount(postData.likes_count || 0);

      const { data: commentsData } = await supabase.from('community_comments').select('*, author:profiles(id, username, avatar_url)').eq('post_id', postId).order('created_at', { ascending: true });
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading post:", error);
      toast.error("TRANSMISSION ERROR: SIGNAL LOST.");
      navigate('/community/feed');
    } finally { setLoading(false); }
  }

  async function fetchLikeStatus() {
    const { data } = await supabase.from('community_likes').select('id').eq('post_id', postId).eq('user_id', myId).maybeSingle();
    setIsLiked(!!data);
  }

  async function fetchSingleComment(commentId) {
    const { data } = await supabase.from('community_comments').select('*, author:profiles(id, username, avatar_url)').eq('id', commentId).single();
    if (data) setComments(prev => prev.some(c => c.id === data.id) ? prev : [...prev, data]);
  }

  async function toggleLike(e) {
    e.stopPropagation();
    if (togglingLike) return;
    setTogglingLike(true);

    const previousLiked = isLiked;
    setIsLiked(!previousLiked);
    setLikesCount(prev => previousLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (previousLiked) {
        await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', myId);
        await supabase.rpc('decrement_likes', { row_id: postId });
      } else {
        await supabase.from('community_likes').insert({ post_id: postId, user_id: myId });
        await supabase.rpc('increment_likes', { row_id: postId });
      }
    } catch (error) {
      setIsLiked(previousLiked);
      setLikesCount(prev => previousLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally { setTogglingLike(false); }
  }

  async function handleDeletePost() {
    if (!confirm("CONFIRM: Delete transmission log?")) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    toast.info("TRANSMISSION PURGED.");
    navigate('/community/feed');
  }

  async function handleSendComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const content = newComment;
    setNewComment('');
    await supabase.from('community_comments').insert({ post_id: postId, user_id: myId, content });
    setSubmitting(false);
    toast.success("LOG APPENDED.");
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete entry?")) return;
    await supabase.from('community_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
    toast.info("ENTRY DELETED.");
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-cyber" /></div>;
  if (!post) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">

      {/* Navigation */}
      <button onClick={() => navigate('/community/feed')} className="flex items-center gap-2 text-slate-500 hover:text-cyber mb-8 transition font-code text-xs uppercase tracking-widest group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition" /> Return to Arena
      </button>

      {/* --- MAIN POST CARD (LOG) --- */}
      <div className="bg-void-800 border border-white/5 clip-chamfer overflow-hidden mb-8 shadow-2xl relative">
        <div className="absolute top-0 right-0 p-2 opacity-20"><Radio size={100} /></div>

        {/* Post Header */}
        <div className="p-6 flex justify-between items-start border-b border-white/5 bg-void-900/80 relative z-10">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(post.user_id === myId ? '/profile' : `/user/${post.user_id}`)}>
            <div className="w-12 h-12 bg-void-800 border border-white/10 clip-chamfer flex items-center justify-center overflow-hidden">
              {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover" /> : <span className="font-mech font-bold text-white text-lg">{post.author?.username?.[0]}</span>}
            </div>
            <div>
              <h2 className="font-mech font-bold text-white text-lg hover:text-cyber transition uppercase tracking-wide">{post.author?.username}</h2>
              <div className="flex items-center gap-3 text-[10px] font-code text-slate-500 mt-1">
                <span className="flex items-center gap-1">LOG_DATE: {new Date(post.created_at).toLocaleDateString()}</span>
                <span className="text-void-700">|</span>
                <span className="flex items-center gap-1">{new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {post.user_id === myId && (
            <button onClick={handleDeletePost} className="text-void-600 hover:text-flux p-2 transition">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Post Content */}
        <div className="p-6 md:p-8 relative z-10">
          <p className="text-slate-200 whitespace-pre-wrap text-base font-ui leading-relaxed">{post.content}</p>
        </div>

        {post.image_url && (
          <div className="w-full bg-black border-y border-white/5 relative z-10">
            <img src={post.image_url} className="max-h-[600px] w-auto max-w-full object-contain opacity-90 mx-auto" alt="Transmission Visual" />
          </div>
        )}

        {/* Post Footer Actions */}
        <div className="px-6 py-4 bg-void-950/50 flex items-center gap-6 border-t border-white/5 relative z-10">
          <button
            onClick={toggleLike}
            className={`flex items-center gap-2 text-xs font-bold font-code transition-all active:scale-95 ${isLiked ? 'text-flux' : 'text-slate-500 hover:text-flux'}`}
          >
            <Heart size={16} fill={isLiked ? "currentColor" : "none"} />
            {likesCount} UPLINKS
          </button>

          <div className="flex items-center gap-2 text-xs font-bold font-code text-slate-500">
            <MessageSquare size={16} className="text-cyber" /> {comments.length} LOGS
          </div>
        </div>
      </div>

      {/* --- DISCUSSION LOG --- */}
      <div>
        <div className="flex items-center gap-2 mb-4 pl-2 border-l-2 border-cyber">
          <h3 className="text-lg font-mech font-bold text-white uppercase tracking-wider">Comm Logs</h3>
          <span className="text-xs font-code text-slate-500">({comments.length})</span>
        </div>

        <div className="bg-void-800 border border-white/5 clip-chamfer overflow-hidden flex flex-col">

          {/* Scrollable List */}
          <div
            ref={commentsContainerRef}
            className="h-[500px] overflow-y-auto p-4 space-y-4 custom-scrollbar bg-void-900/50"
          >
            {comments.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <MessageSquare size={32} className="mb-2" />
                <p className="font-code text-xs">NO ENTRIES FOUND. INITIALIZE LOG.</p>
              </div>
            )}

            {comments.map(c => {
              const isMe = c.user_id === myId;
              return (
                <div key={c.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div
                    onClick={() => navigate(isMe ? '/profile' : `/user/${c.user_id}`)}
                    className="w-8 h-8 bg-void-800 border border-white/10 clip-chamfer flex items-center justify-center shrink-0 cursor-pointer hover:border-cyber transition overflow-hidden"
                  >
                    {c.author?.avatar_url ? <img src={c.author.avatar_url} className="w-full h-full object-cover" /> : <span className="font-mech font-bold text-white text-xs">{c.author?.username?.[0]}</span>}
                  </div>

                  <div className={`flex-1 max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold font-mech uppercase tracking-wide ${isMe ? 'text-cyber' : 'text-slate-400'}`}>
                        {c.author?.username}
                      </span>
                      <span className="text-[8px] font-code text-slate-600">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className={`p-3 clip-chamfer text-sm leading-relaxed relative group border ${isMe
                      ? 'bg-cyber/10 border-cyber/30 text-white'
                      : 'bg-void-800 text-slate-300 border-white/5'
                      }`}>
                      <p>{c.content}</p>
                      {isMe && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="absolute -left-6 top-1/2 -translate-y-1/2 text-void-600 hover:text-flux opacity-0 group-hover:opacity-100 transition p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Integrated Input */}
          <div className="p-3 bg-void-950 border-t border-white/5">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 bg-void-800 hidden md:flex items-center justify-center font-mech font-bold text-white border border-white/10 clip-chamfer shrink-0 overflow-hidden">
                {myProfile?.avatar_url ? <img src={myProfile.avatar_url} className="w-full h-full object-cover" /> : (myProfile?.username?.[0] || 'U')}
              </div>

              <div className="flex-1 relative">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !submitting && handleSendComment()}
                  placeholder="APPEND_LOG_ENTRY..."
                  className="w-full bg-void-900 text-white font-code pl-4 pr-12 py-3 clip-chamfer border border-void-700 focus:border-cyber outline-none transition text-sm placeholder:text-void-600"
                />
                <button
                  onClick={handleSendComment}
                  disabled={!newComment.trim() || submitting}
                  className="absolute right-2 top-1.5 p-1.5 bg-cyber hover:bg-white text-black clip-chamfer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}