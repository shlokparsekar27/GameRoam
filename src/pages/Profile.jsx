import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, MapPin, Phone, Mail, Edit2, Save, X, LogOut, Camera, Loader2 } from 'lucide-react';

export default function Profile({ session, initialProfile, onProfileUpdate }) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // New state for image upload

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    phone_number: '',
    location: '',
    avatar_url: ''
  });

  // Load initial data when page opens
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      setFormData({
        username: initialProfile.username || '',
        phone_number: initialProfile.phone_number || '',
        location: initialProfile.location || '',
        avatar_url: initialProfile.avatar_url || ''
      });
    }
  }, [initialProfile]);

  // Handle Logout with Confirmation
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      await supabase.auth.signOut();
    }
  };

  // --- NEW: Handle Image Upload ---
  async function handleImageUpload(event) {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      // 3. Update Form Data with the new URL
      setFormData({ ...formData, avatar_url: data.publicUrl });

    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          phone_number: formData.phone_number,
          location: formData.location,
          avatar_url: formData.avatar_url,
          updated_at: new Date()
        })
        .eq('id', session.user.id);

      if (error) throw error;
      
      // 1. Update Local State
      setProfile({ ...profile, ...formData });
      // 2. Tell App.jsx to update the Navbar!
      onProfileUpdate(); 
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-white">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background Blur */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 blur-3xl" />

        {/* Edit Toggle Button */}
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="absolute top-8 right-8 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition"
        >
          {isEditing ? <X size={20} /> : <Edit2 size={20} />}
        </button>

        {/* Header Section */}
        <div className="relative flex flex-col md:flex-row items-center gap-8 mb-10 mt-4">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-slate-900 shadow-xl overflow-hidden bg-slate-800 relative">
               {/* Show uploading spinner over image if uploading */}
               {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                  <Loader2 className="animate-spin text-white" size={32} />
                </div>
              )}

              {formData.avatar_url || profile?.avatar_url ? (
                <img 
                  src={isEditing ? formData.avatar_url : profile?.avatar_url} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-indigo-500 bg-slate-950">
                  {session.user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            {isEditing && !uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition pointer-events-none">
                <Camera className="text-white" />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">
              {profile?.username || "New Gamer"}
            </h1>
            <p className="text-slate-400 flex items-center justify-center md:justify-start gap-2">
              <Mail size={16} /> {session.user.email}
            </p>
          </div>
        </div>
        
        {isEditing ? (
          /* EDIT MODE FORM */
          <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="grid md:grid-cols-2 gap-6">
               <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Username</label>
                <input 
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition"
                />
              </div>
              
              {/* --- NEW FILE INPUT --- */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Profile Picture</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white focus:border-indigo-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
                {uploading && <p className="text-xs text-indigo-400 mt-2">Uploading image...</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Location</label>
                <input 
                  type="text" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-indigo-500 outline-none transition"
                />
              </div>
             </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end gap-4">
               <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 rounded-xl font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || uploading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                {loading ? 'Saving...' : <><Save size={18} /> Save </>}
              </button>
            </div>
          </form>
        ) : (
          /* VIEW MODE */
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><User size={24} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Username</p>
                  <p className="font-medium text-lg">{profile?.username || "Not set"}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-400"><Phone size={24} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Phone</p>
                  <p className="font-medium text-lg">{profile?.phone_number || "Not set"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                <div className="p-3 bg-red-500/10 rounded-xl text-red-400"><MapPin size={24} /></div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Location</p>
                  <p className="font-medium text-lg">{profile?.location || "Not set"}</p>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="pt-8 mt-8 border-t border-slate-800">
              <button 
                onClick={handleLogout}
                className="w-full py-4 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold flex items-center justify-center gap-2 transition"
              >
                <LogOut size={20} /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}