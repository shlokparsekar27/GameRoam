import { useEffect, useState } from 'react';
import { Calendar, Flame, ArrowRight, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Community() {
  const navigate = useNavigate();
  const [upcomingGames, setUpcomingGames] = useState([]);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const apiKey = import.meta.env.VITE_RAWG_API_KEY;
        const today = new Date().toISOString().split('T')[0];
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        const res = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&dates=${today},${nextYear.toISOString().split('T')[0]}&ordering=released&page_size=4`);
        const data = await res.json();
        setUpcomingGames(data.results || []);
      } catch (e) { console.error("Game fetch error", e); }
    }
    fetchUpcoming();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-500">
      
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Village</span></h1>
        <p className="text-xl text-slate-400">Your hub for gaming news, trends, and discussions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. UPCOMING RELEASES CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition group h-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Upcoming</h2>
          </div>
          
          <div className="space-y-4">
            {upcomingGames.length === 0 ? <p className="text-slate-500">Loading...</p> : upcomingGames.map(game => (
              <div key={game.id} className="flex gap-4 items-center p-2 hover:bg-white/5 rounded-xl transition cursor-default">
                <img src={game.background_image} className="w-16 h-12 object-cover rounded-lg bg-slate-800" />
                <div>
                  <p className="text-white font-bold text-sm line-clamp-1">{game.name}</p>
                  <p className="text-xs text-slate-500">{game.released || 'TBA'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. TRENDING CARD */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition group h-full">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400">
              <Flame size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white">Trending</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {['#EldenRingDLC', '#GTA6', '#PS5Pro', '#RetroGaming', '#GameRoam', '#Tekken8', '#Speedrun', '#SetupWars'].map(tag => (
              <span key={tag} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-full text-sm font-medium hover:bg-orange-500 hover:text-white transition cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
            <p className="text-orange-400 text-sm font-bold mb-1">Hot Topic 🔥</p>
            <p className="text-slate-300 text-sm">"Is the PS5 Pro worth the upgrade?" - 342 discussions today.</p>
          </div>
        </div>

        {/* 3. VIEW POSTS (CTA) CARD */}
        <div 
          onClick={() => navigate('/community/feed')}
          className="bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 rounded-3xl p-8 cursor-pointer relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 h-full flex flex-col justify-between"
        >
           {/* Background decorative blob */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-indigo-500/30 transition"></div>

           <div>
             <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-3 bg-white/10 rounded-xl text-white">
                <MessageSquare size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white">The Arena</h2>
            </div>
            
            <p className="text-indigo-100/80 text-lg mb-8 relative z-10">
              Join the conversation. Share your setups, clips, and thoughts with the GameRoam community.
            </p>
           </div>

           <div className="flex items-center gap-2 text-white font-bold text-lg group-hover:gap-4 transition-all relative z-10">
             Enter Feed <ArrowRight />
           </div>
        </div>

      </div>
    </div>
  );
}