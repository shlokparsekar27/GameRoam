import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Command, LayoutGrid, ShoppingBag, 
  Users, MessageSquare, User, Plus, X, Terminal, Cpu
} from 'lucide-react';

export default function CommandPalette({ setIsAddModalOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Toggle on Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { label: 'ACCESS_VAULT', sub: 'Dashboard', icon: LayoutGrid, action: () => navigate('/vault') },
    { label: 'GLOBAL_EXCHANGE', sub: 'Marketplace', icon: ShoppingBag, action: () => navigate('/marketplace') },
    { label: 'SECTOR_COMMS', sub: 'Community', icon: Users, action: () => navigate('/community') },
    { label: 'ENCRYPTED_CHAT', sub: 'Messages', icon: MessageSquare, action: () => navigate('/chat') },
    { label: 'OPERATOR_ID', sub: 'Profile', icon: User, action: () => navigate('/profile') },
  ];
  
  // Only add "Initialize Asset" if the function is passed (e.g., if used inside Dashboard)
  if (setIsAddModalOpen) {
    actions.push({ label: 'INIT_NEW_ASSET', sub: 'Add Game', icon: Plus, action: () => setIsAddModalOpen(true) });
  }

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(query.toLowerCase()) || 
    a.sub.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop with Grid and Blur */}
      <div 
        className="absolute inset-0 bg-void-950/80 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      />

      {/* Palette Window */}
      <div className="relative w-full max-w-lg bg-void-900 border border-cyber/30 shadow-[0_0_50px_-10px_rgba(0,240,255,0.2)] animate-in fade-in zoom-in-95 duration-200 clip-chamfer">
        
        {/* Decorative Top Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyber to-transparent opacity-50" />

        {/* Input Area */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 bg-void-900">
          <Terminal className="text-cyber animate-pulse" size={20} />
          <input
            autoFocus
            type="text"
            placeholder="INPUT_COMMAND_DIRECTIVE..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-void-600 outline-none font-code text-sm uppercase tracking-wider"
          />
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-flux transition">
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[300px] overflow-y-auto p-2 bg-void-900/95 custom-scrollbar">
          {filteredActions.length === 0 ? (
            <div className="p-8 text-center text-void-600 flex flex-col items-center gap-2">
              <Cpu size={24} />
              <span className="text-xs font-code uppercase tracking-widest">Syntax Error: Directive Not Found</span>
            </div>
          ) : (
            filteredActions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-cyber/10 border-l-2 border-transparent hover:border-cyber transition-all group text-left"
              >
                <item.icon size={18} className="group-hover:text-cyber transition-colors" />
                <div className="flex flex-col">
                  <span className="text-sm font-mech font-bold uppercase tracking-wider group-hover:text-cyber transition-colors">{item.label}</span>
                  <span className="text-[10px] font-code opacity-50">{item.sub}</span>
                </div>
                <span className="ml-auto text-[10px] text-cyber opacity-0 group-hover:opacity-100 font-code tracking-widest transition-opacity">
                  [EXECUTE]
                </span>
              </button>
            ))
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-void-950 px-4 py-2 border-t border-white/5 flex justify-between items-center text-[10px] font-code text-slate-600 uppercase">
          <span>SYSTEM_READY</span>
          <div className="flex gap-2">
             <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">ESC</span>
             <span className="bg-white/5 px-1.5 py-0.5 rounded text-slate-400">ENTER</span>
          </div>
        </div>
      </div>
    </div>
  );
}