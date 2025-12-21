import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Paperclip, Loader2, Trash2, Check, CheckCheck, MoreVertical, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// --- MEDIA COMPONENT ---
const MediaMessage = ({ path }) => {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function download() {
      try {
        setLoading(true);
        const { data, error } = await supabase.storage.from('chat-uploads').download(path);
        if (data) setMediaUrl(URL.createObjectURL(data));
      } finally { setLoading(false); }
    }
    if (path) download();
  }, [path]);

  if (loading) return <div className="text-xs text-slate-500">Loading media...</div>;
  if (!mediaUrl) return null;

  const isVideo = path.match(/\.(mp4|webm|ogg)$/i);
  return isVideo ? (
    <video src={mediaUrl} controls className="max-w-[200px] md:max-w-xs rounded-lg mt-2" />
  ) : (
    <img src={mediaUrl} alt="Shared" className="max-w-[200px] md:max-w-xs rounded-lg mt-2 cursor-pointer" onClick={() => window.open(mediaUrl)} />
  );
};

// --- CHAT WINDOW ---
export default function Chat({ session }) {
  const { receiverId } = useParams(); 
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiver, setReceiver] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const myId = session.user.id;

  // 1. Load User & Messages
  useEffect(() => {
    if (!receiverId) return;

    // Fetch Receiver Profile
    supabase.from('profiles').select('*').eq('id', receiverId).single()
      .then(({ data }) => setReceiver(data));

    // Fetch Messages
    fetchMessages();
    markAsRead();

    // Subscribe to new messages
    const channel = supabase.channel(`chat:${receiverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (
          (payload.new.sender_id === receiverId && payload.new.receiver_id === myId) || 
          (payload.new.sender_id === myId && payload.new.receiver_id === receiverId)
        ) {
          fetchMessages(); 
          if (payload.new.sender_id === receiverId) markAsRead();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [receiverId]);

  // 2. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }

  async function markAsRead() {
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', receiverId).eq('receiver_id', myId).eq('is_read', false);
  }

  // --- ACTIONS ---
  async function handleSendMessage(e) {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: myId,
      receiver_id: receiverId,
      content: newMessage.trim(),
    });

    if (!error) setNewMessage('');
  }

  async function handleFileUpload(e) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const path = `${[myId, receiverId].sort().join('-')}/${Date.now()}.${file.name.split('.').pop()}`;
    
    setUploading(true);
    const { error } = await supabase.storage.from('chat-uploads').upload(path, file);
    if (!error) {
      await supabase.from('messages').insert({
        sender_id: myId,
        receiver_id: receiverId,
        media_url: path
      });
    }
    setUploading(false);
  }

  async function handleDeleteChat() {
    if (!confirm("Delete this chat history?")) return;
    await supabase.from('messages').delete().or(`and(sender_id.eq.${myId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${myId})`);
    navigate('/chat');
  }

  if (!receiver) return <div className="flex-1 flex items-center justify-center text-slate-500"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-slate-950 relative">
      
      {/* HEADER */}
      <div className="p-3 md:p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          
          {/* Back Button (Visible ONLY on mobile) */}
          <button 
            onClick={() => navigate('/chat')} 
            className="md:hidden p-1 -ml-1 text-slate-400 hover:text-white"
          >
            <ArrowLeft size={22} />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/user/${receiverId}`)}>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 overflow-hidden shrink-0">
               {receiver.avatar_url ? (
                 <img src={receiver.avatar_url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-bold text-white text-sm">{receiver.username?.[0]}</div>
               )}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm md:text-base truncate max-w-[150px] md:max-w-md">{receiver.username}</h3>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-white">
            <MoreVertical size={20}/>
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20">
              <button onClick={handleDeleteChat} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2">
                <Trash2 size={16}/> Delete History
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                {msg.media_url && <MediaMessage path={msg.media_url} />}
                {msg.content && <p className="leading-relaxed text-sm md:text-base break-words whitespace-pre-wrap">{msg.content}</p>}
                <div className={`text-[10px] flex items-center justify-end gap-1 mt-1 opacity-70`}>
                  {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  {isMe && (msg.is_read ? <CheckCheck size={12}/> : <Check size={12}/>)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-2 md:p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()} 
            disabled={uploading} 
            className="p-2 md:p-3 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition shrink-0"
          >
            {uploading ? <Loader2 className="animate-spin" size={20}/> : <Paperclip size={20}/>}
          </button>
          
          <input 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)} 
            placeholder="Message..." 
            className="flex-1 bg-slate-950 text-white p-2.5 md:p-3 rounded-xl border border-slate-800 focus:border-indigo-500 outline-none text-sm md:text-base"
          />
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() || uploading} 
            className="p-2.5 md:p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition disabled:opacity-50 shrink-0"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}