import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Plus, Gamepad2, Pencil, Trash2, CheckCircle,
  Archive, DollarSign, Activity, LayoutGrid, X, Cpu, Search
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';

export default function Dashboard({ session }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const [filter, setFilter] = useState('All');
  const [searchText, setSearchText] = useState('');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchGames();
    fetchProfile();
  }, [session]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsFiltersVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsFiltersVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  async function fetchProfile() {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (data) setProfile(data);
    } catch (error) { console.error('Error fetching profile:', error); }
  }

  async function fetchGames() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('games').select('*').eq('owner_id', session.user.id).order('created_at', { ascending: false });
      if (error) throw error;
      setGames(data || []);
    } catch (error) { console.error('Error fetching games:', error.message); } finally { setLoading(false); }
  }

  async function handleDelete(id) {
    if (!confirm('CONFIRM DELETION: This asset will be permanently removed from the vault.')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) {
      fetchGames();
      setSelectedGame(null); // Close modal if open
    }
  }

  const filteredGames = games.filter(game => {
    const matchesFilter = filter === 'All' ? true : game.listing_type === filter;
    const matchesSearch = game.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: games.length,
    sale: games.filter(g => g.listing_type === 'Sale').length,
    rent: games.filter(g => g.listing_type === 'Rent').length,
    library: games.filter(g => g.listing_type === 'Library').length
  };

  return (
    <>
      <div className="max-w-7xl mx-auto pb-40">

        {/* 1. HERO / COMMAND CENTER */}
        <div className="relative mb-8 md:mb-12 rounded-3xl bg-glass-panel border-0 overflow-hidden">

          {/* Background Grid */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl md:text-5xl font-mech font-bold text-white uppercase tracking-tighter mb-2">
                  Command <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-plasma">Deck</span>
                </h1>
                <p className="text-slate-400 font-code text-[10px] md:text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> SYSTEM ONLINE // VAULT ACCESS GRANTED
                </p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="group relative w-full md:w-auto px-6 py-3 bg-cyber/10 hover:bg-cyber/20 border border-cyber text-cyber font-mech font-bold tracking-widest uppercase transition-all hover:shadow-neon-cyan overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Plus size={18} /> Initialize Asset
                </span>
                <div className="absolute inset-0 bg-cyber/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </div>

            {/* STATS HUD MODULES */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: 'Total Assets', value: stats.total, color: 'text-white', icon: Cpu },
                { label: 'For Rent', value: stats.rent, color: 'text-cyber', icon: Activity },
                { label: 'For Sale', value: stats.sale, color: 'text-emerald-400', icon: DollarSign },
                { label: 'Archived', value: stats.library, color: 'text-slate-400', icon: Archive },
              ].map((stat, idx) => (
                <div key={idx} className="bg-void-950/50 border border-white/5 p-4 relative group hover:border-white/20 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-mech uppercase tracking-widest text-slate-500">{stat.label}</p>
                    <stat.icon size={14} className="text-slate-600 group-hover:text-white transition" />
                  </div>
                  <p className={`text-2xl md:text-3xl font-mech font-bold ${stat.color} text-glow`}>
                    {stat.value < 10 ? `0${stat.value}` : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. FILTER & SEARCH CONTROL STRIP */}
        <div
          className={`sticky top-20 md:top-24 z-30 mb-8 md:mb-10 transition-all duration-500 ${isFiltersVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
            }`}
        >
          <div className="flex flex-col md:flex-row gap-4 items-center bg-void-800/90 backdrop-blur-xl border border-white/10 p-2 rounded-xl shadow-2xl">

            {/* SEARCH BAR */}
            <div className="relative w-full md:w-64 group">
              <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyber transition" size={16} />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="SEARCH_VAULT..."
                className="w-full bg-void-950 border border-white/10 text-white font-code text-xs pl-10 pr-4 py-2.5 rounded-lg focus:border-cyber outline-none transition placeholder:text-void-700"
              />
            </div>

            {/* FILTERS */}
            <div className="overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex md:flex-wrap gap-2 min-w-max">
                {['All', 'Library', 'Rent', 'Sale'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-lg text-xs font-mech font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${filter === f
                      ? 'bg-cyber/10 border-cyber text-cyber shadow-neon-cyan'
                      : 'bg-transparent border-transparent text-slate-500 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {f === 'Library' ? 'Vault' : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. ASSET GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyber border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-code text-cyber text-xs animate-pulse">DECRYPTING DATA...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-void-700 rounded-3xl bg-void-900/50">
            <LayoutGrid className="text-void-700 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-mech font-bold text-slate-300">SECTOR EMPTY</h3>
            <p className="text-slate-500 font-code text-xs mb-6">No assets found matching parameters.</p>
            <button onClick={() => setIsAddModalOpen(true)} className="text-cyber font-bold hover:underline font-code text-sm">
              [INIT_NEW_ASSET]
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredGames.map((game) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={game.id}
                  onClick={() => setSelectedGame(game)}
                  className="group relative bg-void-800 cursor-pointer"
                >
                  {/* CHAMFERED CLIP & BORDER */}
                  <div className="clip-chamfer bg-void-800 border border-void-700 group-hover:border-cyber/50 transition-colors duration-300 h-full">

                    {/* Image Area */}
                    <div className="aspect-[3/4] md:aspect-[3/4] relative overflow-hidden">
                      {game.cover_url ? (
                        <img
                          src={game.cover_url}
                          alt={game.title}
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-110 group-hover:contrast-125"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-void-900 text-void-700">
                          <Gamepad2 size={48} />
                        </div>
                      )}

                      {/* Cyber Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-void-900 via-transparent to-transparent opacity-80" />

                      {/* Price Tag / Badge */}
                      <div className="absolute top-0 right-0 p-2">
                        <span className={`px-2 py-1 text-[10px] font-code font-bold border backdrop-blur-md ${game.listing_type === 'Sale' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' :
                          game.listing_type === 'Rent' ? 'bg-cyber/10 border-cyber text-cyber' :
                            'bg-slate-800/80 border-slate-600 text-slate-300'
                          }`}>
                          {game.listing_type === 'Library' ? 'VAULT' : game.listing_type.toUpperCase()}
                        </span>
                      </div>

                      {/* Hover Controls (Desktop) - Kept for consistency, but functionality also in Modal now */}
                      <div className="absolute inset-0 hidden md:flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-void-900/80 backdrop-blur-sm">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingGame(game); }}
                          className="p-3 bg-white text-black rounded-none hover:bg-cyber hover:text-black transition clip-chamfer"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(game.id); }}
                          className="p-3 bg-flux text-black rounded-none hover:bg-red-600 hover:text-white transition clip-chamfer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-4 border-t border-white/5">
                      <h3 className="font-mech font-bold text-white text-lg truncate mb-1 leading-none">{game.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-code text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{game.platform}</span>
                        <div className="font-code font-bold text-xs">
                          {game.listing_type === 'Sale' && <span className="text-emerald-400">${game.price}</span>}
                          {game.listing_type === 'Rent' && <span className="text-cyber">${game.price}/wk</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <AddGameModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onGameAdded={fetchGames} session={session} />

      {editingGame && (
        <EditGameModal game={editingGame} onClose={() => setEditingGame(null)} onGameUpdated={fetchGames} />
      )}

      {/* GAME DETAILS PORTAL (Holographic Modal) */}
      {selectedGame && createPortal(
        <div className="fixed inset-0 bg-void-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-void-800 border border-white/10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] clip-chamfer">

            <button
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-flux text-white transition rounded-full"
            >
              <X size={20} />
            </button>

            {/* Left: Cover Art */}
            <div className="w-full md:w-1/2 h-64 md:h-auto bg-black relative border-r border-white/10">
              {selectedGame.cover_url ? (
                <img src={selectedGame.cover_url} alt={selectedGame.title} className="w-full h-full object-cover opacity-80" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={64} /></div>
              )}
            </div>

            {/* Right: Data Panel */}
            <div className="w-full md:w-1/2 p-8 flex flex-col bg-void-800 relative">
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-2 py-0.5 text-[10px] font-bold font-code uppercase text-cyber border border-cyber bg-cyber/10">
                    {selectedGame.listing_type}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold font-code uppercase text-slate-400 border border-slate-600">
                    {selectedGame.platform}
                  </span>
                </div>

                <h2 className="text-4xl font-mech font-bold text-white mb-2 uppercase">{selectedGame.title}</h2>

                {selectedGame.price > 0 && (
                  <p className="text-3xl font-code font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber to-blue-500 mb-6">
                    ${selectedGame.price}
                    {selectedGame.listing_type === 'Rent' && <span className="text-sm text-slate-500 ml-1">/WEEK</span>}
                  </p>
                )}

                {/* MANAGEMENT CONSOLE (Edit/Delete) - VISIBLE ON MOBILE & DESKTOP */}
                <div className="mt-8 pt-8 border-t border-dashed border-white/10">
                  <div className="bg-void-900/50 p-4 border border-white/5">
                    <p className="text-[10px] font-mech uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                      <Cpu size={12} /> Management Console
                    </p>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setEditingGame(selectedGame); }}
                        className="flex-1 py-3 bg-white/5 hover:bg-cyber hover:text-black border border-white/10 text-white font-mech font-bold uppercase text-xs transition clip-chamfer flex items-center justify-center gap-2"
                      >
                        <Pencil size={14} /> Edit Asset
                      </button>
                      <button
                        onClick={() => { handleDelete(selectedGame.id); }}
                        className="flex-1 py-3 bg-flux/10 hover:bg-flux text-flux hover:text-black border border-flux/20 font-mech font-bold uppercase text-xs transition clip-chamfer flex items-center justify-center gap-2"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}