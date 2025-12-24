import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { Gamepad2, Menu, X, MessageCircle, Layers, User } from 'lucide-react';

export default function Navbar({ session, profile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const displayName = profile?.username || session.user.email.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  // Active Link Logic with Glow
  const getNavLinkClass = ({ isActive }) => 
    `relative px-1 py-2 font-mech font-bold tracking-wide transition-all duration-300 ${
      isActive 
        ? 'text-cyber text-glow' 
        : 'text-slate-400 hover:text-white'
    }`;

  const getMobileNavLinkClass = ({ isActive }) => 
    `block px-4 py-3 rounded-md font-mech font-bold uppercase tracking-wider transition ${
      isActive 
        ? 'bg-cyber/10 text-cyber border-l-2 border-cyber' 
        : 'text-slate-400 hover:text-white hover:bg-void-800'
    }`;

  return (
    // Floating Island Container
    <nav className="fixed top-4 left-0 right-0 z-[100] flex justify-center px-4">
      <div className="w-full max-w-6xl bg-void-800/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO: Cyber-Tech Style */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-void-900 p-2 rounded-lg border border-white/10 group-hover:border-cyber/50 transition duration-300">
                <Gamepad2 className="w-6 h-6 text-cyber group-hover:animate-pulse-fast" />
              </div>
              <span className="text-2xl font-mech font-bold text-white tracking-widest uppercase">
                Game<span className="text-cyber text-glow">Roam</span>
              </span>
            </Link>

            {/* DESKTOP HUD */}
            <div className="hidden md:flex items-center gap-8">
              <NavLink to="/marketplace" className={getNavLinkClass}>Marketplace</NavLink>
              <NavLink to="/community" className={getNavLinkClass}>Community</NavLink>
              <NavLink to="/vault" className={getNavLinkClass}>My Vault</NavLink>
              <NavLink to="/chat" className={getNavLinkClass}>
                <div className="flex items-center gap-2">
                  <span>Messages</span>
                  {/* Notification Dot */}
                  <span className="w-1.5 h-1.5 rounded-full bg-flux animate-pulse" />
                </div>
              </NavLink>
            </div>

            {/* USER PROFILE: Data Plate */}
            <div className="hidden md:flex items-center">
              <NavLink to="/profile" className="flex items-center gap-4 pl-6 border-l border-white/10 group cursor-pointer">
                {({ isActive }) => (
                  <>
                    <div className="text-right hidden lg:block">
                      <p className={`text-sm font-mech font-bold uppercase tracking-wider ${isActive ? 'text-cyber' : 'text-white group-hover:text-cyber'} transition`}>
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-code">LVL 1 USER</p>
                    </div>

                    <div className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${isActive ? 'border-cyber shadow-neon-cyan' : 'border-void-700 group-hover:border-slate-500'}`}>
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-void-700 flex items-center justify-center text-cyber">
                           <User size={20} />
                        </div>
                      )}
                      {/* Online Indicator */}
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                    </div>
                  </>
                )}
              </NavLink>
            </div>

            {/* MOBILE TRIGGER */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-300 hover:text-cyber transition p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>

          </div>
        </div>

        {/* MOBILE MENU: Dropdown Panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-void-900/95 backdrop-blur-xl rounded-b-2xl animate-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-1">
              <NavLink to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
                Marketplace
              </NavLink>
              <NavLink to="/community" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
                Community
              </NavLink>
              <NavLink to="/vault" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
                My Vault
              </NavLink>
              <NavLink to="/chat" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
                Messages
              </NavLink>
              <div className="h-px bg-white/10 my-2" />
              <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
                Profile Status
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}