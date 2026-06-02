import React, { useState, useEffect } from "react";
import { RoomId, Character, Message, OfficeTask, CalendarEvent } from "./types";
import { 
  OFFICE_ROOMS, 
  INITIAL_CHARACTERS, 
  INITIAL_TASKS, 
  CALENDAR_EVENTS 
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
  MoreHorizontal
} from "lucide-react";

export default function App() {
  // Global States
  const [activeRoomId, setActiveRoomId] = useState<RoomId>(RoomId.LOBBY);
  const [characters, setCharacters] = useState<Character[]>(INITIAL_CHARACTERS);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init-1",
      senderId: "code-reviewer",
      senderName: "Frank (DevOps & Security)",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=frank&backgroundColor=c0aede",
      text: "ยินดีต้อนรับครับคุณ CEO! ส่งส่วนประกอบโค้ดตัวอย่างมาแชร์หน้าจอเพื่อรัน Code Audit (Focus Room) ได้ตลอดเลยนะครับ",
      timestamp: "09:05",
      channel: "code-reviewer"
    },
    {
      id: "init-2",
      senderId: "senior-dev",
      senderName: "Bob (Senior Developer)",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=bob&backgroundColor=c0aede",
      text: "หวัดดีครับหัวหน้า! พร้อมอัพเดทตารางงานและแก้บั๊กรีแอกทีฟแล้ว แชทถามงานผมตัวต่อตัวได้ที่โซนพัฒนา (Dev Area) นะครับผม",
      timestamp: "09:06",
      channel: "senior-dev"
    },
    {
      id: "init-3",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      text: "ระบบจำลอง Virtual Office เชื่อมต่อกำลังพล 12 พิกัด เรียบร้อยแล้ว ยินดีต้อนรับบอส",
      timestamp: "09:04",
      channel: "group"
    }
  ]);
  
  const [tasks, setTasks] = useState<OfficeTask[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Custom dialogs floating over characters on the isometric map
  const [recentDialogs, setRecentDialogs] = useState<Record<string, string>>({
    "code-reviewer": "เช็ค Type Safety เสมอฮะ",
    "senior-dev": "ดริปกาแฟเข้มๆ สักแก้วบอส!"
  });

  // Footer popup states
  const [footerActiveTab, setFooterActiveTab] = useState<string | null>(null); // 'people' | 'calendar' | 'screenshare' | 'settings'
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showConfigAlert, setShowConfigAlert] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // CEO User state customization
  const [ceoName, setCeoName] = useState<string>("คุณบอส CEO");
  const [isEditingCeoName, setIsEditingCeoName] = useState<boolean>(false);
  const [showAllPeople, setShowAllPeople] = useState<boolean>(false);

  const userCharacter = characters.find(c => c.id === "user") || INITIAL_CHARACTERS[0];

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
      const systemMsg: Message = {
        id: `sys-move-${Date.now()}`,
        senderId: "system",
        senderName: "System",
        senderAvatar: "",
        text: `คุณ CEO ย้ายพื้นที่หลักไปที่ "${selectedRoom.nameEn} (${selectedRoom.nameTh})"`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        channel: "group"
      };
      setMessages(prev => [...prev, systemMsg]);
    }
  };

  // Direct DM chat/Group meeting generation trigger
  const handleSendMessage = async (text: string, channel: string) => {
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

        // Separate and parse combined discussion to render each character bubble
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
        triggerSpeechBubble("senior-dev", "กำลังหารืออย่างเมามันส์ในห้องประชุม!");
        triggerSpeechBubble("code-reviewer", "สเปคค่อนข้างระเอียดคุยกันสนุกดีครับ");

        // Speak summary out loud if unmuted
        if (!isMuted) {
          triggerVoiceSynthesis("การประชุมจำลองเสร็จสิ้น ตรวจสอบรายงานบอร์ดได้เลยครับ", "Kore");
        }
      } else {
        // Direct Direct Message
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

        const activeCoworker = characters.find(c => c.id === channel);
        const replyMsg: Message = {
          id: `ai-reply-${Date.now()}`,
          senderId: channel,
          senderName: activeCoworker?.name || "Employee",
          senderAvatar: activeCoworker?.avatarUrl || "",
          text: data.text,
          timestamp: timestampStr,
          channel: channel
        };

        setMessages(prev => [...prev, replyMsg]);
        triggerSpeechBubble(channel, data.text);

        // Vocalize response
        if (!isMuted) {
          triggerVoiceSynthesis(data.text, channel === "code-reviewer" ? "Kore" : "Puck");
        }
      }
    } catch (err) {
      console.error("Error triggering Gemini endpoint:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Screen Share Code audit flow
  const handleTriggerAudit = async (contentString: string, reviewerId: string) => {
    setIsGenerating(true);
    setAuditReport(null);

    const textPrompt = `ช่วยตรวจทานโค้ดความก้าวหน้าโครงการที่ฉันแชร์ขึ้นจอมอนิเตอร์หลักดังต่อไปนี้:\n\n${contentString}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: reviewerId,
          message: textPrompt,
          chatHistory: []
        })
      });
      const data = await response.json();
      setAuditReport(data.text);

      const timestampStr = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      const activeCoworker = characters.find(c => c.id === reviewerId);
      
      // Push copy to direct DM flow as well
      const followUpMsg: Message = {
        id: `audit-msg-${Date.now()}`,
        senderId: reviewerId,
        senderName: `${activeCoworker?.name} (Audit Feedback)`,
        senderAvatar: activeCoworker?.avatarUrl || "",
        text: `**[ผลสแกนและผลการวิเคราะห์สกรีนแชร์ของบอส]**\n\n${data.text}`,
        timestamp: timestampStr,
        channel: reviewerId
      };
      setMessages(prev => [...prev, followUpMsg]);
      triggerSpeechBubble(reviewerId, "รีวิวสกรีนแชร์เสร็จแล้ว บนมอนิเตอร์บอสครับ!");

    } catch (err) {
      console.error("Failed auditing screenshare:", err);
      setAuditReport("มีปัญหาการสื่อสารกับโมเดล Gemini ในการตรวจสกรีนแชร์");
    } finally {
      setIsGenerating(false);
    }
  };

  // Speech voice synthesis
  const triggerVoiceSynthesis = (text: string, voiceName: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop active voices

    // Strip Markdown code lines for TTS comfort
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "[โค้ดตัวอย่าง]")
      .replace(/[^a-zA-Z0-9ก-๙\s.,?]/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText.substring(0, 160));
    utterance.lang = "th-TH";
    utterance.rate = 1.0;

    // Direct pitch adjust per role
    utterance.pitch = voiceName === "Kore" ? 1.0 : 0.85;

    window.speechSynthesis.speak(utterance);
  };

  // Kanban tasks modifier
  const handleAddTask = (title: string, description: string, assignee: string, priority: 'low' | 'medium' | 'high') => {
    const newTask: OfficeTask = {
      id: `task-manual-${Date.now()}`,
      title,
      description,
      assignee,
      status: "todo",
      priority
    };
    setTasks(prev => [newTask, ...prev]);

    // Send a system alert
    const systemMsg: Message = {
      id: `sys-task-${Date.now()}`,
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      text: `คุณ CEO สั่งเตรียมฟีเจอร์ใหม่: "${title}" และมอบหมายให้ ${assignee === "senior-dev" ? "วิชัย" : "สมชาย" } ดำเนินการแล้ว`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      channel: "group"
    };
    setMessages(prev => [...prev, systemMsg]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: OfficeTask['status']) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const handleAddFieldEvent = (title: string, time: string, room: string, desc: string) => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title,
      time,
      room,
      attendees: ["You", "Wichai", "Somchai"],
      description: desc
    };
    setEvents(prev => [...prev, newEvent]);
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-gray-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      <div className="flex flex-1 flex-col lg:flex-row min-h-screen">
        
        {/* ==================== LEFT NAVIGATION SIDEBAR ==================== */}
        <aside className="w-full lg:w-72 bg-[#090d16] border-b lg:border-b-0 lg:border-r border-[#151e33] flex flex-col p-5 space-y-6 z-20 flex-shrink-0">
          
          {/* Symmetrical Retro Monitor Logo Header */}
          <div className="flex items-center gap-3 border-b border-[#141d33] pb-4 animate-[fadeIn_0.5s_ease-out]">
            <div className="w-9 h-9 bg-gradient-to-tr from-[#111e38] to-[#1e3a6d] rounded-xl flex items-center justify-center text-[#38bdf8] border border-[#38bdf8]/50 shadow-[0_0_15px_rgba(56,189,248,0.3)] select-none font-mono font-bold text-base">
              🖥️
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xs font-black tracking-widest text-slate-100 uppercase font-display">VIRTUAL</span>
                <span className="text-xs font-black tracking-widest text-[#2b96ff] uppercase font-display">OFFICE</span>
              </div>
              <span className="text-[9.5px] font-mono font-bold text-[#475569] uppercase tracking-widest mt-1.5 block">V2.5 STABLE ENVIRONMENT</span>
            </div>
          </div>

          {/* User Profile CEO Module (You) */}
          <div className="bg-[#0b101c] border border-[#1e2a44] rounded-2xl p-4 flex flex-col gap-3 shadow-lg relative group">
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 bg-slate-950 rounded-full border border-emerald-500/80 flex items-center justify-center p-0.5 overflow-hidden select-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <img 
                  src={userCharacter.avatarUrl} 
                  alt="CEO avatar" 
                  className="w-full h-full object-cover scale-110 rendering-pixelated"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex-1 leading-none">
                <div className="flex items-center gap-1.5 mb-1 text-left">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse border border-emerald-400"></span>
                  <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-wider">Online</span>
                </div>
                
                {isEditingCeoName ? (
                  <div className="flex gap-1 items-center mt-1">
                    <input 
                      id="ceo-name-input"
                      type="text"
                      value={ceoName}
                      onChange={(e) => setCeoName(e.target.value)}
                      onBlur={() => setIsEditingCeoName(false)}
                      onKeyDown={(e) => { if (e.key === "Enter") setIsEditingCeoName(false); }}
                      className="bg-[#05080f] px-2 py-0.5 border border-emerald-500 rounded text-[10px] text-white max-w-[100px] font-mono font-bold"
                      autoFocus
                    />
                    <button onClick={() => setIsEditingCeoName(false)} className="text-emerald-400 text-[10px] font-black">OK</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-black text-white tracking-wide max-w-[130px] truncate font-display">
                      {ceoName}
                    </h3>
                    <button onClick={() => setIsEditingCeoName(true)} className="p-0.5 hover:bg-slate-800 rounded text-gray-500 hover:text-white transition-colors cursor-pointer" title="Edit Name">
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <span className="text-[9.5px] font-mono font-bold text-sky-400/80 tracking-wide block mt-1.5 text-left">Product Designer</span>
              </div>
            </div>

            <div className="bg-[#05080f]/80 px-3 py-2 rounded-xl border border-[#16203a] flex justify-between items-center text-[10px] leading-none">
              <span className="text-[#475569] font-mono font-bold">CURRENT:</span>
              <strong className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase font-mono">
                {OFFICE_ROOMS.find(r => r.id === activeRoomId)?.nameEn || "Lobby"}
              </strong>
            </div>
          </div>

          {/* PEOPLE (12) Dropdown / Collapse Section matching screenshot */}
          <div className="flex flex-col flex-1 min-h-[220px] space-y-2">
            <button 
              onClick={() => setShowAllPeople(!showAllPeople)}
              className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-[#9edcfe] cursor-pointer hover:text-white transition-colors py-1 pl-1"
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-sky-450 text-sky-400" />
                <span>People (12)</span>
              </div>
              <span className="text-[9px] text-[#2b96ff] font-mono font-bold bg-[#2b96ff]/10 px-1.5 py-0.5 border border-[#2b96ff]/20 rounded-md">{showAllPeople ? "▼ LESS" : "▲ SHOW ALL"}</span>
            </button>

            {/* People list start from Alice, filter out You (user) */}
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {characters.filter(char => char.id !== "user").slice(0, showAllPeople ? 12 : 6).map(char => {
                const isUserHere = activeRoomId === char.currentRoom;
                return (
                  <div 
                    key={char.id}
                    onClick={() => {
                      handleRoomSelect(char.currentRoom);
                      triggerSpeechBubble(char.id, `ยินดีต้อนรับครับบอส! แชทถามงานผมได้ในห้องนะครับ 😄`);
                    }}
                    className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 ${
                      isUserHere
                        ? "border-[#2b96ff]/50 bg-[#2b96ff]/5 text-white"
                        : "bg-[#0b101c] border-[#131b2c] text-gray-300 hover:border-[#1e2a44]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img 
                        src={char.avatarUrl} 
                        alt={char.name} 
                        className="w-7 h-7 rounded-full border border-slate-800 bg-slate-900 object-cover scale-105 rendering-pixelated" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="leading-none text-left">
                        <h4 className="text-[11.5px] font-bold text-white font-mono">{char.name}</h4>
                        <p className="text-[8.5px] text-[#475569] font-semibold mt-0.5 leading-none">{char.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {isUserHere && (
                        <span className="text-[7.5px] bg-[#2b96ff]/15 px-1 py-0.2 rounded text-[#2b96ff] border border-[#2b96ff]/10 font-bold font-mono">MEET</span>
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full ${char.statusColor}`} title={char.status}></span>
                    </div>
                  </div>
                );
              })}
              
              {!showAllPeople && (
                <button 
                  onClick={() => setShowAllPeople(true)}
                  className="w-full text-center py-2 border border-dashed border-[#1d2b47] rounded-xl hover:border-[#2b96ff] text-[9.5px] font-bold font-mono text-[#2b96ff] hover:text-white transition-all bg-[#0b101c]/40 cursor-pointer"
                >
                  + Click to see 6 more employees...
                </button>
              )}
            </div>
          </div>

          {/* QUICK LINKS Teleport links */}
          <div className="flex flex-col space-y-2 border-t border-[#131b2c] pt-4 mt-auto">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2b96ff] font-mono pl-1 text-left">
              Quick Links (Teleport)
            </span>

            <ul className="grid grid-cols-1 gap-1.5 font-display">
              {[
                { id: RoomId.LOBBY, la: "Lobby", th: "ล็อบบี้", col: "hover:border-[#2b6fc2]" },
                { id: RoomId.MEETING, la: "Meeting Room", th: "ประชุมร่วม", col: "hover:border-[#555a64]" },
                { id: RoomId.FOCUS, la: "Focus Room", th: "ตรวจวิเคราะห์", col: "hover:border-[#3f7a45]" },
                { id: RoomId.PANTRY, la: "Pantry", th: "เครื่องชงกาแฟ", col: "hover:border-[#cc971c]" },
                { id: RoomId.HELPDESK, la: "Help Desk", th: "รับคิวช่วยเหลือ", col: "hover:border-[#9c4c23]" },
              ].map(item => {
                const isSelected = activeRoomId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      id={`teleport-btn-${item.id}`}
                      onClick={() => handleRoomSelect(item.id)}
                      className={`w-full px-3 py-2 rounded-xl border text-[10px] text-left transition-all flex justify-between items-center cursor-pointer ${
                        isSelected 
                          ? "bg-[#0b101c] border-[#2b96ff] text-[#2b96ff] font-black shadow-inner translate-x-1" 
                          : `bg-[#0b101c] border-transparent text-gray-400 ${item.col} hover:text-white`
                      }`}
                    >
                      <span className="font-bold">{item.la}</span>
                      <span className="text-[8px] text-slate-500 font-mono">({item.th})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* ==================== RIGHT VIEWPORT PANEL ==================== */}
        <main className="flex-1 p-4 md:p-6 lg:p-7 flex flex-col space-y-5 max-w-full overflow-hidden bg-[#070a13]">
          
          {/* Mini Top Action Header panel */}
          <header className="flex justify-between items-center bg-[#090d16]/40 p-2.5 px-4 rounded-2xl border border-[#16203a] relative z-25">
            <div className="flex items-center gap-2 animate-[pulse_3s_infinite]">
              <span className="text-emerald-400 font-mono text-xs">●</span>
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest leading-none">Virtual Office Sandbox Live</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Audio toggle speaker */}
              <button
                id="btn-toggle-mute"
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted && 'speechSynthesis' in window) {
                    triggerVoiceSynthesis("โหมดเสียง สังเคราะห์ พูดคุยเปิดใช้งานแล้วค่ะ", "Kore");
                  }
                }}
                className={`px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                  !isMuted 
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-lg scale-95 animate-pulse" 
                    : "bg-slate-900/65 border-slate-800 text-gray-500 hover:text-gray-300"
                }`}
                title={isMuted ? "เปิดเสียงพากย์ AI" : "ปิดเสียงพากย์"}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="text-[10.5px] font-mono leading-none">{isMuted ? "AI Voice OFF" : "Voice Mode ON"}</span>
              </button>

              <button
                id="btn-settings"
                onClick={() => setFooterActiveTab(footerActiveTab === "settings" ? null : "settings")}
                className="p-1 px-2.5 bg-slate-900 border border-slate-800 rounded-xl text-gray-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="ตั้งค่า API/ความลับ"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[10.5px] font-mono">API</span>
              </button>
            </div>
          </header>

          {/* Spatial Iso Map rendering */}
          <OfficeMap 
            characters={characters}
            userCharacter={userCharacter}
            activeRoomId={activeRoomId}
            onRoomSelect={handleRoomSelect}
            recentDialogs={recentDialogs}
          />

          {/* Symmetrical Room Widgets container (Loads below map) */}
          <div className="transition-all duration-300 relative z-10">
            {activeRoomId === RoomId.LOBBY && (
              <div className="bg-[#0c111d] border border-[#1e2a47] rounded-3xl p-6 shadow-xl flex gap-5 flex-col md:flex-row items-center justify-between">
                <div className="flex-1">
                  <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-widest">Welcome Desk</span>
                  <h2 className="text-sm font-extrabold text-white mt-1.5 mb-1 flex items-center gap-1.5 font-display">
                    🚪 ประตูต้อนรับสำนักงาน (Lobby Front Desk)
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed leading-normal">
                    ยินดีต้อนรับกลับเข้าสู่ระบบ Virtual Office Sandbox ครับท่านประธาน ขณะนี้พนักงานทั้ง 11 ท่านสแตนด์บายทำงานบนคอร์ออฟฟิศเสรีแล้ว คุณสามารถเดินย้ายพิกัดเพื่อจัดแจงงาน ดริปกาแฟแข่งขันใน Pantry หรืออภิปรายกับทีมงานได้อย่างปลอดภัย!
                  </p>
                  
                  {/* General welcome news log board */}
                  <div className="bg-[#05080f] p-3.5 rounded-xl border border-slate-800 mt-4 font-mono text-[10px] text-gray-500 leading-relaxed">
                    <strong className="text-gray-300 block mb-1 font-bold">📢 กระดานประกาศรอบเช้า:</strong>
                    - ☕ เมล็ดกาแฟดิปเอธิโอเปียบลูเบลนด์มาใหม่ที่ครัวแพนทรี ท้าชิงสตรีคความว่องไวได้ในคอฟฟี่เกมส์วันนี้<br/>
                    - 📝 Frank ตรวจสอบสกรีนซีเคียวระบบ JWT Token คลุมไว้ พิกัดพร้อมผ่านพอร์ต 3000 ได้ไร้กังวล
                  </div>
                </div>

                <div className="w-full md:w-auto flex flex-col gap-2 flex-shrink-0">
                  <button
                    id="btn-lobby-standup"
                    onClick={() => handleRoomSelect(RoomId.MEETING)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ชวนเปิดประชุม Standup</span>
                  </button>
                  <button
                    id="btn-lobby-coffee"
                    onClick={() => handleRoomSelect(RoomId.PANTRY)}
                    className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Coffee className="w-4 h-4 text-amber-500" />
                    <span>เดินไปพักเบรกที่ห้องกาแฟ</span>
                  </button>
                </div>
              </div>
            )}

            {activeRoomId === RoomId.MEETING && (
              <ChatPanel 
                characters={characters}
                messages={messages}
                activeChannel="group"
                onSendMessage={handleSendMessage}
                isGenerating={isGenerating}
                onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))}
                triggerVoiceSynthesis={triggerVoiceSynthesis}
              />
            )}

            {activeRoomId === RoomId.FOCUS && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-[fadeIn_0.3s_ease-out]">
                <div className="md:col-span-8">
                  <ChatPanel 
                    characters={characters}
                    messages={messages}
                    activeChannel="code-reviewer"
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))}
                    triggerVoiceSynthesis={triggerVoiceSynthesis}
                  />
                </div>
                <div className="md:col-span-4 bg-[#0a0f1d] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-[#2b96ff] uppercase tracking-widest block mb-1">Architecture Reviews</span>
                    <h3 className="text-xs font-bold text-white mb-2 font-display">ระบบรีวิวคุณภาพโค้ดสากล (Clean Code)</h3>
                    <ul className="space-y-2 text-[10px] leading-normal text-gray-400">
                      <li className="flex items-start gap-1 p-1.5 bg-gray-950/40 rounded border border-gray-900">
                        <span className="text-emerald-400 font-mono font-bold">1.</span>
                        <span>ใช้ Type Safety หลีกเลี่ยง Any เสมอเพื่อรักษาโครงสร้างโมดูลาร์</span>
                      </li>
                      <li className="flex items-start gap-1 p-1.5 bg-gray-950/40 rounded border border-gray-900">
                        <span className="text-emerald-400 font-mono font-bold">2.</span>
                        <span>เช็ค Dependencies ใน useEffect เสมอ ป้องกัน infinite rendering loops</span>
                      </li>
                      <li className="flex items-start gap-1 p-1.5 bg-gray-950/40 rounded border border-gray-900">
                        <span className="text-emerald-400 font-mono font-bold">3.</span>
                        <span>คัสตอม Component แยกสับไฟล์ ช่วยบริหารจัดการ Token ทรัพยากรแอปพลิเคชันอย่างประหยัด</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-4 bg-[#111827] p-3 rounded-xl text-[10px] text-gray-500 italic font-mono">
                    "ระบบมีเสถียรภาพเริ่มต้นจากความละเอียดลออในการเขียนเทสครับประธาน" - แฟร็งค์ (Frank) DevOps AI
                  </div>
                </div>
              </div>
            )}

            {activeRoomId === RoomId.DEVAREA && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 animate-[fadeIn_0.3s_ease-out]">
                <div className="md:col-span-8">
                  <ChatPanel 
                    characters={characters}
                    messages={messages}
                    activeChannel="senior-dev"
                    onSendMessage={handleSendMessage}
                    isGenerating={isGenerating}
                    onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))}
                    triggerVoiceSynthesis={triggerVoiceSynthesis}
                  />
                </div>
                <div className="md:col-span-4 bg-[#0a111a] border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-mono text-cyan-400 uppercase font-black tracking-widest">Active Server Rack Status</span>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                    </div>

                    <div className="space-y-3 font-mono text-[10px]">
                      <div className="p-2 border border-gray-900 bg-gray-950/60 rounded flex justify-between">
                        <span className="text-gray-400">Main Container (Cloud Run):</span>
                        <strong className="text-emerald-400 font-black">Healthy</strong>
                      </div>
                      <div className="p-2 border border-gray-900 bg-gray-950/60 rounded flex justify-between">
                        <span className="text-gray-400">Sandbox Client Port:</span>
                        <strong className="text-cyan-400 font-bold">Port 3000 Ingress</strong>
                      </div>
                      <div className="p-2 border border-gray-900 bg-gray-950/60 rounded flex justify-between">
                        <span className="text-gray-450">Gemini LLM Pipeline v2:</span>
                        <strong className="text-indigo-400 font-semibold">Ready (API)</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-[9px] text-[#8ea7c5] leading-normal pl-1.5 border-l-2 border-orange-500/40 text-gray-500 font-mono">
                    "หลังบ้านและพร็อกซี่ API พร้อมเขียนคำส่งฟังก์ชันคอลล์สตรีมมิ่งเลยฮะบอส" - บ็อบ (Bob) ซีเนียร์โปรแกรมเมอร์ AI
                  </div>
                </div>
              </div>
            )}

            {activeRoomId === RoomId.PROJECT && (
              <TaskBoard 
                tasks={tasks}
                characters={characters}
                onAddTask={handleAddTask}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onDeleteTask={handleDeleteTask}
              />
            )}

            {activeRoomId === RoomId.PANTRY && (
              <PantryMinigame />
            )}

            {activeRoomId === RoomId.HELPDESK && (
              <div className="bg-[#0c111d] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-5 items-center select-none animate-[fadeIn_0.4s_ease]">
                <div className="flex-1 text-left">
                  <span className="px-2.5 py-0.5 bg-rose-500/15 border border-rose-500/25 text-[#f43f5e] text-[9px] font-extrabold uppercase rounded font-mono tracking-widest">Help Center Portal</span>
                  <h2 className="text-sm font-extrabold text-white tracking-wide mt-2 mb-1 flex items-center gap-1.5 font-display">
                    🚨 จุดตอบปัญหาฝ่ายช่วยเหลือ (Help Desk Station)
                  </h2>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4 leading-normal">
                    พบปัญหาติดบั๊ก API, อยากวิเคราะห์ความลึกของฐานข้อมูล หรือต้องการรีวิวโค้ดระบบความปลอดภัยหรือไม่? คุณสามารถพิมพ์คำขอแชร์สกรีนด้านล่างเพื่ออัพเดตและแก้ปัญหาเร่งด่วนร่วมกันได้ทันทีครับบอส!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-[#070b13] border border-slate-800 rounded-xl">
                      <strong className="text-xs text-indigo-400 block mb-0.5 font-mono font-bold">Frank (DevOps):</strong>
                      <span className="text-[10px] text-gray-500 leading-normal block leading-normal">
                        เชี่ยวชาญการตั้งค่าความลับ .env, การทำ Screen Code Auditing และสแกนช่องโหว่ความเสถียร
                      </span>
                    </div>

                    <div className="p-3 bg-[#070b13] border border-slate-800 rounded-xl">
                      <strong className="text-xs text-cyan-400 block mb-0.5 font-mono font-bold">Bob (Developer):</strong>
                      <span className="text-[10px] text-gray-500 leading-normal block leading-normal">
                        เชี่ยวชาญการสร้าง Responsive views, ยูสเฮดเลส UI, และอัพเกรดฟีเจอร์พอร์ต 3000
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-auto flex-shrink-0 flex flex-col gap-2">
                  <button
                    id="btn-guide-screen"
                    onClick={() => setFooterActiveTab("screenshare")}
                    className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md cursor-pointer"
                  >
                    <Tv className="w-4 h-4 animate-bounce" />
                    <span>แชร์เน็ตเวิร์คเพื่อตรวจสอบ</span>
                  </button>
                </div>
              </div>
            )}

            {activeRoomId === RoomId.HR && (
              <div className="bg-[#0c111d] border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center text-center p-8 max-w-2xl mx-auto select-none animate-[fadeIn_0.4s_ease]">
                <span className="text-sm">🍀</span>
                <h3 className="text-xs font-mono text-purple-400 uppercase font-black tracking-widest mt-1">HR Employee Welfare</h3>
                <h2 className="text-base font-extrabold text-white my-1.5 font-display">ห้องงานจัดสวัสดิการพนักงาน (HR Office Hub)</h2>
                <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                  ยินดีต้อนรับสู่แดนการจัดการทรัพยากรบุคคล ฝ่ายเคที่รายงานพนักงานทุกคนทำงานร่วมกันอย่างขันแข็ง ค่าความสุขเต็มร้อย พร้อมให้บริการอำนวยความสะดวกประธานบริหารตลอดช่วงการรีวิวผลงาน!
                </p>

                <div className="flex gap-4 mt-5 text-[10px] text-gray-500 font-mono bg-[#05080f] px-3.5 py-1.5 border border-slate-800 rounded-xl">
                  <span>🏖️ วันลาเฉลี่ย: 14 วัน</span>
                  <span>⚡ ความพึงพอใจ: 100%</span>
                  <span>🏆 ประสิทธิภาพคอร์: ดีรวม</span>
                </div>
              </div>
            )}
          </div>

          {/* ==================== 3. GLOBAL INTERACTIVE FLOATING TOOLBAR DOCK ==================== */}
          <footer className="w-full mt-auto py-2 z-40 relative">
            <div className="max-w-xl mx-auto">
              <div className="bg-[#0b101c]/95 border border-[#1d2b48] p-2 rounded-2xl flex justify-between items-center shadow-[0_20px_45px_rgba(0,0,0,0.7)] relative z-40 backdrop-blur-md">
                
                {/* 1. CHAT TAB (Triggers teleport to Meeting/Chat panel as seen in screenshot) */}
                <button
                  id="footer-tab-chat"
                  onClick={() => {
                    setFooterActiveTab(null);
                    handleRoomSelect(RoomId.MEETING);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 relative cursor-pointer ${
                    activeRoomId === RoomId.MEETING && !footerActiveTab 
                      ? "text-[#2b96ff] bg-[#2b96ff]/10" 
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <div className="relative">
                    <MessageSquare className="w-5 h-5 text-gray-400 hover:text-[#2b96ff] transition-colors" />
                    <span className="absolute -top-1 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center font-bold font-mono border border-slate-950 shadow-md">2</span>
                  </div>
                  <span className="text-[10px] leading-none font-mono">Chat</span>
                </button>

                {/* 2. PEOPLE TAB (Welfare info popover drawer) */}
                <button
                  id="footer-tab-people"
                  onClick={() => setFooterActiveTab(footerActiveTab === "people" ? null : "people")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    footerActiveTab === "people" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Users className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
                  <span className="text-[10px] leading-none font-mono">People</span>
                </button>

                {/* 3. CALENDAR TAB (Schedule list drawer) */}
                <button
                  id="footer-tab-calendar"
                  onClick={() => setFooterActiveTab(footerActiveTab === "calendar" ? null : "calendar")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    footerActiveTab === "calendar" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Calendar className="w-5 h-5 text-gray-400 hover:text-emerald-400 transition-colors" />
                  <span className="text-[10px] leading-none font-mono">Calendar</span>
                </button>

                {/* 4. SCREEN SHARE TAB (React Code Auditor module) */}
                <button
                  id="footer-tab-screenshare"
                  onClick={() => setFooterActiveTab(footerActiveTab === "screenshare" ? null : "screenshare")}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    footerActiveTab === "screenshare" ? "text-[#2b96ff] bg-[#2b96ff]/10" : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Tv className="w-5 h-5 text-gray-400 hover:text-[#2b96ff] transition-colors" />
                  <span className="text-[10px] leading-none font-mono">Screen Share</span>
                </button>
                
                {/* 5. MORE TAB (Triple horizontal dot dropdown - supports game launch, mute controls & configurations) */}
                <button
                   id="footer-tab-more"
                   onClick={() => setFooterActiveTab(footerActiveTab === "more" ? null : "more")}
                   className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                     footerActiveTab === "more" ? "text-cyan-400 bg-[#22d3ee]/15" : "text-gray-400 hover:text-white"
                   }`}
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-cyan-400 transition-colors" />
                  <span className="text-[10px] leading-none font-mono">More</span>
                </button>
              </div>
            </div>

            {/* Floating Drawer Inner Elements */}
            <div className="max-w-xl mx-auto mt-3">
              {footerActiveTab === "people" && (
                <div className="bg-[#0b101c] border border-[#1e2a44] rounded-2xl p-5 shadow-2xl relative z-40 animate-[slideUp_0.25s_ease-out]">
                  <h3 className="text-xs font-extrabold text-white mb-3 uppercase tracking-wide flex items-center gap-1.5 text-left">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span className="font-display font-bold">ผู้เชี่ยวชาญ AI ของออฟฟิศ</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-[10px]">
                    <div className="p-3.5 bg-[#05080f] rounded-xl border border-slate-900">
                      <div className="flex gap-2 mb-2 text-left">
                        <span className="text-xl">🔧</span>
                        <div>
                          <strong className="text-xs font-bold text-white block leading-none text-left">Frank (DevOps)</strong>
                          <span className="text-[8px] font-mono text-indigo-400 font-bold uppercase mt-1 block">Security & Screen Auditor AI</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal text-left">
                        ดูแลการรันแอปพอร์ต 3000 คลุมสกรีนแชร์ จัดการ Hook checks และคัดกรอง dependencies สังเคราะห์วิจัยร่วมกับโมเดล Gemini
                      </p>
                    </div>

                    <div className="p-3.5 bg-[#05080f] rounded-xl border border-slate-900">
                      <div className="flex gap-2 mb-2 text-left">
                        <span className="text-xl">💻</span>
                        <div>
                          <strong className="text-xs font-bold text-white block leading-none text-left">Bob (Developer)</strong>
                          <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase mt-1 block">Vite & React Frontend AI</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal text-left">
                        ดูแลการแก้ไขข้อผิดพลาด จัดทำปุ่ม สกีนชีท ควิกลิงก์ เทเลพอร์ต และคอยพากย์เสียงตอบคำสัมภาษณ์ให้คุณ CEO 24 ชม.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {footerActiveTab === "calendar" && (
                <div className="bg-[#0b101c] border border-[#1d2b48] rounded-2xl p-5 shadow-2xl relative z-40 animate-[slideUp_0.25s_ease-out]">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-extrabold text-white uppercase tracking-wide flex items-center gap-1.5 text-left">
                      <span>📅 อัพเดทตารางกิจกรรมวันนี้</span>
                    </h3>
                    <span className="text-[9px] font-mono text-green-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">3 Events Active</span>
                  </div>
                  <ul className="space-y-2.5">
                    {events.map((evt: CalendarEvent) => (
                      <li key={evt.id} className="p-3 bg-gray-950 rounded-xl border border-slate-900 flex justify-between items-start">
                        <div className="leading-tight text-left">
                          <span className="text-[10.5px] font-extrabold text-[#9edcfe] block">{evt.title}</span>
                          <span className="text-[9.5px] text-slate-500 block mt-1">{evt.description}</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-[#2b96ff] flex-shrink-0 bg-[#2b96ff]/10 px-2 py-0.5 border border-[#2b96ff]/20 rounded ml-2">
                          {evt.time}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {footerActiveTab === "screenshare" && (
                <div className="relative z-40 bg-slate-950/40 rounded-2xl border border-slate-800/80 p-1 animate-[slideUp_0.25s_ease-out]">
                  <ScreenShareHub 
                    characters={characters}
                    onTriggerAudit={handleTriggerAudit}
                    isGenerating={isGenerating}
                    auditReport={auditReport}
                  />
                </div>
              )}

              {footerActiveTab === "more" && (
                <div className="bg-[#0b101c] border border-[#1d2b48] rounded-2xl p-5 shadow-2xl relative z-45 font-mono text-[10px] text-gray-400 leading-relaxed text-left animate-[slideUp_0.25s_ease-out] space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wide mb-2.5 font-display flex items-center gap-1.5 text-left">
                      <Settings className="w-4 h-4 text-cyan-400" />
                      <span>Configure Office Sandbox</span>
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-normal mb-3 text-left">
                      เมนูควบคุมส่วนกลางสำหรับตั้งค่าพฤติกรรม และเปิดใช้งานฟีเจอร์ย่อยของแอปพลิเคชัน
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 select-none">
                    
                    {/* Launch Coffee mini-game widget */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-[#141d33] flex flex-col justify-between gap-2.5 text-left">
                      <div>
                        <strong className="text-amber-400 font-mono text-[10.5px] block">☕ Drip Coffee Minigame</strong>
                        <span className="text-[9px] text-gray-500 leading-tight block mt-1">
                          จำลองร้านกาแฟในห้องเครื่องครัว วืดรับเมล็ดกาแฟ เพื่อปลดล็อคพลังสมอง
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setFooterActiveTab(null);
                          handleRoomSelect(RoomId.PANTRY);
                        }}
                        className="w-full text-center py-1.5 bg-[#cc971c] hover:bg-[#b58514] text-slate-950 font-bold text-[9.5px] rounded-lg border border-slate-950 cursor-pointer transition-colors"
                      >
                        LAUNCH COFFEE MINI-GAME
                      </button>
                    </div>

                    {/* Speech engine synthesis parameters */}
                    <div className="p-3 bg-slate-950 rounded-xl border border-[#141d33] flex flex-col justify-between gap-2.5 text-left">
                      <div>
                        <strong className="text-[#38bdf8] font-mono text-[10.5px] block">🗣️ Text To Speech Engine</strong>
                        <span className="text-[9px] text-gray-500 leading-tight block mt-1">
                          เปิดหรือปิดผู้สังเคราะห์เสียงอัตนัยเมื่อพนักงานให้การสัมภาษณ์ความก้าวหน้า
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setIsMuted(!isMuted);
                        }}
                        className={`w-full text-center py-1.5 font-bold text-[9.5px] rounded-lg border cursor-pointer transition-colors ${
                          isMuted 
                            ? "bg-slate-900 border-[#1e2a44] text-[#38bdf8] hover:bg-slate-800" 
                            : "bg-[#0284c7] hover:bg-[#0274ad] border-white/20 text-white"
                        }`}
                      >
                        {isMuted ? "ENABLE SPEECH SYNTHESIS" : "MUTED SPEECH ENGINE"}
                      </button>
                    </div>

                  </div>

                  {/* Port and Pipeline diagnostic specifications banner */}
                  <div className="pt-3 border-t border-[#131b2c] text-[8.5px] text-slate-500 space-y-1 text-left">
                    <div>- <strong className="text-emerald-400 font-bold">Gemini Key API status:</strong> {process.env.GEMINI_API_KEY ? "SECURED (ใช้งานผ่าน Proxy Backend)" : "SANDBOX SIMULATION ACTIVE"}</div>
                    <div>- <strong className="text-cyan-400 font-bold">Workspace pipeline:</strong> Built on React 19 + Express Server live on Port 3000</div>
                    <div>- <strong className="text-purple-400 font-bold">Model transit code:</strong> gemini-2.5-flash secure socket layers compliant</div>
                  </div>
                </div>
              )}
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
}
