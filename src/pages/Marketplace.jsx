import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, ShoppingBag, Gamepad2, Loader2, MessageCircle, X, SlidersHorizontal, Cpu, Crosshair, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Marketplace({ session }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  const navigate = useNavigate();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => { fetchMarketplace(); }, []);

  // Scroll Logic for Sticky Header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) setIsFiltersVisible(true);
      else if (currentScrollY > lastScrollY && currentScrollY > 50) setIsFiltersVisible(false);
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  async function fetchMarketplace() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('games')
        .select(`*, owner:profiles ( username, location, avatar_url )`)
        .neq('owner_id', session.user.id)
        .in('listing_type', ['Rent', 'Sale'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) { console.error('Error loading marketplace:', error); } finally { setLoading(false); }
  }

  const filteredGames = games
    .filter(game => {
      const matchTitle = game.title.toLowerCase().includes(searchText.toLowerCase());
      const matchType = typeFilter === 'All' || game.listing_type === typeFilter;
      const matchPlatform = platformFilter === 'All' || game.platform === platformFilter;
      const ownerLocation = game.owner?.location || '';
      const matchLocation = ownerLocation.toLowerCase().includes(locationFilter.toLowerCase());
      return matchTitle && matchType && matchPlatform && matchLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'PriceLow') return a.price - b.price;
      if (sortBy === 'PriceHigh') return b.price - a.price;
      return 0;
    });

  return (
    <div className="min-h-screen pb-40 px-4 max-w-7xl mx-auto">

      {/* 1. HERO / TERMINAL HEADER */}
      <div className="relative mb-8 md:mb-12 p-1 rounded-none clip-chamfer bg-cyber/10">
        <div className="relative overflow-hidden bg-void-900 clip-chamfer border border-cyber/20">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-cyber/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-5xl font-mech font-bold text-white uppercase tracking-tighter mb-2">
                Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-500">Exchange</span>
              </h1>
              <p className="text-slate-400 font-code text-xs md:text-sm flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 bg-cyber rounded-full animate-pulse" /> LIVE MARKET DATA STREAM
              </p>
            </div>

            <div className="hidden md:flex items-center gap-4 bg-void-800/80 p-4 border border-white/10 clip-chamfer">
              <ShoppingBag className="text-cyber" size={24} />
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-mech font-bold uppercase tracking-widest">Active Listings</p>
                <p className="text-2xl font-code font-bold text-white leading-none">{games.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SCANNER BAR (Sticky) */}
      <div className={`sticky top-20 md:top-24 z-30 mb-8 transition-all duration-500 ${isFiltersVisible ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-void-900/90 backdrop-blur-xl border border-white/10 p-2 md:p-4 shadow-2xl clip-chamfer">
          <div className="flex flex-col gap-3">

            {/* Top Row: Search & Mobile Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Search className="absolute left-3 md:left-4 top-3 md:top-3.5 text-slate-500 group-focus-within:text-cyber transition" size={18} />
                <input
                  type="text"
                  placeholder="SCAN_FOR_ASSETS..."
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full bg-void-950/50 border border-void-700 text-white font-code pl-10 md:pl-12 pr-4 py-2.5 md:py-3 text-sm focus:border-cyber outline-none transition placeholder:text-void-700 clip-chamfer"
                />
              </div>
              <button className="md:hidden p-3 bg-void-800 border border-void-700 text-cyber clip-chamfer">
                <Filter size={18} />
              </button>
            </div>

            {/* Bottom Row: Filters (Horizontal Scroll on Mobile) */}
            <div className="overflow-x-auto pb-2 md:pb-0 -mx-2 px-2 md:mx-0 md:px-0 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                <div className="relative group w-[140px] md:w-[180px]">
                  <MapPin className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-cyber" size={14} />
                  <input
                    type="text"
                    placeholder="SECTOR..."
                    value={locationFilter}
                    onChange={e => setLocationFilter(e.target.value)}
                    className="w-full bg-void-950/50 border border-void-700 text-xs text-white font-code pl-8 pr-2 py-2 focus:border-cyber outline-none transition clip-chamfer"
                  />
                </div>

                {[
                  { val: platformFilter, set: setPlatformFilter, opts: ['All', 'PS5', 'PS4', 'Xbox', 'Switch', 'PC'] },
                  { val: typeFilter, set: setTypeFilter, opts: ['All', 'Rent', 'Sale'], labels: ['ALL TYPES', 'RENT', 'BUY'] },
                  { val: sortBy, set: setSortBy, opts: ['Newest', 'PriceLow', 'PriceHigh'], labels: ['NEWEST', 'PRICE: LOW', 'PRICE: HIGH'] }
                ].map((filter, i) => (
                  <select
                    key={i}
                    value={filter.val}
                    onChange={e => filter.set(e.target.value)}
                    className="bg-void-950/50 border border-void-700 text-xs text-white font-code px-3 py-2 focus:border-cyber outline-none cursor-pointer hover:bg-void-900 transition clip-chamfer appearance-none min-w-[100px]"
                  >
                    {filter.opts.map((opt, idx) => (
                      <option key={opt} value={opt}>{filter.labels ? filter.labels[idx] : opt.toUpperCase()}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ASSET GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-cyber" size={48} />
          <p className="text-cyber font-code text-xs animate-pulse">ESTABLISHING CONNECTION...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4 border border-dashed border-void-700 rounded-lg bg-void-900/30">
          <Crosshair className="text-void-700 mb-4" size={48} />
          <h3 className="text-xl font-mech font-bold text-white mb-2">TARGET NOT FOUND</h3>
          <p className="text-slate-500 font-code text-xs">Adjust scanner parameters and retry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence>
            {filteredGames.map((game) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={game.id}
                onClick={() => setSelectedGame(game)}
                className="group bg-void-800 clip-chamfer border border-white/5 hover:border-cyber/50 hover:shadow-neon-cyan transition-all duration-300 cursor-pointer flex flex-col relative"
              >
                {/* Image */}
                <div className="h-48 md:h-64 relative overflow-hidden bg-void-950 border-b border-white/5">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-void-700"><Gamepad2 size={64} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-void-900 via-transparent to-transparent opacity-90" />

                  <div className="absolute top-2 left-0 bg-cyber text-black text-[10px] font-bold font-code px-2 py-0.5 clip-chamfer">
                    {game.listing_type.toUpperCase()}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold font-code text-white">
                    {game.platform}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 md:p-5 flex flex-col flex-1">
                  <h3 className="font-mech font-bold text-white text-lg truncate mb-2 group-hover:text-cyber transition">{game.title}</h3>

                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-code font-bold text-cyber text-xl">${game.price}</span>
                    {game.listing_type === 'Rent' && <span className="text-[10px] text-slate-500 font-code">/WEEK</span>}
                  </div>

                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-void-700 border border-white/10 flex items-center justify-center overflow-hidden">
                      {game.owner?.avatar_url ? (
                        <img src={game.owner.avatar_url} className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-mech font-bold text-white text-xs">{game.owner?.username?.[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-bold truncate">{game.owner?.username}</p>
                      <p className="text-slate-500 text-[10px] font-code truncate flex items-center gap-1">
                        <MapPin size={10} /> {game.owner?.location || "UNKNOWN_SECTOR"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 4. DETAILS MODAL (Holographic) */}
      {/* 4. DETAILS MODAL (Holographic) */}
      {selectedGame && createPortal(
        <div className="fixed inset-0 bg-void-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-void-800 w-full max-w-4xl clip-chamfer border border-white/10 shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">

            <button onClick={() => setSelectedGame(null)} className="absolute top-4 right-4 z-[60] p-2 bg-black/50 hover:text-flux transition text-white rounded-full cursor-pointer pointer-events-auto">
              <X size={24} />
            </button>

            {/* Visual */}
            <div className="w-full md:w-1/2 relative bg-black h-56 md:h-auto md:min-h-[300px] shrink-0">
              {selectedGame.cover_url ? (
                <img src={selectedGame.cover_url} className="w-full h-full object-cover opacity-70" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-void-700"><Gamepad2 size={80} /></div>
              )}
              <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
            </div>

            {/* Data */}
            <div className="w-full md:w-1/2 p-6 md:p-8 bg-void-800 flex flex-col border-l border-white/5">
              <div className="mb-8">
                <div className="flex gap-2 mb-2">
                  <span className="text-cyber border border-cyber px-2 py-0.5 text-[10px] font-bold font-code">{selectedGame.listing_type.toUpperCase()}</span>
                  <span className="text-slate-400 border border-slate-600 px-2 py-0.5 text-[10px] font-bold font-code">{selectedGame.platform}</span>
                </div>
                <h2 className="text-3xl font-mech font-bold text-white uppercase mb-2 leading-none">{selectedGame.title}</h2>
                <p className="text-4xl font-code font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-500">
                  ${selectedGame.price}
                </p>
              </div>

              <div className="bg-void-900/50 p-4 border border-white/5 mb-8 clip-chamfer">
                <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-2 flex items-center gap-2 font-mech">
                  <Cpu size={12} className="text-cyber" /> Asset Description
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Asset ready for transfer. Contact owner immediately to secure this unit. This transaction is secured by the GameRoam Protocol.
                </p>
              </div>

              <div className="mt-auto space-y-4">
                <div
                  onClick={() => { setSelectedGame(null); navigate(`/user/${selectedGame.owner_id}`); }}
                  className="flex items-center gap-4 p-4 bg-void-900 border border-white/5 hover:border-cyber/30 transition cursor-pointer clip-chamfer"
                >
                  <div className="w-10 h-10 bg-void-700 flex items-center justify-center font-mech font-bold text-white border border-white/10 overflow-hidden">
                    {selectedGame.owner?.avatar_url ? (
                      <img src={selectedGame.owner.avatar_url} className="w-full h-full object-cover" alt={selectedGame.owner.username} />
                    ) : (
                      selectedGame.owner?.username?.[0]
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{selectedGame.owner?.username}</p>
                    <p className="text-slate-500 text-[10px] font-code">LOC: {selectedGame.owner?.location || "N/A"}</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/chat/${selectedGame.owner_id}`)}
                  className="w-full bg-cyber/10 hover:bg-cyber hover:text-black border border-cyber text-cyber font-mech font-bold py-4 flex items-center justify-center gap-2 transition-all clip-chamfer"
                >
                  <MessageCircle size={18} /> INITIATE_CHAT
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}