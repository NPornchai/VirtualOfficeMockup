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
      senderName: "Mina (Code Reviewer)",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=mina&backgroundColor=ffd5dc",
      text: "สวัสดีค่ะคุณปลิว! มีโค้ดส่วนไหนอยากให้มีนาช่วยรีวิวเรื่องคุณภาพและตรวจสอบคุณภาพ (QA Room) ส่งแชทหามีนาได้ตลอดเลยนะคะ",
      timestamp: "09:05",
      channel: "code-reviewer"
    },
    {
      id: "init-2",
      senderId: "senior-dev",
      senderName: "Byte (Senior Developer)",
      senderAvatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=byte&backgroundColor=c0aede",
      text: "หวัดดีครับพี่ปลิว! สแตนด์บายพร้อมออกแบบระบบและเขียนโค้ดหลังบ้านอย่างเต็มกำลังครับ ทักแชทคุยกับผมที่ห้องวิเคราะห์ระบบ (SA Room) ได้เสมอนะครับ",
      timestamp: "09:06",
      channel: "senior-dev"
    },
    {
      id: "init-3",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      text: "ระบบจำลอง Virtual Office เชื่อมสิทธิสำเร็จ พร้อมทำงานร่วมกันกับพี่ปลิวและผู้ช่วยแล้ว",
      timestamp: "09:04",
      channel: "group"
    }
  ]);
  
  const [tasks, setTasks] = useState<OfficeTask[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<CalendarEvent[]>(CALENDAR_EVENTS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  
  // Tab states for consolidated rooms
  const [saRoomTab, setSaRoomTab] = useState<"group" | "byte">("group");
  const [qaRoomTab, setQaRoomTab] = useState<"kanban" | "mina">("kanban");
  const [helpBotTab, setHelpBotTab] = useState<"momo" | "screenshare">("momo");
  
  // Custom dialogs floating over characters on the isometric map
  const [recentDialogs, setRecentDialogs] = useState<Record<string, string>>({
    "code-reviewer": "เช็ค Type Safety เสมอนะคะ",
    "senior-dev": "ดริปกาแฟก่อนลุยเขียนโค้ดครับ!"
  });

  // Footer popup states
  const [footerActiveTab, setFooterActiveTab] = useState<string | null>(null); // 'people' | 'calendar' | 'screenshare' | 'settings'
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [showConfigAlert, setShowConfigAlert] = useState<boolean>(false);
  const [auditReport, setAuditReport] = useState<string | null>(null);

  // CEO User state customization
  const [ceoName, setCeoName] = useState<string>("พี่ปลิว (CEO)");
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
      attendees: ["You", "Byte", "Mina"],
      description: desc
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const navItems = [
    { id: RoomId.LOBBY,    label: "CEO Room",    icon: "👑", color: "text-sky-400"     },
    { id: RoomId.MEETING,  label: "SA Room",     icon: "💻", color: "text-purple-400"  },
    { id: RoomId.PROJECT,  label: "QA Room",     icon: "📋", color: "text-cyan-400"    },
    { id: RoomId.HELPDESK, label: "Helper Desk", icon: "🤖", color: "text-rose-400"    },
    { id: RoomId.PANTRY,   label: "Pantry",      icon: "☕", color: "text-amber-400"   },
    { id: RoomId.FOCUS,    label: "Lobby",       icon: "🏢", color: "text-emerald-400" },
  ];

  const activeRoom = OFFICE_ROOMS.find(r => r.id === activeRoomId);

  return (
    <div className="h-screen bg-[#070a13] text-gray-100 flex flex-col font-sans select-none overflow-hidden">

      {/* ══ TOP HEADER BAR ══════════════════════════════════════════════════ */}
      <header className="flex-shrink-0 h-16 bg-[#090d16] border-b border-[#151e33] flex items-center px-4 gap-4 z-30">

        {/* Logo */}
        <div className="flex items-center gap-2.5 pr-4 border-r border-[#151e33] flex-shrink-0">
          <div className="relative w-9 h-7 bg-[#1a253d] rounded-md flex flex-col items-center justify-between p-0.5 border border-slate-600 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            <div className="w-full h-[16px] bg-[#1d5c2e] border border-[#22c55e]/30 rounded-[2px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.12)_1px,transparent_1px)] bg-[size:100%_3.5px]"></div>
              <span className="text-[8px] text-[#4ade80] font-black z-10 animate-pulse">💻</span>
            </div>
            <div className="w-3 h-[1px] bg-slate-500 rounded-sm"></div>
            <div className="w-5 h-[1px] bg-slate-400 rounded-full"></div>
          </div>
          <div className="leading-none">
            <div className="text-[13px] font-black tracking-wider text-slate-100">VIRTUAL</div>
            <div className="text-[13px] font-black tracking-wider text-[#2b96ff] -mt-0.5">OFFICE</div>
          </div>
        </div>

        {/* Active room breadcrumb */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-emerald-400 font-mono text-xs animate-[pulse_3s_infinite]">●</span>
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Sandbox Live</span>
          {activeRoom && (
            <>
              <span className="text-[#1e2a44]">/</span>
              <span className="text-[11px] font-bold text-[#2b96ff] font-mono">{activeRoom.nameEn}</span>
            </>
          )}
        </div>

        {/* CEO name editor */}
        <div className="flex items-center gap-2 px-3 border-x border-[#151e33]">
          <img src={userCharacter.avatarUrl} className="w-6 h-6 rounded-full border border-emerald-500 object-cover" referrerPolicy="no-referrer" />
          {isEditingCeoName ? (
            <input
              id="ceo-name-input"
              type="text"
              value={ceoName}
              onChange={e => setCeoName(e.target.value)}
              onBlur={() => setIsEditingCeoName(false)}
              onKeyDown={e => { if (e.key === "Enter") setIsEditingCeoName(false); }}
              className="bg-[#05080f] px-1.5 py-0.5 border border-emerald-500 rounded text-[10px] text-white w-28 font-mono font-bold"
              autoFocus
            />
          ) : (
            <button onClick={() => setIsEditingCeoName(true)} className="flex items-center gap-1 group">
              <span className="text-[11px] font-bold text-white font-mono">{ceoName}</span>
              <Edit3 className="w-3 h-3 text-gray-600 group-hover:text-gray-300 transition-colors" />
            </button>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            id="btn-toggle-mute"
            onClick={() => { setIsMuted(!isMuted); if (isMuted && 'speechSynthesis' in window) triggerVoiceSynthesis("โหมดเสียงเปิดใช้งานแล้วค่ะ", "Kore"); }}
            className={`px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 text-xs font-bold ${!isMuted ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 animate-pulse" : "bg-slate-900/65 border-slate-800 text-gray-500 hover:text-gray-300"}`}
            title={isMuted ? "เปิดเสียงพากย์" : "ปิดเสียงพากย์"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="text-[10px] font-mono">{isMuted ? "Voice OFF" : "Voice ON"}</span>
          </button>
          <button
            id="btn-settings"
            onClick={() => setFooterActiveTab(footerActiveTab === "settings" ? null : "settings")}
            className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-xs font-bold"
            title="ตั้งค่า API"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono">API</span>
          </button>
        </div>
      </header>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* ══ LEFT NAV ═══════════════════════════════════════════════════ */}
        <aside className="w-52 flex-shrink-0 bg-[#090d16] border-r border-[#151e33] flex flex-col z-20">

          {/* Room nav */}
          <div className="px-2 pt-3 pb-1">
            <span className="text-[8px] font-mono text-[#475569] uppercase tracking-widest px-2 block mb-1.5">Rooms</span>
            <nav className="space-y-0.5">
              {navItems.map(item => {
                const isActive = activeRoomId === item.id;
                return (
                  <button
                    key={item.id}
                    id={`teleport-btn-${item.id}`}
                    onClick={() => handleRoomSelect(item.id)}
                    className={`w-full px-2.5 py-2 rounded-xl text-left text-[11px] flex items-center gap-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#2b96ff]/10 border border-[#2b96ff]/25 text-white font-bold"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="text-sm leading-none flex-shrink-0">{item.icon}</span>
                    <span className="font-semibold leading-tight truncate">{item.label}</span>
                    {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2b96ff] flex-shrink-0 animate-pulse"></span>}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mx-3 border-t border-[#151e33] my-2"></div>

          {/* Colleagues */}
          <div className="px-2 flex-1 overflow-y-auto">
            <span className="text-[8px] font-mono text-[#475569] uppercase tracking-widest px-2 block mb-1.5">Colleagues</span>
            <div className="space-y-0.5">
              {characters.filter(c => c.id !== "user").map(char => {
                const isHere = activeRoomId === char.currentRoom;
                return (
                  <button
                    key={char.id}
                    onClick={() => { handleRoomSelect(char.currentRoom); triggerSpeechBubble(char.id, char.greetingTh); }}
                    className={`w-full px-2 py-1.5 rounded-lg flex items-center gap-2 transition-all cursor-pointer text-left ${isHere ? "bg-white/5" : "hover:bg-white/5"}`}
                  >
                    <img src={char.avatarUrl} alt={char.name} className="w-6 h-6 rounded-full border border-slate-700 flex-shrink-0 object-cover" referrerPolicy="no-referrer" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10.5px] font-bold text-white truncate leading-none">{char.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${char.statusColor}`}></span>
                        <span className="text-[8px] text-gray-500 truncate">{char.status}</span>
                      </div>
                    </div>
                    {isHere && <span className="text-[7px] bg-[#2b96ff]/15 px-1 rounded text-[#2b96ff] border border-[#2b96ff]/15 font-bold font-mono flex-shrink-0">HERE</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent count */}
          <div className="px-4 py-2.5 border-t border-[#151e33]">
            <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
              {characters.filter(c => c.isAi).length} Agents Online
            </span>
          </div>
        </aside>

        {/* ══ CENTER MAP ══════════════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 min-h-0">
          <OfficeMap
            characters={characters}
            userCharacter={userCharacter}
            activeRoomId={activeRoomId}
            onRoomSelect={handleRoomSelect}
            recentDialogs={recentDialogs}
          />
        </div>

        {/* ══ RIGHT PANEL ═════════════════════════════════════════════════ */}
        <div className="w-96 flex-shrink-0 bg-[#090d16]/95 backdrop-blur-sm border-l border-[#151e33] flex flex-col overflow-hidden z-20">

          {/* Panel header — room tabs */}
          <div className="flex-shrink-0 px-3 py-2 border-b border-[#151e33] flex items-center gap-1.5 flex-wrap min-h-[40px]">
            {activeRoomId === RoomId.MEETING && (
              <>
                <button onClick={() => setSaRoomTab("group")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${saRoomTab === "group" ? "bg-[#7c3aed] text-white border-[#9061f9]" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>🤝 Group</button>
                <button onClick={() => setSaRoomTab("byte")}  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${saRoomTab === "byte"  ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>💬 Byte</button>
              </>
            )}
            {activeRoomId === RoomId.PROJECT && (
              <>
                <button onClick={() => setQaRoomTab("kanban")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${qaRoomTab === "kanban" ? "bg-cyan-500 text-slate-950 border-cyan-400" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>📋 Kanban</button>
                <button onClick={() => setQaRoomTab("mina")}   className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${qaRoomTab === "mina"   ? "bg-[#7c3aed] text-white border-[#9061f9]" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>📝 Mina</button>
              </>
            )}
            {activeRoomId === RoomId.HELPDESK && (
              <>
                <button onClick={() => setHelpBotTab("momo")}        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${helpBotTab === "momo"        ? "bg-[#e11d48] text-white border-[#f43f5e]" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>🤖 Momo</button>
                <button onClick={() => setHelpBotTab("screenshare")} className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${helpBotTab === "screenshare" ? "bg-[#7c3aed] text-white border-[#9061f9]" : "bg-slate-950 text-gray-400 border-slate-900 hover:text-white"}`}>🚨 Screen</button>
              </>
            )}
            {activeRoomId === RoomId.LOBBY  && <span className="text-[11px] font-bold text-white">👑 CEO Room</span>}
            {activeRoomId === RoomId.PANTRY && <span className="text-[11px] font-bold text-white">☕ Pantry</span>}
            {activeRoomId === RoomId.FOCUS  && <span className="text-[11px] font-bold text-white">🏢 Lobby</span>}
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-3">

            {activeRoomId === RoomId.LOBBY && (
              <div className="flex flex-col gap-3 text-left">
                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-widest self-start">CEO Strategic Command</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">ยินดีต้อนรับกลับ ท่านประธานปลิว ทีม AI สแตนด์บายพร้อมทำงานครบทั้ง 3 คนแล้ว</p>
                <div className="bg-[#05080f] p-3 rounded-xl border border-slate-800 font-mono text-[10px] text-gray-500 space-y-1">
                  <strong className="text-gray-300 block mb-1.5">📢 สถานะโครงการ:</strong>
                  <div>💻 <span className="text-cyan-400">Byte</span> — SA Room พร้อมออกแบบระบบ</div>
                  <div>📝 <span className="text-indigo-400">Mina</span> — QA Room พร้อมรีวิวโค้ด</div>
                  <div>🤖 <span className="text-sky-400">Momo</span> — Help Desk พร้อมตอบคำถาม</div>
                </div>
                <button id="btn-lobby-standup" onClick={() => handleRoomSelect(RoomId.MEETING)} className="px-3 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse">
                  <Plus className="w-3.5 h-3.5" /><span>เข้าห้อง SA ประชุมทีม</span>
                </button>
                <button id="btn-lobby-coffee" onClick={() => handleRoomSelect(RoomId.PANTRY)} className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-gray-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Coffee className="w-3.5 h-3.5 text-amber-500" /><span>พักเบรกกาแฟ</span>
                </button>
              </div>
            )}

            {activeRoomId === RoomId.MEETING && (
              saRoomTab === "group"
                ? <ChatPanel characters={characters} messages={messages} activeChannel="group" onSendMessage={handleSendMessage} isGenerating={isGenerating} onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))} triggerVoiceSynthesis={triggerVoiceSynthesis} />
                : <ChatPanel characters={characters} messages={messages} activeChannel="senior-dev" onSendMessage={handleSendMessage} isGenerating={isGenerating} onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))} triggerVoiceSynthesis={triggerVoiceSynthesis} />
            )}

            {activeRoomId === RoomId.PROJECT && (
              qaRoomTab === "kanban"
                ? <TaskBoard tasks={tasks} characters={characters} onAddTask={handleAddTask} onUpdateTaskStatus={handleUpdateTaskStatus} onDeleteTask={handleDeleteTask} />
                : <ChatPanel characters={characters} messages={messages} activeChannel="code-reviewer" onSendMessage={handleSendMessage} isGenerating={isGenerating} onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))} triggerVoiceSynthesis={triggerVoiceSynthesis} />
            )}

            {activeRoomId === RoomId.PANTRY && <PantryMinigame />}

            {activeRoomId === RoomId.FOCUS && (
              <div className="flex flex-col gap-3 text-left">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase font-mono tracking-widest self-start">Central Lobby</span>
                <p className="text-[11px] text-gray-400 leading-relaxed">ล็อบบี้กลางสำนักงาน — จุดนัดพบของทุกคนในทีม เดินผ่านเพื่อเข้าสู่ห้องต่างๆ</p>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {navItems.filter(n => n.id !== RoomId.FOCUS).map(item => (
                    <button key={item.id} onClick={() => handleRoomSelect(item.id)}
                      className="p-2.5 bg-[#0b101c] border border-[#151e33] rounded-xl flex items-center gap-2 hover:border-[#2b96ff]/30 transition-all cursor-pointer text-left">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-[10px] font-bold text-gray-300">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeRoomId === RoomId.HELPDESK && (
              helpBotTab === "momo"
                ? <ChatPanel characters={characters} messages={messages} activeChannel="helper-bot" onSendMessage={handleSendMessage} isGenerating={isGenerating} onClearHistory={(chan) => setMessages(prev => prev.filter(m => m.channel !== chan))} triggerVoiceSynthesis={triggerVoiceSynthesis} />
                : (
                  <div className="flex flex-col gap-3">
                    <span className="px-2 py-0.5 bg-rose-500/15 border border-rose-500/25 text-[#f43f5e] text-[9px] font-extrabold uppercase rounded font-mono self-start">Help Center</span>
                    <p className="text-[11px] text-gray-400 leading-relaxed">ส่งสกรีนแชร์โค้ดให้มีนารีวิวได้เลย หรือถามโมโม่บอทช่วยเหลือทั่วไป</p>
                    <button id="btn-guide-screen" onClick={() => setFooterActiveTab("screenshare")} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                      <Tv className="w-3.5 h-3.5 animate-bounce" /><span>Screen Share Audit</span>
                    </button>
                  </div>
                )
            )}

          </div>
        </div>

      </div>

      {/* ══ BOTTOM BAR ══════════════════════════════════════════════════════ */}
      <footer className="flex-shrink-0 h-12 bg-[#090d16] border-t border-[#151e33] flex items-center px-4 gap-3 z-30 relative overflow-visible">

        {/* Toolbar tabs */}
        <div className="flex items-center gap-0.5 bg-[#0b101c] border border-[#1d2b48] rounded-xl p-1 flex-shrink-0">
          <button id="footer-tab-chat" onClick={() => { setFooterActiveTab(null); handleRoomSelect(RoomId.MEETING); }} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${activeRoomId === RoomId.MEETING && !footerActiveTab ? "text-[#2b96ff] bg-[#2b96ff]/10" : "text-gray-400 hover:text-white"}`}>
            <MessageSquare className="w-3.5 h-3.5" /><span className="font-mono">Chat</span>
            <span className="bg-red-500 text-white rounded-full w-3.5 h-3.5 text-[7px] flex items-center justify-center font-bold">2</span>
          </button>
          <button id="footer-tab-people" onClick={() => setFooterActiveTab(footerActiveTab === "people" ? null : "people")} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${footerActiveTab === "people" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"}`}>
            <Users className="w-3.5 h-3.5" /><span className="font-mono">People</span>
          </button>
          <button id="footer-tab-calendar" onClick={() => setFooterActiveTab(footerActiveTab === "calendar" ? null : "calendar")} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${footerActiveTab === "calendar" ? "text-emerald-400 bg-emerald-500/10" : "text-gray-400 hover:text-white"}`}>
            <Calendar className="w-3.5 h-3.5" /><span className="font-mono">Calendar</span>
          </button>
          <button id="footer-tab-screenshare" onClick={() => setFooterActiveTab(footerActiveTab === "screenshare" ? null : "screenshare")} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${footerActiveTab === "screenshare" ? "text-[#2b96ff] bg-[#2b96ff]/10" : "text-gray-400 hover:text-white"}`}>
            <Tv className="w-3.5 h-3.5" /><span className="font-mono">Screen</span>
          </button>
          <button id="footer-tab-more" onClick={() => setFooterActiveTab(footerActiveTab === "more" ? null : "more")} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${footerActiveTab === "more" ? "text-cyan-400 bg-[#22d3ee]/15" : "text-gray-400 hover:text-white"}`}>
            <MoreHorizontal className="w-3.5 h-3.5" /><span className="font-mono">More</span>
          </button>
        </div>

        <div className="w-px h-6 bg-[#1e2a44] flex-shrink-0"></div>

        {/* Character status chips */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {characters.map(char => (
            <button key={char.id} onClick={() => { handleRoomSelect(char.currentRoom); if (char.id !== "user") triggerSpeechBubble(char.id, char.greetingTh); }}
              className="flex items-center gap-1.5 bg-[#0b101c] border border-[#151e33] rounded-lg px-2.5 py-1 hover:border-[#2b96ff]/30 transition-all cursor-pointer flex-shrink-0">
              <img src={char.avatarUrl} alt={char.name} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="text-[9.5px] font-mono font-bold text-gray-300">{char.id === "user" ? "You" : char.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${char.statusColor}`}></span>
            </button>
          ))}
        </div>

        {/* Popover drawers — float above footer */}
        {footerActiveTab && (
          <div className="absolute bottom-full left-4 mb-2 z-50 w-[500px] max-w-[calc(100vw-2rem)]">
            {footerActiveTab === "people" && (
              <div className="bg-[#0b101c] border border-[#1e2a44] rounded-2xl p-4 shadow-2xl animate-[slideUp_0.2s_ease-out]">
                <h3 className="text-xs font-extrabold text-white mb-3 uppercase tracking-wide flex items-center gap-1.5"><Info className="w-4 h-4 text-emerald-400" />ผู้เชี่ยวชาญ AI ของออฟฟิศ</h3>
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                  <div className="p-3 bg-[#05080f] rounded-xl border border-slate-900"><strong className="text-xs text-white block mb-1">🔧 Mina (QA & Reviewer)</strong><p className="text-slate-500">ตรวจคุณภาพโค้ด ค้นหาบั๊ก ประจำการที่ห้อง QA</p></div>
                  <div className="p-3 bg-[#05080f] rounded-xl border border-slate-900"><strong className="text-xs text-white block mb-1">💻 Byte (Developer & SA)</strong><p className="text-slate-500">ดูแลระบบ รันไทม์พอร์ต 3000 ประจำการที่ห้อง SA</p></div>
                </div>
              </div>
            )}
            {footerActiveTab === "calendar" && (
              <div className="bg-[#0b101c] border border-[#1d2b48] rounded-2xl p-4 shadow-2xl animate-[slideUp_0.2s_ease-out]">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-extrabold text-white flex items-center gap-1.5">📅 อัพเดทตารางกิจกรรมวันนี้</h3>
                  <span className="text-[9px] font-mono text-green-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">3 Events</span>
                </div>
                <ul className="space-y-2">
                  {events.map((evt: CalendarEvent) => (
                    <li key={evt.id} className="p-2.5 bg-gray-950 rounded-xl border border-slate-900 flex justify-between items-start">
                      <div><span className="text-[10px] font-bold text-[#9edcfe] block">{evt.title}</span><span className="text-[9px] text-slate-500">{evt.description}</span></div>
                      <span className="text-[9px] font-mono font-bold text-[#2b96ff] bg-[#2b96ff]/10 px-2 py-0.5 border border-[#2b96ff]/20 rounded ml-2 flex-shrink-0">{evt.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {footerActiveTab === "screenshare" && (
              <div className="bg-slate-950/95 rounded-2xl border border-slate-800 p-1 animate-[slideUp_0.2s_ease-out]">
                <ScreenShareHub characters={characters} onTriggerAudit={handleTriggerAudit} isGenerating={isGenerating} auditReport={auditReport} />
              </div>
            )}
            {footerActiveTab === "more" && (
              <div className="bg-[#0b101c] border border-[#1d2b48] rounded-2xl p-4 shadow-2xl animate-[slideUp_0.2s_ease-out] space-y-3">
                <h3 className="text-xs font-black text-white uppercase tracking-wide flex items-center gap-1.5"><Settings className="w-4 h-4 text-cyan-400" />Configure Office Sandbox</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-[#141d33] flex flex-col gap-2">
                    <strong className="text-amber-400 font-mono text-[10.5px]">☕ Drip Coffee Minigame</strong>
                    <button onClick={() => { setFooterActiveTab(null); handleRoomSelect(RoomId.PANTRY); }} className="py-1.5 bg-[#cc971c] hover:bg-[#b58514] text-slate-950 font-bold text-[9.5px] rounded-lg cursor-pointer">LAUNCH</button>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-[#141d33] flex flex-col gap-2">
                    <strong className="text-[#38bdf8] font-mono text-[10.5px]">🗣️ Text To Speech</strong>
                    <button onClick={() => setIsMuted(!isMuted)} className={`py-1.5 font-bold text-[9.5px] rounded-lg border cursor-pointer ${isMuted ? "bg-slate-900 border-[#1e2a44] text-[#38bdf8]" : "bg-[#0284c7] border-white/20 text-white"}`}>{isMuted ? "ENABLE VOICE" : "MUTE VOICE"}</button>
                  </div>
                </div>
                <div className="text-[8.5px] text-slate-500 space-y-0.5 border-t border-[#131b2c] pt-2">
                  <div>● <strong className="text-emerald-400">API:</strong> SANDBOX SIMULATION ACTIVE</div>
                  <div>● <strong className="text-cyan-400">Stack:</strong> React 19 + Express · Port 3000</div>
                </div>
              </div>
            )}
            {footerActiveTab === "settings" && (
              <div className="bg-[#0b101c] border border-[#1d2b48] rounded-2xl p-4 shadow-2xl animate-[slideUp_0.2s_ease-out]">
                <h3 className="text-xs font-black text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><Settings className="w-4 h-4 text-cyan-400" />API Configuration</h3>
                <div className="text-[10px] text-gray-400 space-y-2 font-mono">
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">Set <span className="text-emerald-400">GEMINI_API_KEY</span> in .env to enable real AI responses.</div>
                  <div className="p-2 bg-slate-950 rounded border border-slate-800">Currently: <span className="text-amber-400">sandbox / simulation mode</span></div>
                </div>
              </div>
            )}
          </div>
        )}

      </footer>

    </div>
  );
}
