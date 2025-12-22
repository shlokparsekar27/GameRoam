import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  MapPin, Calendar, Loader2, Grid, ShoppingBag, Heart, MessageCircle, Camera 
} from 'lucide-react';

export default function UserProfile({ session }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); 

  // Check if this is ME
  const isMe = session?.user?.id === userId;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch User Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (profileError) throw profileError;
        setProfile(profileData);

        // 2. Fetch User's Posts
        const { data: postsData } = await supabase
          .from('community_posts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        setUserPosts(postsData || []);

        // 3. Fetch User's Public Listings (Rent or Sale ONLY)
        const { data: gamesData } = await supabase
          .from('games')
          .select('*')
          .eq('owner_id', userId)
          .in('listing_type', ['Rent', 'Sale'])
          .order('created_at', { ascending: false });
        setUserListings(gamesData || []);

      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center text-slate-500 py-20">User not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-48 text-white animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        
        {/* Avatar */}
        <div className="shrink-0">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">
                  {profile.username?.[0]?.toUpperCase()}
                </div>
              )}
           </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 text-center md:text-left w-full">
          
          {/* Username + Chat Button (JUSTIFIED APART) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-6 w-full">
            <h1 className="text-2xl md:text-3xl font-light">{profile.username}</h1>
            
            {/* NEW: Chat Button (Pushed to Right) */}
            {!isMe && (
              <button 
                onClick={() => navigate(`/chat/${userId}`)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <MessageCircle size={18} /> Message
              </button>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex justify-center md:justify-start gap-8 mb-6 text-base">
            <div className="flex gap-1">
              <span className="font-bold text-white">{userPosts.length}</span> <span className="text-slate-400">posts</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-white">{userListings.length}</span> <span className="text-slate-400">listings</span>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-1 text-sm text-slate-400">
             {profile.location && (
               <p className="flex items-center justify-center md:justify-start gap-1">
                 <MapPin size={14} /> {profile.location}
               </p>
             )}
             <p className="flex items-center justify-center md:justify-start gap-1">
               <Calendar size={14} /> Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}
             </p>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="border-t border-slate-800 mb-4">
        <div className="flex justify-center gap-12">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-4 text-xs font-bold tracking-widest uppercase border-t-2 transition ${activeTab === 'posts' ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <Grid size={12} /> Posts
          </button>
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 py-4 text-xs font-bold tracking-widest uppercase border-t-2 transition ${activeTab === 'listings' ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <ShoppingBag size={12} /> Listings
          </button>
        </div>
      </div>

      {/* --- GRID CONTENT --- */}
      
      {/* 1. POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {userPosts.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl">
              <Camera className="mx-auto mb-2 opacity-50" size={40}/>
              <p>No posts yet</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="relative aspect-square bg-slate-900 cursor-pointer group overflow-hidden border border-slate-800"
              >
                {post.image_url ? (
                  <img src={post.image_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full p-4 flex items-center justify-center bg-slate-800 text-center">
                    <p className="text-xs md:text-sm text-slate-400 line-clamp-4">{post.content}</p>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition duration-200">
                   <div className="flex items-center gap-1 font-bold">
                     <Heart className="fill-white text-white" size={20} /> {post.likes_count || 0}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. LISTINGS TAB */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
           {userListings.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl">
              <ShoppingBag className="mx-auto mb-2 opacity-50" size={40}/>
              <p>No active listings</p>
            </div>
          ) : (
            userListings.map(game => (
              <div key={game.id} className="relative aspect-square bg-slate-900 border border-slate-800 group overflow-hidden">
                {game.cover_url ? (
                  <img src={game.cover_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 font-bold">{game.title[0]}</div>
                )}
                
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                  {game.listing_type}
                </div>

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition">
                  <p className="text-xs font-bold truncate">{game.title}</p>
                  <p className="text-xs text-indigo-400 font-bold">
                    ${game.price}{game.listing_type === 'Rent' ? '/wk' : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}