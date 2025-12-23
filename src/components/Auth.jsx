import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Login and Signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // For success/error messages

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        // --- SIGN UP LOGIC ---
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match!");
        }
        
        const { error, data } = await supabase.auth.signUp({ 
          email, 
          password,
        });
        
        if (error) throw error;
        
        // Check if session was created immediately (some setups allow this) or requires email
        if (data.user && !data.session) {
          setMessage({ type: 'success', text: 'Success! Check your email to confirm your account.' });
        } else {
           // If auto-login is enabled in Supabase
           setMessage({ type: 'success', text: 'Account created successfully!' });
        }

      } else {
        // --- LOGIN LOGIC ---
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
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
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">
            Game<span className="text-indigo-500">Roam</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            {isSignUp ? "Join the Vault" : "Welcome Back"}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          
          {/* Tabs */}
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
            {/* Email Field */}
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

            {/* Password Field */}
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

            {/* Confirm Password (Only for SignUp) */}
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

            {/* Messages */}
            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium text-center ${
                message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}