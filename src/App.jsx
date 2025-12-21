import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import AddGameModal from './components/AddGameModal';
import EditGameModal from './components/EditGameModal';
import { Plus, LogOut, Gamepad2, Pencil, Trash2, Search, Filter, Loader2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [games, setGames] = useState([]);
  
  // NEW: Loading state for the initial Auth check
  const [authLoading, setAuthLoading] = useState(true); 
  const [gamesLoading, setGamesLoading] = useState(false);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false); // Stop loading once check is done
      if (session) fetchGames();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
      if (session) fetchGames();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchGames() {
    setGamesLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching games:', error);
    if (data) setGames(data);
    setGamesLoading(false);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this game?")) return;
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) alert("Error deleting game!");
    else fetchGames();
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Playing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Backlog': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'All' || game.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // 1. SHOW LOADING SCREEN WHILE CHECKING AUTH
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  // 2. SHOW LOGIN IF NO USER
  if (!session) return <Auth />;

  // 3. SHOW DASHBOARD
  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-1 tracking-tight">Game Vault <span className="text-indigo-500">.</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">
              {session.user.email}
            </p>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="self-start md:self-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 rounded-xlQq transition"
          >
            <LogOut size={18} />
            <span className="font-bold">Logout</span>
          </button>
        </div>

        {/* CONTROLS (Search & Filter) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2 relative group">
            <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search library..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition shadow-lg"
            />
          </div>
          <div className="relative group">
            <Filter className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 text-white pl-12 pr-4 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none cursor-pointer shadow-lg"
            >
              <option value="All">All Statuses</option>
              <option value="Backlog">Backlog</option>
              <option value="Playing">Playing</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* GRID */}
        {gamesLoading ? (
          <div className="text-center text-slate-500Vy py-20 animate-pulse">Loading vault...</div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/50Kv border-dashed">
            <Gamepad2 className="mx-auto text-slate-700 mb-4" size={48} />
            <h3 className="text-xl font-bold text-slate-500 mb-2">No Games Found</h3>
            <p className="text-slate-600">Time to expand your library.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden hover:border-indigo-500/50 hover:transform hover:scale-[1.02] transition duration-300 shadow-2xl group flex flex-col h-full">
                
                {/* IMAGE AREA */}
                <div className="h-48 w-full bg-slate-800 relative overflow-hidden">
                  {game.cover_url ? (
                    <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                      <Gamepad2 className="text-slate-700" size={48} />
                    </div>
                  )}
                </div>

                {/* CONTENT AREA */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex-1 mb-4">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{game.title}</h3>
                    
                    {/* PLATFORM + BADGE ROW */}
                    <div className="flex items-center justify-between">
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{game.author || "Unknown"}</p>
                      
                      {/* Badge */}
                      <span className={`px-2 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(game.status)}`}>
                        {game.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions Footer */}
                  <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                    <div className="flex gap-2 w-full">
                       <button 
                        onClick={() => setEditingGame(game)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-indigo-600 text-slate-400 hover:text-white rounded-lg transition flex justify-center"
                        title="Edit Game"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(game.id)}
                        className="flex-1 py-2 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition flex justify-center"
                        title="Delete Game"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* FAB */}
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-110 transition-all duration-200 z-50"
        >
          <Plus size={28} />
        </button>

        {/* MODALS */}
        {isAddModalOpen && <AddGameModal onClose={() => setIsAddModalOpen(false)} onGameAdded={fetchGames} />}
        {editingGame && <EditGameModal game={editingGame} onClose={() => setEditingGame(null)} onGameUpdated={() => { fetchGames(); setEditingGame(null); }} />}

      </div>
    </div>
  );
}