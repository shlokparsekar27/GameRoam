import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Pages
import MyVault from './pages/MyVault';
import Profiles from './pages/Profiles';
import Market from './pages/Market';
import UserProfile from './pages/UserProfile';
import ChatPage from './pages/ChatPage';
import Community from './pages/Community';
import CommunityFeed from './pages/CommunityFeed';
import PostDetails from './pages/PostDetails';

import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else {
        setUserProfile(null);
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
      {/* 1. FLEX WRAPPER: min-h-screen + flex-col ensures full height */}
      <div className="min-h-screen bg-[#020617] text-white font-sans flex flex-col">
        
        <Navbar session={session} profile={userProfile} />
        
        {/* 2. MAIN CONTENT: flex-1 forces this div to grow and push Footer down */}
        <div className="max-w-7xl mx-auto p-6 md:p-12 w-full flex-1">
          <Routes>
            <Route path="/" element={<MyVault session={session} />} />
            <Route path="/profile" element={<Profiles session={session} initialProfile={userProfile} onProfileUpdate={() => fetchUserProfile(session.user.id)} />} />
            <Route path="/marketplace" element={<Market session={session} />} />
            <Route path="/user/:userId" element={<UserProfile session={session} />} />
            <Route path="*" element={<Navigate to="/" />} />
            <Route path="/chat" element={<ChatPage session={session} />} />
            <Route path="/chat/:receiverId" element={<ChatPage session={session} />} />
            <Route path="/community" element={<Community session={session} />} />
            <Route path="/community/feed" element={<CommunityFeed session={session} />} />
            <Route path="/community/post/:postId" element={<PostDetails session={session} />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </div>

        {/* 3. FOOTER: Always sits at the bottom now */}
        <Footer />
        
      </div>
    </Router>
  );
}