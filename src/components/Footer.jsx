import { Link } from 'react-router-dom';
import { Gamepad2, Heart, ArrowRight } from 'lucide-react'; 
// We still use Lucide for the UI icons to match your app's style
// But we use React Icons for the brands:
import { FaDiscord, FaTwitch, FaSteam, FaYoutube, FaDatabase } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. BRAND */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
              <Gamepad2 className="text-indigo-500" size={28} />
              Game<span className="text-indigo-500">Roam</span>
            </Link>
            <p className="leading-relaxed text-slate-500">
              Your ultimate gateway to the gaming universe. Discover, trade, and connect with the squad.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Heart size={16} className="fill-indigo-500/20" />
              <span>Crafted for gamers</span>
            </div>
          </div>

          {/* 2. EXPLORE */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/marketplace" className="hover:text-indigo-400 transition">Marketplace</Link></li>
              <li><Link to="/community" className="hover:text-indigo-400 transition">The Village</Link></li>
              <li><Link to="/community/feed" className="hover:text-indigo-400 transition">Social Feed</Link></li>
              <li><Link to="/profile" className="hover:text-indigo-400 transition">My Profile</Link></li>
            </ul>
          </div>

          {/* 3. COMMUNITY (Now using React Icons) */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Join the Squad</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://discord.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#5865F2] transition">
                  <FaDiscord size={20} /> Discord
                </a>
              </li>
              <li>
                <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#9146FF] transition">
                  <FaTwitch size={20} /> Twitch
                </a>
              </li>
              <li>
                <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#66c0f4] transition">
                  <FaSteam size={20} /> Steam Group
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#FF0000] transition">
                  <FaYoutube size={20} /> YouTube
                </a>
              </li>
              <li>
                <a href="https://rawg.io" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition">
                  <FaDatabase size={18} /> RAWG Database
                </a>
              </li>
            </ul>
          </div>

          {/* 4. NEWSLETTER */}
          <div>
            <h3 className="text-white font-bold mb-6 text-lg">Stay in the loop</h3>
            <p className="mb-4 text-slate-500">Get the latest drops and game trends directly to your inbox.</p>
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 focus-within:border-indigo-500 transition">
              <input 
                type="email" 
                placeholder="Enter email" 
                className="bg-transparent text-white px-3 w-full outline-none placeholder:text-slate-600"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-md transition">
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} GameRoam. All rights reserved.</p>
          <div className="flex gap-6 text-xs font-bold uppercase tracking-wider">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
            <a href="#" className="hover:text-white transition">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}