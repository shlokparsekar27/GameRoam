import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, MapPin, Phone, Mail } from 'lucide-react';

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      const { user } = session;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.warn("Profile fetch error (might not exist yet):", error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {session.user.email[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{profile?.username || "Gamer"}</h1>
            <p className="text-slate-400">{session.user.email}</p>
          </div>
        </div>
        
        <div className="grid gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <Mail className="text-indigo-500" />
            <span>{session.user.email}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <Phone className="text-green-500" />
            <span>{profile?.phone_number || "No phone added"}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <MapPin className="text-red-500" />
            <span>{profile?.location || "No location set"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}