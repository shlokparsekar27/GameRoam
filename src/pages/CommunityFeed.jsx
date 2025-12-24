import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageSquare, Image as ImageIcon, Send, Loader2, Radio, TrendingUp, Shield, Flame, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

export default function CommunityFeed({ session }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [togglingLikes, setTogglingLikes] = useState(new Set());
  
  const [myProfile, setMyProfile] = useState(null);
  const myId = session.user.id;
  const fallbackName = session.user.email.split('@')[0];

  useEffect(() => {
    fetchMyProfile();
    fetchPosts();
    fetchUserLikes();
    fetchTrending();

    const channel = supabase.channel('public:community_posts')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'community_posts' }, (payload) => {
        setPosts(currentPosts => currentPosts.map(p => p.id === payload.new.id ? { ...p, likes_count: payload.new.likes_count } : p));
        fetchTrending();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'community_posts' }, () => { fetchPosts(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function fetchMyProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('id', myId).single();
    if (data) setMyProfile(data);
  }

  async function fetchPosts() {
    try {
      const { data, error } = await supabase.from('community_posts').select(`*, author:profiles(id, username, avatar_url), community_comments(count)`).order('created_at', { ascending: false });
      if (error) throw error;
      setPosts((data || []).map(post => ({ ...post, comments_count: post.community_comments?.[0]?.count || 0 })));
      setLoading(false);
    } catch (error) { console.error("Error fetching posts:", error); }
  }

  async function fetchTrending() {
    try {
      const { data } = await supabase.from('community_posts').select('id, content, likes_count, author:profiles(username)').order('likes_count', { ascending: false }).limit(3);
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
      await supabase.from('community_posts').insert({ user_id: myId, content: newPostContent, image_url: imageUrl });
      setNewPostContent('');
    } catch (e) { alert(e.message); } finally { setUploading(false); }
  }

  async function toggleLike(e, postId) {
    e.stopPropagation();
    if (togglingLikes.has(postId)) return;
    setTogglingLikes(prev => new Set(prev).add(postId));

    const isLiked = likedPosts.has(postId);
    setLikedPosts(prev => { const next = new Set(prev); isLiked ? next.delete(postId) : next.add(postId); return next; });
    setPosts(prev => prev.map(p => { if (p.id === postId) return { ...p, likes_count: isLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1 }; return p; }));

    try {
      if (isLiked) { await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', myId); await supabase.rpc('decrement_likes', { row_id: postId }); } 
      else { await supabase.from('community_likes').insert({ post_id: postId, user_id: myId }); await supabase.rpc('increment_likes', { row_id: postId }); }
    } catch (error) { console.error(error); } finally { setTogglingLikes(prev => { const next = new Set(prev); next.delete(postId); return next; }); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-20">
      
      {/* HEADER */}
      <div className="mb-10 flex items-center gap-4 border-b border-white/5 pb-6">
        <div className="p-3 bg-cyber/10 border border-cyber/30 clip-chamfer">
           <Radio className="text-cyber animate-pulse" size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-mech font-bold text-white uppercase tracking-wider">The Arena</h1>
          <p className="text-slate-500 font-code text-xs">Public Transmission Frequency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* --- LEFT COLUMN: FEED --- */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Create Post / Transmission Widget */}
          <div className="bg-void-800 clip-chamfer p-1 border border-white/10">
            <div className="bg-void-900 p-4 clip-chamfer">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-void-700 flex items-center justify-center border border-white/10 clip-chamfer shrink-0">
                  {myProfile?.avatar_url ? (
                    <img src={myProfile.avatar_url} alt="Me" className="w-full h-full object-cover" />
                  ) : (
                     <User size={20} className="text-cyber" />
                  )}
                </div>
                <textarea
                  value={newPostContent}
                  onChange={e => setNewPostContent(e.target.value)}
                  placeholder="BROADCAST_MESSAGE..."
                  className="w-full bg-transparent text-white pt-2 font-code text-sm placeholder:text-void-600 focus:outline-none resize-none h-20"
                />
              </div>
              
              <div className="flex justify-between items-center mt-3 pl-14 pt-3 border-t border-white/5">
                <div className="relative">
                  <input type="file" id="post-img" className="hidden" accept="image/*" onChange={(e) => handleCreatePost(e.target.files[0])} />
                  <label htmlFor="post-img" className="flex items-center gap-2 text-cyber text-xs font-bold font-mech uppercase hover:text-white cursor-pointer transition">
                    <ImageIcon size={14} /> Attach Visual
                  </label>
                </div>
                <button 
                  onClick={() => handleCreatePost(null)} 
                  disabled={!newPostContent.trim() && !uploading} 
                  className="bg-cyber text-black px-6 py-2 font-mech font-bold text-xs uppercase tracking-widest hover:bg-white transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed clip-chamfer"
                >
                  {uploading ? <Loader2 className="animate-spin" size={14}/> : <Send size={14} />} SEND
                </button>
              </div>
            </div>
          </div>

          {/* Feed */}
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyber" size={32} /></div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <div 
                  key={post.id} 
                  onClick={() => navigate(`/community/post/${post.id}`)}
                  className="bg-void-800 border border-white/5 clip-chamfer overflow-hidden hover:border-cyber/30 transition duration-300 cursor-pointer group"
                >
                  {/* Header */}
                  <div className="p-4 flex items-center gap-4 bg-void-900/50 border-b border-white/5">
                    <div className="w-10 h-10 bg-void-800 border border-white/10 clip-chamfer flex items-center justify-center overflow-hidden">
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="font-mech font-bold text-white">{post.author?.username?.[0]}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-mech font-bold text-white text-sm group-hover:text-cyber transition uppercase tracking-wide">
                        @{post.author?.username || 'UNKNOWN'}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-code">
                        {new Date(post.created_at).toLocaleDateString()} // {new Date(post.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">{post.content}</p>
                  </div>

                  {post.image_url && (
                    <div className="w-full bg-black border-y border-white/5">
                      <img src={post.image_url} className="w-full max-h-[500px] object-contain opacity-90" />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-5 py-3 flex items-center gap-6 bg-void-950/30">
                      <button 
                        onClick={(e) => toggleLike(e, post.id)}
                        className={`flex items-center gap-2 text-xs font-bold font-code transition-all ${likedPosts.has(post.id) ? 'text-flux' : 'text-slate-500 hover:text-flux'}`}
                      >
                        <Heart size={16} fill={likedPosts.has(post.id) ? "currentColor" : "none"} /> 
                        {post.likes_count}
                      </button>

                      <div className="flex items-center gap-2 text-xs font-bold font-code text-slate-500 group-hover:text-cyber transition">
                        <MessageSquare size={16} /> 
                        {post.comments_count}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: HUD --- */}
        <div className="hidden lg:block space-y-6">
          
          {/* Identity Module */}
          <div className="bg-void-800 border border-white/5 p-1 clip-chamfer">
            <div className="bg-void-900 p-4 clip-chamfer text-center">
              <p className="text-slate-500 font-code text-[10px] uppercase mb-2">Operator Identity</p>
              <p className="text-white font-mech font-bold text-xl uppercase tracking-wider mb-4">
                {myProfile?.username || fallbackName}
              </p>
              <Link to="/profile" className="block w-full bg-void-800 border border-white/10 hover:border-cyber text-cyber py-2 text-[10px] font-bold font-mech uppercase tracking-widest transition clip-chamfer">
                Access Profile
              </Link>
            </div>
          </div>

          {/* Trending Module */}
          <div className="bg-void-800 border border-white/5 p-1 clip-chamfer">
            <div className="bg-void-900 p-4 clip-chamfer">
              <div className="flex items-center gap-2 text-white font-mech font-bold uppercase tracking-wider mb-4 text-xs border-b border-white/5 pb-2">
                <TrendingUp size={14} className="text-cyber"/> Viral Logs
              </div>
              
              <div className="space-y-3">
                {trendingPosts.map((trend) => (
                  <div 
                    key={trend.id} 
                    onClick={() => navigate(`/community/post/${trend.id}`)}
                    className="cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-code text-slate-500 mb-1">
                      <Flame size={10} className="text-orange-500" />
                      <span>{trend.likes_count} LIKES</span>
                    </div>
                    <p className="text-xs text-slate-300 group-hover:text-cyber transition line-clamp-2 leading-relaxed">
                      {trend.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Protocols */}
          <div className="bg-void-800 border border-white/5 p-1 clip-chamfer">
             <div className="bg-void-900 p-4 clip-chamfer">
                <div className="flex items-center gap-2 text-white font-mech font-bold uppercase tracking-wider mb-4 text-xs border-b border-white/5 pb-2">
                  <Shield size={14} className="text-emerald-500"/> Protocols
                </div>
                <ul className="text-[10px] font-code text-slate-400 space-y-2 list-disc pl-3 marker:text-emerald-500">
                  <li>RESPECT FELLOW OPERATORS.</li>
                  <li>NO UNAUTHORIZED SPAM.</li>
                  <li>TRADING LIMITED TO EXCHANGE.</li>
                </ul>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}