import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Link as LinkIcon, Wand2, Loader2, DollarSign, Clock, Sliders, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToast } from './TacticalToast'; // <--- IMPORT

export default function EditGameModal({ game, onClose, onGameUpdated }) {
  const toast = useToast(); // <--- HOOK
  const [formData, setFormData] = useState({
    title: game.title,
    platform: game.platform || 'PC',
    listing_type: game.listing_type || 'Library',
    price: game.price || '',
    cover_url: game.cover_url || '',
    transaction_price: game.transaction_price || '',
    transaction_date: game.transaction_date || '',
    return_date: game.return_date || ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);

  async function fetchGameCover() {
    if (!formData.title) return toast.warning("INPUT_REQUIRED: Enter asset title.");

    setFetchingImage(true);
    try {
      const apiKey = import.meta.env.VITE_RAWG_API_KEY;
      if (!apiKey) return toast.error("SysErr: MISSING_API_KEY");

      const response = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${formData.title}&page_size=1`);
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setFormData(prev => ({ ...prev, cover_url: data.results[0].background_image }));
        toast.info("SCAN_COMPLETE: VISUAL UPDATED.");
      } else {
        toast.warning("SCAN_RESULT: Negative. Check spelling.");
      }
    } catch (error) {
      console.error(error);
      toast.error("NET_ERR: Connection failed.");
    } finally {
      setFetchingImage(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = {
        title: formData.title,
        platform: formData.platform,
        listing_type: formData.listing_type,
        price: (formData.listing_type === 'Rent' || formData.listing_type === 'Sale') ? Number(formData.price) : 0,
        cover_url: formData.cover_url,
        transaction_price: formData.transaction_price ? Number(formData.transaction_price) : null,
        transaction_date: formData.transaction_date || null,
        return_date: formData.return_date || null
      };

      const { error } = await supabase.from('games').update(updates).eq('id', game.id);
      if (error) throw error;

      onGameUpdated();
      onClose();
      toast.success("CONFIGURATION SAVED.");
    } catch (error) {
      toast.error(error.message.toUpperCase());
    } finally {
      setLoading(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-void-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <div className="bg-void-800 w-full max-w-md p-1 clip-chamfer shadow-2xl shadow-cyber/20 relative">
        <div className="bg-void-800 border border-white/10 p-6 h-full clip-chamfer max-h-[90vh] overflow-y-auto custom-scrollbar">

          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-flux transition z-10 hover:rotate-90 duration-300">
            <X size={24} />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <Sliders className="text-cyber animate-spin-slow" size={24} />
            <h2 className="text-2xl font-mech font-bold text-white tracking-widest uppercase">
              Modify <span className="text-cyber">Parameters</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="group">
              <label className="block text-cyber/80 text-[10px] font-mech font-bold uppercase tracking-widest mb-1">Asset Designation</label>
              <input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-void-950 text-white font-code p-3 border border-void-700 focus:border-cyber outline-none transition-all clip-chamfer"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-[10px] font-mech font-bold uppercase tracking-widest mb-1">Visual Data Source</label>
              <div className="relative mb-3">
                <LinkIcon className="absolute left-3 top-3.5 text-slate-600" size={16} />
                <input
                  value={formData.cover_url}
                  onChange={e => setFormData({ ...formData, cover_url: e.target.value })}
                  className="w-full bg-void-950 text-white font-code pl-10 pr-12 py-3 border border-void-700 focus:border-cyber outline-none transition-all placeholder:text-void-700 clip-chamfer"
                  placeholder="Image URL..."
                />
                <button
                  type="button"
                  onClick={fetchGameCover}
                  disabled={fetchingImage || !formData.title}
                  className="absolute right-2 top-2 p-1.5 bg-cyber/10 hover:bg-cyber text-cyber hover:text-black border border-cyber/30 rounded-none transition disabled:opacity-50"
                >
                  {fetchingImage ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                </button>
              </div>

              {formData.cover_url && (
                <div className="h-32 w-full overflow-hidden border border-void-700 relative group bg-void-950">
                  <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
                  <img src={formData.cover_url} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition duration-500" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-mech font-bold uppercase tracking-widest mb-1">Platform</label>
                <div className="relative">
                  <select
                    className="w-full bg-void-950 text-white font-code p-3 border border-void-700 focus:border-cyber outline-none appearance-none cursor-pointer clip-chamfer"
                    value={formData.platform}
                    onChange={e => setFormData({ ...formData, platform: e.target.value })}
                  >
                    <option value="PC">PC_TERM</option>
                    <option value="PS5">PS5_CORE</option>
                    <option value="PS4">PS4_LEGACY</option>
                    <option value="Xbox">XBOX_SERIES</option>
                    <option value="Switch">NINTENDO_SW</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyber text-[10px]">▼</div>
                </div>
              </div>
              <div>
                <label className="block text-slate-500 text-[10px] font-mech font-bold uppercase tracking-widest mb-1">Protocol</label>
                <div className="relative">
                  <select
                    className="w-full bg-void-950 text-white font-code p-3 border border-void-700 focus:border-cyber outline-none appearance-none cursor-pointer clip-chamfer"
                    value={formData.listing_type}
                    onChange={e => setFormData({ ...formData, listing_type: e.target.value })}
                  >
                    <option value="Library">VAULT_STORE</option>
                    <option value="Rent">RENT_PROTOCOL</option>
                    <option value="Sale">SALE_PROTOCOL</option>
                    <option value="Rented Out">STATUS_AWAY</option>
                    <option value="Rented In">STATUS_BORROWED</option>
                    <option value="Sold">STATUS_SOLD</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-cyber text-[10px]">▼</div>
                </div>
              </div>
            </div>

            <div className="bg-void-900/50 p-4 border border-white/5 space-y-3 animate-in slide-in-from-top-2 clip-chamfer">
              {['Rent', 'Sale'].includes(formData.listing_type) && (
                <div>
                  <label className="block text-cyber text-[10px] font-bold uppercase mb-1">
                    {formData.listing_type === 'Rent' ? 'Weekly Rate ($)' : 'Credits Required ($)'}
                  </label>
                  <input required type="number" min="0" className="w-full bg-void-950 text-white font-code p-2 border border-cyber/30 focus:border-cyber outline-none" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
              )}

              {formData.listing_type === 'Library' && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Acquisition Cost</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 text-slate-600" size={12} />
                      <input type="number" className="w-full bg-void-950 text-white pl-6 p-2 border border-void-700 text-sm font-code" value={formData.transaction_price} onChange={e => setFormData({ ...formData, transaction_price: e.target.value })} />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Date</label>
                    <input type="date" className="w-full bg-void-950 text-white p-2 border border-void-700 text-sm font-code" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} />
                  </div>
                </div>
              )}

              {(formData.listing_type === 'Rented Out' || formData.listing_type === 'Rented In') && (
                <div>
                  <label className="block text-plasma text-[10px] font-bold uppercase mb-1">Return Deadline</label>
                  <div className="relative">
                    <Clock className="absolute left-2 top-2.5 text-plasma" size={14} />
                    <input type="date" className="w-full bg-void-950 text-white pl-8 p-2 border border-plasma/50 text-sm font-code" value={formData.return_date} onChange={e => setFormData({ ...formData, return_date: e.target.value })} />
                  </div>
                </div>
              )}

              {formData.listing_type === 'Sold' && (
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-emerald-500 text-[10px] font-bold uppercase mb-1">Credits Received</label>
                    <div className="relative">
                      <DollarSign className="absolute left-2 top-2.5 text-emerald-600" size={12} />
                      <input type="number" className="w-full bg-void-950 text-white pl-6 p-2 border border-emerald-500/30 text-sm font-code" value={formData.transaction_price} onChange={e => setFormData({ ...formData, transaction_price: e.target.value })} />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-emerald-500 text-[10px] font-bold uppercase mb-1">Date</label>
                    <input type="date" className="w-full bg-void-950 text-white p-2 border border-emerald-500/30 text-sm font-code" value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })} />
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full relative overflow-hidden bg-cyber/10 border border-cyber text-cyber font-mech font-bold tracking-widest py-4 mt-4 transition-all hover:bg-cyber hover:text-black hover:shadow-neon-cyan disabled:opacity-50 clip-chamfer"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {loading ? 'OVERWRITING...' : 'SAVE CONFIGURATION'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}