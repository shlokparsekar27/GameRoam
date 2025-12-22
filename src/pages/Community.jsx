import { useEffect, useState } from 'react';
import { Calendar, Flame, ArrowRight, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();
  const [upcomingGames, setUpcomingGames] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGames() {
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        // 1. Setup Dates for UPCOMING (Next 1 Year)
        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        const nextYearStr = nextYear.toISOString().split('T')[0];

        // 2. Setup Dates for TRENDING (Last 6 Months)
        const lastSixMonths = new Date();
        lastSixMonths.setMonth(today.getMonth() - 6);
        const lastSixMonthsStr = lastSixMonths.toISOString().split('T')[0];
        
        // --- FETCH UPCOMING ---
        const resUpcoming = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${todayStr},${nextYearStr}&ordering=released&page_size=5`);
        const dataUpcoming = await resUpcoming.json();
        setUpcomingGames(dataUpcoming.results || []);

        // --- FETCH TRENDING (Recent & Popular) ---
        // ordering=-added means "most added to libraries" (usually implies popularity)
        const resTrending = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${lastSixMonthsStr},${todayStr}&ordering=-added&page_size=5`);
        const dataTrending = await resTrending.json();
        setTrendingGames(dataTrending.results || []);

      } catch (e) { 
        console.error("Game fetch error", e); 
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, []);

  // Helper to open game link
  const openGameLink = (slug) => {
    window.open(`https://rawg.io/games/${slug}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-80 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Village</span></h1>
        <p className="text-xl text-slate-400">Your hub for gaming news, trends, and discussions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. UPCOMING RELEASES CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-indigo-500/30 transition group h-full flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Coming Soon</h2>
          </div>
          
          <div className="space-y-4 flex-1">
            {loading ? <Loader2 className="animate-spin mx-auto text-slate-500"/> : upcomingGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => openGameLink(game.slug)}
                className="flex gap-4 items-center p-2 hover:bg-white/5 rounded-xl transition cursor-pointer group/item"
              >
                <div className="w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-800 relative">
                  <img src={game.background_image} className="w-full h-full object-cover group-hover/item:scale-110 transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate group-hover/item:text-indigo-400 transition">{game.name}</p>
                  <p className="text-xs text-slate-500">{game.released || 'TBA'}</p>
                </div>
                <ExternalLink size={14} className="text-slate-600 opacity-0 group-hover/item:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>

        {/* 2. TRENDING GAMES CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-orange-500/30 transition group h-full flex flex-col">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
              <Flame size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white">Trending Now</h2>
          </div>

          <div className="space-y-4 flex-1">
            {loading ? <Loader2 className="animate-spin mx-auto text-slate-500"/> : trendingGames.map(game => (
              <div 
                key={game.id} 
                onClick={() => openGameLink(game.slug)}
                className="flex gap-4 items-center p-2 hover:bg-white/5 rounded-xl transition cursor-pointer group/item"
              >
                <div className="w-16 h-12 shrink-0 rounded-lg overflow-hidden bg-slate-800 relative">
                  <img src={game.background_image} className="w-full h-full object-cover group-hover/item:scale-110 transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <p className="text-white font-bold text-sm truncate group-hover/item:text-orange-400 transition">{game.name}</p>
                     {game.metacritic && (
                       <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${game.metacritic >= 80 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                         {game.metacritic}
                       </span>
                     )}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {game.genres?.slice(0, 2).map(g => (
                      <span key={g.id} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 rounded">{g.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. THE ARENA (Social Feed CTA) */}
        <div 
          onClick={() => navigate('/community/feed')}
          className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 h-full flex flex-col justify-between shadow-2xl shadow-black/50"
        >
           {/* Background decorative blob */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/30 transition"></div>

           <div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-xl text-white backdrop-blur-sm">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white">The Arena</h2>
            </div>
            
            <p className="text-indigo-100/80 text-lg mb-8 relative z-10 leading-relaxed">
              Join the conversation. Share your setups, clips, and thoughts with the GameRoam community.
            </p>
           </div>

           <div className="flex items-center gap-3 text-white font-bold text-lg group-hover:translate-x-2 transition-transform relative z-10">
             Enter Feed <ArrowRight className="animate-pulse"/>
           </div>
        </div>

      </div>
    </div>
  );
}