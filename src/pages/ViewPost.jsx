import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Trash2, Send, Loader2, ArrowLeft } from 'lucide-react';

export default function ViewPost({ session }) {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  
  const [isToggling, setIsToggling] = useState(false);
  const myId = session.user.id;

  useEffect(() => {
    if (!postId) return;
    fetchPostData();

    // REALTIME SUBSCRIPTION
    const channel = supabase.channel(`view_post_${postId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'community_posts', 
        filter: `id=eq.${postId}` 
      }, (payload) => {
        const newCount = Math.max(0, payload.new.likes_count);
        setLikesCount(newCount);
      })
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'community_comments', 
        filter: `post_id=eq.${postId}` 
      }, (payload) => {
        fetchSingleComment(payload.new.id);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  async function fetchPostData() {
    setLoading(true);
    try {
      const { data: postData, error: postError } = await supabase
        .from('community_posts')
        .select(`*, author:profiles(id, username, avatar_url)`)
        .eq('id', postId)
        .single();

      if (postError) throw postError;
      setPost(postData);
      setLikesCount(Math.max(0, postData.likes_count));

      const { data: likeData } = await supabase
        .from('community_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', myId)
        .maybeSingle();
      
      setIsLiked(!!likeData);
      await fetchComments();

    } catch (error) {
      console.error(error);
      navigate('/community/feed');
    } finally {
      setLoading(false);
    }
  }

  async function fetchComments() {
    const { data } = await supabase
      .from('community_comments')
      .select(`*, author:profiles(id, username, avatar_url)`)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    setComments(data || []);
  }

  async function fetchSingleComment(commentId) {
    const { data } = await supabase.from('community_comments').select('*, author:profiles(id, username, avatar_url)').eq('id', commentId).single();
    if(data) setComments(prev => [...prev, data]);
  }

  async function toggleLike() {
    if (isToggling) return;
    setIsToggling(true);

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);

    try {
      if (wasLiked) {
        const { error } = await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', myId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('community_likes').insert({ post_id: postId, user_id: myId });
        if (error) throw error;
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setIsToggling(false);
    }
  }

  async function handleAddComment() {
    if (!newComment.trim()) return;
    const content = newComment;
    setNewComment('');
    await supabase.from('community_comments').insert({ post_id: postId, user_id: myId, content: content });
  }

  async function handleDeletePost() {
    if(!confirm("Delete this entire post? This cannot be undone.")) return;
    await supabase.from('community_posts').delete().eq('id', postId);
    navigate('/community/feed');
  }

  async function handleDeleteComment(commentId) {
    if(!confirm("Delete comment?")) return;
    await supabase.from('community_comments').delete().eq('id', commentId);
    setComments(prev => prev.filter(c => c.id !== commentId));
  }

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>;
  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Back Button */}
      <button onClick={() => navigate('/community/feed')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition">
        <ArrowLeft size={20} /> Back to Feed
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* --- POST HEADER --- */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${post.author?.id}`)}>
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
               {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white">{post.author?.username?.[0]}</div>}
            </div>
            <div>
              <p className="font-bold text-white hover:text-indigo-400 transition">{post.author?.username}</p>
              <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* DELETE POST BUTTON (ALWAYS VISIBLE FOR OWNER) */}
          {post.user_id === myId && (
            <button 
              onClick={handleDeletePost} 
              className="bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition text-xs font-bold flex items-center gap-2 border border-red-500/20"
            >
              <Trash2 size={14}/> Delete Post
            </button>
          )}
        </div>

        {/* --- POST CONTENT --- */}
        <div className="p-6">
          <p className="text-slate-200 text-lg whitespace-pre-wrap leading-relaxed mb-4">{post.content}</p>
          {post.image_url && (
            <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
              <img src={post.image_url} className="w-full max-h-[600px] object-contain" alt="Post" />
            </div>
          )}
        </div>

        {/* --- STATS BAR --- */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex items-center gap-6">
          <button 
            onClick={toggleLike} 
            disabled={isToggling}
            className={`flex items-center gap-2 text-lg font-bold transition ${isLiked ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'} ${isToggling ? 'opacity-50' : ''}`}
          >
            <Heart size={24} fill={isLiked ? "currentColor" : "none"} className={isLiked && !isToggling ? "animate-in zoom-in" : ""} /> 
            {likesCount}
          </button>
          <div className="flex items-center gap-2 text-lg font-bold text-slate-400">
            <MessageSquare size={24} /> {comments.length}
          </div>
        </div>

        {/* --- COMMENTS SECTION --- */}
        <div className="bg-slate-950/50 p-6 border-t border-slate-800">
          <h3 className="text-white font-bold mb-4">Comments</h3>
          
          {/* Add Comment Input */}
          <div className="flex gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">ME</div>
            <div className="flex-1 flex gap-2">
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 text-white focus:border-indigo-500 outline-none"
              />
              <button onClick={handleAddComment} disabled={!newComment.trim()} className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl disabled:opacity-50 transition">
                <Send size={20} />
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex gap-3">
                
                {/* Avatar */}
                <div 
                  onClick={() => navigate(`/user/${comment.user_id}`)}
                  className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700 mt-1 cursor-pointer hover:border-indigo-500 transition"
                >
                   {comment.author?.avatar_url ? <img src={comment.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">{comment.author?.username?.[0]}</div>}
                </div>

                <div className="flex-1">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 hover:border-slate-700 transition">
                    
                    {/* Header Row: Username + (Date & Delete) */}
                    <div className="flex justify-between items-center mb-2">
                       <span 
                         onClick={() => navigate(`/user/${comment.user_id}`)}
                         className="font-bold text-indigo-400 text-sm cursor-pointer hover:underline"
                       >
                         {comment.author?.username}
                       </span>

                       {/* Right Side Container */}
                       <div className="flex items-center gap-3 shrink-0">
                         <span className="text-[10px] text-slate-500 whitespace-nowrap">{new Date(comment.created_at).toLocaleDateString()}</span>
                         
                         {/* DELETE COMMENT BUTTON (FIXED: Always Visible, Lighter Color) */}
                         {comment.user_id === myId && (
                          <button 
                            onClick={() => handleDeleteComment(comment.id)} 
                            className="text-slate-400 hover:text-red-500 transition p-1 rounded-md hover:bg-slate-800"
                            title="Delete Comment"
                          >
                            <Trash2 size={16} />
                          </button>
                         )}
                       </div>
                    </div>

                    <p className="text-slate-300 text-sm">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}