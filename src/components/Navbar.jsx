import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom'; 
import { Gamepad2, Menu, X, MessageCircle } from 'lucide-react';

export default function Navbar({ session, profile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const displayName = profile?.username || session.user.email.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  const getNavLinkClass = ({ isActive }) => 
    `font-medium transition ${
      isActive 
        ? 'text-indigo-400' 
        : 'text-slate-300 hover:text-white'
    }`;

  const getMobileNavLinkClass = ({ isActive }) => 
    `block px-3 py-3 rounded-md text-base font-medium transition ${
      isActive 
        ? 'bg-indigo-600/10 text-indigo-400' 
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo links to Home (About) */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition">
            <Gamepad2 className="w-8 h-8 text-indigo-500" />
            <span>
              Game<span className="text-indigo-500">Roam</span>
            </span>
          </Link>

          {/* DESKTOP Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink to="/marketplace" className={getNavLinkClass}>Marketplace</NavLink>
            <NavLink to="/community" className={getNavLinkClass}>Community</NavLink>
            {/* UPDATED LINK */}
            <NavLink to="/vault" className={getNavLinkClass}>My Vault</NavLink>
            <NavLink to="/chat" className={({ isActive }) => `${getNavLinkClass({ isActive })} flex items-center gap-2`}>
              <MessageCircle size={20} />
              <span>Messages</span>
            </NavLink>
          </div>

          {/* Profile Section (Desktop) */}
          <div className="hidden md:flex items-center">
            <NavLink to="/profile" className="flex items-center gap-3 pl-6 border-l border-slate-800 group cursor-pointer">
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 rounded-full bg-slate-800 overflow-hidden ring-2 transition ${isActive ? 'ring-indigo-500' : 'ring-transparent group-hover:ring-slate-700'}`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                        {displayName[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className={`text-sm font-bold transition ${isActive ? 'text-indigo-400' : 'text-white group-hover:text-indigo-400'}`}>
                      {displayName}
                    </p>
                  </div>
                </>
              )}
            </NavLink>
          </div>

          {/* MOBILE Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <NavLink to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
              Marketplace
            </NavLink>

            <NavLink to="/community" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
              Community
            </NavLink>

            {/* UPDATED LINK */}
            <NavLink to="/vault" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
              My Vault
            </NavLink>
            
            <NavLink to="/chat" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `${getMobileNavLinkClass({ isActive })} flex items-center gap-2`}>
              <MessageCircle size={18} /> Messages
            </NavLink>

            <NavLink to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={getMobileNavLinkClass}>
              Profile
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}