import { Gamepad2, Users, ArrowRightLeft, Shield, Globe, Zap, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto space-y-20 py-12 animate-in fade-in duration-700">
      
      {/* Hero Section */}
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

      {/* Mission & Vision Grid */}
      <div className="grid md:grid-cols-2 gap-8">
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

      {/* Core Values */}
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