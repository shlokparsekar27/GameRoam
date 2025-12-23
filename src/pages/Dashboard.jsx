import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Plus, Gamepad2, Pencil, Trash2, Clock, CheckCircle, 
  Archive, DollarSign, Activity, LayoutGrid, X, ArrowDownCircle 
} from 'lucide-react';
import { createPortal } from 'react-dom'; 
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';

export default function Dashboard({ session }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile state for the modal "Owner" section
  const [profile, setProfile] = useState(null);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null); 
  
  const [filter, setFilter] = useState('All'); 

  // Scroll Visibility State
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchGames();
    fetchProfile();
  }, [session]);

  // SCROLL LISTENER: Smart Hide Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show if scrolling UP or if near the TOP (first 100px)
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsFiltersVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Hide if scrolling DOWN and not at the top
        setIsFiltersVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  async function fetchProfile() {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }

  async function fetchGames() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games') 
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this game from your vault?')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) fetchGames();
  }

  // Filter Logic
  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    return game.listing_type === filter; 
  });

  // Derived Stats
  const stats = {
    total: games.length,
    sale: games.filter(g => g.listing_type === 'Sale').length,
    rent: games.filter(g => g.listing_type === 'Rent').length,
    library: games.filter(g => g.listing_type === 'Library').length
  };

  return (
    <>
      {/* MAIN CONTENT WRAPPER */}
      <div className="max-w-5xl mx-auto px-4 pb-40 animate-in fade-in duration-700">
        
        {/* 1. HERO / STATS HEADER */}
        <div className="relative mb-10 py-8 px-6 md:px-10 rounded-[2rem] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-1">
                  My Vault
                </h1>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Archive size={16} className="text-indigo-400"/> Manage your personal collection
                </p>
              </div>
              
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="group bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5 text-sm"
              >
                <div className="bg-white/20 p-1 rounded-md group-hover:rotate-90 transition duration-300">
                  <Plus size={16} />
                </div>
                Add Game
              </button>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Total Games</p>
                <p className="text-xl font-black text-white">{stats.total}</p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1">For Rent</p>
                <p className="text-xl font-black text-white">{stats.rent}</p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-1">For Sale</p>
                <p className="text-xl font-black text-white">{stats.sale}</p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Collection</p>
                <p className="text-xl font-black text-white">{stats.library}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FILTERS (Sticky & Smart Hide) */}
        <div 
          className={`sticky top-20 z-30 mb-8 bg-slate-950/80 backdrop-blur-lg p-2 rounded-2xl border border-white/5 shadow-2xl transition-all duration-500 ease-in-out ${
            isFiltersVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0 pointer-events-none'
          }`}
        >
          {/* UPDATED GRID: 7 Columns for Even Spacing */}
          <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
            {['All', 'Library', 'Rent', 'Rented In', 'Sale', 'Rented Out', 'Sold'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  filter === f 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f === 'Library' ? 'Collection' : f}
              </button>
            ))}
          </div>
        </div>

        {/* 3. VAULT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="bg-slate-900 p-4 rounded-full animate-bounce">
              <Gamepad2 size={32} className="text-indigo-500" />
            </div>
            <p className="text-slate-500 font-medium">Opening Vault...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800">
            <div className="bg-slate-900 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
              <LayoutGrid className="text-slate-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">It's quiet here...</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-6">Start building your legacy. Add games to your vault to track, rent, or sell them.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition"
            >
              + Add Game
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)} // CLICK TO VIEW DETAILS
                className={`group relative bg-slate-900 rounded-2xl overflow-hidden border border-white/5 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50 transition-all duration-300 cursor-pointer ${game.listing_type === 'Sold' ? 'opacity-60 grayscale' : ''}`}
              >
                
                {/* Image Container (Poster Ratio) */}
                <div className="aspect-[3/4] relative overflow-hidden bg-slate-950">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                      <Gamepad2 size={48} />
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-80 transition duration-300" />

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${
                        game.listing_type === 'Sale' ? 'bg-emerald-500/90 text-white border-emerald-400/30' :
                        game.listing_type === 'Rent' ? 'bg-indigo-500/90 text-white border-indigo-400/30' :
                        game.listing_type === 'Rented Out' ? 'bg-amber-500/90 text-white border-amber-400/30' :
                        game.listing_type === 'Rented In' ? 'bg-purple-500/90 text-white border-purple-400/30' : 
                        game.listing_type === 'Sold' ? 'bg-slate-700/90 text-slate-300 border-slate-600/30' :
                        'bg-slate-800/90 text-slate-300 border-slate-600/30'
                      }`}>
                        {game.listing_type === 'Library' ? 'Vault' : game.listing_type}
                      </span>
                  </div>

                  {/* Platform Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black/60 text-slate-300 border border-white/10 backdrop-blur-md">
                      {game.platform}
                    </span>
                  </div>

                  {/* Hover Actions Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition duration-200 backdrop-blur-[2px]">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingGame(game); }} 
                      className="bg-white text-slate-900 px-5 py-2 rounded-full font-bold text-xs hover:bg-indigo-500 hover:text-white transition transform hover:scale-105 shadow-xl flex items-center gap-2"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }} 
                      className="bg-red-500/20 text-red-400 border border-red-500/50 px-5 py-2 rounded-full font-bold text-xs hover:bg-red-500 hover:text-white transition transform hover:scale-105 shadow-xl flex items-center gap-2"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="p-3 bg-slate-900 border-t border-white/5 relative z-20">
                  <h3 className="font-bold text-white text-sm truncate mb-1" title={game.title}>{game.title}</h3>
                  
                  <div className="flex items-center justify-between text-xs">
                    {/* Dynamic Status Text */}
                    <div className="font-medium">
                      {game.listing_type === 'Sale' && <span className="text-emerald-400 flex items-center gap-1"><DollarSign size={15}/> ${game.price}</span>}
                      {game.listing_type === 'Rent' && <span className="text-indigo-400 flex items-center gap-1"><Activity size={15}/> ${game.price}/wk</span>}
                      {game.listing_type === 'Rented Out' && <span className="text-amber-500 flex items-center gap-1"><Clock size={15}/> Away</span>}
                      {game.listing_type === 'Rented In' && <span className="text-purple-400 flex items-center gap-1"><ArrowDownCircle size={15}/> Borrowed</span>}
                      {game.listing_type === 'Sold' && <span className="text-slate-500 flex items-center gap-1"><CheckCircle size={15}/> History</span>}
                      {game.listing_type === 'Library' && <span className="text-slate-500">Collection</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* --- MODALS MOVED OUTSIDE THE ANIMATED CONTAINER --- */}
      
      <AddGameModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onGameAdded={fetchGames} 
        session={session}
      />
      
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onGameUpdated={fetchGames}
        />
      )}

      {/* GAME DETAILS MODAL */}
      {selectedGame && (
        // PORTAL to body to ensure it's on top
        createPortal(
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
              
              <button 
                onClick={() => setSelectedGame(null)} 
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-white transition"
              >
                <X size={20} />
              </button>

              {/* Left: Cover Art */}
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-black relative">
                {selectedGame.cover_url ? (
                  <img src={selectedGame.cover_url} alt={selectedGame.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={64} /></div>
                )}
              </div>

              {/* Right: Details */}
              <div className="w-full md:w-1/2 p-8 flex flex-col bg-slate-900">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      selectedGame.listing_type === 'Sale' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                    }`}>
                      {selectedGame.listing_type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">{selectedGame.platform}</span>
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-white bg-indigo-600">
                          {profile?.username?.[0] || "Me"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">Stored in Vault</p>
                      <p className="text-xs text-slate-500">Owned by You</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </>
  );
}