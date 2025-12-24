import { Link } from 'react-router-dom';
import { Gamepad2, Heart, Code2, Cpu, Shield, Zap } from 'lucide-react';
import { FaDiscord, FaTwitch, FaSteam, FaYoutube, FaGithub, FaLinkedin } from 'react-icons/fa';
import { Activity } from 'react';

export default function Footer() {
    return (
        <footer className="bg-void-950 border-t border-white/5 pt-16 pb-8 text-slate-400 text-sm mt-auto relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
            
            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* COLUMN 1: BRAND & MISSION */}
                    <div className="space-y-4">
                        <Link to="/about" className="flex items-center gap-3 text-white group">
                            <div className="p-2 bg-void-800 border border-white/10 clip-chamfer group-hover:border-cyber/50 transition">
                                <Gamepad2 className="text-cyber" size={24} />
                            </div>
                            <span className="font-mech font-bold text-2xl tracking-tight uppercase">
                                Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-500">Roam</span>
                            </span>
                        </Link>
                        <p className="leading-relaxed text-slate-500 font-code text-xs">
                            System Version 2.0. The decentralized trading grid for modern operators. Secure. Local. Encrypted.
                        </p>
                        <div className="flex items-center gap-2 text-cyber font-bold pt-2 text-xs uppercase tracking-widest font-mech">
                            <Cpu size={16} />
                            <span>Engineered for Gamers</span>
                        </div>
                    </div>

                    {/* COLUMN 2: DISCOVER (Internal Links) */}
                    <div>
                        <h3 className="text-white font-mech font-bold mb-6 text-lg uppercase tracking-wider flex items-center gap-2">
                            <Zap size={16} className="text-purple-500"/> Navigation
                        </h3>
                        <ul className="space-y-3 font-code text-xs">
                            <li><Link to="/about" className="hover:text-cyber transition flex items-center gap-2"><span className="text-void-700">&gt;</span> SYSTEM_INTEL</Link></li>
                            <li><Link to="/marketplace" className="hover:text-cyber transition flex items-center gap-2"><span className="text-void-700">&gt;</span> GLOBAL_EXCHANGE</Link></li>
                            <li><Link to="/community" className="hover:text-cyber transition flex items-center gap-2"><span className="text-void-700">&gt;</span> SECTOR_COMMS</Link></li>
                            <li><Link to="/profile" className="hover:text-cyber transition flex items-center gap-2"><span className="text-void-700">&gt;</span> OPERATOR_ID</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: CONNECT (Socials) */}
                    <div>
                        <h3 className="text-white font-mech font-bold mb-6 text-lg uppercase tracking-wider">
                            <Activity size={16} className="text-purple-800"/> Frequency
                        </h3>
                        <ul className="space-y-3 font-code text-xs">
                            <li>
                                <a href="https://discord.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#5865F2] transition">
                                    <FaDiscord size={16} /> DISCORD_SERVER
                                </a>
                            </li>
                            <li>
                                <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#9146FF] transition">
                                    <FaTwitch size={16} /> LIVE_STREAMS
                                </a>
                            </li>
                            <li>
                                <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#66c0f4] transition">
                                    <FaSteam size={16} /> STEAM_GROUP
                                </a>
                            </li>
                            <li>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#FF0000] transition">
                                    <FaYoutube size={16} /> VIDEO_LOGS
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMN 4: DEVELOPER INFO */}
                    <div>
                        <h3 className="text-white font-mech font-bold mb-6 text-lg flex items-center gap-2 uppercase tracking-wider">
                            <Code2 size={20} className="text-cyber" /> Architect
                        </h3>
                        <p className="mb-4 text-slate-500 text-xs font-code">
                            System built by <span className="text-white font-bold">Shlok Parsekar</span>.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/shlokparsekar27"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-void-800 p-3 clip-chamfer hover:bg-white hover:text-black transition border border-white/10 text-slate-400"
                                aria-label="GitHub Profile"
                            >
                                <FaGithub size={20} />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/shlok-parsekar"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-void-800 p-3 clip-chamfer hover:bg-[#0077b5] hover:text-white transition border border-white/10 text-slate-400"
                                aria-label="LinkedIn Profile"
                            >
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="font-code text-xs text-slate-600">&copy; {new Date().getFullYear()} GAMEROAM_SYSTEMS. ALL RIGHTS RESERVED.</p>

                    <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-wider font-mech">
                        <Link to="/privacy" className="hover:text-cyber transition flex items-center gap-1"><Shield size={12}/> Security Protocols</Link>
                        <Link to="/terms" className="hover:text-cyber transition flex items-center gap-1"><Shield size={12}/> Operator Agreement</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}