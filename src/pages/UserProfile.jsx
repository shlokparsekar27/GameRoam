import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MapPin, Gamepad2, Loader2, Calendar, ShoppingBag } from 'lucide-react';

export default function UserProfile() {
  const { userId } = useParams(); // Get the ID from the URL
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

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

        // 2. Fetch User's Public Listings (Rent or Sale ONLY)
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('*')
          .eq('owner_id', userId)
          .in('listing_type', ['Rent', 'Sale']) // Only show public items
          .order('created_at', { ascending: false });

        if (gamesError) throw gamesError;
        setGames(gamesData || []);

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
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center gap-8">
        {/* Background Blur */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-transparent pointer-events-none" />
        
        {/* Avatar */}
        <div className="w-32 h-32 rounded-full border-4 border-slate-800 bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 z-10 relative">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-bold text-indigo-500">{profile.username?.[0]?.toUpperCase()}</span>
          )}
        </div>

        {/* Info */}
        <div className="text-center md:text-left z-10">
          <h1 className="text-4xl font-extrabold text-white mb-2">{profile.username}</h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400">
            {profile.location && (
              <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full text-sm">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1 rounded-full text-sm">
              <Calendar size={14} /> Joined {new Date(profile.created_at || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. LISTINGS GRID */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <ShoppingBag className="text-indigo-500" /> Active Listings
        </h2>

        {games.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <Gamepad2 className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500">This user hasn't listed any games yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <div key={game.id} className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 transition flex flex-col group">
                {/* Cover Image */}
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={40} /></div>
                  )}
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg ${
                    game.listing_type === 'Sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {game.listing_type}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4">
                  <h3 className="font-bold text-white truncate mb-1">{game.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{game.platform}</span>
                    <span className="font-bold text-indigo-400">
                      ${game.price}{game.listing_type === 'Rent' && '/wk'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}