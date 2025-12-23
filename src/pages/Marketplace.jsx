import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, ShoppingBag, Gamepad2, Loader2, MessageCircle, X, Filter, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false); // Mobile dropdown toggle

  // Scroll Visibility State
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    fetchMarketplace();
  }, []);

  // SCROLL LISTENER: Smart Hide/Show Logic
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show if scrolling UP or if near the TOP (first 50px)
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Hide if scrolling DOWN and not at the top
        setIsHeaderVisible(false);
      }
      
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
    } catch (error) {
      console.error('Error loading marketplace:', error);
    } finally {
      setLoading(false);
    }
  }

  // --- FILTER LOGIC ---
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
    <div className="min-h-screen pb-20 animate-in fade-in duration-700">
      
      {/* 1. HERO SECTION */}
      <div className="relative mb-12 py-12 px-6 md:px-12 rounded-3xl overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-3xl" />
        
        <div className="relative z-10 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 mb-2 drop-shadow-lg">
              Marketplace
            </h1>
            <p className="text-indigo-300/80 text-lg max-w-lg">
              Discover rare finds, rent weekend adventures, or trade with your local squad.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
              <div className="bg-indigo-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/40">
                <ShoppingBag size={24} />
              </div>
              <div>
                <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider">Active Listings</p>
                <p className="text-2xl font-bold text-white">{games.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR (Sticky & Smart Hide) */}
      <div 
        className={`sticky top-20 z-30 mb-8 mx-auto max-w-7xl transition-all duration-500 ease-in-out ${
          isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50">
          
          {/* Top Row: Search & Toggles */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition" size={20} />
              <input 
                type="text" 
                placeholder="Search games..." 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-3 text-white focus:border-indigo-500/50 focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500/50 outline-none transition placeholder:text-slate-600"
              />
            </div>

            {/* Mobile Filter Toggle */}
            <button 
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="md:hidden flex items-center justify-center gap-2 bg-slate-800 text-white p-3 rounded-xl border border-slate-700"
            >
              <SlidersHorizontal size={18} /> Filters
            </button>

            {/* Desktop Filters (Always Visible) & Mobile Filters (Conditional) */}
            <div className={`flex-col md:flex-row gap-4 ${showFiltersMobile ? 'flex' : 'hidden md:flex'} animate-in slide-in-from-top-2 md:animate-none`}>
              
              <div className="relative group min-w-[140px]">
                 <MapPin className="absolute left-3 top-3.5 text-slate-500 group-focus-within:text-indigo-400" size={16} />
                 <input 
                  type="text" 
                  placeholder="City..." 
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl pl-9 pr-3 py-3 text-sm text-white focus:border-indigo-500/50 outline-none transition"
                 />
              </div>

              <select 
                value={platformFilter}
                onChange={e => setPlatformFilter(e.target.value)}
                className="bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none cursor-pointer hover:bg-slate-900 transition"
              >
                <option value="All">All Platforms</option>
                <option value="PS5">PS5</option>
                <option value="PS4">PS4</option>
                <option value="Xbox">Xbox</option>
                <option value="Switch">Switch</option>
                <option value="PC">PC</option>
              </select>
              
              <select 
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none cursor-pointer hover:bg-slate-900 transition"
              >
                <option value="All">Rent & Buy</option>
                <option value="Rent">Rent Only</option>
                <option value="Sale">Buy Only</option> 
              </select>

              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none cursor-pointer hover:bg-slate-900 transition"
              >
                <option value="Newest">Newest</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 3. RESULTS GRID */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-500 font-medium animate-pulse">Scanning the vault...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-4">
          <div className="bg-slate-900/50 p-6 rounded-full border border-slate-800 mb-6">
             <Search className="text-slate-600" size={48} />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Matches Found</h3>
          <p className="text-slate-400 max-w-md">We couldn't find any games matching your filters. Try adjusting your search or check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredGames.map((game) => (
            <div 
              key={game.id} 
              onClick={() => setSelectedGame(game)}
              className="group bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-white/5 overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Cover Image */}
              <div className="h-64 relative overflow-hidden bg-slate-950">
                {game.cover_url ? (
                  <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-out" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={64} /></div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-lg border border-white/10 ${
                    game.listing_type === 'Sale' 
                    ? 'bg-emerald-500/90 text-white' 
                    : 'bg-indigo-500/90 text-white'
                  }`}>
                    {game.listing_type}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                   <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-black/60 backdrop-blur-md text-white border border-white/10 shadow-lg">
                    {game.platform}
                   </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-white text-lg line-clamp-1 group-hover:text-indigo-400 transition" title={game.title}>
                    {game.title}
                  </h3>
                </div>
                
                <div className="mb-4">
                  <p className="inline-block bg-slate-800/50 border border-slate-700 px-3 py-1 rounded-lg">
                    <span className="font-extrabold text-indigo-400 text-lg">${game.price}</span>
                    {game.listing_type === 'Rent' && <span className="text-xs text-slate-500 font-medium ml-1">/ week</span>}
                  </p>
                </div>
                
                {/* Footer / Owner Info */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-center gap-3">
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/user/${game.owner_id}`);
                    }}
                    className="flex items-center gap-3 flex-1 p-2 -ml-2 rounded-xl hover:bg-white/5 transition group/owner"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-800 p-[2px] ring-1 ring-white/10 group-hover/owner:ring-indigo-500 transition">
                      <div className="w-full h-full rounded-full overflow-hidden">
                        {game.owner?.avatar_url ? (
                          <img src={game.owner.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-indigo-600">
                            {game.owner?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-slate-300 text-xs font-bold truncate group-hover/owner:text-white transition">
                        @{game.owner?.username || "Unknown"}
                      </p>
                      <p className="text-slate-500 text-[10px] flex items-center gap-1 truncate">
                        <MapPin size={10} /> {game.owner?.location || "Earth"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. GAME DETAILS MODAL */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-4xl rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedGame(null)}
              className="absolute top-6 right-6 z-20 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-white border border-white/10 transition backdrop-blur-sm"
            >
              <X size={24} />
            </button>

            {/* Left: Image */}
            <div className="w-full md:w-1/2 relative bg-black h-72 md:h-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 md:hidden" />
              {selectedGame.cover_url ? (
                <img src={selectedGame.cover_url} alt={selectedGame.title} className="w-full h-full object-cover opacity-90" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={80} /></div>
              )}
            </div>

            {/* Right: Details */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950">
              
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    selectedGame.listing_type === 'Sale' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {selectedGame.listing_type}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedGame.platform}
                  </span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-4">{selectedGame.title}</h2>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    ${selectedGame.price}
                  </span>
                  {selectedGame.listing_type === 'Rent' && <span className="text-slate-500 font-medium">/ week</span>}
                </div>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                  <Sparkles size={12} className="text-indigo-400"/> Description
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Ready to play? This copy of <strong className="text-white">{selectedGame.title}</strong> is available now. 
                  Connect with the seller to arrange the trade!
                </p>
              </div>

              <div className="mt-auto space-y-4">
                {/* Seller Card */}
                <div 
                  onClick={() => { setSelectedGame(null); navigate(`/user/${selectedGame.owner_id}`); }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 transition cursor-pointer border border-white/5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-700 p-[2px] ring-2 ring-indigo-500/30 group-hover:ring-indigo-500 transition overflow-hidden">
                    {selectedGame.owner?.avatar_url ? (
                      <img src={selectedGame.owner.avatar_url} className="w-full h-full rounded-full object-cover"/>
                    ) : (
                      <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                         {selectedGame.owner?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg group-hover:text-indigo-400 transition">@{selectedGame.owner?.username}</p>
                    <p className="text-slate-500 text-xs flex items-center gap-1"><MapPin size={12}/> {selectedGame.owner?.location || "Nearby"}</p>
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/chat/${selectedGame.owner_id}`)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transform hover:-translate-y-0.5"
                >
                  <MessageCircle size={20} /> Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}