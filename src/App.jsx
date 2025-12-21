import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';

// Components
import Auth from './components/Auth';
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check for an active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  // If not logged in, show the Auth (Login) screen
  if (!session) {
    return <Auth />;
  }

  // If logged in, show the main app with Routing
  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-white font-sans">
        {/* Navbar stays at the top of all pages */}
        <Navbar session={session} />
        
        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          <Routes>
            {/* The 'path' is what shows in the browser URL bar.
               '/' means the home page.
            */}
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/profile" element={<Profile session={session} />} />
            <Route path="/marketplace" element={<Marketplace session={session} />} />
            
            {/* Redirect unknown URLs to the Dashboard */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}