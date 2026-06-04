import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  Clock, Image, MoreHorizontal, Paperclip, Phone, Search, 
  Send, Smile, SquarePen, Trash2, Video, X, Sparkles, Loader2 
} from 'lucide-react';
import { 
  fetchConversations, 
  createConversation, 
  fetchChatHistory, 
  sendMessage, 
  searchUsers 
} from '../../../api/messageApi';
import { draftAiMessage } from '../../../api/aiApi';
import { fetchMe } from '../../../api/profileApi';
import { clearActiveChat } from '../../../store/slices/messageSlice';
import type { AppDispatch, RootState } from '../../../store';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';

// Validation schema using Yup
const validationSchema = Yup.object().shape({
  content: Yup.string().trim().required('Message content cannot be empty'),
});

export default function ChatPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux states
  const { conversations, activeChat, searchResults, loading, activeChatLoading } = useSelector(
    (state: RootState) => state.messages
  );
  const { me } = useSelector((state: RootState) => state.profile);

  // Component states
  const [activeConvId, setActiveConvId] = useState<string | number | null>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [convSearchQuery, setConvSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tempUsers, setTempUsers] = useState<Record<string | number, any>>({});

  // AI draft states
  const [isAiDraftOpen, setIsAiDraftOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMsgIdRef = useRef<string | number | null>(null);

  // Get current logged in user ID dynamically
  const currentUserId = me?.id;

  // 1. Fetch current user (me) if not loaded
  useEffect(() => {
    if (!me) {
      dispatch(fetchMe());
    }
  }, [dispatch, me]);

  // 2. Fetch conversations list initially
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // 3. Real-time background polling for conversations (every 8 seconds when active)
  useEffect(() => {
    const poll = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchConversations());
      }
    };
    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // 4. Real-time background polling for selected chat messages (every 4 seconds when active)
  useEffect(() => {
    if (!activeConvId) return;
    dispatch(fetchChatHistory(activeConvId));

    const poll = () => {
      if (document.visibilityState === 'visible') {
        dispatch(fetchChatHistory(activeConvId));
      }
    };
    const interval = setInterval(poll, 4000);

    return () => clearInterval(interval);
  }, [dispatch, activeConvId]);

  // 5. Search directory users when query changes and new chat dialog is open
  useEffect(() => {
    if (isNewChatOpen) {
      dispatch(searchUsers(searchQuery));
    }
  }, [isNewChatOpen, searchQuery, dispatch]);

  // 6. Auto-scroll to bottom only when a new message actually arrives (prevent scroll lock on poll)
  useEffect(() => {
    if (activeChat.length === 0) return;
    const lastMsg = activeChat[activeChat.length - 1];
    
    if (lastMsg.id !== lastMsgIdRef.current) {
      lastMsgIdRef.current = lastMsg.id;
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [activeChat]);

  // Formik form setup for writing messages
  const formik = useFormik({
    initialValues: { content: '' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!values.content.trim() || !activeConvId) return;
      const textToSend = values.content.trim();
      resetForm();
      
      await dispatch(sendMessage({ conversationId: activeConvId, content: textToSend }));
      dispatch(fetchConversations()); // Refresh conv list immediately
    }
  });

  // Handle switching to a conversation
  const handleSelectConversation = (id: string | number) => {
    dispatch(clearActiveChat());
    setActiveConvId(id);
    dispatch(fetchChatHistory(id));
    setIsMenuOpen(false);
    setIsAiDraftOpen(false);
    formik.resetForm(); // Ensure text field is clean for the next user
  };

  // Start new conversation from Directory Search
  const handleStartNewChat = async (user: any) => {
    setIsNewChatOpen(false);
    setSearchQuery('');
    
    const resultAction = await dispatch(createConversation({ participantId: user.id }));
    if (createConversation.fulfilled.match(resultAction)) {
      const newConv = resultAction.payload;
      const convId = newConv.id || newConv.conversationId || `temp-${Date.now()}`;
      
      // Temporarily cache this user object locally so the name shows instantly
      setTempUsers(prev => ({ ...prev, [convId]: user }));
      
      dispatch(clearActiveChat());
      setActiveConvId(convId);
      dispatch(fetchChatHistory(convId));
      dispatch(fetchConversations());
      formik.resetForm(); // Ensure text field is clean for the new user
    }
  };

  // Clear active chat pane selection
  const handleClearChat = () => {
    dispatch(clearActiveChat());
    setActiveConvId(null);
    setIsMenuOpen(false);
    setIsAiDraftOpen(false);
  };

  // Resolve chat partner's user object from conversation
  const resolveUserObj = (conv: any) => {
    const convId = conv.id || conv.conversationId;
    // Check if we have cached this user temporarily from New Chat trigger
    if (convId && tempUsers[convId]) return tempUsers[convId];

    // Decode token dynamically to resolve current logged-in user synchronously
    const token = localStorage.getItem("store_token");
    let currentId = currentUserId;
    if (!currentId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                   payload.nameid || 
                   payload.id || 
                   payload.sub;
        if (id) currentId = Number(id);
      } catch (e) {
        console.error(e);
      }
    }

    if (conv.otherUser) return conv.otherUser;
    if (conv.user) return conv.user;
    
    if (currentId) {
      if (Number(conv.participant1Id) === Number(currentId)) {
        return conv.participant2 || conv.participant1;
      }
      return conv.participant1 || conv.participant2;
    }
    
    return conv.participant2 || conv.participant1 || conv.user || conv.otherUser;
  };

  // Generate draft text using AI message writer
  const handleAiDraftGenerate = async () => {
    const currentActiveConv = conversations.find(c => c.id === activeConvId);
    const activePartner = currentActiveConv ? resolveUserObj(currentActiveConv) : null;
    if (!activePartner) return;

    setAiGenerating(true);
    try {
      const result = await dispatch(draftAiMessage({
        recipientId: activePartner.id,
        context: aiPrompt || 'Write a professional friendly message response.'
      })).unwrap();
      
      if (result?.answer) {
        formik.setFieldValue('content', result.answer);
        setIsAiDraftOpen(false);
        setAiPrompt('');
      }
    } catch (err) {
      console.error('Failed to generate AI message:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Filter conversations by local search input and remove unresolved / invalid partners
  const filteredConversations = conversations.filter(conv => {
    const user = resolveUserObj(conv);
    if (!user) return false;

    // Decode token dynamically to filter out yourself (if any database state points to yourself)
    const token = localStorage.getItem("store_token");
    let currentId = currentUserId;
    if (!currentId && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const id = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || 
                   payload.nameid || 
                   payload.id || 
                   payload.sub;
        if (id) currentId = Number(id);
      } catch (e) {}
    }

    if (currentId && Number(user.id) === Number(currentId)) {
      return false;
    }

    const displayName = user.fullName || user.username || user.userName;
    if (!displayName || displayName === 'Chat Partner') {
      return false;
    }

    return displayName.toLowerCase().includes(convSearchQuery.toLowerCase());
  });

  const currentActiveConv = conversations.find(c => c.id === activeConvId);
  const activePartner = currentActiveConv ? resolveUserObj(currentActiveConv) : null;

  // Decide if we should show a loading overlay or just a background update
  const showInitialLoading = activeChatLoading && activeChat.length === 0;

  return (
    <div className="flex h-screen w-full bg-[#F4F2EE] text-slate-800 overflow-hidden antialiased font-sans">
      <div className="max-w-6xl w-full mx-auto flex h-full bg-white shadow-md border-x border-slate-200">
        
        {/* ─── LEFT PANEL: CONVERSATIONS LIST ─────────────────────────── */}
        <div className="w-[340px] flex flex-col h-full bg-white border-r border-slate-100 flex-shrink-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Messaging</h1>
            <button 
              onClick={() => setIsNewChatOpen(true)} 
              className="p-2 hover:bg-slate-100 text-[#0A66C2] rounded-full transition-all"
              title="New message"
            >
              <SquarePen size={20} />
            </button>
          </div>
          
          {/* Search box */}
          <div className="p-3 border-b border-slate-50 bg-slate-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={convSearchQuery} 
                onChange={(e) => setConvSearchQuery(e.target.value)} 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30 transition-all font-medium" 
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
            {loading && conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                <Loader2 className="animate-spin text-[#0A66C2]" size={20} />
                <span className="text-xs font-semibold">Loading chats...</span>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-xs font-medium text-slate-400">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv, index) => {
                const partner = resolveUserObj(conv);
                const convId = conv.id || conv.conversationId || `conv-${index}`;
                const isActive = convId === activeConvId;
                const displayName = partner?.fullName || partner?.username || partner?.userName || 'Chat Partner';
                
                return (
                  <button 
                    key={convId} 
                    onClick={() => handleSelectConversation(convId)} 
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left border ${
                      isActive 
                        ? 'bg-blue-50/50 border-[#0A66C2]/30 shadow-sm' 
                        : 'hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <div className="relative flex-shrink-0 mt-0.5">
                      <Avatar className="h-11 w-11 border-2 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage src={partner?.avatarUrl || partner?.profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-[#0A66C2]/10 text-[#0A66C2] font-bold text-sm">
                          {displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900 truncate block">{displayName}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight shrink-0">
                          {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium truncate block">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: CHAT WINDOW ─────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full bg-[#F3F2EF]/40">
          {activeConvId ? (
            <div className="flex flex-col flex-1 h-full">
              
              {/* Active Conversation Header */}
              <div className="h-16 border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 bg-white shadow-sm relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                      <AvatarImage src={activePartner?.avatarUrl || activePartner?.profilePicture} className="object-cover" />
                      <AvatarFallback className="bg-[#0A66C2]/10 text-[#0A66C2] font-bold text-sm">
                        {(activePartner?.fullName || activePartner?.username || activePartner?.userName || 'C').charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block leading-tight">
                      {activePartner?.fullName || activePartner?.username || activePartner?.userName || 'Chat Partner'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                      {activePartner?.title || 'User'}
                      <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px]">• Active now</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-slate-500">
                  <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><Video size={18} /></button>
                  <button className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors"><Phone size={16} /></button>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-slate-100 text-slate-600 rounded-full transition-colors relative"><MoreHorizontal size={18} /></button>
                  {isMenuOpen && (
                    <div className="absolute right-6 top-14 mt-1 w-44 rounded-xl border border-slate-100 bg-white p-1 text-slate-700 shadow-lg z-20">
                      <button 
                        onClick={handleClearChat} 
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                      >
                        <Trash2 size={14} /> Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Message List area */}
              <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 bg-white" ref={scrollRef}>
                {showInitialLoading ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-slate-400 gap-2">
                    <Loader2 className="animate-spin text-[#0A66C2]" size={24} />
                    <span className="text-xs font-semibold">Loading chat history...</span>
                  </div>
                ) : activeChat.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center text-slate-400 space-y-3">
                    <div className="p-4 bg-slate-50 rounded-full">
                      <Smile size={32} className="text-[#0A66C2]/40" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700">Say hello!</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Send a friendly introduction to get the conversation started.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {activeChat.map((msg, index) => {
                      const isMe = Number(msg.senderId) === Number(currentUserId);
                      const msgId = msg.id || `msg-${index}`;
                      return (
                        <div key={msgId} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex gap-2.5 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            
                            {/* Avatar for partner */}
                            {!isMe && (
                              <Avatar className="h-8 w-8 shrink-0 border border-slate-100 shadow-sm mt-0.5">
                                <AvatarImage src={activePartner?.avatarUrl || activePartner?.profilePicture} className="object-cover" />
                                <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs">
                                  {(activePartner?.fullName || 'U').charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className="flex flex-col">
                              {/* Message bubble with clean wrapping */}
                              <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm break-words whitespace-pre-wrap ${
                                isMe 
                                  ? 'bg-[#0A66C2] text-white rounded-tr-none' 
                                  : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                              }`}>
                                <p className="m-0 font-medium">{msg.content}</p>
                              </div>
                              <span className={`text-[9px] font-black text-slate-400 mt-1.5 uppercase tracking-tighter ${isMe ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Input & Form Area */}
              <div className="p-4 border-t border-slate-100 bg-white flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
                
                {/* AI Draft input tray */}
                {isAiDraftOpen && (
                  <div className="mb-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2.5 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-[#663399]">
                      <Sparkles size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">AI Copilot Messenger</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Context (e.g. 'follow up about job', 'thank them for the call')"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="h-10 bg-white border-slate-200 text-xs font-medium focus-visible:ring-[#0A66C2]"
                        disabled={aiGenerating}
                      />
                      <Button
                        onClick={handleAiDraftGenerate}
                        disabled={aiGenerating}
                        className="h-10 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold px-4 rounded-lg flex gap-1.5"
                      >
                        {aiGenerating ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Drafting...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Generate
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsAiDraftOpen(false)}
                        className="h-10 text-slate-500 hover:bg-slate-100 font-bold px-2 rounded-lg"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                <form onSubmit={formik.handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Input 
                      name="content"
                      placeholder="Write a message..." 
                      value={formik.values.content} 
                      onChange={formik.handleChange} 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          formik.handleSubmit();
                        }
                      }}
                      className="pr-28 h-12 bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]/40 rounded-xl text-sm font-medium transition-all"
                    />
                    
                    {/* Media Attachments */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-slate-400">
                      <button type="button" className="p-1 hover:text-[#0A66C2] transition-colors"><Image size={16} /></button>
                      <button type="button" className="p-1 hover:text-[#0A66C2] transition-colors"><Paperclip size={16} /></button>
                      <button type="button" className="p-1 hover:text-[#0A66C2] transition-colors"><Smile size={16} /></button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* AI Prompt Trigger Button */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAiDraftOpen(!isAiDraftOpen)}
                      className="border-indigo-200 text-[#0A66C2] hover:bg-indigo-50 font-bold text-xs h-9 px-3.5 flex gap-1.5 rounded-full transition-all shadow-sm"
                    >
                      <Sparkles size={14} className="text-[#0A66C2]" />
                      AI Draft Message
                    </Button>

                    <div className="flex items-center gap-3">
                      <button type="button" className="text-slate-400 hover:text-slate-600 transition-colors"><Clock size={16} /></button>
                      <Button 
                        type="submit" 
                        disabled={!formik.values.content.trim()} 
                        className="h-9 px-5 bg-[#0A66C2] hover:bg-[#004182] disabled:opacity-50 text-white text-xs font-bold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                      >
                        Send
                        <Send size={12} />
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

            </div>
          ) : (
            /* Empty Chat State */
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white">
              <div className="w-16 h-16 border border-slate-100 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0A66C2] mb-4 shadow-sm">
                <SquarePen size={28} />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Your Inbox</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[240px] text-center leading-relaxed">
                Select a contact from the sidebar or search your network to start messaging.
              </p>
              <Button 
                onClick={() => setIsNewChatOpen(true)} 
                className="mt-4 bg-[#0A66C2] hover:bg-[#004182] font-bold text-xs rounded-full px-5 py-2"
              >
                New Message
              </Button>
            </div>
          )}
        </div>

      </div>

      {/* ─── DIALOG: NEW CONVERSATION DIRECTORY SEARCH ──────────────── */}
      {isNewChatOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 border border-slate-100 rounded-2xl w-full max-w-sm shadow-xl flex flex-col max-h-[460px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 flex items-center justify-between border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-none">New message</h2>
                <p className="text-xs text-slate-500 mt-1">Search the directory to start a new chat.</p>
              </div>
              <button 
                onClick={() => { setIsNewChatOpen(false); setSearchQuery(''); }} 
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 border-b border-slate-50 bg-slate-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search by name or username..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0A66C2]/30 focus:border-transparent transition-all font-medium" 
                  autoFocus 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-0.5 bg-white">
              {searchResults.length === 0 ? (
                <div className="text-center py-10 text-xs font-semibold text-slate-400">
                  No directory users found
                </div>
              ) : (
                searchResults.map((user) => {
                  const itemDisplayName = user.fullName || user.username || user.userName || 'User';
                  return (
                    <button 
                      key={user.id} 
                    onClick={() => handleStartNewChat(user)} 
                      className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl text-left transition-all border border-transparent"
                    >
                      <Avatar className="h-9 w-9 border shadow-sm">
                        <AvatarImage src={user.avatarUrl || user.profilePicture} className="object-cover" />
                        <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs">
                          {itemDisplayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block leading-tight">{itemDisplayName}</span>
                        <span className="text-[11px] font-semibold text-slate-500 mt-0.5 block">{user.title || 'Professional'}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}