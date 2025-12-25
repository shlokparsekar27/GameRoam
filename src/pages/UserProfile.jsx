import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createPortal } from 'react-dom';
import {
  MapPin, Calendar, Loader2, Grid, Archive, Heart, MessageCircle, Phone, Gamepad2, X, Shield, Radio
} from 'lucide-react';

export default function UserProfile({ session }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedGame, setSelectedGame] = useState(null);

  const isMe = session?.user?.id === userId;

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (profileError) throw profileError;
        setProfile(profileData);

        const { data: postsData } = await supabase.from('community_posts').select('*').eq('user_id', userId).order('created_at', { ascending: false });
        setUserPosts(postsData || []);

        const { data: gamesData } = await supabase.from('games').select('*').eq('owner_id', userId).in('listing_type', ['Rent', 'Sale']).order('created_at', { ascending: false });
        setUserListings(gamesData || []);
      } catch (error) { console.error("Error fetching user details:", error); }
      finally { setLoading(false); }
    }
    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-cyber" size={40} /></div>;
  if (!profile) return <div className="text-center text-cyber font-code py-40">TARGET_NOT_FOUND</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-40 animate-in fade-in duration-700">

      {/* --- 1. TARGET DOSSIER HEADER --- */}
      <div className="bg-void-800 border border-white/5 clip-chamfer p-1 mb-10 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <div className="relative z-10 bg-void-900 clip-chamfer p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 md:w-40 md:h-40 clip-chamfer bg-void-800 border border-white/10 p-1 relative group">
              {/* Decorative scanning line */}
              <div className="absolute inset-0 bg-cyber/5 animate-pulse z-10 pointer-events-none" />
              <div className="w-full h-full bg-void-950 clip-chamfer overflow-hidden flex items-center justify-center relative z-0">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
                ) : (
                  <span className="text-4xl md:text-5xl font-mech font-bold text-void-700">{profile.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 w-full text-left">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">

              <div className="flex-1">
                <div className="flex items-center justify-start gap-2 mb-2">
                  <Shield size={14} className="text-slate-500" />
                  <span className="text-[10px] font-code text-slate-500 uppercase tracking-widest">Public Dossier</span>
                </div>
                <h1 className="text-4xl font-mech font-bold text-white uppercase tracking-wide mb-2">{profile.username}</h1>

                <div className="flex items-center justify-start gap-4 text-xs font-code text-slate-500 mt-2">
                  <span className="text-white font-bold">{userPosts.length}</span> LOGS
                  <span className="text-void-700">|</span>
                  <span className="text-white font-bold">{userListings.length}</span> ASSETS
                </div>
              </div>

              {!isMe && (
                <button
                  onClick={() => navigate(`/chat/${userId}`)}
                  className="px-6 py-3 bg-cyber hover:bg-white text-black font-mech font-bold text-xs uppercase tracking-widest transition flex items-center gap-2 clip-chamfer shadow-neon-cyan"
                >
                  <MessageCircle size={16} /> INITIATE_CHAT
                </button>
              )}
            </div>

            <div className="space-y-4 max-w-2xl text-sm border-t border-white/5 pt-4">
              <div className="flex flex-wrap items-center justify-start gap-6 font-code text-xs text-slate-400">
                {profile.location && (
                  <p className="flex items-center gap-2"><MapPin size={12} className="text-cyber" /> {profile.location}</p>
                )}
                {profile.phone_number && (
                  <p className="flex items-center gap-2"><Phone size={12} className="text-cyber" /> {profile.phone_number}</p>
                )}
                <p className="flex items-center gap-2 text-slate-600">
                  <Calendar size={12} /> REG: {new Date(profile.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>

              {profile.bio && (
                <div className="bg-void-950/50 p-4 border-l-2 border-slate-700 text-slate-300 font-ui text-sm leading-relaxed text-left">
                  "{profile.bio}"
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- 2. DATA TABS --- */}
      <div className="flex justify-center mb-10">
        <div className="bg-void-800 border border-white/10 p-1 clip-chamfer flex gap-1">
          {['posts', 'listings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-2 font-mech font-bold uppercase tracking-wider text-xs transition-all clip-chamfer ${activeTab === tab
                ? 'bg-cyber text-black'
                : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
            >
              {tab === 'posts' ? <Grid size={14} /> : <Archive size={14} />}
              {tab === 'posts' ? 'Mission Logs' : 'Public Vault'}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. GRID CONTENT --- */}

      {activeTab === 'posts' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {userPosts.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-void-700 bg-void-900/30 clip-chamfer">
              <p className="text-void-500 font-code text-xs">NO PUBLIC LOGS</p>
            </div>
          ) : (
            userPosts.map(post => (
              <div
                key={post.id}
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="group relative aspect-square bg-void-800 clip-chamfer border border-white/5 cursor-pointer hover:border-cyber/50 transition duration-300"
              >
                {post.image_url ? (
                  <img src={post.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
                ) : (
                  <div className="w-full h-full p-6 flex items-center justify-center bg-void-900 text-center">
                    <p className="text-slate-500 font-code text-xs italic line-clamp-4">"{post.content}"</p>
                  </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2 font-bold font-code text-cyber text-sm">
                    <Heart className="fill-cyber" size={14} /> {post.likes_count || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'listings' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {userListings.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-void-700 bg-void-900/30 clip-chamfer">
              <p className="text-void-500 font-code text-xs">NO ASSETS DETECTED</p>
            </div>
          ) : (
            userListings.map(game => (
              <div
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group relative bg-void-800 clip-chamfer border border-white/5 cursor-pointer hover:border-cyber/50 transition duration-300"
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-void-950 border-b border-white/5">
                  {game.cover_url ? (
                    <img src={game.cover_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-void-700"><Gamepad2 size={40} /></div>
                  )}
                  <div className="absolute top-2 right-0 bg-cyber text-black text-[9px] font-bold font-code px-2 py-0.5 clip-chamfer">
                    {game.listing_type.toUpperCase()}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-mech font-bold text-white truncate mb-1 group-hover:text-cyber transition">{game.title}</h3>
                  <div className="flex justify-between items-center text-xs font-code">
                    <span className="text-slate-500">{game.platform}</span>
                    <span className="text-cyber font-bold">${game.price}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- MODAL --- */}
      {selectedGame && createPortal(
        <div className="fixed inset-0 bg-void-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-void-800 w-full max-w-2xl clip-chamfer border border-white/10 shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:text-flux transition text-white rounded-full"><X size={20} /></button>

            <div className="w-full md:w-1/2 relative bg-black h-56 md:h-auto md:min-h-[250px] shrink-0">
              {selectedGame.cover_url ? <img src={selectedGame.cover_url} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center text-void-700"><Gamepad2 size={64} /></div>}
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col bg-void-800 border-l border-white/5">
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <span className="text-cyber border border-cyber px-2 py-0.5 text-[10px] font-bold font-code">{selectedGame.listing_type.toUpperCase()}</span>
                </div>
                <h2 className="text-3xl font-mech font-bold text-white uppercase mb-2 leading-none">{selectedGame.title}</h2>
                <p className="text-2xl font-code font-bold text-cyber">${selectedGame.price}</p>
              </div>

              {!isMe && (
                <div className="mt-auto bg-void-900/50 p-4 border border-white/5 clip-chamfer">
                  <button
                    onClick={() => navigate(`/chat/${userId}`)}
                    className="w-full bg-cyber hover:bg-white text-black font-mech font-bold py-3 flex items-center justify-center gap-2 transition clip-chamfer uppercase tracking-widest text-xs"
                  >
                    <Radio size={16} /> INITIATE_CHAT
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}