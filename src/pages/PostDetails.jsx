import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Send, Loader2, MessageSquare, Trash2, Calendar, Clock, Heart } from 'lucide-react';

export default function PostDetails({ session }) {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  // Post & Comments State
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Like Logic State
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);

  // Comment Input State
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // User Profile State
  const [myProfile, setMyProfile] = useState(null);
  const commentsEndRef = useRef(null);

  const myId = session.user.id;
  const fallbackName = session.user.email.split('@')[0];

  useEffect(() => {
    fetchMyProfile();
    fetchPostAndComments();
    fetchLikeStatus();

    // Realtime subscription for comments and likes
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

  // Scroll to bottom whenever comments update
  useEffect(() => {
    if (comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length]);

  async function fetchMyProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', myId).single();
    if (data) setMyProfile(data);
  }

  async function fetchPostAndComments() {
    try {
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select('*, author:profiles(id, username, avatar_url)')
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData);
      setLikesCount(postData.likes_count || 0);

      const { data: commentsData } = await supabase
        .from('community_comments')
        .select('*, author:profiles(id, username, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);
    } catch (error) {
      console.error("Error loading post:", error);
      navigate('/community/feed'); 
    } finally { setLoading(false); }
  }

  async function fetchLikeStatus() {
    const { data } = await supabase.from('community_likes').select('id').eq('post_id', postId).eq('user_id', myId).maybeSingle();
    setIsLiked(!!data);
  }

  async function fetchSingleComment(commentId) {
    const { data } = await supabase.from('community_comments').select('*, author:profiles(id, username, avatar_url)').eq('id', commentId).single();
    if (data) {
      setComments(prev => prev.some(c => c.id === data.id) ? prev : [...prev, data]);
    }
  }

  async function toggleLike(e) {
    e.stopPropagation();
    if (togglingLike) return;
    setTogglingLike(true);

    const previousLiked = isLiked;
    // Optimistic UI Update
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
      // Revert on error
      console.error(error);
      setIsLiked(previousLiked);
      setLikesCount(prev => previousLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setTogglingLike(false);
    }
  }

  async function handleDeletePost() {
    if (!confirm("Are you sure you want to delete this post?")) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    navigate('/community/feed'); 
  }

  async function handleSendComment() {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const content = newComment;
    setNewComment(''); 
    await supabase.from('community_comments').insert({ post_id: postId, user_id: myId, content });
    setSubmitting(false);
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Delete this comment?")) return;
    await supabase.from('community_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 pb-20">
      
      {/* Navigation */}
      <button onClick={() => navigate('/community/feed')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition px-4 md:px-0">
        <ArrowLeft size={20} /> Back to Village
      </button>

      {/* --- MAIN POST CARD --- */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden mb-8 shadow-2xl mx-4 md:mx-0">
        
        {/* Post Header */}
        <div className="p-6 flex justify-between items-start border-b border-slate-800/50">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(post.user_id === myId ? '/profile' : `/user/${post.user_id}`)}>
            <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden ring-2 ring-transparent hover:ring-indigo-500 transition duration-300">
               {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-xl">{post.author?.username?.[0]}</div>}
            </div>
            <div>
              <h2 className="font-bold text-white text-xl hover:text-indigo-400 transition">{post.author?.username}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(post.created_at).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(post.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            </div>
          </div>

          {post.user_id === myId && (
            <button onClick={handleDeletePost} className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 p-2.5 rounded-xl transition">
              <Trash2 size={20} />
            </button>
          )}
        </div>
        
        {/* Post Content */}
        <div className="p-6 md:p-8">
          <p className="text-slate-100 whitespace-pre-wrap text-lg leading-relaxed">{post.content}</p>
        </div>

        {post.image_url && (
          <div className="w-full bg-black/80 flex justify-center">
            <img src={post.image_url} className="max-h-[700px] w-auto max-w-full object-contain" alt="Post" />
          </div>
        )}
        
        {/* Post Footer Actions */}
        <div className="px-6 py-4 bg-slate-950/30 text-sm font-bold text-slate-400 flex items-center gap-6 border-t border-slate-800/50">
           {/* LIKE BUTTON */}
           <button 
             onClick={toggleLike}
             className={`flex items-center gap-2 text-sm font-bold transition-all active:scale-95 ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
           >
             <Heart size={20} fill={isLiked ? "currentColor" : "none"} className={isLiked ? "animate-in zoom-in spin-in-12" : ""} /> 
             {likesCount}
           </button>

           <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-indigo-500"/> {comments.length} Comments
           </div>
        </div>
      </div>

      {/* --- DISCUSSION CONTAINER (Box + Input) --- */}
      <div className="px-4 md:px-0">
        <h3 className="text-xl font-bold text-white mb-6 pl-2 border-l-4 border-indigo-500">Discussion</h3>
        
        {/* Unified Box for List + Input */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          
          {/* 1. SCROLLABLE COMMENT LIST */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-6 custom-scrollbar">
            {comments.length === 0 && (
               <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                  <MessageSquare size={48} className="mb-2"/>
                  <p>No comments yet. Start the conversation!</p>
               </div>
            )}

            {comments.map(c => {
              const isMe = c.user_id === myId;
              return (
                <div key={c.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div 
                    onClick={() => navigate(isMe ? '/profile' : `/user/${c.user_id}`)}
                    className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700 cursor-pointer hover:border-indigo-500 transition"
                  >
                     {c.author?.avatar_url ? <img src={c.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">{c.author?.username?.[0]}</div>}
                  </div>

                  {/* Comment Bubble */}
                  <div className={`flex-1 max-w-[80%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    
                    {/* UPDATED: Username is now clickable */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span 
                        onClick={() => navigate(isMe ? '/profile' : `/user/${c.user_id}`)}
                        className="text-xs font-bold text-slate-400 cursor-pointer hover:text-indigo-400 transition"
                      >
                        {c.author?.username}
                      </span>
                      <span className="text-[10px] text-slate-600">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group
                      ${isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-tl-none'}`}>
                      
                      <p>{c.content}</p>

                      {/* Delete Button (Only on hover) */}
                      {isMe && (
                        <button 
                          onClick={() => handleDeleteComment(c.id)} 
                          className="absolute -left-8 top-1/2 -translate-y-1/2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Scroll Anchor */}
            <div ref={commentsEndRef} />
          </div>

          {/* 2. INTEGRATED INPUT AREA (Bottom of the box) */}
          <div className="p-4 bg-slate-950/50 border-t border-slate-800">
            <div className="flex gap-4 items-center">
               
               {/* UPDATED: Dynamic User Avatar */}
               <div className="w-10 h-10 rounded-full bg-indigo-600 hidden md:flex items-center justify-center font-bold text-white border border-slate-700 shrink-0 overflow-hidden">
                 {myProfile?.avatar_url ? (
                   <img src={myProfile.avatar_url} alt="Me" className="w-full h-full object-cover" />
                 ) : (
                   (myProfile?.username?.[0] || fallbackName[0]).toUpperCase()
                 )}
               </div>

               <div className="flex-1 relative">
                  <input 
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !submitting && handleSendComment()}
                    placeholder="Join the discussion..."
                    className="w-full bg-slate-900 text-white pl-5 pr-14 py-3.5 rounded-full border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition shadow-lg"
                  />
                  <button 
                    onClick={handleSendComment}
                    disabled={!newComment.trim() || submitting}
                    className="absolute right-2 top-1.5 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18}/> : <Send size={18} />}
                  </button>
               </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}