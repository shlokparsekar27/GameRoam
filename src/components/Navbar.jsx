import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Gamepad2, ShoppingBag, MessageCircle, User, Users, Menu, X, Bell, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ session, profile }) {
  const [scrolled, setScrolled] = useState(false);

  // Handle Scroll Effect for Desktop HUD
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <DesktopNav session={session} profile={profile} scrolled={scrolled} />
      <MobileNav session={session} profile={profile} />
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-void-950 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <Link to="/about" className="flex items-center gap-2">
          <Gamepad2 className="text-cyber" size={20} />
          <span className="font-mech font-bold text-lg text-white tracking-widest uppercase">
            Game<span className="text-cyber">Roam</span>
          </span>
        </Link>
        <Link to="/profile" className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 relative">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-void-800 flex items-center justify-center text-cyber"><User size={14} /></div>
          )}
        </Link>
      </div>
    </>
  );
}

// --- DESKTOP COMMAND CENTER (HUD) ---
function DesktopNav({ session, profile, scrolled }) {
  const displayName = profile?.username || session.user.email.split('@')[0];
  const avatarUrl = profile?.avatar_url;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center transition-all duration-500 ease-out ${scrolled ? 'py-2' : 'py-6'}`}>
      {/* Floating Glass Island */}
      <div className={`w-full max-w-7xl mx-6 transition-all duration-500 ${scrolled
        ? 'bg-void-900/90 backdrop-blur-md border-b border-white/5 shadow-glass px-8 py-3 rounded-b-2xl'
        : 'bg-void-800/60 backdrop-blur-xl border border-white/10 shadow-2xl px-8 py-4 rounded-2xl'
        }`}>
        <div className="flex items-center justify-between">

          {/* LEFT: Branding (Links to About/Landing) */}
          <Link to="/about" className="flex items-center gap-3 group relative overflow-hidden">
            <div className="relative z-10 bg-void-950 p-2 rounded-lg border border-white/10 group-hover:border-cyber/50 transition-colors duration-300">
              <Gamepad2 className="w-6 h-6 text-cyber group-hover:animate-pulse-fast transition-transform group-hover:rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-mech font-bold text-white tracking-widest uppercase leading-none">
                Game<span className="text-cyber text-glow">Roam</span>
              </span>
              <span className="text-[10px] text-cyber/60 font-code tracking-[0.2em] font-bold group-hover:text-cyber transition-colors">
                SYSTEM ONLINE
              </span>
            </div>
          </Link>

          {/* CENTER: Navigation Links */}
          <div className="flex items-center gap-2">
            <DesktopNavLink to="/vault" label="Vault" icon={Gamepad2} />
            <DesktopNavLink to="/arcade" label="Arcade" icon={Play} /> {/* NEW MODULE */}
            <DesktopNavLink to="/marketplace" label="Market" icon={ShoppingBag} />
            <DesktopNavLink to="/community" label="Community" icon={Users} />
          </div>

          {/* RIGHT: Status & Profile */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <NavLink to="/chat" className={({ isActive }) => `relative p-2 text-slate-400 hover:text-white transition-colors ${isActive ? 'text-cyber' : ''}`}>
                <MessageCircle size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-flux rounded-full animate-pulse shadow-[0_0_8px_#ff003c]" />
              </NavLink>
            </div>

            <NavLink to="/profile" className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right">
                <p className="text-xs font-mech font-bold uppercase tracking-wider text-slate-200 group-hover:text-cyber transition-colors">
                  {displayName}
                </p>
                <div className="flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 bg-helix rounded-full animate-pulse" />
                  <p className="text-[10px] text-slate-500 font-code group-hover:text-slate-300">ONLINE</p>
                </div>
              </div>

              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 group-hover:border-cyber/50 transition-all shadow-lg group-hover:shadow-neon-cyan">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-void-700 flex items-center justify-center text-cyber">
                    <User size={18} />
                  </div>
                )}
                {/* Glitch Overlay on Hover */}
                <div className="absolute inset-0 bg-cyber/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity" />
              </div>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function DesktopNavLink({ to, label, icon: Icon }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `relative px-6 py-2 group overflow-hidden rounded-lg transition-all duration-300 ${isActive ? 'bg-white/5' : 'hover:bg-white/5'}`
    }>
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-2 relative z-10">
            <Icon size={16} className={`transition-colors duration-300 ${isActive ? 'text-cyber' : 'text-slate-400 group-hover:text-white'}`} />
            <span className={`font-mech font-bold tracking-wider uppercase text-sm transition-colors duration-300 ${isActive ? 'text-white text-glow' : 'text-slate-400 group-hover:text-white'}`}>
              {label}
            </span>
          </div>

          {/* Active Indicator & Hover Glitch */}
          {isActive && (
            <motion.div
              layoutId="desktop-nav-active"
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyber shadow-neon-cyan"
            />
          )}
        </>
      )}
    </NavLink>
  );
}


// --- MOBILE DATAPAD (BOTTOM NAVIGATION) ---
function MobileNav({ session, profile }) {
  const avatarUrl = profile?.avatar_url;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      {/* Glass Container */}
      <div className="bg-void-950/80 backdrop-blur-xl border-t border-white/10 pt-2 pb-4 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-around relative">

          <MobileNavLink to="/vault" icon={Gamepad2} label="Vault" />
          <MobileNavLink to="/arcade" icon={Play} label="Play" />

          {/* Center Action Button (FAB) (Marketplace) - Slightly tweaked for 5-item layout */}
          <Link to="/marketplace" className="relative group -mt-8 flex flex-col items-center">
            <div className="absolute inset-0 bg-cyber blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
            <div className="relative w-12 h-12 bg-void-900 border border-cyber/30 rounded-2xl flex items-center justify-center transform rotate-45 group-hover:rotate-0 transition-all duration-300 shadow-neon-cyan">
              <ShoppingBag className="w-5 h-5 text-cyber -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            {/* Optional Label for consistency if space permits, or leave icon-only for emphasis */}
          </Link>

          <MobileNavLink to="/community" icon={Users} label="Social" />
          <MobileNavLink to="/chat" icon={MessageCircle} label="Chat" />

        </div>
      </div>
    </nav>
  );
}

function MobileNavLink({ to, icon: Icon, label, alert }) {
  return (
    <NavLink to={to} className={({ isActive }) =>
      `relative flex flex-col items-center gap-1 p-2 transition-all duration-300 ${isActive ? 'text-cyber scale-110' : 'text-slate-500 hover:text-slate-300'}`
    }>
      {({ isActive }) => (
        <>
          <div className="relative">
            <Icon size={22} className={isActive ? 'drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : ''} />
            {alert && <span className="absolute -top-1 -right-1 w-2 h-2 bg-flux rounded-full animate-pulse shadow-[0_0_5px_#ff003c]" />}
          </div>
          <span className="text-[10px] font-mech font-bold uppercase tracking-widest">{label}</span>
        </>
      )}
    </NavLink>
  );
}