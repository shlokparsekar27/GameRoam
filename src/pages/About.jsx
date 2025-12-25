import { Link } from 'react-router-dom';
import { Gamepad2, Users, ArrowRightLeft, Shield, Globe, Zap, Heart, ShoppingBag, Archive, MessageCircle, UserCircle, MapPin, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 py-4 md:py-12 px-4 md:px-6">

      {/* 1. HERO */}
      {/* 1. HERO */}
      <div className="text-center relative pt-8 md:pt-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-cyber/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1 mb-4 md:mb-6 border border-cyber/30 bg-cyber/5 clip-chamfer">
          <Zap size={14} className="text-cyber" />
          <span className="text-[10px] font-code font-bold text-cyber uppercase tracking-[0.2em]">System Version 2.0</span>
        </div>

        <h1 className="text-4xl md:text-8xl font-mech font-bold text-white mb-4 md:mb-6 uppercase tracking-tighter leading-none">
          Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-600">Roam</span>
        </h1>

        <p className="text-sm md:text-2xl text-slate-400 max-w-3xl mx-auto font-ui leading-relaxed">
          The decentralized trading grid for operators, collectors, and gamers.
          <span className="text-white block mt-2">Secure. Local. Encrypted.</span>
        </p>
      </div>

      {/* 2. MODULE GRID */}
      <div className="space-y-12">
        <div className="flex items-center gap-4 mb-8">
          <Cpu className="text-cyber" size={24} />
          <h2 className="text-2xl font-mech font-bold text-white uppercase tracking-widest">Protocol Capabilities</h2>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {[
            { icon: ShoppingBag, title: "Global Exchange", desc: "Peer-to-peer asset acquisition protocols. Zero latency trading environment.", color: "text-cyber" },
            { icon: Users, title: "Sector Comms", desc: "Decentralized squad formation and tactical communication hub.", color: "text-purple-400" },
            { icon: Archive, title: "Secure Vault", desc: "Encrypted inventory management for physical and digital properties.", color: "text-emerald-400" },
            { icon: MessageCircle, title: "Encrypted Chat", desc: "End-to-end secured channels for private negotiation.", color: "text-blue-400" },
            { icon: UserCircle, title: "Operator Reputation", desc: "Merit-based ranking system tracking successful exchanges.", color: "text-pink-400" },
            { icon: MapPin, title: "Local Grid", desc: "Proximity-based asset discovery optimization.", color: "text-orange-400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-void-800 border border-white/5 clip-chamfer p-1 group hover:border-cyber/30 transition duration-300">
              <div className="bg-void-900 h-full p-8 clip-chamfer flex flex-col items-start relative overflow-hidden">
                <item.icon size={32} className={`${item.color} mb-4`} />
                <h3 className="text-xl font-mech font-bold text-white uppercase mb-2 group-hover:text-cyber transition">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. CORE PROTOCOLS */}
      <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
        <div className="bg-void-800 border border-white/5 clip-chamfer p-1 h-full">
          <div className="bg-void-900 p-8 md:p-10 h-full clip-chamfer flex flex-col justify-center">
            <h2 className="text-3xl font-mech font-bold text-white mb-6 uppercase">Primary Objective</h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-6 font-ui">
              "To decentralize the gaming economy. Assets should not decay in isolation; they must be circulated to maintain value."
            </p>
            <div className="flex items-center gap-4 text-cyber font-bold font-code text-xs uppercase tracking-widest">
              <Globe size={16} />
              <span>Global Connectivity Established</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 h-full flex flex-col">
          <div className="bg-void-800 border border-white/5 p-8 clip-chamfer flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-3">
              <ArrowRightLeft className="text-emerald-400" size={24} />
              <h3 className="text-white font-mech font-bold text-xl uppercase">Circular Economy</h3>
            </div>
            <p className="text-slate-400 text-sm">Recycle physical media. Reduce waste. Maximize utility.</p>
          </div>
          <div className="bg-void-800 border border-white/5 p-8 clip-chamfer flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-3">
              <Shield className="text-cyber" size={24} />
              <h3 className="text-white font-mech font-bold text-xl uppercase">Trust Protocol</h3>
            </div>
            <p className="text-slate-400 text-sm">Reputation-based verification ensures secure asset transfer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}