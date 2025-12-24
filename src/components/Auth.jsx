import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Loader2, Gamepad2, ArrowRight } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleOAuth(provider) {
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin, // Redirects back to your app after login
      },
    });

    if (error) setMessage({ type: 'error', text: error.message });
  }

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
      
      {/* --- BACKGROUND ANIMATION --- */}
      <style>{`
        @keyframes float-color {
          0% { transform: translate(0px, 0px) scale(1); background-color: rgba(79, 70, 229, 0.2); }
          33% { transform: translate(30px, -50px) scale(1.1); background-color: rgba(168, 85, 247, 0.2); }
          66% { transform: translate(-20px, 20px) scale(0.9); background-color: rgba(236, 72, 153, 0.2); }
          100% { transform: translate(0px, 0px) scale(1); background-color: rgba(79, 70, 229, 0.2); }
        }
        .animate-float-color { animation: float-color 10s infinite ease-in-out; }
      `}</style>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full blur-[100px] animate-float-color" style={{ animationDelay: '0s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full blur-[100px] animate-float-color" style={{ animationDelay: '-5s' }} />

      <div className="w-full max-w-md relative z-10">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight flex items-center justify-center gap-4">
            <Gamepad2 size={48} className="text-indigo-500" />
            <span>Game<span className="text-indigo-500">Roam</span></span>
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            {isSignUp ? "Join the Vault" : "Welcome Back"}
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl">
          
          {/* --- OAUTH SECTION (Primary Trust Path) --- */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-700 hover:border-slate-500 hover:bg-slate-900 text-white py-3 rounded-xl transition-all font-bold text-sm"
            >
              {/* Google SVG Icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" color="#4285F4"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" color="#34A853"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" color="#FBBC05"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" color="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              onClick={() => handleOAuth('github')}
              className="flex items-center justify-center gap-2 bg-slate-950 border border-slate-700 hover:border-slate-500 hover:bg-slate-900 text-white py-3 rounded-xl transition-all font-bold text-sm"
            >
              {/* GitHub SVG Icon */}
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-xs font-bold uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* --- TRADITIONAL EMAIL FORM --- */}
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 mt-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
              className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}