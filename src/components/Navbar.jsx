import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Menu, X } from 'lucide-react';

export default function Navbar({ session, profile }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Use profile data or fallback to email
  const displayName = profile?.username || session.user.email.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition">
            <Gamepad2 className="w-8 h-8 text-indigo-500" />
            <span>GameRoam</span>
          </Link>

          {/* DESKTOP Navigation (Hidden on Mobile) */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/marketplace" className="text-slate-300 hover:text-white font-medium transition">Marketplace</Link>
            <Link to="/" className="text-slate-300 hover:text-white font-medium transition">My Vault</Link>
          </div>

          {/* Profile Section (Desktop) */}
          <div className="hidden md:flex items-center">
            <Link to="/profile" className="flex items-center gap-3 pl-6 border-l border-slate-800 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-500 transition">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
                    {displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-white group-hover:text-indigo-400 transition">{displayName}</p>
              </div>       
            </Link>
          </div>

          {/* MOBILE Menu Button (Visible only on small screens) */}
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

      {/* MOBILE MENU DROPODOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link 
              to="/marketplace" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Marketplace
            </Link>
            <Link 
              to="/" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              My Vault
            </Link>
            <Link 
              to="/profile" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-3 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800"
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}