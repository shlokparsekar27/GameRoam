import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Search, Filter, Gamepad2, Pencil, Trash2, Clock, CheckCircle, Ban } from 'lucide-react';
import AddGameModal from '../components/AddGameModal';
import EditGameModal from '../components/EditGameModal';

export default function Dashboard({ session }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [filter, setFilter] = useState('All'); 

  useEffect(() => {
    fetchGames();
  }, [session]);

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
    if (!confirm('Are you sure you want to delete this game?')) return;
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) fetchGames();
  }

  // Filter Logic
  const filteredGames = games.filter(game => {
    if (filter === 'All') return true;
    return game.listing_type === filter; 
  });

  // Helper for badge colors
  const getBadgeStyle = (type) => {
    switch(type) {
      case 'Sale': return 'bg-green-600 text-white';
      case 'Rent': return 'bg-blue-600 text-white';
      case 'Rented Out': return 'bg-amber-600 text-white';
      case 'Rented In': return 'bg-purple-600 text-white';
      case 'Sold': return 'bg-slate-700 text-slate-300';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-80">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">My Vault</h1>
          <p className="text-slate-400 mt-1">Manage your personal collection</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} /> Add Game
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Library', 'Rent', 'Sale', 'Rented In', 'Rented Out', 'Sold'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
              filter === f 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {f === 'Library' ? 'Collection' : f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500 animate-pulse">Loading your vault...</div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-300">No games found</h3>
          <p className="text-slate-500">Add games to your collection to see them here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div 
              key={game.id} 
              className={`group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-xl transition flex flex-col relative ${game.listing_type === 'Sold' ? 'opacity-75 grayscale-[50%]' : ''}`}
            >
              
              {/* Image */}
              <div className="aspect-video bg-slate-950 relative overflow-hidden">
                {game.cover_url ? (
                  <img src={game.cover_url} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                    <Gamepad2 size={40} />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10 uppercase">
                  {game.platform}
                </div>
                
                {/* Status Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide shadow-sm ${getBadgeStyle(game.listing_type)}`}>
                  {game.listing_type === 'Library' ? 'Collection' : game.listing_type}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-white truncate mb-1">{game.title}</h3>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800/50">
                   <div className="text-sm font-medium text-slate-300">
                     {/* Dynamic Price Display */}
                     {game.listing_type === 'Sale' && <span className="text-green-400">${game.price}</span>}
                     {game.listing_type === 'Rent' && <span className="text-blue-400">${game.price}/wk</span>}
                     {game.listing_type === 'Rented Out' && <span className="text-amber-500 flex items-center gap-1"><Clock size={14}/> On Loan</span>}
                     {game.listing_type === 'Sold' && <span className="text-slate-500 flex items-center gap-1"><CheckCircle size={14}/> Sold</span>}
                     {game.listing_type === 'Library' && <span className="text-slate-500">Vault</span>}
                   </div>
                   
                   <div className="flex gap-2">
                     <button onClick={() => setEditingGame(game)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition" title="Edit Status">
                       <Pencil size={16} />
                     </button>
                     <button onClick={() => handleDelete(game.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition" title="Delete">
                       <Trash2 size={16} />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
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
    </div>
  );
}