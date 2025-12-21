import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, ShoppingBag, Gamepad2, Loader2, MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Marketplace({ session }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Initialize Navigation Hook
  const navigate = useNavigate();

  // Filters
  const [searchText, setSearchText] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    fetchMarketplace();
  }, []);

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
    <>
      {/* 1. MAIN PAGE CONTENT (Animated) */}
      <div className="space-y-8 animate-in fade-in duration-500 pb-12">
        
        {/* HERO / FILTERS */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-slate-900 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold text-white mb-2">Game Marketplace</h1>
            <p className="text-indigo-200 mb-6">Find your next adventure. Rent or buy from local gamers.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative group">
                <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-400 transition" size={18} />
                <input 
                  type="text" 
                  placeholder="Search titles..." 
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                />
              </div>

              {/* Location */}
              <div className="relative group">
                <MapPin className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-400 transition" size={18} />
                <input 
                  type="text" 
                  placeholder="City (e.g. New York)" 
                  value={locationFilter}
                  onChange={e => setLocationFilter(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:border-indigo-500 outline-none transition"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select 
                  value={platformFilter}
                  onChange={e => setPlatformFilter(e.target.value)}
                  className="w-1/2 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Any Platform</option>
                  <option value="PS5">PS5</option>
                  <option value="PS4">PS4</option>
                  <option value="Xbox">Xbox</option>
                  <option value="Switch">Switch</option>
                  <option value="PC">PC</option>
                </select>
                
                <select 
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="w-1/2 bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                >
                  <option value="All">Rent & Buy</option>
                  <option value="Rent">Rent</option>
                  <option value="Sale">Buy</option> 
                </select>
              </div>

              {/* Sort */}
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none appearance-none cursor-pointer"
              >
                <option value="Newest">Newest Listed</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
            <ShoppingBag className="mx-auto text-slate-700 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-500">No Listings Found</h3>
            <p className="text-slate-600 mt-2">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <div 
                key={game.id} 
                onClick={() => setSelectedGame(game)}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 hover:transform hover:scale-[1.02] transition shadow-xl flex flex-col cursor-pointer group"
              >
                <div className="h-48 relative bg-slate-950 overflow-hidden">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={48} /></div>
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                    {game.platform}
                  </div>
                  <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white uppercase shadow-lg ${
                    game.listing_type === 'Sale' ? 'bg-green-600' : 'bg-blue-600'
                  }`}>
                    {game.listing_type}
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white line-clamp-1 text-lg group-hover:text-indigo-400 transition">{game.title}</h3>
                    <p className="font-bold text-indigo-400 whitespace-nowrap">
                      ${game.price}{game.listing_type === 'Rent' && <span className="text-xs text-slate-500 font-normal">/wk</span>}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-slate-800 flex items-center gap-3">
                    {/* CLICKABLE OWNER SECTION */}
                    <div 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening game modal
                        navigate(`/user/${game.owner_id}`);
                      }}
                      className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-slate-800/50 p-1 -ml-1 rounded-lg transition"
                      title="View Seller Profile"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                        {game.owner?.avatar_url ? (
                          <img src={game.owner.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-indigo-600">
                            {game.owner?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-300 text-xs font-bold truncate group-hover:text-white transition">{game.owner?.username || "Unknown"}</p>
                        <p className="text-slate-500 text-[10px] flex items-center gap-1 truncate">
                          <MapPin size={10} /> {game.owner?.location || "No Location"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. MODAL OUTSIDE THE ANIMATED DIV (Fixes Z-Index Issue) */}
      {selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] overflow-y-auto">
            
            <button 
              onClick={() => setSelectedGame(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-slate-800 rounded-full text-white transition"
            >
              <X size={20} />
            </button>

            <div className="w-full md:w-1/2 h-64 md:h-auto bg-slate-950 relative">
              {selectedGame.cover_url ? (
                <img src={selectedGame.cover_url} alt={selectedGame.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700"><Gamepad2 size={64} /></div>
              )}
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col">
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
                <p className="text-3xl font-extrabold text-indigo-400">
                  ${selectedGame.price}<span className="text-lg text-slate-500 font-medium">{selectedGame.listing_type === 'Rent' && '/week'}</span>
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">About this listing</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selectedGame.title} is available for {selectedGame.listing_type.toLowerCase()}! 
                  The owner has listed this game in {selectedGame.platform} format.
                </p>
              </div>

              <div className="mt-auto bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                {/* CLICKABLE OWNER SECTION IN MODAL */}
                <div 
                  onClick={() => {
                    setSelectedGame(null); // Close modal
                    navigate(`/user/${selectedGame.owner_id}`);
                  }}
                  className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-slate-800 p-2 -m-2 rounded-lg transition"
                  title="View Seller Profile"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                    {selectedGame.owner?.avatar_url ? (
                      <img src={selectedGame.owner.avatar_url} alt="Owner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-indigo-600">
                        {selectedGame.owner?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white hover:text-indigo-400 underline-offset-2 group-hover:underline">{selectedGame.owner?.username}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin size={10} /> {selectedGame.owner?.location || "Unknown Location"}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    // navigate to chat directly with ID
                    navigate(`/chat/${selectedGame.owner_id}`);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/20"
                >
                  <MessageCircle size={18} /> Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}