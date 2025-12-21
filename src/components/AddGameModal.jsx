import { useState } from 'react';
import { X, Link as LinkIcon, Wand2, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddGameModal({ onClose, onGameAdded }) {
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('');
  const [status, setStatus] = useState('Backlog');
  const [coverUrl, setCoverUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  // --- AUTO-FETCH LOGIC ---
  async function fetchGameCover() {
    if (!title) return alert("Type a game name first!");
    
    setFetchingImage(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${title}&page_size=1`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setCoverUrl(data.results[0].background_image); // Auto-fill the URL
      } else {
        alert("No game found! Try checking the spelling.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch image. Check your API Key.");
    } finally {
      setFetchingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title) return alert('Please enter a game title');

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('items').insert({
      title,
      author: platform, 
      status,
      cover_url: coverUrl,
      user_id: user.id
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      onGameAdded();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Add New Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TITLE INPUT + MAGIC BUTTON */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Title</label>
            <div className="relative">
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-950 text-white p-3 pr-12 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
                placeholder="e.g. Elden Ring"
              />
              
              {/* THE MAGIC WAND */}
              <button
                type="button"
                onClick={fetchGameCover}
                disabled={fetchingImage || !title}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Auto-fetch Cover Art"
              >
                {fetchingImage ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              </button>
            </div>
          </div>

          {/* COVER IMAGE PREVIEW & URL */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Cover Image URL</label>
            <div className="relative mb-2">
              <LinkIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
              <input
                value={coverUrl}
                onChange={e => setCoverUrl(e.target.value)}
                className="w-full bg-slate-950 text-white pl-10 pr-3 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
                placeholder="https://..."
              />
            </div>
            
            {/* IMAGE PREVIEW */}
            {coverUrl && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800 relative group">
                <img src={coverUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Platform</label>
              <input
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
                placeholder="e.g. PS5"
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none"
              >
                <option>Backlog</option>
                <option>Playing</option>
                <option>Completed</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-4 transition shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Saving...' : 'Add to Vault'}
          </button>
        </form>
      </div>
    </div>
  );
}