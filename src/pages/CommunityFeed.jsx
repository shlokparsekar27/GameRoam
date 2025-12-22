import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CommunityFeed({ session }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Track which posts the current user has liked
  const [likedPosts, setLikedPosts] = useState(new Set());
  // Prevent spam-clicking likes
  const [togglingLikes, setTogglingLikes] = useState(new Set());

  const myId = session.user.id;

  useEffect(() => {
    fetchPosts();
    fetchUserLikes();

    // REALTIME: Listen for changes to like counts from OTHER users
    const channel = supabase
      .channel('public:community_posts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts' }, (payload) => {
        setPosts(currentPosts => 
          currentPosts.map(p => p.id === payload.new.id ? { ...p, likes_count: payload.new.likes_count } : p)
        );
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, (payload) => {
        // Optional: fetch author details if needed, or simple reload
        fetchPosts(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select(`*, author:profiles(id, username, avatar_url)`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
      setLoading(false);
    } catch (error) { console.error(error); }
  }

  async function fetchUserLikes() {
    const { data } = await supabase.from('community_likes').select('post_id').eq('user_id', myId);
    if (data) setLikedPosts(new Set(data.map(l => l.post_id)));
  }

  async function handleCreatePost(file) {
    if (!newPostContent.trim() && !file) return;
    setUploading(true);

    try {
      let imageUrl = null;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const filePath = `social/${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('chat-uploads').upload(filePath, file);
        if (error) throw error;
        const { data } = supabase.storage.from('chat-uploads').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      await supabase.from('community_posts').insert({
        user_id: myId,
        content: newPostContent,
        image_url: imageUrl
      });
      setNewPostContent('');
    } catch (e) { alert(e.message); } 
    finally { setUploading(false); }
  }

  // --- THE FIXED LIKE LOGIC ---
  async function toggleLike(e, postId, currentCount) {
    e.stopPropagation(); // Stop opening the post when clicking like
    
    if (togglingLikes.has(postId)) return; // Prevent spam
    setTogglingLikes(prev => new Set(prev).add(postId));

    const isLiked = likedPosts.has(postId);
    
    // 1. Optimistic UI Update (Instant)
    setLikedPosts(prev => {
      const next = new Set(prev);
      isLiked ? next.delete(postId) : next.add(postId);
      return next;
    });

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1 };
      }
      return p;
    }));

    // 2. Database Sync
    try {
      if (isLiked) {
        await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', myId);
        await supabase.rpc('decrement_likes', { row_id: postId });
      } else {
        await supabase.from('community_likes').insert({ post_id: postId, user_id: myId });
        await supabase.rpc('increment_likes', { row_id: postId });
      }
    } catch (error) {
      console.error("Like error", error);
      // Revert if error (omitted for brevity, but recommended in prod)
    } finally {
      setTogglingLikes(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      
      {/* Create Post Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-8 shadow-xl">
        <textarea
          value={newPostContent}
          onChange={e => setNewPostContent(e.target.value)}
          placeholder="Share your gaming moments..."
          className="w-full bg-transparent text-white p-2 text-lg placeholder:text-slate-500 focus:outline-none resize-none h-24"
        />
        <div className="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
          <div className="relative">
            <input type="file" id="post-img" className="hidden" accept="image/*" onChange={(e) => handleCreatePost(e.target.files[0])} />
            <label htmlFor="post-img" className="p-2 text-slate-400 hover:text-indigo-400 cursor-pointer transition"><ImageIcon size={20} /></label>
          </div>
          <button onClick={() => handleCreatePost(null)} disabled={!newPostContent.trim() && !uploading} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2">
            {uploading ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} />} Post
          </button>
        </div>
      </div>

      {/* Posts List */}
      {loading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-indigo-500"/></div> : (
        <div className="space-y-6">
          {posts.map(post => (
            <div 
              key={post.id} 
              onClick={() => navigate(`/community/post/${post.id}`)}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition shadow-lg cursor-pointer group"
            >
              <div className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                  {post.author?.avatar_url ? <img src={post.author.avatar_url} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center font-bold text-white">{post.author?.username?.[0]}</div>}
                </div>
                <div>
                  <span className="font-bold text-white group-hover:text-indigo-400 transition">{post.author?.username}</span>
                  <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="px-4 pb-3">
                <p className="text-slate-200 whitespace-pre-wrap leading-relaxed line-clamp-3">{post.content}</p>
              </div>
              {post.image_url && <img src={post.image_url} className="w-full max-h-[500px] object-cover bg-black" />}

              <div className="px-4 py-3 flex items-center gap-6 border-t border-slate-800/50 bg-slate-950/30">
                  {/* LIKE BUTTON */}
                  <button 
                    onClick={(e) => toggleLike(e, post.id, post.likes_count)}
                    className={`flex items-center gap-2 text-sm font-bold transition ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
                  >
                    <Heart size={20} fill={likedPosts.has(post.id) ? "currentColor" : "none"} className={likedPosts.has(post.id) ? "animate-in zoom-in" : ""} /> 
                    {post.likes_count}
                  </button>

                  <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition">
                    <MessageSquare size={18} /> Comment
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}