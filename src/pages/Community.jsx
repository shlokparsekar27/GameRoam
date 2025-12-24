import { useEffect, useState } from 'react';
import { Calendar, Flame, ArrowRight, Radio, ExternalLink, Loader2, Signal } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 pb-40 pt-28">
      
      {/* Header */}
      <div className="text-center mb-16 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber/10 border border-cyber/20 rounded-full mb-4">
          <Signal className="text-cyber animate-pulse" size={14} />
          <span className="text-[10px] font-code font-bold text-cyber uppercase tracking-widest">Signal Strength: 100%</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-mech font-bold text-white mb-2 uppercase tracking-tighter">
          Sector <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-600">Comms</span>
        </h1>
        <p className="text-slate-400 font-code text-sm">Global Gaming Intelligence Network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. UPCOMING DATA STREAM */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1 relative group h-full flex flex-col">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />
          
          <div className="p-6 bg-void-900/50 h-full clip-chamfer flex flex-col">
            <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Calendar className="text-purple-500" size={20} />
              <h2 className="text-xl font-mech font-bold text-white uppercase tracking-wider">Incoming Drops</h2>
            </div>
            
            <div className="space-y-4 flex-1">
              {loading ? <Loader2 className="animate-spin mx-auto text-void-600"/> : upcomingGames.map(game => (
                <div 
                  key={game.id} 
                  onClick={() => openGameLink(game.slug)}
                  className="flex gap-4 items-center p-2 hover:bg-white/5 transition cursor-pointer group/item border-l-2 border-transparent hover:border-purple-500"
                >
                  <div className="w-12 h-12 shrink-0 bg-void-800 relative overflow-hidden clip-chamfer border border-white/10">
                    <img src={game.background_image} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate font-mech tracking-wide group-hover/item:text-purple-400 transition">{game.name}</p>
                    <p className="text-[10px] text-slate-500 font-code">{game.released || 'TBA'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. TRENDING DATA STREAM */}
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1 relative group h-full flex flex-col">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
           
           <div className="p-6 bg-void-900/50 h-full clip-chamfer flex flex-col">
             <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
              <Flame className="text-orange-500" size={20} />
              <h2 className="text-xl font-mech font-bold text-white uppercase tracking-wider">High Traffic</h2>
            </div>

            <div className="space-y-4 flex-1">
              {loading ? <Loader2 className="animate-spin mx-auto text-void-600"/> : trendingGames.map(game => (
                <div 
                  key={game.id} 
                  onClick={() => openGameLink(game.slug)}
                  className="flex gap-4 items-center p-2 hover:bg-white/5 transition cursor-pointer group/item border-l-2 border-transparent hover:border-orange-500"
                >
                  <div className="w-12 h-12 shrink-0 bg-void-800 relative overflow-hidden clip-chamfer border border-white/10">
                    <img src={game.background_image} className="w-full h-full object-cover opacity-60 group-hover/item:opacity-100 transition" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="text-white font-bold text-sm truncate font-mech tracking-wide group-hover/item:text-orange-400 transition">{game.name}</p>
                       {game.metacritic && (
                         <span className={`text-[9px] font-bold font-code px-1 ${game.metacritic >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                           [{game.metacritic}]
                         </span>
                       )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. THE ARENA LINK (Portal) */}
        <div 
          onClick={() => navigate('/community/feed')}
          className="relative overflow-hidden cursor-pointer group h-full clip-chamfer border border-cyber/30 bg-void-900"
        >
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyber/20 via-void-900 to-void-900" />
           
           <div className="relative z-10 p-8 h-full flex flex-col justify-between">
             <div>
               <div className="w-12 h-12 bg-cyber/10 flex items-center justify-center border border-cyber/50 mb-6 clip-chamfer">
                 <Radio size={24} className="text-cyber" />
               </div>
               <h2 className="text-3xl font-mech font-bold text-white uppercase mb-2">The Arena</h2>
               <p className="text-slate-400 font-code text-sm leading-relaxed">
                 Access the public frequency. Share intel, post clips, and communicate with other operators.
               </p>
             </div>

             <div className="flex items-center gap-3 text-cyber font-bold font-mech tracking-widest text-lg group-hover:translate-x-2 transition-transform mt-8">
               CONNECT <ArrowRight size={18} />
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}