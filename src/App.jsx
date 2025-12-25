import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import CommandPalette from './components/CommandPalette';
import { ToastProvider } from './components/TacticalToast'; // <--- IMPORT

// Pages
import Dashboard from './pages/Dashboard';
import Arcade from './pages/Arcade';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import UserProfile from './pages/UserProfile';
import ChatPage from './pages/ChatPage';
import Community from './pages/Community';
import CommunityFeed from './pages/CommunityFeed';
import PostDetails from './pages/PostDetails';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// --- HANDLER: Returning User Logic ---
function RedirectHandler({ isReturningUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If this is a returning user (refreshed page) AND they are at the root ('/'),
    // send them to the Vault automatically.
    if (isReturningUser && location.pathname === '/') {
      navigate('/vault', { replace: true });
    }
  }, [isReturningUser, location, navigate]);

  return null;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Track if session was restored (vs fresh login)
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // 1. Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        setIsReturningUser(true);
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setIsReturningUser(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) setUserProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-void-950 flex items-center justify-center text-white">
          <Loader2 className="animate-spin text-cyber" size={48} />
        </div>
      </ToastProvider>
    );
  }

  if (!session) {
    return (
      <ToastProvider>
        <Auth />
      </ToastProvider>
    );
  }

  return (
    <Router>
      <ToastProvider>
        <ScrollToTop />
        <RedirectHandler isReturningUser={isReturningUser} />

        {/* GLOBAL COMMAND PALETTE */}
        <CommandPalette />

        {/* CORE LAYOUT WRAPPER 
           - Applied 'font-ui' and 'bg-void-900' globally.
           - 'selection:bg-cyber' makes text highlighting look tactical.
        */}
        <div className="min-h-screen bg-void-900 text-slate-300 font-ui flex flex-col relative selection:bg-cyber selection:text-black">

          <Navbar session={session} profile={userProfile} />

          {/* MAIN VIEWPORT 
              - Added 'pt-24' for Desktop HUD clearance.
              - Added 'pb-24' for Mobile Bottom Bar clearance.
              - 'md:pb-12' resets bottom padding on desktop where footer exists.
          */}
          <main className="flex-1 w-full relative z-10 pt-20 md:pt-28 pb-24 md:pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <Routes>
              {/* Redirect root to /about, so users are safe from the RedirectHandler's specific check on '/' */}
              <Route path="/" element={<Navigate to="/about" replace />} />
              <Route path="/about" element={<About />} />

              <Route path="/vault" element={<Dashboard session={session} />} />
              <Route path="/arcade" element={<Arcade />} />
              <Route path="/profile" element={<Profile session={session} initialProfile={userProfile} onProfileUpdate={() => fetchUserProfile(session.user.id)} />} />
              <Route path="/marketplace" element={<Marketplace session={session} />} />
              <Route path="/user/:userId" element={<UserProfile session={session} />} />

              <Route path="*" element={<Navigate to="/about" />} />

              <Route path="/chat" element={<ChatPage session={session} />} />
              <Route path="/chat/:receiverId" element={<ChatPage session={session} />} />
              <Route path="/community" element={<Community session={session} />} />
              <Route path="/community/feed" element={<CommunityFeed session={session} />} />
              <Route path="/community/post/:postId" element={<PostDetails session={session} />} />

              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}