import React, { useState, useRef, useEffect } from "react";
import { Message, Character } from "../types";
import { 
  Send, 
  Bot, 
  Sparkles, 
  Coffee, 
  RotateCcw,
  Volume2,
  Mic,
  Smile,
  ShieldCheck,
  Zap,
  CheckCircle2
} from "lucide-react";

interface ChatPanelProps {
  characters: Character[];
  messages: Message[];
  activeChannel: string; // 'group' | 'senior-dev' | 'code-reviewer'
  onSendMessage: (text: string, channel: string) => Promise<void>;
  isGenerating: boolean;
  onClearHistory: (channel: string) => void;
  triggerVoiceSynthesis?: (text: string, voiceName: string) => void;
}

// Simple, high-reliability markdown parser to bypass dependency issues
function formatMessageText(text: string) {
  if (!text) return "";
  
  // Format bold (**text**)
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#9cdcfe]">$1</strong>');
  
  // Format code blocks (```code```)
  formatted = formatted.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="bg-slate-950 p-2.5 rounded-lg my-2 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">${code.trim()}</pre>`;
  });

  // Format inline code (`code`)
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-900 px-1 py-0.5 rounded text-rose-400 font-mono text-[11px]">$1</code>');

  // Format bullet lines (* bullet)
  formatted = formatted.replace(/^\*\s(.*)$/gm, '<li class="list-disc ml-4 my-1">$1</li>');

  // Convert double newlines into spaced blocks
  const paragraphs = formatted.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.trim().startsWith('<pre') || p.trim().startsWith('<li')) {
      return p;
    }
    return `<p class="leading-relaxed mb-2">${p.replace(/\n/g, '<br/>')}</p>`;
  }).join('');
}

export default function ChatPanel({
  characters,
  messages,
  activeChannel,
  onSendMessage,
  isGenerating,
  onClearHistory,
  triggerVoiceSynthesis
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Filter messages based on channel
  const filteredMessages = messages.filter(msg => msg.channel === activeChannel);

  // Get active character info
  const getCurrentCoworker = () => {
    if (activeChannel === "senior-dev") return characters.find(c => c.id === "senior-dev");
    if (activeChannel === "code-reviewer") return characters.find(c => c.id === "code-reviewer");
    return null;
  };

  const activeCoworker = getCurrentCoworker();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isGenerating) return;
    const textToSend = inputValue;
    setInputValue("");
    await onSendMessage(textToSend, activeChannel);
  };

  const getChannelTitle = () => {
    if (activeChannel === "group") return "🤝 ห้องประชุมทีมแบบโต้ตอบ (Interactive Joint Standup)";
    if (activeChannel === "senior-dev") return "💬 แชทกับ พี่วิชัย (Senior Developer)";
    if (activeChannel === "code-reviewer") return "📝 แชทกับ พี่สมชาย (Code Reviewer)";
    return "กระดานสนทนา";
  };

  const getChannelSub = () => {
    if (activeChannel === "group") return "ห้องสนทนารวม โดยคำถามของคุณจะได้รับการตอบกลับสลับกันคุยจากทั้งสองคนแบบ Standup Meeting";
    if (activeChannel === "senior-dev") return "พูดคุยสัญจรเรื่องเขียนโค้ด, เชื่อมฐานข้อมูล, ตัวอย่างฟีเจอร์ หรือ บ่นประชุม";
    if (activeChannel === "code-reviewer") return "ให้พี่สมชายช่วยรีวิวโค้ด สปอตหาบั๊ก แนะนำแพทเทิร์น และตรวจหา Memory leak คลีนโค้ด";
    return "";
  };

  return (
    <div className="flex flex-col h-[520px] bg-[#0c111d] rounded-2xl border border-gray-800 shadow-xl overflow-hidden">
      {/* Thread Header */}
      <div className="px-5 py-4 bg-gray-900/60 border-b border-gray-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {activeCoworker ? (
            <div className="relative">
              <img 
                src={activeCoworker.avatarUrl} 
                alt={activeCoworker.name} 
                className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 object-cover rendering-pixelated"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${activeCoworker.statusColor}`}></span>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shadow-inner">
              📢
            </div>
          )}

          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide">{getChannelTitle()}</h2>
            <p className="text-[10px] text-gray-400 font-medium">{getChannelSub()}</p>
          </div>
        </div>

        <button
          id={`btn-clear-${activeChannel}`}
          onClick={() => onClearHistory(activeChannel)}
          title="ล้างประวัติการคุย"
          className="p-1.5 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#0d1321]/30 scrollbar-thin scrollbar-thumb-gray-800">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
            {activeChannel === "group" ? (
              <>
                <div className="w-14 h-14 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center text-2xl mb-3 animate-bounce">
                  🗣️
                </div>
                <h3 className="text-sm font-bold text-gray-300">เริ่มการหารือในห้องประชุม</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  พิมพ์ประเด็น เช่น "ทำยังไงให้ระบบรองรับ 10,000 RPS ดี?" แล้วพนักงานทั้งคู่ร่วมกันโต้ตอบในฉากประชุมทันที!
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xl mb-3">
                  {activeCoworker?.avatar}
                </div>
                <h3 className="text-sm font-bold text-gray-300">เริ่มพูดคุยกับ {activeCoworker?.name}</h3>
                <p className="text-xs text-gray-500 max-w-sm mt-1">
                  พิมพ์ทักทายหรือสับสนปัญหาเขียนโค้ด แล้วคุณจะได้รับการตอบกลับสไตล์พนักงานจริงๆ ที่ได้รับมอเตอร์ขับเคลื่อนจาก Gemini
                </p>
              </>
            )}
          </div>
        ) : (
          filteredMessages.map((msg: Message) => {
            const isUser = msg.senderId === "user";
            const isSystem = msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-1.5">
                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-full py-1 px-4 text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <img 
                    src={msg.senderAvatar} 
                    alt={msg.senderName} 
                    className="w-8 h-8 rounded-full border border-gray-700 bg-gray-800 rendering-pixelated"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Message Box */}
                <div>
                  <div className={`flex items-center gap-1.5 mb-1 ${isUser ? "justify-end" : ""}`}>
                    <span className="text-[10px] font-extrabold text-gray-300 tracking-wide">{msg.senderName}</span>
                    <span className="text-[8px] text-gray-500 font-mono">{msg.timestamp}</span>

                    {/* Simple Audio playback trigger for AI response */}
                    {!isUser && triggerVoiceSynthesis && (
                      <button
                        onClick={() => triggerVoiceSynthesis(msg.text, msg.senderId === "code-reviewer" ? "Kore" : "Puck")}
                        title="ฟังเสียง AI พนักงานพูด"
                        className="p-0.5 hover:bg-gray-800 rounded text-gray-500 hover:text-cyan-400 transition-colors pointer-events-auto"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div 
                    className={`p-3.5 rounded-2xl text-xs md:text-[13px] text-gray-100 shadow-md ${
                      isUser 
                        ? "bg-gradient-to-r from-emerald-500/20 to-teal-600/30 border border-emerald-500/30 rounded-tr-none" 
                        : msg.senderId === "code-reviewer"
                        ? "bg-indigo-950/40 border border-indigo-900/40 rounded-tl-none"
                        : "bg-cyan-950/40 border border-cyan-900/40 rounded-tl-none"
                    }`}
                  >
                    <div 
                      className="prose-sm leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Loading Indicator */}
        {isGenerating && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center animate-spin">
              ✨
            </div>
            <div>
              <span className="text-[10px] font-bold text-gray-400">กำลังร่างคำตอบ...</span>
              <div className="mt-1 bg-gray-900/60 p-3 rounded-2xl rounded-tl-none border border-gray-800/80 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Fields */}
      <form 
        onSubmit={handleSend} 
        className="p-4 bg-gray-900/80 border-t border-gray-800 flex gap-2 items-center"
      >
        <input 
          id={`chat-input-${activeChannel}`}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={
            activeChannel === "group" 
              ? "พิมพ์ประเด็นในที่ประชุม..." 
              : `พิมพ์พูดคุยกับ ${activeCoworker?.name}... (ถามโค้ด ประสิทธิภาพ หรือบักส์...)`
          }
          className="flex-1 bg-[#0b0e14] border border-gray-800 hover:border-gray-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-gray-200 outline-none transition-colors"
        />
        
        <button
          id={`btn-send-${activeChannel}`}
          type="submit"
          disabled={!inputValue.trim() || isGenerating}
          className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 text-slate-950 font-bold p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
