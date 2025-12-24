import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, Gamepad2, AlertTriangle, Fingerprint } from 'lucide-react';
import { useToast } from './TacticalToast'; // <--- IMPORT

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast(); // <--- HOOK

  async function handleOAuth(provider) {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (error) toast.error(error.message.toUpperCase());
  }

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        if (password !== confirmPassword) throw new Error("PASSWORD_MISMATCH_ERROR");
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        // Check if session exists (auto-login) or if verification is needed
        if (data.user && !data.session) {
          toast.info("VERIFICATION_REQUIRED: CHECK EMAIL.");
        } else {
          toast.success("ID_CREATED. INITIALIZING SESSION...");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("ACCESS GRANTED.");
      }
    } catch (error) { toast.error(error.message.toUpperCase()); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-void-950 p-4 relative overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber to-transparent opacity-50" />

      <div className="w-full max-w-md relative z-10">

        {/* LOGO */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 border border-cyber/30 bg-cyber/10 clip-chamfer mb-4">
            <Gamepad2 size={48} className="text-cyber animate-pulse" />
          </div>
          <h1 className="text-5xl font-mech font-bold text-white mb-1 tracking-tight uppercase">
            Game<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber to-purple-500">Roam</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-code tracking-[0.3em] uppercase">System Access Control</p>
        </div>

        <div className="bg-void-900/80 backdrop-blur-xl p-1 clip-chamfer border border-white/10 shadow-2xl">
          <div className="p-8 clip-chamfer bg-void-900 border border-void-800">

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['google', 'github'].map(p => (
                <button
                  key={p}
                  onClick={() => handleOAuth(p)}
                  className="flex items-center justify-center gap-2 bg-void-950 border border-white/10 hover:border-cyber/50 hover:bg-void-800 text-white py-3 transition-all font-code font-bold text-xs uppercase tracking-wider clip-chamfer"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-slate-600 text-[10px] font-code font-bold uppercase tracking-widest">Or Use Credentials</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyber transition-colors" size={18} />
                <input
                  type="email" required placeholder="USER_EMAIL" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-void-950 text-white font-code pl-12 pr-4 py-3 border border-void-700 focus:border-cyber outline-none transition-all placeholder:text-void-700 text-sm clip-chamfer"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyber transition-colors" size={18} />
                <input
                  type="password" required placeholder="ACCESS_CODE" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-void-950 text-white font-code pl-12 pr-4 py-3 border border-void-700 focus:border-cyber outline-none transition-all placeholder:text-void-700 text-sm clip-chamfer"
                />
              </div>

              {isSignUp && (
                <div className="relative group animate-in fade-in slide-in-from-top-2">
                  <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyber transition-colors" size={18} />
                  <input
                    type="password" required placeholder="CONFIRM_CODE" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-void-950 text-white font-code pl-12 pr-4 py-3 border border-void-700 focus:border-cyber outline-none transition-all placeholder:text-void-700 text-sm clip-chamfer"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyber hover:bg-white text-black font-mech font-bold py-4 transition-all duration-200 shadow-neon-cyan flex items-center justify-center gap-2 mt-4 clip-chamfer uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? <><Fingerprint size={18} /> INITIALIZE_ID</> : <><Fingerprint size={18} /> AUTHENTICATE</>)}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); }}
                className="text-slate-500 hover:text-cyber text-xs font-code font-bold uppercase tracking-widest transition-colors"
              >
                {isSignUp ? "Already Registered? Log In" : "New User? Register ID"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}