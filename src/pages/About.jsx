import { Gamepad2, Users, ArrowRightLeft, Shield, Globe, Zap, Heart, ShoppingBag, Archive, MessageCircle, UserCircle, MapPin } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto space-y-24 py-12 animate-in fade-in duration-700 px-6">
      
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-bold uppercase tracking-wider border border-indigo-500/20">
          <Zap size={16} /> The Future of Game Trading
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
          We Are GameRoam.
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The ultimate decentralized ecosystem for gamers to trade physical copies, share digital experiences, and build a reputation in a village built by gamers, for gamers.
        </p>
      </div>

      {/* 2. FEATURE BREAKDOWN (The Ecosystem) */}
      <div className="space-y-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Explore the Ecosystem</h2>
          <p className="text-slate-400 mt-2">Everything you need to manage your gaming life in one place.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Marketplace */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition">
              <ShoppingBag size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">The Marketplace</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Buy, sell, or trade physical games directly with locals. Filter by platform, price, or location. No hidden fees, just pure peer-to-peer trading.
            </p>
          </div>

          {/* The Village */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-pink-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center text-pink-400 mb-4 group-hover:scale-110 transition">
              <Users size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">The Village</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our community hub. Share your latest achievements, ask for game recommendations, or find a squad. It’s social media, but strictly for gamers.
            </p>
          </div>

          {/* My Vault */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition">
              <Archive size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">My Vault</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your personal inventory management system.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-slate-500">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span> <b>Library:</b> Catalog games you own.</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> <b>Sale:</b> List items for cash.</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> <b>Rent:</b> Lend games for weekly income.</li>
            </ul>
          </div>

          {/* Messages */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Chat</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Negotiate prices, arrange safe meetup spots, or just chat about games. Share images and videos directly within the conversation.
            </p>
          </div>

          {/* Profile */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition">
              <UserCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Your Identity</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Build your reputation. Your profile showcases your public vault, your "Gamer Bio", and your standing in the community.
            </p>
          </div>

          {/* Location Based */}
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition duration-300 group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400 mb-4 group-hover:scale-110 transition">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Local First</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We prioritize connections near you. Save on shipping and meet fellow gamers in your city to exchange physical discs instantly.
            </p>
          </div>

        </div>
      </div>

      {/* 3. MISSION & VISION GRID */}
      <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-slate-800/50">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            To democratize access to gaming experiences. We believe that a game finished shouldn't gather dust on a shelf. It should be passed on, played, and loved by someone else. We are building the infrastructure to make peer-to-peer trading safe, local, and community-driven.
          </p>
          <div className="flex items-center gap-4 text-indigo-400 font-bold">
            <Globe size={20} />
            <span>Connecting players globally</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition duration-300">
            <ArrowRightLeft className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-white font-bold text-xl mb-2">Circular Economy</h3>
            <p className="text-slate-400">Reduce e-waste by giving physical game discs a second, third, or fourth life within your local community.</p>
          </div>
          <div className="bg-slate-900/30 p-8 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition duration-300">
            <Shield className="text-indigo-400 mb-4" size={32} />
            <h3 className="text-white font-bold text-xl mb-2">Trust & Safety</h3>
            <p className="text-slate-400">A reputation-based system ensures you know exactly who you are trading with before you meet.</p>
          </div>
        </div>
      </div>

      {/* 4. CORE VALUES */}
      <div>
        <h2 className="text-3xl font-bold text-white text-center mb-12">Why the Community Chooses Us</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
              <Users size={100} />
            </div>
            <Users className="text-pink-500 mb-6" size={40} />
            <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
            <p className="text-slate-400 leading-relaxed">
              We aren't just a marketplace. We are a social network where you can discuss lore, share clips, and find your squad.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
              <Gamepad2 size={100} />
            </div>
            <Gamepad2 className="text-indigo-500 mb-6" size={40} />
            <h3 className="text-xl font-bold text-white mb-3">For Hardcore & Casuals</h3>
            <p className="text-slate-400 leading-relaxed">
              Whether you are a speedrunner looking for retro gems or a casual player swapping the latest AAA title, you belong here.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110">
              <Heart size={100} />
            </div>
            <Heart className="text-red-500 mb-6" size={40} />
            <h3 className="text-xl font-bold text-white mb-3">Passion Project</h3>
            <p className="text-slate-400 leading-relaxed">
              Built by a solo developer who was tired of unfair trade-in values at retail stores. We put value back in your pocket.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}