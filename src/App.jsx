import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; 

// Pages
import Dashboard from './pages/Dashboard';
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

// --- NEW COMPONENT: Handles the "Returning User" Logic ---
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
  
  // New state to track if the session was restored (Returning User) vs Fresh Login
  const [isReturningUser, setIsReturningUser] = useState(false);

  useEffect(() => {
    // 1. Check for existing session (Page Refresh / New Tab)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        setIsReturningUser(true); // <--- They were already logged in!
      } else {
        setLoading(false);
      }
    });

    // 2. Listen for Auth Changes (Login / Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
        // If the event is SIGNED_IN, it means they just clicked "Login", so we keep isReturningUser = false
        // This ensures they see the "About" page first, as you requested.
      } else {
        setUserProfile(null);
        setIsReturningUser(false); // Reset on logout
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
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <Router>
      <ScrollToTop />
      {/* Handles the redirect logic inside the Router context */}
      <RedirectHandler isReturningUser={isReturningUser} />
      
      <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
        <Navbar session={session} profile={userProfile} />
        
        <div className="max-w-7xl mx-auto p-6 md:p-12 w-full flex-1">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/vault" element={<Dashboard session={session} />} />
            <Route path="/profile" element={<Profile session={session} initialProfile={userProfile} onProfileUpdate={() => fetchUserProfile(session.user.id)} />} />
            <Route path="/marketplace" element={<Marketplace session={session} />} />
            <Route path="/user/:userId" element={<UserProfile session={session} />} />
            
            <Route path="*" element={<Navigate to="/" />} />
            
            <Route path="/chat" element={<ChatPage session={session} />} />
            <Route path="/chat/:receiverId" element={<ChatPage session={session} />} />
            <Route path="/community" element={<Community session={session} />} />
            <Route path="/community/feed" element={<CommunityFeed session={session} />} />
            <Route path="/community/post/:postId" element={<PostDetails session={session} />} />
            
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </Router>
  );
}