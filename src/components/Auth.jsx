import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, Gamepad2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) throw new Error("Passwords do not match!");
        
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setMessage({ type: 'success', text: 'Success! Check your email to confirm your account.' });
        } else {
           setMessage({ type: 'success', text: 'Account created successfully!' });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#020617] p-4 relative overflow-hidden">
      
      {/* --- CUSTOM ANIMATION KEYFRAMES --- */}
      <style>{`
        @keyframes float-color {
          0% {
            transform: translate(0px, 0px) scale(1);
            background-color: rgba(79, 70, 229, 0.2); /* Indigo */
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
            background-color: rgba(168, 85, 247, 0.2); /* Purple */
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
            background-color: rgba(236, 72, 153, 0.2); /* Pink */
          }
          100% {
            transform: translate(0px, 0px) scale(1);
            background-color: rgba(79, 70, 229, 0.2); /* Back to Indigo */
          }
        }
        
        /* Utility class to apply the animation */
        .animate-float-color {
          animation: float-color 10s infinite ease-in-out;
        }
      `}</style>

      {/* --- ANIMATED DECOR --- */}
      {/* Top Left Blob */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] animate-float-color" 
        style={{ animationDelay: '0s' }}
      />
      
      {/* Bottom Right Blob (Delayed for async movement) */}
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[100px] animate-float-color" 
        style={{ animationDelay: '-5s' }}
      />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight flex items-center justify-center gap-4">
            <Gamepad2 size={48} className="text-indigo-500" />
            <span>Game<span className="text-indigo-500">Roam</span></span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            {isSignUp ? "Join the Vault" : "Welcome Back"}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          
          <div className="flex bg-slate-950/50 p-1 rounded-xl mb-8 border border-slate-800/50">
            <button
              onClick={() => { setIsSignUp(false); setMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                !isSignUp ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setMessage(null); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                isSignUp ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
              />
            </div>

            {isSignUp && (
              <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 text-white pl-12 pr-4 py-3.5 rounded-xl border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                />
              </div>
            )}

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isSignUp ? 'Sign Up' : 'Sign In'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}