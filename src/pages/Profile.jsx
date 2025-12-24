import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Save, X, Camera, Loader2, Grid, Archive, Heart, Gamepad2, Settings, LogOut, Phone, Cpu, User, Shield
} from 'lucide-react';

export default function Profile({ session, initialProfile, onProfileUpdate }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [myPosts, setMyPosts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); 
  const [selectedGame, setSelectedGame] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    location: '',
    avatar_url: '',
    bio: '' 
  });

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFormData({
        username: initialProfile.username || '',
        phone_number: initialProfile.phone_number || '',
        location: initialProfile.location || '',
        avatar_url: initialProfile.avatar_url || '',
        bio: initialProfile.bio || '' 
      });
      fetchMyContent();
    }
  }, [initialProfile]);

  async function fetchMyContent() {
    try {
      const { data: postsData } = await supabase.from('community_posts').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
      setMyPosts(postsData || []);

      const { data: gamesData } = await supabase.from('games').select('*').eq('owner_id', session.user.id);
      setMyListings(gamesData || []);
    } catch (error) { console.error(error); }
  }

  const handleLogout = async () => {
    if (confirm("CONFIRM: Terminate Session?")) {
      navigate('/');
      await supabase.auth.signOut();
    }
  };

  async function handleImageUpload(event) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error) { alert(error.message); } finally { setUploading(false); }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ ...formData, updated_at: new Date() }).eq('id', session.user.id);
      if (error) throw error;
      setProfile({ ...profile, ...formData });
      onProfileUpdate(); 
      setIsEditing(false);
    } catch (error) { alert(error.message); } finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pb-48 pt-28 animate-in fade-in duration-700">
      
      {/* --- 1. OPERATOR DOSSIER HEADER --- */}
      <div className="bg-void-800 border border-white/5 clip-chamfer p-1 mb-10 relative group">
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
        {/* Holographic Border Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyber/0 via-cyber/30 to-cyber/0 opacity-0 group-hover:opacity-100 transition duration-1000 blur-sm" />

        <div className="relative z-10 bg-void-900 clip-chamfer p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar Module */}
          <div className="relative shrink-0 mx-auto md:mx-0">
             <div className="w-32 h-32 clip-chamfer bg-void-800 border-2 border-white/10 p-1 overflow-hidden relative group-hover:border-cyber/50 transition">
                <div className="w-full h-full bg-void-950 clip-chamfer overflow-hidden relative">
                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20"><Loader2 className="animate-spin text-cyber" /></div>}
                    
                    {isEditing ? (
                       formData.avatar_url ? <img src={formData.avatar_url} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-void-800" />
                    ) : (
                       profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-mech font-bold text-void-700">{profile?.username?.[0]}</div>
                    )}
                    
                    {/* Scan Line Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber/10 to-transparent h-full w-full animate-[scan_2s_infinite_linear] pointer-events-none opacity-50" />
                </div>
             </div>
             
             {isEditing && (
               <>
                 <label htmlFor="pfp-upload" className="absolute -bottom-3 -right-3 p-2 bg-cyber text-black clip-chamfer cursor-pointer hover:bg-white transition shadow-neon-cyan">
                   <Camera size={16} />
                 </label>
                 <input id="pfp-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
               </>
             )}
          </div>

          {/* Data Module */}
          <div className="flex-1 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={16} className="text-cyber" />
                  <span className="text-[10px] font-code text-cyber uppercase tracking-widest">Operator Identity</span>
                </div>
                
                {isEditing ? (
                  <input 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="bg-void-950 border border-void-700 text-2xl font-mech font-bold text-white focus:border-cyber outline-none w-full md:w-auto p-2 clip-chamfer uppercase"
                    placeholder="CALLSIGN..."
                  />
                ) : (
                  <h1 className="text-4xl font-mech font-bold text-white uppercase tracking-wide mb-2">{profile?.username || "UNKNOWN_USER"}</h1>
                )}
                
                <div className="flex gap-4 text-xs font-code text-slate-500 mt-2">
                   <div className="flex items-center gap-2 px-2 py-1 bg-void-800 border border-white/5 clip-chamfer">
                      <span className="text-white font-bold">{myPosts.length}</span> LOGS
                   </div>
                   <div className="flex items-center gap-2 px-2 py-1 bg-void-800 border border-white/5 clip-chamfer">
                      <span className="text-white font-bold">{myListings.length}</span> ASSETS
                   </div>
                </div>
              </div>

              {/* Control Panel */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-void-800 border border-white/10 text-slate-400 font-code text-xs hover:text-white hover:border-white transition clip-chamfer">CANCEL</button>
                    <button onClick={handleUpdateProfile} disabled={loading} className="px-4 py-2 bg-cyber text-black font-mech font-bold text-xs hover:bg-white transition flex items-center gap-2 clip-chamfer">
                      {loading && <Loader2 size={14} className="animate-spin"/>} SAVE_CHANGES
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditing(true)} className="p-3 bg-void-800 border border-white/10 text-cyber hover:bg-cyber hover:text-black transition clip-chamfer" title="Update Registry">
                      <Settings size={18} />
                    </button>
                    <button onClick={handleLogout} className="p-3 bg-void-800 border border-white/10 text-flux hover:bg-flux hover:text-black transition clip-chamfer" title="Terminate Session">
                      <LogOut size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio / Meta Data */}
            <div className="space-y-4 max-w-2xl text-sm border-t border-white/5 pt-4">
               {isEditing ? (
                 <div className="grid grid-cols-1 gap-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <MapPin className="absolute left-3 top-3 text-slate-500 group-focus-within:text-cyber" size={14}/>
                        <input 
                          value={formData.location} 
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          placeholder="SECTOR / LOCATION"
                          className="w-full bg-void-950 border border-void-700 pl-9 pr-3 py-2.5 text-white font-code text-xs focus:border-cyber outline-none clip-chamfer"
                        />
                      </div>
                      <div className="relative group">
                        <Phone className="absolute left-3 top-3 text-slate-500 group-focus-within:text-cyber" size={14}/>
                        <input 
                          value={formData.phone_number} 
                          onChange={e => setFormData({...formData, phone_number: e.target.value})}
                          placeholder="COMM_FREQUENCY"
                          className="w-full bg-void-950 border border-void-700 pl-9 pr-3 py-2.5 text-white font-code text-xs focus:border-cyber outline-none clip-chamfer"
                        />
                      </div>
                   </div>
                   <textarea
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      placeholder="OPERATOR_BIO_DATA..."
                      className="w-full bg-void-950 border border-void-700 px-3 py-2 text-white font-code text-xs focus:border-cyber outline-none resize-none h-24 clip-chamfer"
                   />
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="text-slate-400 font-code text-xs flex items-center gap-2">
                          <MapPin size={12} className="text-cyber" /> {profile?.location || "UNKNOWN_SECTOR"}
                        </div>
                        {profile?.phone_number && (
                          <div className="text-slate-400 font-code text-xs flex items-center gap-2">
                            <Phone size={12} className="text-cyber" /> {profile.phone_number}
                          </div>
                        )}
                        <div className="text-slate-500 font-code text-xs flex items-center gap-2">
                           <Shield size={12} /> LEVEL 1 OPERATOR
                        </div>
                    </div>
                    
                    {profile?.bio && (
                      <div className="bg-void-950/50 p-3 border-l-2 border-cyber text-slate-300 font-ui text-sm leading-relaxed">
                        "{profile.bio}"
                      </div>
                    )}
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
              className={`flex items-center gap-2 px-6 py-2 font-mech font-bold uppercase tracking-wider text-xs transition-all clip-chamfer ${
                activeTab === tab 
                  ? 'bg-cyber text-black' 
                  : 'text-slate-500 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'posts' ? <Grid size={14} /> : <Archive size={14} />} 
              {tab === 'posts' ? 'Mission Logs' : 'Vault Assets'}
            </button>
          ))}
        </div>
      </div>

      {/* --- 3. GRID CONTENT --- */}
      
      {/* POSTS TAB */}
      {activeTab === 'posts' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPosts.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-void-700 bg-void-900/30 clip-chamfer">
              <Camera className="text-void-700 mx-auto mb-4" size={32}/>
              <p className="text-void-500 font-code text-xs">NO LOGS RECORDED</p>
            </div>
          ) : (
            myPosts.map(post => (
              <div 
                key={post.id} 
                onClick={() => navigate(`/community/post/${post.id}`)}
                className="group relative aspect-square bg-void-800 clip-chamfer border border-white/5 cursor-pointer hover:border-cyber/50 transition duration-300"
              >
                {post.image_url ? (
                  <img src={post.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full p-6 flex items-center justify-center bg-void-900 text-center">
                    <p className="text-slate-500 font-code text-xs italic line-clamp-4">"{post.content}"</p>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition duration-300">
                   <div className="flex items-center gap-2 font-bold font-code text-cyber text-sm">
                     <Heart className="fill-cyber" size={14} /> {post.likes_count || 0}
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VAULT TAB */}
      {activeTab === 'listings' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
           {myListings.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-dashed border-void-700 bg-void-900/30 clip-chamfer">
              <Archive className="text-void-700 mx-auto mb-4" size={32}/>
              <p className="text-void-500 font-code text-xs">VAULT EMPTY</p>
            </div>
          ) : (
            myListings.map(game => (
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
                     {game.price > 0 && <span className="text-cyber font-bold">${game.price}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* --- DETAILS MODAL --- */}
      {selectedGame && (
        <div className="fixed inset-0 bg-void-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-void-800 w-full max-w-2xl clip-chamfer border border-white/10 shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            
            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:text-flux transition text-white"><X size={20} /></button>

            <div className="w-full md:w-1/2 relative bg-black min-h-[250px]">
              {selectedGame.cover_url ? (
                 <img src={selectedGame.cover_url} className="w-full h-full object-cover opacity-80" />
              ) : (
                 <div className="w-full h-full flex items-center justify-center text-void-700"><Gamepad2 size={64} /></div>
              )}
              <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col bg-void-800 border-l border-white/5">
              <div className="mb-6">
                <div className="flex gap-2 mb-2">
                  <span className="text-cyber border border-cyber px-2 py-0.5 text-[10px] font-bold font-code">{selectedGame.listing_type.toUpperCase()}</span>
                  <span className="text-slate-400 border border-slate-600 px-2 py-0.5 text-[10px] font-bold font-code">{selectedGame.platform}</span>
                </div>
                <h2 className="text-3xl font-mech font-bold text-white uppercase mb-2 leading-none">{selectedGame.title}</h2>
                {selectedGame.price > 0 && (
                  <p className="text-2xl font-code font-bold text-cyber">
                    ${selectedGame.price}
                    {selectedGame.listing_type === 'Rent' && <span className="text-sm text-slate-500 font-normal ml-1">/WK</span>}
                  </p>
                )}
              </div>

              <div className="mt-auto bg-void-900/50 p-4 border border-white/5 clip-chamfer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-void-700 border border-white/10 clip-chamfer flex items-center justify-center text-white font-mech font-bold">
                    {profile?.username?.[0]}
                  </div>
                  <div>
                    <p className="font-mech font-bold text-white text-sm">VAULT ASSET</p>
                    <p className="text-xs font-code text-emerald-500">OWNERSHIP_VERIFIED</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}