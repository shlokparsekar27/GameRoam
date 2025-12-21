import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Chat from './Chat';

// Helper component for Avatar
const ProfileAvatar = ({ url, username, size = 12 }) => {
  if (url) {
    return (
      <img 
        src={url} 
        alt="Avatar" 
        className={`w-${size} h-${size} rounded-full object-cover border border-slate-700 bg-slate-800`} 
      />
    );
  }
  return (
    <div className={`w-${size} h-${size} rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-xs`}>
      {username?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

const ConversationList = ({ conversations, currentReceiverId }) => {
  return (
    <div className={`w-full md:w-80 border-r border-slate-800 bg-slate-900 flex-col flex-shrink-0 ${currentReceiverId ? 'hidden md:flex' : 'flex'}`}>
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
        <h2 className="text-xl font-bold text-white">Messages</h2>
      </div>
      <div className="overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No conversations yet.</div>
        ) : (
          conversations.map((convo) => (
            <Link
              to={`/chat/${convo.other_user.id}`}
              key={convo.other_user.id}
              className={`flex items-center p-4 space-x-3 hover:bg-slate-800/50 transition border-b border-slate-800/50 ${
                currentReceiverId === convo.other_user.id ? 'bg-indigo-900/20 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'
              }`}
            >
              <ProfileAvatar url={convo.other_user.avatar_url} username={convo.other_user.username} size={12} />
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-semibold text-slate-200 truncate">{convo.other_user.username || 'User'}</p>
                  
                  {/* UNREAD COUNT BADGE */}
                  {convo.unread_count > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/20 animate-in zoom-in">
                      {convo.unread_count}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <p className={`truncate w-32 ${convo.unread_count > 0 ? 'text-slate-300 font-medium' : ''}`}>
                    {convo.last_message?.content || (convo.last_message?.media_url ? 'Sent a file' : '')}
                  </p>
                  <span>
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

  // Logic to fetch and group messages into conversations
  const fetchConversations = useCallback(async () => {
    try {
      const myId = session.user.id;

      // 1. Fetch ALL messages involving me
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(id, username, avatar_url),
          receiver:profiles!receiver_id(id, username, avatar_url)
        `)
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Group by Partner & Count Unreads
      const partnerMap = new Map();
      
      data.forEach(msg => {
        const isMeSender = msg.sender_id === myId;
        const partner = isMeSender ? msg.receiver : msg.sender;
        
        if (!partner) return;

        // Initialize entry if not exists
        if (!partnerMap.has(partner.id)) {
          partnerMap.set(partner.id, {
            other_user: partner,
            last_message: msg,
            last_message_at: msg.created_at,
            unread_count: 0 // Initialized as snake_case
          });
        }
        
        // INCREMENT UNREAD COUNT
        // FIXED: Using snake_case 'unread_count' here to match the initialization
        if (!isMeSender && !msg.is_read) {
          partnerMap.get(partner.id).unread_count += 1; 
        }
      });

      setConversations(Array.from(partnerMap.values()));
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  }, [session.user.id]);

  useEffect(() => {
    fetchConversations();

    // Listen for ANY change in messages to update badge instantly
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchConversations]);

  return (
    <div className="flex h-[calc(100vh-5rem)] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-500">
      
      {/* 1. SIDEBAR (Conversation List) */}
      {loading ? (
        <div className="w-full md:w-80 border-r border-slate-800 p-8 text-slate-500">Loading...</div>
      ) : (
        <ConversationList conversations={conversations} currentReceiverId={receiverId} />
      )}

      {/* 2. CHAT AREA */}
      {receiverId ? (
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          <Chat session={session} />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500 bg-slate-950">
           <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800">
             <span className="text-4xl">💬</span>
           </div>
           <p className="text-lg font-medium text-white">Your Messages</p>
           <p>Select a conversation to start chatting.</p>
        </div>
      )}
    </div>
  );
}