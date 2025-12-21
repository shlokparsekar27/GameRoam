import { Link } from 'react-router-dom';
import { LogOut, Gamepad2, User, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  return (
    <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-400 transition">
            <Gamepad2 className="w-8 h-8 text-indigo-500" />
            <span>GameRoam</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-300 hover:text-white font-medium transition">My Vault</Link>
            <Link to="/marketplace" className="text-slate-300 hover:text-white font-medium transition">Marketplace</Link>
          </div>

          {/* Right Side: Profile & Logout */}
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-2 text-slate-300 hover:text-white transition group">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold group-hover:bg-indigo-500">
                {session.user.email[0].toUpperCase()}
              </div>
              <span className="hidden md:block text-sm">{session.user.email.split('@')[0]}</span>
            </Link>
            
            <div className="h-6 w-px bg-slate-700 mx-2"></div>

            <button
              onClick={() => supabase.auth.signOut()}
              className="text-slate-400 hover:text-red-400 transition"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}