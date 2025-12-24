import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Radio, Signal, Lock, ShieldCheck } from 'lucide-react';
import Chat from './Chat';

const ProfileAvatar = ({ url, username }) => {
  return (
    <div className="w-10 h-10 md:w-12 md:h-12 bg-void-800 border border-white/10 clip-chamfer flex items-center justify-center overflow-hidden shrink-0 relative group">
      {url ? (
        <img src={url} alt="Avatar" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
      ) : (
        <span className="font-mech font-bold text-white text-xs md:text-sm">{username?.[0]?.toUpperCase() || '?'}</span>
      )}
      <div className="absolute inset-0 bg-cyber/10 opacity-0 group-hover:opacity-100 transition duration-300" />
    </div>
  );
};

const ConversationList = ({ conversations, currentReceiverId }) => {
  return (
    <div className={`w-full md:w-80 border-r border-white/5 bg-void-900 flex-col flex-shrink-0 h-full ${currentReceiverId ? 'hidden md:flex' : 'flex'}`}>

      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-void-950/50 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="text-cyber animate-pulse" size={16} />
          <h2 className="text-sm font-mech font-bold text-white uppercase tracking-widest">Active Freqs</h2>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-code text-teal-500">
          <Lock size={10} /> ENCRYPTED
        </div>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar p-2 space-y-1 bg-void-900">
        {conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full opacity-50">
            <Signal className="text-void-600 mb-2" size={32} />
            <p className="text-void-500 font-code text-xs">NO SIGNAL DETECTED</p>
          </div>
        ) : (
          conversations.map((convo) => (
            <Link
              to={`/chat/${convo.other_user.id}`}
              key={convo.other_user.id}
              className={`flex items-center p-3 gap-3 transition clip-chamfer relative group border border-transparent ${currentReceiverId === convo.other_user.id
                ? 'bg-cyber/5 border-cyber/30'
                : 'hover:bg-void-800 hover:border-white/5'
                }`}
            >
              {/* Active Indicator Bar */}
              {currentReceiverId === convo.other_user.id && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-cyber shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
              )}

              <ProfileAvatar url={convo.other_user.avatar_url} username={convo.other_user.username} />

              <div className="flex-1 min-w-0 z-10">
                <div className="flex justify-between items-center mb-1">
                  <p className={`font-mech font-bold uppercase text-xs md:text-sm truncate ${currentReceiverId === convo.other_user.id ? 'text-cyber' : 'text-slate-300 group-hover:text-white'}`}>
                    {convo.other_user.username || 'UNKNOWN_ID'}
                  </p>

                  {/* UNREAD COUNT BADGE */}
                  {convo.unread_count > 0 && (
                    <span className="bg-flux text-black text-[9px] font-bold font-code px-1.5 py-0.5 clip-chamfer shadow-[0_0_10px_rgba(255,0,60,0.5)] animate-pulse">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-[9px] md:text-[10px] font-code text-slate-500">
                  <p className={`truncate max-w-[120px] ${convo.unread_count > 0 ? 'text-white' : ''}`}>
                    {convo.last_message?.content || (convo.last_message?.media_url ? '[DATA_FILE]' : 'INIT_HANDSHAKE...')}
                  </p>
                  <span className="opacity-50">
                    {new Date(convo.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default function ChatPage({ session }) {
  const { receiverId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    try {
      const myId = session.user.id;
      const { data, error } = await supabase
        .from('messages')
        .select(`*, sender:profiles!sender_id(id, username, avatar_url), receiver:profiles!receiver_id(id, username, avatar_url)`)
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const partnerMap = new Map();
      data.forEach(msg => {
        const isMeSender = msg.sender_id === myId;
        const partner = isMeSender ? msg.receiver : msg.sender;
        if (!partner) return;

        if (!partnerMap.has(partner.id)) {
          partnerMap.set(partner.id, {
            other_user: partner,
            last_message: msg,
            last_message_at: msg.created_at,
            unread_count: 0
          });
        }
        if (!isMeSender && !msg.is_read) {
          partnerMap.get(partner.id).unread_count += 1;
        }
      });
      setConversations(Array.from(partnerMap.values()));
    } catch (error) { console.error("Error:", error); }
    finally { setLoading(false); }
  }, [session.user.id]);

  useEffect(() => {
    fetchConversations();
    const channel = supabase.channel('public:messages').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => { fetchConversations(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchConversations]);

  useEffect(() => { window.scrollTo(0, 0); }, [receiverId]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-24 md:pb-12 h-[calc(100vh-6rem)] md:h-[calc(100vh-8rem)]">
      <div className="flex h-full bg-void-950 border border-white/5 clip-chamfer shadow-2xl overflow-hidden relative">

        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyber z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyber z-20 pointer-events-none" />

        {/* 1. SIDEBAR */}
        {loading ? (
          <div className="w-full md:w-80 border-r border-white/5 p-8 text-cyber font-code text-xs animate-pulse flex items-center justify-center">initializing_uplink...</div>
        ) : (
          <ConversationList conversations={conversations} currentReceiverId={receiverId} />
        )}

        {/* 2. CHAT AREA */}
        {receiverId ? (
          <div className={`flex-1 flex flex-col min-w-0 bg-void-950 relative ${!receiverId ? 'hidden md:flex' : 'flex'}`}>
            <Chat session={session} />
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500 bg-void-950 relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="w-24 h-24 bg-void-900 border border-white/10 clip-chamfer flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-cyber/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
              <Radio size={40} className="text-void-600 group-hover:text-cyber transition duration-500" />
            </div>
            <p className="text-xl font-mech font-bold text-white uppercase tracking-widest">System Standby</p>
            <p className="font-code text-xs text-slate-600 mt-2">SELECT_FREQUENCY_TO_BEGIN</p>
            <div className="mt-8 flex items-center gap-2 text-emerald-500/50 font-code text-[10px] border border-emerald-500/20 px-3 py-1 rounded-full">
              <ShieldCheck size={12} /> SECURE CONNECTION ESTABLISHED
            </div>
          </div>
        )}
      </div>
    </div>
  );
}