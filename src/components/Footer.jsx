import { Link } from 'react-router-dom';
import { Gamepad2, Heart, Code2 } from 'lucide-react';
import { FaDiscord, FaTwitch, FaSteam, FaYoutube, FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8 text-slate-400 text-sm mt-auto">
            <div className="max-w-7xl mx-auto px-6 md:px-12">

                {/* MAIN GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* COLUMN 1: BRAND & MISSION */}
                    <div className="space-y-4">
                        <Link to="/" className="flex items-center gap-2 text-white font-extrabold text-2xl tracking-tight">
                            <Gamepad2 className="text-indigo-500" size={28} />
                            <span>
                                Game<span className="text-indigo-500">Roam</span>
                            </span>
                        </Link>
                        <p className="leading-relaxed text-slate-500">
                            Your ultimate gateway to the gaming universe. Discover, trade, and connect with the squad in a decentralized village.
                        </p>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold pt-2">
                            <Heart size={16} className="fill-indigo-500/20" />
                            <span>Crafted for gamers</span>
                        </div>
                    </div>

                    {/* COLUMN 2: DISCOVER (Internal Links) */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Discover</h3>
                        <ul className="space-y-3">
                            <li><Link to="/about" className="hover:text-indigo-400 transition">About GameRoam</Link></li>
                            <li><Link to="/marketplace" className="hover:text-indigo-400 transition">Marketplace</Link></li>
                            <li><Link to="/community" className="hover:text-indigo-400 transition">The Village</Link></li>
                            <li><Link to="/profile" className="hover:text-indigo-400 transition">My Profile</Link></li>
                        </ul>
                    </div>

                    {/* COLUMN 3: CONNECT (Socials) */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg">Join the Squad</h3>
                        <ul className="space-y-3">
                            <li>
                                <a href="https://discord.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#5865F2] transition">
                                    <FaDiscord size={18} /> Discord
                                </a>
                            </li>
                            <li>
                                <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#9146FF] transition">
                                    <FaTwitch size={18} /> Twitch
                                </a>
                            </li>
                            <li>
                                <a href="https://store.steampowered.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#66c0f4] transition">
                                    <FaSteam size={18} /> Steam Group
                                </a>
                            </li>
                            <li>
                                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#FF0000] transition">
                                    <FaYoutube size={18} /> YouTube
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* COLUMN 4: DEVELOPER INFO (New!) */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg flex items-center gap-2">
                            <Code2 size={20} className="text-indigo-500" /> Developer
                        </h3>
                        <p className="mb-4 text-slate-500">
                            Built with passion by <span className="text-white font-medium">Shlok Parsekar</span>. Connect with me.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://github.com/shlokparsekar27"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-slate-900 p-3 rounded-lg hover:bg-indigo-600 hover:text-white transition border border-slate-800"
                                aria-label="GitHub Profile"
                            >
                                <FaGithub size={20} />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/shlok-parsekar"
                                target="_blank"
                                rel="noreferrer"
                                className="bg-slate-900 p-3 rounded-lg hover:bg-[#0077b5] hover:text-white transition border border-slate-800"
                                aria-label="LinkedIn Profile"
                            >
                                <FaLinkedin size={20} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* BOTTOM BAR */}
                <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>&copy; {new Date().getFullYear()} GameRoam. All rights reserved.</p>

                    <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-wider">
                        <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition">Terms & Conditions</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}