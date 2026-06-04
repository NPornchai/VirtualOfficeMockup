import React, { useState, useEffect } from "react";
import { RoomId, Character, Message, OfficeTask, CalendarEvent } from "./types";
import { 
  OFFICE_ROOMS, 
  INITIAL_CHARACTERS, 
  INITIAL_TASKS, 
  CALENDAR_EVENTS,
  COFFEE_RECIPES
} from "./data";
import OfficeMap from "./components/OfficeMap";
import ChatPanel from "./components/ChatPanel";
import TaskBoard from "./components/TaskBoard";
import PantryMinigame from "./components/PantryMinigame";
import ScreenShareHub from "./components/ScreenShareHub";
import { 
  Layout, 
  Users, 
  Calendar, 
  Tv, 
  Plus,
  Compass, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut, 
  Terminal, 
  Edit3,
  Coffee,
  CheckCircle,
  Clock,
  Sparkles,
  HelpCircle,
  Info,
  MoreHorizontal,
  ChevronDown,
  TrendingUp,
  DollarSign,
  CheckSquare,
  Bell,
  Percent,
  FileText,
  AlertTriangle,
  Play,
  Share2,
  Lock,
  Cpu,
  Bookmark,
  Activity,
  Send
} from "lucide-react";

export default function App() {
  // Global States
  const [activeRoomId, setActiveRoomId] = useState<RoomId>(RoomId.LOBBY);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [activeTab, setActiveTab] = useState<string>("overview"); // "overview" | "chat" | "agents" | "workflow" | "analytics" | "risk" | "reports" | "settings"
  
  // Custom states for demo counters (bottom stats bar)
  const [stats, setStats] = useState({
    activeTrades: 2,
    todayPL: 840.50,
    tasksToday: INITIAL_TASKS.filter(t => t.status !== "done").length,
    alertsCount: 1,
    winRate: 74,
    reportsCount: 3,
    overdueTasks: 0
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      senderId: "helper-bot",
      senderName: "EA Bot",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=robot&backgroundColor=cbd5e1",
      text: "AITradingTeam EA v2.4 • Standby • Balance $25,480.50 • Win rate: 74% • Ready to fire trade signals!",
      timestamp: "16:20",
      channel: "group"
    },
    {
      id: "init-2",
      senderId: "senior-dev",
      senderName: "Chart AI",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=chart&backgroundColor=c0aede",
      text: "Buy zone identified on ETH/USDT near support line at $3,450. Volume breakout is imminent!",
      timestamp: "16:22",
      channel: "group"
    },
    {
      id: "init-3",
      senderId: "risk-ai",
      senderName: "Risk AI",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=risk&backgroundColor=020617",
      text: "Enforcing stop-loss protections at $3,410. Risk ratio aligned with CEO safe-mode guidelines. Margin level: 850%. ✅ Safety status secured.",
      timestamp: "16:24",
      channel: "group"
    },
    {
      id: "init-4",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      text: "Welcome back, CEO Pliew! Connected to Mt5 Terminal • All 7 Trading AI Agents are operational in full-workspace mode.",
      timestamp: "16:25",
      channel: "group"
    }
  ]);
  
  const [tasks, setTasks] = useState<OfficeTask[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [chatInputText, setChatInputText] = useState("");
  
  // Custom dialogs floating over characters on the isometric map
  const [recentDialogs, setRecentDialogs] = useState<Record<string, string>>({
    "code-reviewer": "เช็ค Type Safety เสมอนะคะ",
    "senior-dev": "ดริปกาแฟก่อนลุยเขียนโค้ดครับ!"
  });

  // Footer / Settings states
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showConfigAlert, setShowConfigAlert] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // CEO User state customization
  const [ceoName, setCeoName] = useState<string>("พี่ปลิว (CEO)");
  const [isEditingCeoName, setIsEditingCeoName] = useState<boolean>(false);
  const [editModeActive, setEditModeActive] = useState<boolean>(false);

  // Quick stats calculations
  useEffect(() => {
    const incomplete = tasks.filter(t => t.status !== "done").length;
    setStats(prev => ({
      ...prev,
      tasksToday: incomplete
    }));
  }, [tasks]);

  const userCharacter = characters.find(c => c.id === "user") || INITIAL_CHARACTERS[0];

  // Voice synthesis fallback handler
  const triggerVoiceSynthesis = (text: string, voiceName: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#`_\\]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "th-TH";
      utterance.volume = 1.0;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech Synthesis failed:", e);
    }
  };

  // Helper to show floating message bubbles over 3D avatars for 8 seconds
  const triggerSpeechBubble = (characterId: string, text: string) => {
    const briefText = text.length > 45 ? text.substring(0, 42) + "..." : text;
    setRecentDialogs(prev => ({
      ...prev,
      [characterId]: briefText
    }));

    setTimeout(() => {
      setRecentDialogs(prev => {
        const next = { ...prev };
        delete next[characterId];
        return next;
      });
    }, 8500);
  };

  // Teleport CEO's physical room location
  const handleRoomSelect = (roomId: RoomId) => {
    setActiveRoomId(roomId);
    
    // Smoothly update CEO avatar room on the layout map
    setCharacters(prev => prev.map(c => {
      if (c.id === "user") {
        return { ...c, currentRoom: roomId };
      }
      return c;
    }));

    // Log movement in system corridor
    const selectedRoom = OFFICE_ROOMS.find(r => r.id === roomId);
    if (selectedRoom) {
      const timestampStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const systemMsg: Message = {
        id: `sys-move-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        senderAvatar: "",
        text: `คุณ CEO ย้ายพื้นที่หลักไปที่ "${selectedRoom.nameEn} (${selectedRoom.nameTh})"`,
        timestamp: timestampStr,
        channel: "group"
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  };

  // Direct DM chat/Group meeting generation trigger
  const handleSendMessage = async (text: string, channel: string) => {
    if (!text.trim()) return;
    const timestampStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `user-msg-${Date.now()}`,
      senderId: "user",
      senderName: ceoName,
      senderAvatar: userCharacter.avatarUrl,
      text: text,
      timestamp: timestampStr,
      channel: channel
    };

    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      if (channel === "group") {
        // Multi-agent Joint Office Meeting
        const response = await fetch("/api/meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: text })
        });
        const data = await response.json();

        const replyMsg: Message = {
          id: `ai-reply-${Date.now()}`,
          senderId: "system",
          senderName: "ที่ประชุมร่วม (Standup Room Hub)",
          senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=standup",
          text: data.discussion,
          timestamp: timestampStr,
          channel: "group"
        };
        setMessages(prev => [...prev, replyMsg]);
        triggerSpeechBubble("senior-dev", "วิเคราะห์พอร์ตร่วมประเด็นตลาดด่วน!");
        triggerSpeechBubble("code-reviewer", "สเปควิเคราะห์เรียบร้อยคุมเสี่ยงค่ะ");

        if (!isMuted) {
          triggerVoiceSynthesis("การสรุปบทวิเคราะห์เสร็จสิ้น ตรวจสอบกราฟสรุปได้เลยค่ะ", "Kore");
        }
      } else {
        // Direct DM message
        const activeChatHistory = messages.filter(m => m.channel === channel);
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            characterId: channel, 
            message: text,
            chatHistory: activeChatHistory 
          })
        });
        const data = await response.json();

        const responder = characters.find(c => c.id === channel) || { name: "AI Agent", statusColor: "bg-[#2b96ff]" };

        const replyMsg: Message = {
          id: `ai-reply-${Date.now()}`,
          senderId: channel,
          senderName: responder.nameTh || responder.name,
          senderAvatar: responder.avatarUrl,
          text: data.text,
          timestamp: timestampStr,
          channel: channel
        };

        setMessages(prev => [...prev, replyMsg]);
        triggerSpeechBubble(channel, data.text);

        if (!isMuted) {
          triggerVoiceSynthesis(data.text, "Kore");
        }
      }
    } catch (error) {
      console.error("Failed to generate chat reply:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct send message handler for persistent Group Chat Area on the right
  const handleGroupChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInputText.trim() || isGenerating) return;
    const currentText = chatInputText;
    setChatInputText("");
    await handleSendMessage(currentText, "group");
  };

  const handleClearHistory = (channel: string) => {
    setMessages(prev => prev.filter(m => m.channel !== channel));
  };

  // Task controllers
  const handleAddTask = (title: string, description: string, assignee: string, priority: "low" | "medium" | "high") => {
    const newTask: OfficeTask = {
      id: `task-${Date.now()}`,
      title,
      description,
      assignee,
      status: "todo",
      priority
    };
    setTasks(prev => [...prev, newTask]);
    
    // Voice Synth confirmation
    const assigneeChar = characters.find(c => c.id === assignee);
    const assignedName = assigneeChar ? assigneeChar.nameTh : "ทุกคน";
    triggerVoiceSynthesis(`มอบหมายรายการงานใหม่ให้กับ ${assignedName} สำเร็จแล้วค่ะ`, "Kore");
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: "todo" | "in_progress" | "review" | "done") => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    triggerVoiceSynthesis("ลบรายการงานเรียบร้อยแล้วค่ะ", "Kore");
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-[#e2e8f0] flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Three Column Outer Flexible Desktop Layout */}
      <div className="flex flex-1 flex-col lg:flex-row min-h-screen">
        
        {/* ==================== LEFT SIDEBAR (AI TRADE OFFICE PANELS) ==================== */}
        <aside className="w-full lg:w-60 bg-[#090d16] border-b lg:border-b-0 lg:border-r border-[#151e33] flex flex-col p-4 space-y-5 flex-shrink-0 z-20">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#141d33] select-none">
            {/* Custom glowing terminal-like icon block */}
            <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.35)]">
              <div className="w-full h-full bg-[#090d16] rounded-[6px] flex items-center justify-center">
                <Cpu className="w-4.5 h-4.5 text-blue-400 rotate-12" />
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-[15px] font-black tracking-widest text-[#f8fafc] font-display">AI TRADE</h1>
              <p className="text-[9.5px] font-semibold text-blue-400/80 font-mono tracking-widest -mt-0.5">OFFICE v2</p>
            </div>
          </div>

          {/* User Profile CEO (Customizable) */}
          <div className="bg-[#0b101c] border border-[#1e2a44] rounded-xl p-3 flex items-center gap-3 shadow-md relative group select-none">
            <div className="relative w-9 h-9 bg-slate-950 rounded-full border border-emerald-500 flex items-center justify-center p-0.5 overflow-hidden flex-shrink-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
              <img 
                src={userCharacter.avatarUrl} 
                alt="CEO avatar" 
                className="w-full h-full object-cover scale-110 rendering-pixelated"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0b101c] shadow"></span>
            </div>

            <div className="flex-1 leading-tight text-left min-w-0">
              <div className="flex items-center gap-1 text-left mb-0.5">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[8px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Online</span>
              </div>
              
              {isEditingCeoName ? (
                <div className="flex gap-1 items-center">
                  <input 
                    id="ceo-name-field"
                    type="text"
                    value={ceoName}
                    onChange={(e) => setCeoName(e.target.value)}
                    onBlur={() => setIsEditingCeoName(false)}
                    onKeyDown={(e) => { if (e.key === "Enter") setIsEditingCeoName(false); }}
                    className="bg-[#05080f] px-1 py-0.5 border border-emerald-500 rounded text-[10px] text-white max-w-[80px] font-mono font-bold font-sans"
                    autoFocus
                  />
                  <button onClick={() => setIsEditingCeoName(false)} className="text-emerald-400 text-[8px] font-extrabold uppercase">OK</button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <h4 className="text-[11px] font-black text-white truncate max-w-[95px] font-display">
                    {ceoName}
                  </h4>
                  <button onClick={() => setIsEditingCeoName(true)} className="p-0.5 hover:bg-slate-800 rounded text-gray-500 hover:text-white transition-colors cursor-pointer" title="Edit Name">
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>
              )}
              <span className="text-[9px] font-mono text-gray-400 block truncate leading-none mt-0.5">Portfolio Director</span>
            </div>
          </div>

          {/* Links navigation - SECTION HEADER matches reference */}
          <div className="flex flex-col space-y-1.5 flex-1 select-none">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-mono px-1 block text-left">
              Rooms Layout
            </span>

            {/* ● Menu Main Office - Styled parent as seen in the reference mockup */}
            <div className="pl-1 py-1 flex items-center gap-2 text-[11px] font-bold text-slate-300">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping filter drop-shadow-[0_0_3px_rgba(59,130,246,0.5)]"></span>
              <span>Menu Main Office</span>
            </div>

            <nav className="space-y-0.5 pr-0.5">
              {[
                { id: "overview", label: "Office Overview", count: null },
                { id: "chat", label: "Chat Center", count: null },
                { id: "agents", label: "AI Agents", count: "8" },
                { id: "workflow", label: "Workflow Board", count: null },
                { id: "analytics", label: "Analytics", count: null },
                { id: "risk", label: "Risk Monitor", count: "🛡️" },
                { id: "reports", label: "Reports", count: "Report" },
                { id: "settings", label: "Settings", count: null }
              ].map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`sidebar-tab-${tab.id}`}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-3 py-2 rounded-lg text-[11.5px] font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#1e2a48] border-l-2 border-blue-400 text-white shadow-inner font-extrabold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-[#121c2f]/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-400" : "bg-transparent border border-slate-700"}`}></span>
                      <span>{tab.label}</span>
                    </div>
                    {tab.count && (
                      <span className={`text-[8.5px] font-mono font-bold px-1.5 rounded-full ${
                        isSelected ? "bg-[#38bdf8]/15 text-[#38bdf8]" : "bg-slate-900 border border-slate-800 text-slate-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick teleport quicklist */}
          <div className="flex flex-col space-y-1.5 pt-2 border-t border-[#131b2c] select-none">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#475569] font-mono pl-1 text-left">
              Quick Teleport
            </span>
            <ul className="grid grid-cols-1 gap-1 font-mono text-[10px]">
              {[
                { id: RoomId.FOCUS, label: "CEO Room 👑" },
                { id: RoomId.MEETING, label: "SA Room 💻" },
                { id: RoomId.PROJECT, label: "QA Room 📋" },
                { id: RoomId.HELPDESK, label: "Helper Desk 🤖" },
                { id: RoomId.PANTRY, label: "Pantry ☕" }
              ].map(rm => (
                <li key={rm.id}>
                  <button
                    onClick={() => {
                      handleRoomSelect(rm.id);
                      setActiveTab("overview"); // Auto show Map
                    }}
                    className={`w-full px-2 py-1 rounded bg-[#0b101c]/60 hover:bg-[#121c2f] text-slate-400 hover:text-white transition-all text-left flex items-center justify-between cursor-pointer border ${
                      activeRoomId === rm.id ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/5" : "border-transparent"
                    }`}
                  >
                    <span>{rm.label}</span>
                    {activeRoomId === rm.id && <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Bottom stats indicator */}
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#131b2c] justify-center select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[9.5px] text-slate-500 font-mono uppercase tracking-wider font-bold">7 AI Agents · Online</span>
          </div>

        </aside>

        {/* ==================== CENTER COLUMN (HEADER, CORE CONTENT AND BENTO STATISTICS) ==================== */}
        <section className="flex-1 flex flex-col p-4 lg:p-5 space-y-4 overflow-hidden relative min-w-0">
          
          {/* Main Top Header panel - Symmetrical to Screenshot layout */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#090d16]/75 p-3 px-4.5 rounded-2xl border border-[#16203a] relative z-25 gap-3 shrink-0 select-none">
            <div className="flex flex-col gap-1.5 md:flex-row items-start md:items-center justify-start text-left">
              <h2 className="text-white font-sans text-xs font-black tracking-wide leading-none uppercase">
                Dashboard - AI Trading Virtual Office v2
              </h2>
              {/* Symmetrical badging tags with blue, cyan, green indicator dots */}
              <div className="flex items-center gap-2 flex-wrap md:pl-3 md:border-l md:border-[#1e2a44] mt-1 md:mt-0">
                <span className="bg-[#1e2a48] hover:bg-[#2e3e5e] transition-colors border border-slate-800 rounded-full px-2 py-0.5 text-[8.5px] font-mono text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Notion
                </span>
                <span className="bg-[#1e2a48] hover:bg-[#2e3e5e] transition-colors border border-slate-800 rounded-full px-2 py-0.5 text-[8.5px] font-mono text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span> Google Drive
                </span>
                <span className="bg-[#1e2a48] border border-emerald-500/20 rounded-full px-2 py-0.5 text-[8.5px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> MT5 · Live
                </span>
                <span className="px-1.5 py-0.5 text-[8px] font-black tracking-widest text-[#94a3b8] font-mono bg-slate-900 border border-slate-800 rounded">
                  v2.21.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* Claude orange warning badge as seen in screenshot */}
              <div className="border border-orange-500/40 bg-orange-500/10 rounded-full px-2.5 py-1 text-[9px] font-mono text-orange-400 flex items-center gap-1 tracking-wider uppercase font-bold animate-pulse">
                <span>Claude</span>
                <span className="text-[10px] text-emerald-400 font-extrabold">✔</span>
              </div>

              {/* Edit Mode style toggle button */}
              <button
                id="btn-edit-mode"
                onClick={() => {
                  setEditModeActive(!editModeActive);
                  triggerVoiceSynthesis(editModeActive ? "ปิดโหมดแก้ไข" : "เปิดใช้งานโหมดเพิ่มออเดอร์จำลองแล้วค่ะ", "Kore");
                }}
                className={`px-3 py-1 bg-gradient-to-b hover:bg-gradient-to-t rounded-xl border text-[10px] font-black tracking-wider transition-all flex items-center gap-1.5 cursor-pointer leading-tight uppercase ${
                  editModeActive 
                    ? "from-[#ff2e56]/15 to-[#ff2e56]/20 border-[#ff2e56]/30 text-rose-400 shadow-[0_0_10px_rgba(255,46,86,0.15)] animate-bounce" 
                    : "from-slate-900 to-slate-800 border-slate-800 text-slate-300 hover:border-slate-650"
                }`}
                title="Toggle visual sandbox layout"
              >
                <span>✏️</span>
                <span>{editModeActive ? "Sandbox ON" : "Edit Mode"}</span>
              </button>

              {/* User Avatar Circle with letter C */}
              <div className="w-7 h-7 rounded-full bg-indigo-600 border border-indigo-400 flex items-center justify-center text-xs font-black text-white shadow-inner" title={`${ceoName}'s Workspace`}>
                C
              </div>
            </div>
          </header>

          {/* ==================== CORE TAB LOAD AND RENDERING VIEWPORT ==================== */}
          <main className="flex-1 relative bg-[#070a13] rounded-3xl min-h-[350px] flex flex-col overflow-hidden">
            
            {/* Overview / Map View */}
            {activeTab === "overview" && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0 w-full relative">
                {/* OfficeMap expanded to absolute maximum height */}
                <div className="flex-1 min-h-0 w-full relative">
                  <OfficeMap 
                    characters={characters}
                    userCharacter={userCharacter}
                    activeRoomId={activeRoomId}
                    onRoomSelect={handleRoomSelect}
                    recentDialogs={recentDialogs}
                  />
                </div>
              </div>
            )}

            {/* Chat Center View */}
            {activeTab === "chat" && (
              <div className="flex-1 bg-[#090d16]/30 border border-[#17223b] p-3 rounded-2xl flex flex-col justify-between overflow-hidden min-h-0 max-w-full">
                <div className="flex-1 overflow-hidden">
                  <ChatPanel 
                    characters={characters}
                    messages={messages}
                    activeChannel="group"
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    onClearHistory={handleClearHistory}
                    triggerVoiceSynthesis={triggerVoiceSynthesis}
                  />
                </div>
              </div>
            )}

            {/* AI Agents Catalog */}
            {activeTab === "agents" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-5 rounded-2xl overflow-y-auto max-h-full min-h-0">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-left">
                    <h3 className="text-sm font-black text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-blue-400" /> Catalog of AI Trading Agents
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">8 active modules synced with standard MT5 terminal</p>
                  </div>
                  {/* Speaker indicator inside page */}
                  <div className="flex items-center gap-1.5 text-[9.5px] font-bold font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> AUTO SYNC ACTIVE
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {characters.map(char => (
                    <div 
                      key={char.id} 
                      className={`border p-3.5 rounded-xl text-left bg-[#0c1221] transition-all relative ${
                        char.id === "user" ? "border-emerald-500/40 bg-emerald-950/10 shadow-lg" : "border-slate-800/80 hover:border-slate-700/80"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="relative">
                          <img 
                            src={char.avatarUrl} 
                            alt={char.name} 
                            className="w-10 h-10 rounded-full border border-slate-800 bg-slate-900 object-cover scale-105 rendering-pixelated"
                            referrerPolicy="no-referrer"
                          />
                          <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0c1221] ${char.statusColor}`} />
                        </div>
                        <span className="text-[9.5px] font-bold font-mono text-slate-500 bg-slate-900/60 px-1.5 py-0.5 border border-slate-800 rounded uppercase">
                          {char.role}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white mt-2.5 font-display flex items-center gap-1.5">
                        {char.nameTh}
                        <span className="text-[9px] text-[#2b96ff] font-mono font-bold">({char.name})</span>
                      </h4>

                      <p className="text-[10px] text-gray-400 mt-1 lines-clamp-2 leading-relaxed">
                        {char.greetingTh}
                      </p>

                      <div className="flex gap-1.5 mt-3 border-t border-slate-850 pt-2.5 items-center justify-between">
                        <div className="leading-none text-left">
                          <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-widest leading-none">Status</span>
                          <span className="text-[9px] font-bold font-mono text-emerald-400 block mt-0.5">{char.status}</span>
                        </div>
                        
                        <button
                          onClick={() => {
                            handleRoomSelect(char.currentRoom);
                            setActiveTab("overview");
                            triggerSpeechBubble(char.id, char.greetingTh);
                          }}
                          className="px-2.5 py-1 rounded bg-[#15233d] hover:bg-[#1f355a] text-[9.5px] text-white font-bold transition-all flex items-center gap-1 border border-blue-400/20 cursor-pointer"
                        >
                          📍 Meet Agent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow Board View */}
            {activeTab === "workflow" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-4.5 rounded-2xl overflow-y-auto max-h-full min-h-0">
                <div className="flex-1">
                  <TaskBoard 
                    characters={characters}
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onDeleteTask={handleDeleteTask}
                  />
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {activeTab === "analytics" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-5 rounded-2xl overflow-y-auto max-h-full min-h-0 text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                      <TrendingUp className="w-4.5 h-4.5 text-blue-400" /> Real-time Trade Signal Flow
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Simulated real-time candle scanner metrics with support grids</p>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded border border-[#38bdf8]/15 animate-pulse uppercase">
                    Live Analyzer Connected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Gauge 1: Trading Volume */}
                  <div className="bg-[#0c1221] p-4 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] font-mono text-slate-500 block uppercase tracking-widest">Active Trade Volatility</span>
                    <div className="text-xl font-black text-white mt-1.5 font-sans">$434,815.12</div>
                    <div className="mt-2.5 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="w-[78%] h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                      <span>Low volatility</span>
                      <span className="text-blue-400 font-bold">78% Breakout Standard</span>
                    </div>
                  </div>

                  {/* Gauge 2: Signal Strengths */}
                  <div className="bg-[#0c1221] p-4 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] font-mono text-slate-500 block uppercase tracking-widest">Target Profit Ratio</span>
                    <div className="text-xl font-black text-emerald-400 mt-1.5 font-sans">+12.85% (Weekly)</div>
                    <div className="mt-2.5 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="w-[64%] h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                      <span>Drawdown limit</span>
                      <span className="text-emerald-400 font-bold">64% TP Win Target</span>
                    </div>
                  </div>

                  {/* Gauge 3: System Stress level */}
                  <div className="bg-[#0c1221] p-4 rounded-xl border border-slate-800">
                    <span className="text-[9.5px] font-mono text-slate-500 block uppercase tracking-widest">Compiler Stress Standard</span>
                    <div className="text-xl font-black text-sky-400 mt-1.5 font-sans">99.98% Healthy</div>
                    <div className="mt-2.5 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-1">
                      <span>Latency: 4.8ms</span>
                      <span className="text-sky-400 font-bold">95% optimal efficiency</span>
                    </div>
                  </div>
                </div>

                {/* Sub Chart Simulator lines */}
                <div className="bg-[#050914] p-4.5 rounded-xl border border-slate-850 mt-4 leading-relaxed font-mono text-[10px]">
                  <strong className="text-white block mb-1 text-xs uppercase font-sans font-black tracking-wider text-slate-300">📊 Active Trade Ledger (Simulated Feed):</strong>
                  <div className="space-y-1.5 text-slate-400">
                    <div>- <span className="text-emerald-400 font-bold">[BUY SOL/USDT]</span> Entry: $141.20 | Take-profit: $148.50 | Stop-loss: $138.00 (Executed: Chart AI)</div>
                    <div>- <span className="text-rose-400 font-bold">[SELL ETH/USDT]</span> Entry: $3,480.00 | Take-profit: $3,400.00 | Stop-loss: $3,520.00 (Completed Spot: Risk AI)</div>
                    <div>- <span className="text-slate-500">[STANDBY BTC/USDT]</span> Waiting for consolidation range breakout near $67,500 pivot level.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Monitor View */}
            {activeTab === "risk" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-5 rounded-2xl overflow-y-auto max-h-full min-h-0 text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-500" /> Portfolio Risk Shield Guard
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Enforced stop-loss protections & safety margin scales</p>
                  </div>
                  <span className="text-[9.5px] font-mono font-bold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded border border-rose-500/15 uppercase">
                    Active Protection Mode: SECURED
                  </span>
                </div>

                <div className="bg-[#0c1221] p-4.5 rounded-xl border border-slate-800 mb-4 flex items-center gap-4.5 flex-col md:flex-row justify-between">
                  <div className="space-y-1.5">
                    <span className="bg-red-500/10 text-rose-400 border border-red-500/20 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">Protector Active</span>
                    <h4 className="text-xs font-bold text-white font-display">Stop-Loss Safety Threshold: 5.0% Max Drawdraw</h4>
                    <p className="text-[10.5px] text-gray-400 leading-relaxed">
                      The Risk AI and Audit AI are continuously checking open margins. Any price fluctuation going below -5.0% on individual robot accounts will trigger automatic liquidation to hedge our trading capital.
                    </p>
                  </div>

                  <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                    <div className="bg-[#05080f] p-3 rounded-lg border border-slate-800 text-center font-mono">
                      <span className="text-[8px] text-slate-500 uppercase block">Current Drawdown</span>
                      <span className="text-lg font-black text-emerald-400 font-sans">-0.42%</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0c1221] p-4.5 rounded-xl border border-slate-850">
                    <span className="text-white block font-bold text-[11px] uppercase tracking-wide border-b border-slate-850 pb-1.5 mb-2">Leverage Limits Controller</span>
                    <ul className="space-y-1.5 text-[10px] font-mono text-slate-400 leading-relaxed">
                      <li className="flex justify-between"><span>Max Robot Leverage:</span> <span className="text-white font-bold">1:20 (Safe Mode)</span></li>
                      <li className="flex justify-between"><span>Margin Utilization:</span> <span className="text-white font-bold">14.15%</span></li>
                      <li className="flex justify-between"><span>Active Hedging Assets:</span> <span className="text-white font-bold">SOL, USDT, ETH</span></li>
                      <li className="flex justify-between"><span>Stop-loss orders armed:</span> <span className="text-emerald-400 font-bold">100% Armed</span></li>
                    </ul>
                  </div>

                  <div className="bg-[#0c1221] p-4.5 rounded-xl border border-slate-850">
                    <span className="text-white block font-bold text-[11px] uppercase tracking-wide border-b border-slate-850 pb-1.5 mb-2">Live Compliance Audit logs</span>
                    <ul className="space-y-1 text-[10px] font-mono text-slate-500">
                      <li>- [16:04:12] Audit AI - Sliced slippage checks inside Lobby Room.</li>
                      <li>- [16:12:00] Signal Dispatcher - Verified candle patterns for scalp ratios.</li>
                      <li>- [16:20:45] Risk Shield Engine - Stabilized leverage check at 1.4% drawdown.</li>
                      <li className="text-emerald-400 font-bold">- [16:25:00] Standby mode aligned successfully.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === "reports" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-5 rounded-2xl overflow-y-auto max-h-full min-h-0 text-left">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                      <FileText className="w-4.5 h-4.5 text-blue-400" /> Compiled P&L Performance Reports
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automated database summaries compiled securely on Cloud server</p>
                  </div>
                  <button 
                    onClick={() => triggerVoiceSynthesis("กำลังสร้างรายงานสถิติชุดใหม่", "Kore")}
                    className="bg-blue-600 hover:bg-blue-700 font-bold text-[9.5px] text-white px-2.5 py-1 rounded-lg border border-blue-500 cursor-pointer"
                  >
                    Generate New Report
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {[
                    { id: "REP-90", title: "Daily Performance Report - 4 Jun 2026", size: "142 KB", compiledBy: "Report AI" },
                    { id: "REP-89", title: "Weekly Strategy backtests and portfolio hedging report", size: "1.2 MB", compiledBy: "Strategy AI" },
                    { id: "REP-88", title: "Compliance ledger and tax standards compliance checks", size: "380 KB", compiledBy: "Audit AI" }
                  ].map(rep => (
                    <div key={rep.id} className="bg-[#0c1221] p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold font-mono text-xs">
                          DOC
                        </div>
                        <div className="leading-tight text-left">
                          <h4 className="text-xs font-bold text-slate-200">{rep.title}</h4>
                          <span className="text-[9px] font-mono text-slate-500 mt-1 block">Compiled by {rep.compiledBy} • Size: {rep.size}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => triggerVoiceSynthesis(`จำลองการเปิดไฟล์ตรวจสอบรายงานของ ${rep.compiledBy}`, "Kore")}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-300 font-bold cursor-pointer"
                      >
                        Download PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <div className="flex-1 bg-[#090d16]/75 border border-[#17223b] p-5 rounded-2xl overflow-y-auto max-h-full min-h-0 text-left">
                <div className="mb-4">
                  <h3 className="text-sm font-black text-white uppercase font-display tracking-widest flex items-center gap-1.5">
                    <Settings className="w-4.5 h-4.5 text-blue-400" /> Virtual Office Control Settings
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">Manage server configurations and credentials securely</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#0c1221] p-4.5 rounded-xl border border-slate-850 space-y-4">
                    <span className="text-white block font-bold text-xs uppercase tracking-wide border-b border-slate-850 pb-1.5">Credentials check</span>
                    <div className="space-y-3.5">
                      <div className="leading-normal">
                        <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Server API Status indicator:</label>
                        <div className="bg-[#05080f] px-2.5 py-2 border border-slate-850 rounded-lg text-[10.5px] text-emerald-400 font-mono flex items-center justify-between">
                          <span>GEMINI_API_KEY</span>
                          <span className="text-[9px] bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 font-bold">SECURED ON BACKEND</span>
                        </div>
                        <p className="text-[8.5px] text-slate-500 font-mono mt-1">This key is hidden inside server.ts for environment security and never sent to browser.</p>
                      </div>

                      <div className="leading-normal">
                        <label className="text-[10.5px] font-mono text-slate-400 block mb-1">Edit CEO Display Name:</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={ceoName}
                            onChange={(e) => setCeoName(e.target.value)}
                            className="bg-[#05080f] flex-1 px-3 py-1.5 border border-slate-800 rounded-lg text-xs font-mono text-white"
                          />
                          <button 
                            onClick={() => triggerVoiceSynthesis("บันทึกชื่อผู้ใช้เรียบร้อยแล้วค่ะ", "Kore")}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0c1221] p-4.5 rounded-xl border border-slate-850 space-y-4 text-left">
                    <span className="text-white block font-bold text-xs uppercase tracking-wide border-b border-slate-850 pb-1.5">AI Synthesis Preferences</span>
                    <div className="space-y-3.5 leading-relaxed">
                      
                      {/* Audio mute settings switch */}
                      <div>
                        <span className="text-[10.5px] font-mono text-slate-400 block mb-1">Speaker Volume Synthesis:</span>
                        <button
                          onClick={() => {
                            setIsMuted(!isMuted);
                            if (isMuted && 'speechSynthesis' in window) {
                              triggerVoiceSynthesis("โหมดเสียง สังเคราะห์ คำพูดเปิดทำงานเรียบร้อยค่ะ", "Kore");
                            }
                          }}
                          className={`w-full px-4 py-2 border rounded-xl text-center font-black text-xs transition-all cursor-pointer ${
                            !isMuted 
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md animate-pulse" 
                              : "bg-slate-900 border-slate-850 text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {isMuted ? "🔇 AI Voice Synthesizer: MUTED" : "🔊 AI Voice Synthesizer: ON (Thai)"}
                        </button>
                        <p className="text-[8.5px] text-slate-500 font-mono mt-1">When ON, characters speak using the browser API when they respond in chats.</p>
                      </div>

                      {/* Simulation Reset */}
                      <div>
                        <span className="text-[10.5px] font-mono text-gray-400 block mb-1">Clear Local Sandboxes:</span>
                        <button
                          onClick={() => {
                            setTasks(INITIAL_TASKS);
                            setMessages(messages.slice(0, 4));
                            triggerVoiceSynthesis("รีเซ็ตระบบฐานข้อมูลจำลองเรียบร้อยแล้วค่ะ", "Kore");
                          }}
                          className="w-full px-4 py-2 bg-[#ff2e56]/10 border border-[#ff2e56]/20 hover:bg-[#ff2e56]/15 hover:border-[#ff2e56]/30 text-[#ff2e56] font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Reset Database Sandbox
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

          {/* ==================== BENTO STATISTICS BAR AT BOTTOM (7 columns) ==================== */}
          <footer className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 select-none shrink-0" id="bento-stats-panel">
            {[
              { label: "Active Trades", value: `${stats.activeTrades}`, color: "border-blue-500/25 text-blue-400", sub: "Live signals active", icon: <TrendingUp className="w-3.5 h-3.5 text-blue-400" /> },
              { label: "Today P&L", value: `$${stats.todayPL.toFixed(2)}`, color: "border-yellow-500/20 text-yellow-400", sub: "+3.45% profit scale", icon: <DollarSign className="w-3.5 h-3.5 text-yellow-400" /> },
              { label: "Tasks Today", value: `${stats.tasksToday}`, color: "border-cyan-500/20 text-cyan-400", sub: "Remaining work", icon: <CheckSquare className="w-3.5 h-3.5 text-cyan-400" /> },
              { label: "Alerts", value: `${stats.alertsCount}`, color: "border-rose-500/25 text-rose-450", sub: "Volume breaks", icon: <Bell className="w-3.5 h-3.5 text-rose-400" /> },
              { label: "Win Rate", value: `${stats.winRate}%`, color: "border-emerald-500/20 text-emerald-400", sub: "Optimal strategy avg", icon: <Percent className="w-3.5 h-3.5 text-emerald-400" /> },
              { label: "Reports", value: `${stats.reportsCount}`, color: "border-indigo-500/20 text-indigo-400", sub: "Performance ledgers", icon: <FileText className="w-3.5 h-3.5 text-indigo-400" /> },
              { label: "Overdue", value: `${stats.overdueTasks}`, color: "border-red-500/30 text-rose-500", sub: "No critical delays", icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> }
            ].map((st, idx) => (
              <div 
                key={idx} 
                className={`bg-[#090d16]/85 border p-3 rounded-2xl text-left hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between ${st.color} shadow-lg`}
                onClick={() => {
                  triggerVoiceSynthesis(`ตรวจสอบสถิติ ${st.label}`, "Kore");
                }}
              >
                <div className="flex justify-between items-center gap-1.5 w-full">
                  <span className="text-[9px] font-mono tracking-wider font-extrabold text-slate-400 uppercase leading-none block">{st.label}</span>
                  {st.icon}
                </div>
                <div className="mt-1.5 leading-none">
                  <span className="text-[17px] font-black tracking-tight block font-display leading-none">{st.value}</span>
                  <span className="text-[7.5px] font-mono text-slate-500 tracking-wider block mt-0.5 uppercase leading-none">{st.sub}</span>
                </div>
              </div>
            ))}
          </footer>

        </section>

        {/* ==================== RIGHT SIDEBAR (LIVE CHAT & MEETING BOARD) ==================== */}
        <aside className="w-full lg:w-[350px] xl:w-[385px] bg-[#0a0f1d] border-t lg:border-t-0 lg:border-l border-[#151e33] flex flex-col flex-shrink-0 z-20 overflow-hidden relative">
          
          {/* Right Header Panel */}
          <div className="p-4 bg-gray-900/40 border-b border-[#141e33] flex justify-between items-center select-none shrink-0">
            <div className="text-left leading-none">
              <h3 className="text-[12.5px] font-black text-white tracking-wide uppercase font-sans">Team Chat</h3>
              <p className="text-[9.5px] font-mono text-slate-500 mt-1">#ai-trading-team</p>
            </div>
            
            <div className="flex items-center gap-1.5 pl-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span className="text-[9px] text-[#22d3ee] font-mono font-bold tracking-wider uppercase">System ready</span>
            </div>
          </div>

          {/* Group Conversation Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#080c16]/30 custom-scrollbar-thin">
            {messages.filter(m => m.channel === "group").map((msg, i) => {
              const isUser = msg.senderId === "user";
              const isSystem = msg.senderId === "system";
              const charLogo = characters.find(c => c.id === msg.senderId);

              if (isSystem) {
                return (
                  <div key={msg.id || i} className="p-3 bg-blue-950/15 border border-blue-900/15 rounded-xl text-left font-mono text-[10.5px] text-cyan-400 relative">
                    <span className="text-[8.5px] text-slate-500 block absolute top-2 right-2.5">{msg.timestamp}</span>
                    <strong className="block mb-1 text-slate-300 font-sans font-black flex items-center gap-1.5">
                      ⚙️ {msg.senderName}
                    </strong>
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  </div>
                );
              }

              return (
                <div key={msg.id || i} className={`flex items-start gap-2.5 text-left ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  
                  {/* Photo of Agent */}
                  {!isUser && charLogo ? (
                    <img 
                      src={charLogo.avatarUrl} 
                      alt={charLogo.name} 
                      className="w-7 h-7 rounded-full border border-slate-700 bg-slate-900 object-cover scale-105 rendering-pixelated shrink-0 mt-0.5"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs shadow-inner shrink-0 text-white mt-0.5 font-bold">
                      {isUser ? "👑" : "🤖"}
                    </div>
                  )}

                  {/* Bubble details */}
                  <div className="max-w-[80%] flex flex-col gap-0.5">
                    <div className={`flex items-baseline gap-1.5 ${isUser ? "justify-end text-right" : "justify-start text-left"}`}>
                      <span className="text-[10.5px] font-black text-slate-200">{msg.senderName}</span>
                      <span className="text-[8px] font-mono text-slate-500">{msg.timestamp}</span>
                    </div>

                    <div className={`p-3 rounded-2xl text-[11px] leading-relaxed relative ${
                      isUser 
                        ? "bg-[#2563eb] text-white rounded-tr-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]" 
                        : "bg-[#0b101d] text-slate-300 border border-[#162137] rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap break-words font-sans">{msg.text}</p>
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>

          {/* Quick instructions floating helper bar */}
          {isGenerating && (
            <div className="p-2 px-4 bg-slate-950/90 text-left border-t border-slate-900 flex items-center gap-2 text-[10px] font-mono text-cyan-400 select-none">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping"></span>
              <span>Thinking with server-side AI integration...</span>
            </div>
          )}

          {/* Bottom Chat Submission formulation Input area */}
          <form onSubmit={handleGroupChatSubmit} className="p-3 bg-[#0d1325] border-t border-[#141e33] flex flex-col gap-2 shrink-0">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={chatInputText}
                onChange={(e) => setChatInputText(e.target.value)}
                placeholder="พิมพ์ข้อความคุยและเทเลพอร์ตร่วมกัน..."
                disabled={isGenerating}
                className="flex-1 bg-[#05080f] border border-slate-800 focus:border-blue-500 rounded-xl px-3 py-2 text-[11.5px] text-white focus:outline-none transition-all placeholder-slate-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!chatInputText.trim() || isGenerating}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-35 text-white transition-all flex items-center justify-center font-bold text-xs gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่ง</span>
              </button>
            </div>
            
            <div className="flex justify-between items-center text-[8.5px] font-mono text-slate-500 select-none leading-none pr-1 pl-1">
              <span>💡 Ask "Buy zone" or click teleport links</span>
              <button 
                type="button"
                onClick={() => handleClearHistory("group")}
                className="hover:text-rose-400 transition-colors uppercase font-bold"
              >
                Clear History
              </button>
            </div>
          </form>

        </aside>

      </div>

    </div>
  );
}
