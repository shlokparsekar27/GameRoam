import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Image as ImageIcon, Send, Loader2, Sparkles, TrendingUp, Shield, Flame } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function CommunityFeed({ session }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]); // State for trending
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [togglingLikes, setTogglingLikes] = useState(new Set());
  
  // Store the full profile to get the avatar and updated username
  const [myProfile, setMyProfile] = useState(null);

  const myId = session.user.id;
  
  // Fallback if profile is loading
  const fallbackName = session.user.email.split('@')[0];

  useEffect(() => {
    fetchMyProfile();
    fetchPosts();
    fetchUserLikes();
    fetchTrending(); // <--- Fetch trending data

    const channel = supabase
      .channel('public:community_posts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts' }, (payload) => {
        // Update likes in real-time
        setPosts(currentPosts => 
          currentPosts.map(p => p.id === payload.new.id ? { ...p, likes_count: payload.new.likes_count } : p)
        );
        // Refresh trending if likes change significantly
        fetchTrending();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, () => {
        fetchPosts(); 
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMyProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', myId).single();
    if (data) setMyProfile(data);
  }

  // 1. UPDATED: Fetch Posts with Comment Count
  async function fetchPosts() {
    try {
      // We assume 'community_comments' is linked to 'community_posts' via 'post_id'
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *, 
          author:profiles(id, username, avatar_url),
          community_comments(count) 
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to flatten the count structure
      const formattedPosts = (data || []).map(post => ({
        ...post,
        comments_count: post.community_comments?.[0]?.count || 0
      }));

      setPosts(formattedPosts);
      setLoading(false);
    } catch (error) { console.error("Error fetching posts:", error); }
  }

  // 2. NEW: Fetch Trending Posts (Top 3 by Likes)
  async function fetchTrending() {
    try {
      const { data } = await supabase
        .from('community_posts')
        .select('id, content, likes_count, author:profiles(username)')
        .order('likes_count', { ascending: false })
        .limit(3);
        
      if (data) setTrendingPosts(data);
    } catch (error) { console.error("Error fetching trending:", error); }
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
      // fetchPosts will be triggered by realtime subscription
    } catch (e) { alert(e.message); } 
    finally { setUploading(false); }
  }

  async function toggleLike(e, postId) {
    e.stopPropagation();
    if (togglingLikes.has(postId)) return;
    setTogglingLikes(prev => new Set(prev).add(postId));

    const isLiked = likedPosts.has(postId);
    
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

    try {
      if (isLiked) {
        await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', myId);
        await supabase.rpc('decrement_likes', { row_id: postId });
      } else {
        await supabase.from('community_likes').insert({ post_id: postId, user_id: myId });
        await supabase.rpc('increment_likes', { row_id: postId });
      }
    } catch (error) { console.error(error); } 
    finally {
      setTogglingLikes(prev => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
      
      {/* PAGE HEADER */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl font-extrabold text-white flex items-center justify-center md:justify-start gap-2">
          <Sparkles className="text-indigo-500" /> 
          The Village
        </h1>
        <p className="text-slate-400 mt-2">See what's happening in the GameRoam universe.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- LEFT COLUMN: FEED --- */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Create Post Widget */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-4 shadow-xl focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50 transition duration-300">
            <div className="flex gap-4">
              
              {/* Dynamic Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0 overflow-hidden ring-2 ring-slate-800">
                {myProfile?.avatar_url ? (
                  <img src={myProfile.avatar_url} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  (myProfile?.username?.[0] || fallbackName[0]).toUpperCase()
                )}
              </div>

              <textarea
                value={newPostContent}
                onChange={e => setNewPostContent(e.target.value)}
                placeholder={`What's on your mind, ${myProfile?.username || fallbackName}?`}
                className="w-full bg-transparent text-white pt-2 text-lg placeholder:text-slate-500 focus:outline-none resize-none h-20"
              />
            </div>
            
            <div className="flex justify-between items-center mt-3 pl-14">
              <div className="relative">
                <input type="file" id="post-img" className="hidden" accept="image/*" onChange={(e) => handleCreatePost(e.target.files[0])} />
                <label htmlFor="post-img" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 cursor-pointer transition text-sm font-medium">
                  <ImageIcon size={18} /> Add Image
                </label>
              </div>
              <button 
                onClick={() => handleCreatePost(null)} 
                disabled={!newPostContent.trim() && !uploading} 
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl font-bold text-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
              >
                {uploading ? <Loader2 className="animate-spin" size={16}/> : <Send size={16} />} Post
              </button>
            </div>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/community/post/${post.id}`)}
                  className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition duration-300 shadow-lg cursor-pointer group"
                >
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden border border-slate-700 group-hover:border-indigo-500 transition">
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} className="w-full h-full object-cover"/>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white bg-slate-800">
                          {(post.author?.username?.[0] || '?').toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-indigo-400 transition">
                        {post.author?.username || 'Unknown Gamer'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-4">
                    <p className="text-slate-200 whitespace-pre-wrap leading-relaxed text-[15px]">{post.content}</p>
                  </div>

                  {post.image_url && (
                    <div className="w-full bg-black/50">
                      <img src={post.image_url} className="w-full max-h-[500px] object-contain" alt="Post content" />
                    </div>
                  )}

                  <div className="px-5 py-4 flex items-center gap-6 border-t border-slate-800/50 bg-slate-950/30">
                      <button 
                        onClick={(e) => toggleLike(e, post.id)}
                        className={`flex items-center gap-2 text-sm font-bold transition-all active:scale-95 ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-slate-400 hover:text-pink-500'}`}
                      >
                        <Heart size={20} fill={likedPosts.has(post.id) ? "currentColor" : "none"} className={likedPosts.has(post.id) ? "animate-in zoom-in spin-in-12" : ""} /> 
                        {post.likes_count}
                      </button>

                      <div className="flex items-center gap-2 text-sm font-bold text-slate-400 group-hover:text-indigo-400 transition">
                        <MessageSquare size={18} /> 
                        {/* Displaying Real Comment Count */}
                        {post.comments_count}
                      </div>
                  </div>
                </div>
              ))}
              
              {posts.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                  <p>No posts yet. Be the first to start the conversation!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: SIDEBAR (Desktop Only) --- */}
        <div className="hidden lg:block space-y-6">
          
          {/* Mini Profile Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-1">Welcome back</h3>
            <p className="text-indigo-400 font-bold text-xl mb-4">
              {myProfile?.username || fallbackName}
            </p>
            <div className="space-y-2">
              <Link to="/profile" className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-sm font-medium transition">
                View Profile
              </Link>
            </div>
          </div>

          {/* REAL Trending Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <TrendingUp size={18} className="text-pink-500"/>
              <span>Trending Now</span>
            </div>
            
            <div className="space-y-4">
              {trendingPosts.length > 0 ? (
                trendingPosts.map((trend, index) => (
                  <div 
                    key={trend.id} 
                    onClick={() => navigate(`/community/post/${trend.id}`)}
                    className="group cursor-pointer border-b border-slate-800/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Flame size={12} className="text-orange-500" />
                      <span>{trend.likes_count} Likes</span>
                    </div>
                    <p className="text-sm text-slate-300 font-medium group-hover:text-indigo-400 transition line-clamp-2">
                      {trend.content}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-1">
                      by {trend.author?.username}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No trending posts yet.</p>
              )}
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <Shield size={18} className="text-emerald-500"/>
              <span>Village Rules</span>
            </div>
            <ul className="text-sm text-slate-400 space-y-3 list-disc pl-4 marker:text-slate-600">
              <li>Be respectful to fellow gamers.</li>
              <li>No spam or self-promotion.</li>
              <li>Keep trading discussions in the Marketplace.</li>
              <li>Have fun!</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}