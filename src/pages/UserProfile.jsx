import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  MapPin, Calendar, Loader2, Grid, Archive, Heart, MessageCircle, Phone, Gamepad2, X, Camera 
} from 'lucide-react';

export default function UserProfile({ session }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); 
  
  // Modal State
  const [selectedGame, setSelectedGame] = useState(null);

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
    <div className="max-w-5xl mx-auto px-4 pb-48 animate-in fade-in duration-700">
      
      {/* --- 1. COMPACT PROFILE HEADER --- */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/5 rounded-3xl p-6 md:p-8 mb-10 shadow-2xl relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Avatar Area */}
          <div className="relative group shrink-0">
             <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20">
                <div className="w-full h-full rounded-full bg-slate-900 border-4 border-slate-900 overflow-hidden relative">
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-700">
                        {profile.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                </div>
             </div>
          </div>

          {/* Info Area */}
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
              
              {/* Name & Stats */}
              <div className="flex-1">
                <h1 className="text-3xl font-black text-white tracking-tight mb-1">{profile.username}</h1>
                
                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-medium text-slate-400">
                   <span><strong className="text-white">{userPosts.length}</strong> Posts</span>
                   <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                   <span><strong className="text-white">{userListings.length}</strong> In Vault</span>
                </div>
              </div>

              {/* Action Button */}
              {!isMe && (
                <button 
                  onClick={() => navigate(`/chat/${userId}`)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition flex items-center gap-2 shadow-lg shadow-indigo-600/20 transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={18} /> Message
                </button>
              )}
            </div>

            {/* Details (Location, Phone, Joined) */}
            <div className="space-y-2 max-w-lg mx-auto md:mx-0 text-sm">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-1">
                    {profile.location && (
                      <p className="text-indigo-300 font-medium flex items-center gap-1.5">
                        <MapPin size={14} /> {profile.location}
                      </p>
                    )}
                    {profile.phone_number && (
                      <p className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Phone size={14} /> {profile.phone_number}
                      </p>
                    )}
                    <p className="text-slate-500 flex items-center gap-1.5">
                       <Calendar size={14} /> Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                    </p>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. TABS --- */}
      <div className="flex justify-center mb-8">
        <div className="bg-slate-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10 flex gap-1">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'posts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Grid size={14} /> Posts
          </button>
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === 'listings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Archive size={14} /> Vault
          </button>
        </div>
      </div>

      {/* --- 3. GRID CONTENT --- */}
      
      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
          {userPosts.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <div className="bg-slate-900/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <Camera className="text-slate-600" size={24}/>
              </div>
              <p className="text-slate-500 text-sm">No posts yet.</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="group relative aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10 transition duration-300"
              >
                {post.image_url ? (
                  <img src={post.image_url} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full p-8 flex items-center justify-center bg-slate-800/50 text-center">
                    <p className="text-slate-400 font-medium line-clamp-4 italic">"{post.content}"</p>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition duration-300 backdrop-blur-sm">
                   <div className="flex items-center gap-2 font-bold text-white text-lg">
                     <Heart className="fill-white" size={24} /> {post.likes_count || 0}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VAULT TAB (Listings) */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 animate-in slide-in-from-bottom-4 duration-500">
           {userListings.length === 0 ? (
            <div className="col-span-full py-24 text-center">
              <div className="bg-slate-900/50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 border border-slate-800">
                <Archive className="text-slate-600" size={24}/>
              </div>
              <p className="text-slate-500 text-sm">Vault is empty.</p>
            </div>
          ) : (
            userListings.map(game => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)} 
                className="group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 transition duration-300"
              >
                {/* Image Aspect Ratio Container */}
                <div className="aspect-[3/4] relative overflow-hidden bg-slate-950">
                  {game.cover_url ? (
                    <img src={game.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500 opacity-90 group-hover:opacity-100" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={40} /></div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${
                      game.listing_type === 'Sale' ? 'bg-emerald-500/80 text-white border-emerald-400/30' :
                      'bg-indigo-500/80 text-white border-indigo-400/30'
                    }`}>
                      {game.listing_type}
                    </span>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-slate-900 border-t border-white/5">
                  <h3 className="text-sm font-bold text-white truncate mb-1">{game.title}</h3>
                  <div className="flex justify-between items-center text-s">
                     <span className="text-slate-500">{game.platform}</span>
                     {game.price > 0 && (
                       <span className="text-indigo-400 font-bold">
                         ${game.price}
                         {/* UPDATED: Add /wk for Rent listings */}
                         {game.listing_type === 'Rent' && <span className="text-[12px] text-slate-500 font-normal ml-0.5">/wk</span>}
                       </span>
                     )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- GAME DETAILS MODAL --- */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-white transition"><X size={20} /></button>

            <div className="w-full md:w-1/2 h-64 md:h-auto bg-black relative">
              {selectedGame.cover_url ? (
                <img src={selectedGame.cover_url} alt={selectedGame.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={64} /></div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col bg-slate-900">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedGame.listing_type === 'Sale' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                  }`}>
                    {selectedGame.listing_type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedGame.platform}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight mb-2">{selectedGame.title}</h2>
                {selectedGame.price > 0 && (
                  <p className="text-2xl font-bold text-indigo-400">
                    ${selectedGame.price}
                    {selectedGame.listing_type === 'Rent' && <span className="text-sm text-slate-500 font-medium ml-1">/week</span>}
                  </p>
                )}
              </div>

              <div className="mt-auto bg-slate-950/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-4 p-2 -m-2 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-indigo-600">
                        {profile?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white">{profile.username}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {profile.location || "No Location"}
                    </p>
                  </div>
                </div>

                {!isMe && (
                  <button 
                    onClick={() => navigate(`/chat/${userId}`)}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                  >
                    <MessageCircle size={18} /> Chat with Seller
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}