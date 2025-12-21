import { useState } from 'react';
import { X, Link as LinkIcon, Wand2, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddGameModal({ isOpen, onClose, onGameAdded, session }) {
  if (!isOpen) return null;

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    platform: 'PC',
    listing_type: 'Library', // Library, Rent, Sale
    price: '',
    cover_url: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  // --- MAGIC WAND LOGIC ---
  async function fetchGameCover() {
    if (!formData.title) return alert("Type a game name first!");
    
    setFetchingImage(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      if (!apiKey) {
        alert("Missing API Key! Check your .env file.");
        return;
      }

      const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${formData.title}&page_size=1`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setFormData(prev => ({ ...prev, cover_url: data.results[0].background_image }));
      } else {
        alert("No game found! Try checking the spelling.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to fetch image.");
    } finally {
      setFetchingImage(false);
    }
  }

  // --- SUBMIT LOGIC ---
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const newGame = {
        title: formData.title,
        platform: formData.platform,
        listing_type: formData.listing_type,
        price: formData.listing_type === 'Library' ? 0 : Number(formData.price),
        cover_url: formData.cover_url,
        owner_id: session.user.id
      };

      const { error } = await supabase.from('games').insert([newGame]);

      if (error) throw error;

      onGameAdded();
      onClose();
      setFormData({ title: '', platform: 'PC', listing_type: 'Library', price: '', cover_url: '' });

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      {/* Updated Container:
          - max-h-[90vh]: Prevents modal from being taller than the screen
          - overflow-y-auto: Adds internal scrolling if content is too long
      */}
      <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition z-10">
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">Add New Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TITLE + MAGIC WAND */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Title</label>
            <div className="relative">
              <input
                autoFocus
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 text-white p-3 pr-12 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition"
                placeholder="e.g. Elden Ring"
              />
              <button
                type="button"
                onClick={fetchGameCover}
                disabled={fetchingImage || !formData.title}
                className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                title="Auto-fetch Cover Art"
              >
                {fetchingImage ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              </button>
            </div>
          </div>

          {/* COVER IMAGE + PREVIEW */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Cover Image URL</label>
            <div className="relative mb-2">
              <LinkIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
              <input
                value={formData.cover_url}
                onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                className="w-full bg-slate-950 text-white pl-10 pr-3 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
                placeholder="https://..."
              />
            </div>
            {formData.cover_url && (
              <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800 relative group">
                <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
              </div>
            )}
          </div>

          {/* PLATFORM & PURPOSE ROW */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Platform</label>
              <select
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                value={formData.platform}
                onChange={e => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="PC">PC</option>
                <option value="PS5">PlayStation 5</option>
                <option value="PS4">PlayStation 4</option>
                <option value="Xbox">Xbox Series X/S</option>
                <option value="Switch">Nintendo Switch</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Purpose</label>
              <select
                className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                value={formData.listing_type}
                onChange={e => setFormData({ ...formData, listing_type: e.target.value })}
              >
                <option value="Library">Collection</option>
                <option value="Rent">For Rent</option>
                <option value="Sale">For Sale</option>
              </select>
            </div>
          </div>

          {/* PRICE INPUT (Conditional) */}
          {formData.listing_type !== 'Library' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                {formData.listing_type === 'Rent' ? 'Weekly Price ($)' : 'Sale Price ($)'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 text-slate-500" size={16} />
                <input
                  required
                  type="number"
                  min="0"
                  className="w-full bg-slate-950 text-white pl-10 pr-3 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-4 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Add to Vault'}
          </button>
        </form>
      </div>
    </div>
  );
}