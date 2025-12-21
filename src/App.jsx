import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import UserProfile from './pages/UserProfile';

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // <--- Shared Profile Data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
      else setLoading(false);
    });

    // 2. Listen for Auth Changes
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

  // Shared function to fetch/refresh profile
  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
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
      <div className="min-h-screen bg-[#020617] text-white font-sans">
        {/* Pass the shared profile to Navbar so it updates instantly */}
        <Navbar session={session} profile={userProfile} />
        
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            
            {/* Pass the refresh function to Profile so it can tell App to update */}
            <Route 
              path="/profile" 
              element={<Profile session={session} initialProfile={userProfile} onProfileUpdate={() => fetchUserProfile(session.user.id)} />} 
            />
            
            <Route path="/marketplace" element={<Marketplace session={session} />} />
            <Route path="/user/:userId" element={<UserProfile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}