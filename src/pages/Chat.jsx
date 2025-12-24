import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Paperclip, Loader2, Trash2, Check, CheckCheck, MoreVertical, ArrowLeft, XCircle, Shield, Radio } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

// --- MEDIA COMPONENT ---
const MediaMessage = ({ path, onLoaded }) => {
  const [mediaUrl, setMediaUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function download() {
      try {
        setLoading(true);
        const { data } = await supabase.storage.from('chat-uploads').download(path);
        if (data) setMediaUrl(URL.createObjectURL(data));
      } catch (e) {
        // silent fail
      } finally { setLoading(false); }
    }
    if (path) download();
  }, [path]);

  if (loading) return <div className="text-[10px] text-cyber font-code animate-pulse">DOWNLOADING_ASSET...</div>;
  if (!mediaUrl) return null;

  const isVideo = path.match(/\.(mp4|webm|ogg)$/i);
  return isVideo ? (
    <video 
      src={mediaUrl} 
      controls 
      className="max-w-full max-h-[250px] clip-chamfer mt-2 border border-white/10 bg-black"
      onLoadedData={onLoaded}
    />
  ) : (
    <img 
      src={mediaUrl} 
      alt="Shared" 
      className="max-w-full max-h-[250px] clip-chamfer mt-2 cursor-pointer object-cover border border-white/10 hover:border-cyber/50 transition" 
      onClick={() => window.open(mediaUrl)} 
      onLoad={onLoaded}
    />
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
  
  const chatContainerRef = useRef(null); 
  const fileInputRef = useRef(null);
  const myId = session.user.id;

  useEffect(() => {
    if (!receiverId) return;

    supabase.from('profiles').select('*').eq('id', receiverId).single()
      .then(({ data }) => setReceiver(data));

    fetchMessages();
    markAsRead();

    const channel = supabase.channel(`chat_room:${receiverId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const eventType = payload.eventType;
        const newRecord = payload.new;
        
        if (eventType === 'INSERT' && newRecord) {
          if ((newRecord.sender_id === receiverId && newRecord.receiver_id === myId) || 
              (newRecord.sender_id === myId && newRecord.receiver_id === receiverId)) {
            fetchMessages(); 
            if (newRecord.sender_id === receiverId) markAsRead();
          }
        }
        if (eventType === 'UPDATE' || eventType === 'DELETE') {
           fetchMessages();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [receiverId]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTop = scrollHeight - clientHeight;
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });

    const visibleMessages = (data || []).filter(msg => {
      if (msg.sender_id === myId && msg.deleted_by_sender) return false;
      if (msg.receiver_id === myId && msg.deleted_by_receiver) return false;
      return true;
    });

    setMessages(visibleMessages);
  }

  async function markAsRead() {
    await supabase.from('messages').update({ is_read: true }).eq('sender_id', receiverId).eq('receiver_id', myId).eq('is_read', false);
  }

  async function handleSendMessage(e) {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    const { error } = await supabase.from('messages').insert({ sender_id: myId, receiver_id: receiverId, content: newMessage.trim() });
    if (!error) setNewMessage('');
  }

  async function handleFileUpload(e) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const path = `${[myId, receiverId].sort().join('-')}/${Date.now()}.${file.name.split('.').pop()}`;
    
    setUploading(true);
    const { error } = await supabase.storage.from('chat-uploads').upload(path, file);
    if (!error) {
      await supabase.from('messages').insert({ sender_id: myId, receiver_id: receiverId, media_url: path });
    }
    setUploading(false);
  }

  async function handleDeleteSingleMessage(msgId, mediaUrl) {
    if (!confirm("CONFIRM DELETION: Remove this data packet?")) return;
    await supabase.from('messages').delete().eq('id', msgId);
    if (mediaUrl) await supabase.storage.from('chat-uploads').remove([mediaUrl]);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  }

  async function handleClearHistory() {
    if (!confirm("PURGE HISTORY: This will wipe your local logs.")) return;
    await supabase.from('messages').update({ deleted_by_sender: true }).eq('sender_id', myId).eq('receiver_id', receiverId);
    await supabase.from('messages').update({ deleted_by_receiver: true }).eq('receiver_id', myId).eq('sender_id', receiverId);
    setMessages([]); 
    setShowMenu(false);
  }

  if (!receiver) return <div className="flex-1 flex items-center justify-center text-cyber font-code text-xs animate-pulse">ESTABLISHING LINK...</div>;

  return (
    <div className="flex flex-col h-full bg-void-950 relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* HEADER */}
      <div className="p-3 md:p-4 border-b border-white/5 flex justify-between items-center bg-void-900/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/chat')} className="md:hidden p-1 -ml-1 text-slate-400 hover:text-cyber transition"><ArrowLeft size={20} /></button>
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/user/${receiverId}`)}>
            <div className="relative w-10 h-10 clip-chamfer bg-void-800 border border-white/10 group-hover:border-cyber/50 transition overflow-hidden">
               {receiver.avatar_url ? (
                 <img src={receiver.avatar_url} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center font-mech font-bold text-white text-lg">{receiver.username?.[0]}</div>
               )}
               {/* Online Dot */}
               <div className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 shadow-[0_0_5px_#10b981]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-mech font-bold text-white text-sm md:text-base truncate group-hover:text-cyber transition tracking-wide">
                {receiver.username.toUpperCase()}
              </h3>
              <p className="text-[10px] font-code text-emerald-500 flex items-center gap-1">
                <Shield size={10} /> ENCRYPTED_CONN
              </p>
            </div>
          </div>
        </div>

        {/* Options Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-500 hover:text-cyber transition"><MoreVertical size={18}/></button>
          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-void-900 border border-void-700 shadow-2xl z-20 clip-chamfer animate-in slide-in-from-top-2">
              <button onClick={handleClearHistory} className="w-full text-left px-4 py-3 text-xs font-code text-flux hover:bg-flux/10 flex items-center gap-2 transition uppercase tracking-wider">
                <XCircle size={14}/> PURGE_LOGS
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId;
          return (
            <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%]`}>
                
                {isMe && (
                  <button 
                    onClick={() => handleDeleteSingleMessage(msg.id, msg.media_url)}
                    className="mb-2 text-void-600 hover:text-flux opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    title="Delete Packet"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                <div className={`clip-chamfer p-3 relative border ${
                  isMe 
                    ? 'bg-cyber/10 border-cyber/30 text-white' 
                    : 'bg-void-800 border-white/10 text-slate-300'
                }`}>
                  {msg.media_url && <MediaMessage path={msg.media_url} onLoaded={scrollToBottom} />}
                  
                  {msg.content && <p className="leading-relaxed text-sm font-ui whitespace-pre-wrap break-words">{msg.content}</p>}
                  
                  <div className={`text-[9px] font-code flex items-center justify-end gap-1 mt-2 uppercase tracking-wider ${isMe ? 'text-cyber/70' : 'text-slate-600'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isMe && (msg.is_read ? <CheckCheck size={10} className="text-cyber"/> : <Check size={10}/>)}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-void-900 border-t border-white/5">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
          
          <button type="button" onClick={() => fileInputRef.current.click()} disabled={uploading} className="p-3 text-slate-500 hover:text-cyber hover:bg-void-800 clip-chamfer transition shrink-0 border border-transparent hover:border-cyber/30">
            {uploading ? <Loader2 className="animate-spin" size={18}/> : <Paperclip size={18}/>}
          </button>
          
          <div className="flex-1 relative">
            <input 
              value={newMessage} 
              onChange={e => setNewMessage(e.target.value)} 
              placeholder="TRANSMIT_DATA..." 
              className="w-full bg-void-950 text-white font-code p-3 pr-10 border border-void-700 focus:border-cyber outline-none text-sm clip-chamfer placeholder:text-void-700 transition"
            />
            {newMessage && <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyber animate-pulse" />}
          </div>
          
          <button type="submit" disabled={!newMessage.trim() || uploading} className="p-3 bg-cyber hover:bg-white text-black clip-chamfer transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0 font-bold">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}