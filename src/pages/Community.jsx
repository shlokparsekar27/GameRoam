import { useEffect, useState } from 'react';
import { Calendar, Flame, ArrowRight, Radio, ExternalLink, Loader2, Signal, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

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

        const nextYear = new Date();
        nextYear.setFullYear(today.getFullYear() + 1);
        const nextYearStr = nextYear.toISOString().split('T')[0];

        const lastSixMonths = new Date();
        lastSixMonths.setMonth(today.getMonth() - 6);
        const lastSixMonthsStr = lastSixMonths.toISOString().split('T')[0];

        const resUpcoming = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${todayStr},${nextYearStr}&ordering=released&page_size=5`);
        const dataUpcoming = await resUpcoming.json();
        setUpcomingGames(dataUpcoming.results || []);

        const resTrending = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${lastSixMonthsStr},${todayStr}&ordering=-added&page_size=5`);
        const dataTrending = await resTrending.json();
        setTrendingGames(dataTrending.results || []);

      } catch (e) { console.error("Game fetch error", e); } finally { setLoading(false); }
    }
    fetchGames();
  }, []);

  const openGameLink = (slug) => {
    window.open(`https://rawg.io/games/${slug}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-48">

      {/* Header */}
      <div className="text-center mb-12 md:mb-16 relative">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-cyber/10 border border-cyber/20 clip-chamfer mb-6 hover:bg-cyber/20 transition cursor-default">
          <Signal className="text-cyber animate-pulse" size={14} />
          <span className="text-[10px] font-code font-bold text-cyber uppercase tracking-widest">Signal Strength: 100%</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-mech font-bold text-white mb-4 uppercase tracking-tighter">
          Sector <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-600">Comms</span>
        </h1>
        <p className="text-slate-400 font-code text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
          Global Gaming Intelligence Network. Intercepting data streams from the external web.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* 1. THE ARENA LINK (Portal) - MOVED TO FIRST POSITION */}
        <div
          onClick={() => navigate('/community/feed')}
          className="relative overflow-hidden cursor-pointer group h-full clip-chamfer border border-cyber/30 bg-void-900 transition-all duration-500 hover:border-cyber hover:shadow-neon-cyan lg:col-span-1"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyber/20 via-void-950 to-void-950 opacity-50 group-hover:opacity-100 transition duration-700" />
          <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition" />

          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 bg-cyber/10 flex items-center justify-center border border-cyber/50 mb-8 clip-chamfer group-hover:bg-cyber group-hover:text-black transition duration-500 text-cyber">
                <Globe size={32} />
              </div>
              <h2 className="text-3xl font-mech font-bold text-white uppercase mb-4 leading-none">The Arena <br /><span className="text-cyber text-lg">Public Frequency</span></h2>
              <p className="text-slate-400 font-code text-sm leading-relaxed border-l-2 border-slate-700 pl-4">
                Access the global feed. Share intel, post clips, and communicate with other operators in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3 text-cyber font-bold font-mech tracking-widest text-lg group-hover:translate-x-4 transition-transform duration-300 mt-10">
              INITIALIZE_UPLINK <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {/* 2. UPCOMING DATA STREAM */}
        <div className="bg-void-900 border border-white/10 clip-chamfer p-1 relative group h-full flex flex-col hover:border-purple-500/50 transition duration-500">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          <div className="p-6 bg-void-950/50 h-full clip-chamfer flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Calendar className="text-purple-500" size={20} />
              <h2 className="text-lg md:text-xl font-mech font-bold text-white uppercase tracking-wider">Incoming Drops</h2>
            </div>

            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-purple-500" /></div>
              ) : upcomingGames.map(game => (
                <div
                  key={game.id}
                  onClick={() => openGameLink(game.slug)}
                  className="flex gap-4 items-center p-3 hover:bg-white/5 transition cursor-pointer group/item border border-transparent hover:border-purple-500/30 clip-chamfer"
                >
                  <div className="w-12 h-12 shrink-0 bg-void-800 relative overflow-hidden clip-chamfer border border-white/10">
                    <img src={game.background_image} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate font-mech tracking-wide group-hover/item:text-purple-400 transition">{game.name}</p>
                    <p className="text-[10px] text-slate-500 font-code">{game.released || 'TBA'}</p>
                  </div>
                  <ExternalLink size={12} className="text-slate-600 group-hover/item:text-purple-500 opacity-0 group-hover/item:opacity-100 transition -translate-x-2 group-hover/item:translate-x-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. TRENDING DATA STREAM */}
        <div className="bg-void-900 border border-white/10 clip-chamfer p-1 relative group h-full flex flex-col hover:border-orange-500/50 transition duration-500">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />

          <div className="p-6 bg-void-950/50 h-full clip-chamfer flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Flame className="text-orange-500" size={20} />
              <h2 className="text-lg md:text-xl font-mech font-bold text-white uppercase tracking-wider">High Traffic</h2>
            </div>

            <div className="space-y-3 flex-1">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-500" /></div>
              ) : trendingGames.map(game => (
                <div
                  key={game.id}
                  onClick={() => openGameLink(game.slug)}
                  className="flex gap-4 items-center p-3 hover:bg-white/5 transition cursor-pointer group/item border border-transparent hover:border-orange-500/30 clip-chamfer"
                >
                  <div className="w-12 h-12 shrink-0 bg-void-800 relative overflow-hidden clip-chamfer border border-white/10">
                    <img src={game.background_image} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition duration-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-bold text-sm truncate font-mech tracking-wide group-hover/item:text-orange-400 transition">{game.name}</p>
                      {game.metacritic && (
                        <span className={`text-[9px] font-bold font-code px-1.5 py-0.5 rounded-sm ${game.metacritic >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
                          {game.metacritic}
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink size={12} className="text-slate-600 group-hover/item:text-orange-500 opacity-0 group-hover/item:opacity-100 transition -translate-x-2 group-hover/item:translate-x-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}