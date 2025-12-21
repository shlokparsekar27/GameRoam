import { useState } from 'react';
import { X, Link as LinkIcon, Wand2, Loader2, DollarSign, Calendar, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AddGameModal({ isOpen, onClose, onGameAdded, session }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    title: '',
    platform: 'PC',
    listing_type: 'Library', 
    price: '', 
    cover_url: '',
    // TRACKING FIELDS
    transaction_price: '', 
    transaction_date: '',  
    return_date: ''        
  });

  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  // --- MAGIC WAND LOGIC ---
  async function fetchGameCover() {
    if (!formData.title) return alert("Type a game name first!");
    
    setFetchingImage(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      if (!apiKey) return alert("Missing API Key!");

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

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const newGame = {
        title: formData.title,
        platform: formData.platform,
        listing_type: formData.listing_type,
        // If Library/Sold/Rented Out, listing price is 0
        price: (formData.listing_type === 'Rent' || formData.listing_type === 'Sale') ? Number(formData.price) : 0,
        cover_url: formData.cover_url,
        owner_id: session.user.id,
        // Tracking Updates
        transaction_price: formData.transaction_price ? Number(formData.transaction_price) : null,
        transaction_date: formData.transaction_date || null,
        return_date: formData.return_date || null
      };

      const { error } = await supabase.from('games').insert([newGame]);
      if (error) throw error;

      onGameAdded();
      onClose();
      // Reset Form
      setFormData({ 
        title: '', platform: 'PC', listing_type: 'Library', price: '', cover_url: '',
        transaction_price: '', transaction_date: '', return_date: ''
      });

    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition z-10"><X size={24} /></button>
        <h2 className="text-2xl font-bold text-white mb-6">Add New Game</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* TITLE & COVER */}
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Title</label>
            <div className="relative">
              <input autoFocus value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-950 text-white p-3 pr-12 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none transition" placeholder="e.g. Elden Ring" />
              <button type="button" onClick={fetchGameCover} disabled={fetchingImage || !formData.title} className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"><Wand2 size={16} /></button>
            </div>
          </div>
          <div>
             <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Cover Image URL</label>
             <div className="relative mb-2">
               <LinkIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
               <input value={formData.cover_url} onChange={e => setFormData({ ...formData, cover_url: e.target.value })} className="w-full bg-slate-950 text-white pl-10 pr-3 py-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none" />
             </div>
             {formData.cover_url && <div className="h-32 w-full rounded-xl overflow-hidden border border-slate-800 relative"><img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover opacity-80" /></div>}
          </div>

          {/* SETTINGS */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Platform</label>
              <select className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none cursor-pointer" value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })}>
                <option value="PC">PC</option><option value="PS5">PlayStation 5</option><option value="PS4">PlayStation 4</option><option value="Xbox">Xbox</option><option value="Switch">Switch</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Status</label>
              <select className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none appearance-none cursor-pointer" value={formData.listing_type} onChange={e => setFormData({ ...formData, listing_type: e.target.value })}>
                <optgroup label="Active">
                  <option value="Library">My Collection</option>
                  <option value="Rent">List for Rent</option>
                  <option value="Sale">List for Sale</option>
                </optgroup>
                <optgroup label="Lifecycle">
                  <option value="Rented Out">Rented Out (Away)</option>
                  <option value="Rented In">Rented In (Borrowed)</option>
                  <option value="Sold">Sold (History)</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* DYNAMIC FIELDS based on Status */}
          <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 space-y-3 animate-in slide-in-from-top-2">
            
            {/* 1. LISTING PRICE (Rent/Sale) */}
            {['Rent', 'Sale'].includes(formData.listing_type) && (
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Listing Price ($)</label>
                <input required type="number" min="0" className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            )}

            {/* 2. PURCHASE DETAILS (Library) */}
            {formData.listing_type === 'Library' && (
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Bought Price</label>
                  <div className="relative"><DollarSign className="absolute left-2 top-2.5 text-slate-600" size={12} />
                  <input type="number" min="0" className="w-full bg-slate-900 text-white pl-6 p-2 rounded-lg border border-slate-700 text-sm" placeholder="0.00" value={formData.transaction_price} onChange={e => setFormData({ ...formData, transaction_price: e.target.value })} />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Bought Date</label>
                  <input type="date" className="w-full bg-slate-900 text-white p-2 rounded-lg border border-slate-700 text-sm" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} />
                </div>
              </div>
            )}

            {/* 3. RETURN DEADLINE (Rented In/Out) - OPTIONAL */}
            {(formData.listing_type === 'Rented Out' || formData.listing_type === 'Rented In') && (
               <div>
                  <label className="block text-indigo-400 text-xs font-bold uppercase mb-1">
                    {formData.listing_type === 'Rented Out' ? 'Expected Return Date (Optional)' : 'Return Deadline (Optional)'}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 text-indigo-500" size={14} />
                    <input type="date" className="w-full bg-slate-900 text-white pl-8 p-2 rounded-lg border border-indigo-500/30 text-sm" value={formData.return_date} onChange={e => setFormData({ ...formData, return_date: e.target.value })} />
                  </div>
               </div>
            )}

            {/* 4. SOLD DETAILS */}
            {formData.listing_type === 'Sold' && (
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-green-500 text-[10px] font-bold uppercase mb-1">Sold Price</label>
                  <div className="relative"><DollarSign className="absolute left-2 top-2.5 text-green-600" size={12} />
                  <input type="number" className="w-full bg-slate-900 text-white pl-6 p-2 rounded-lg border border-green-500/30 text-sm" value={formData.transaction_price} onChange={e => setFormData({ ...formData, transaction_price: e.target.value })} />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="block text-green-500 text-[10px] font-bold uppercase mb-1">Sold Date</label>
                  <input type="date" className="w-full bg-slate-900 text-white p-2 rounded-lg border border-green-500/30 text-sm" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl mt-4 transition shadow-lg shadow-indigo-600/20">{loading ? 'Saving...' : 'Add to Vault'}</button>
        </form>
      </div>
    </div>
  );
}