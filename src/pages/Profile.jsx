import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, Edit2, Save, X, Camera, Loader2, Grid, ShoppingBag, Heart, MessageSquare 
} from 'lucide-react';

export default function Profile({ session, initialProfile, onProfileUpdate }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Data States
  const [myPosts, setMyPosts] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'listings'

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    location: '',
    avatar_url: ''
  });

  // Load initial data
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFormData({
        username: initialProfile.username || '',
        phone_number: initialProfile.phone_number || '',
        location: initialProfile.location || '',
        avatar_url: initialProfile.avatar_url || ''
      });
      fetchMyContent();
    }
  }, [initialProfile]);

  async function fetchMyContent() {
    try {
      // 1. Fetch My Posts
      const { data: postsData } = await supabase
        .from('community_posts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setMyPosts(postsData || []);

      // 2. Fetch My Listings (Games)
      const { data: gamesData } = await supabase
        .from('games')
        .select('*')
        .eq('owner_id', session.user.id);
      setMyListings(gamesData || []);

    } catch (error) {
      console.error("Error fetching content:", error);
    }
  }

  // Handle Logout
  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
    }
  };

  // Image Upload
  async function handleImageUpload(event) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));

    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  // Update Profile
  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          phone_number: formData.phone_number,
          location: formData.location,
          avatar_url: formData.avatar_url,
          updated_at: new Date()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...formData });
      onProfileUpdate(); 
      setIsEditing(false);
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-12 pb-48 text-white animate-in fade-in duration-500">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
        
        {/* Avatar */}
        <div className="shrink-0 relative group">
           <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-800 bg-slate-900 overflow-hidden relative">
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <Loader2 className="animate-spin text-white" />
                </div>
              )}
              
              {isEditing ? (
                 formData.avatar_url ? <img src={formData.avatar_url} className="w-full h-full object-cover opacity-50" /> : <div className="w-full h-full bg-slate-800" />
              ) : (
                 profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-600">{profile?.username?.[0]}</div>
              )}
           </div>

           {/* Edit Mode Camera Icon */}
           {isEditing && (
             <>
               <label htmlFor="pfp-upload" className="absolute inset-0 flex items-center justify-center cursor-pointer z-10 text-white font-bold opacity-0 hover:opacity-100 transition duration-300">
                 <Camera size={24} />
               </label>
               <input id="pfp-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
             </>
           )}
        </div>

        {/* Info Column */}
        <div className="flex-1 text-center md:text-left w-full">
          
          {/* Username + Buttons (JUSTIFIED APART) */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 md:mb-6 w-full">
            {isEditing ? (
              <input 
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-xl font-bold outline-none focus:border-indigo-500 w-full md:w-auto"
                placeholder="Username"
              />
            ) : (
              <h1 className="text-2xl md:text-3xl font-light">{profile?.username}</h1>
            )}

            {/* Buttons pushed to the right */}
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 rounded-lg bg-slate-800 font-bold text-sm hover:bg-slate-700 transition">Cancel</button>
                  <button onClick={handleUpdateProfile} disabled={loading} className="px-4 py-1.5 rounded-lg bg-indigo-600 font-bold text-sm hover:bg-indigo-500 transition flex items-center gap-2">
                    {loading && <Loader2 size={14} className="animate-spin"/>} Save
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIsEditing(true)} className="px-4 py-1.5 rounded-lg bg-slate-800 font-bold text-sm hover:bg-slate-700 transition">Edit Profile</button>
                  <button onClick={handleLogout} className="px-4 py-1.5 rounded-lg bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition">Logout</button>
                </>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex justify-center md:justify-start gap-8 mb-6 text-base">
            <div className="flex gap-1">
              <span className="font-bold text-white">{myPosts.length}</span> <span className="text-slate-400">posts</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-white">{myListings.length}</span> <span className="text-slate-400">listings</span>
            </div>
          </div>

          {/* Bio / Details Section */}
          <div className="space-y-1">
             <p className="font-bold text-white">{session.user.email}</p>
             
             {isEditing ? (
               <div className="space-y-2 mt-2 max-w-md">
                 <input 
                   value={formData.location} 
                   onChange={e => setFormData({...formData, location: e.target.value})}
                   placeholder="Location"
                   className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm focus:border-indigo-500 outline-none"
                 />
                 <input 
                   value={formData.phone_number} 
                   onChange={e => setFormData({...formData, phone_number: e.target.value})}
                   placeholder="Phone Number"
                   className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm focus:border-indigo-500 outline-none"
                 />
               </div>
             ) : (
               <>
                {profile?.location && (
                  <p className="text-slate-400 text-sm flex items-center justify-center md:justify-start gap-1">
                    <MapPin size={14} /> {profile.location}
                  </p>
                )}
               </>
             )}
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
      {activeTab === 'posts' && (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {myPosts.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl">
              <Camera className="mx-auto mb-2 opacity-50" size={40}/>
              <p>No posts yet</p>
            </div>
          ) : (
            myPosts.map(post => (
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

      {activeTab === 'listings' && (
        <div className="grid grid-cols-3 gap-1 md:gap-4">
           {myListings.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-slate-500 bg-slate-900/50 rounded-xl">
              <ShoppingBag className="mx-auto mb-2 opacity-50" size={40}/>
              <p>No listings yet</p>
            </div>
          ) : (
            myListings.map(game => (
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