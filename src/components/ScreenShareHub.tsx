import React, { useState } from "react";
import { Character } from "../types";
import { 
  Tv, 
  Terminal, 
  Sparkles, 
  Code2, 
  UserSquare, 
  Send, 
  Zap,
  CheckCircle2,
  FileCode2,
  Volume2,
  ShieldCheck
} from "lucide-react";

interface ScreenShareHubProps {
  characters: Character[];
  onTriggerAudit: (content: string, reviewerId: string) => Promise<void>;
  isGenerating: boolean;
  auditReport: string | null;
}

export default function ScreenShareHub({
  characters,
  onTriggerAudit,
  isGenerating,
  auditReport
}: ScreenShareHubProps) {
  const [shareType, setShareType] = useState<"code" | "plan">("code");
  const [content, setContent] = useState<string>(`// พาสตัวอย่างโค้ดมาไล่ตรวจสอบกันครับ เช่น:
export default function useCounter(initial = 0) {
  const [count, setCount] = React.useState(initial);
  
  React.useEffect(() => {
    // แนะนำตรวจแก้ Memory leak ตรงนี้
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  }, []); // <-- ระวัง Dependency arrays?

  return { count };
}`);

  const [reviewerId, setReviewerId] = useState<string>("code-reviewer");
  const [showResultBubble, setShowResultBubble] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isGenerating) return;
    setShowResultBubble(true);
    await onTriggerAudit(content, reviewerId);
  };

  const selectedReviewer = characters.find(c => c.id === reviewerId);

  // Quick preset loading helper to ease testing
  const loadPreset = (type: "auth" | "hook" | "pantry") => {
    if (type === "auth") {
      setShareType("code");
      setContent(`// โค้ดตรวจสอบความปลอดภัยสัญจร
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);

  // บกพร่องเรื่องการไม่ดักหมดอายุเซสชัน
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}`);
    } else if (type === "hook") {
      setShareType("code");
      setContent(`// คัสตอมฮุค React 19 ดริปแคช
import { use } from 'react';

export function useFetchItems(dataPromise) {
  // บอสครับ การโยน dataPromise แบบไม่เมโมรี่อาจทำให้ Re-render ไม่สิ้นสุด
  const items = use(dataPromise);
  return items;
}`);
    } else {
      setShareType("plan");
      setContent(`## แผนฟีเจอร์: บอร์ดจัดลำดับตู้เย็นระบบพิกเซล
1. ปล่อยให้พนักงานดริปกาแฟแล้วแลกเปลี่ยนของว่าง
2. เชื่อมโยง Firestore เพื่อเก็บคะแนน Energy สำนักงานแบบ persistent
3. นำเสนอการสรุป Standup บ่ายสองโมงอัตโนมัติจากเวิรกสเปซ`);
    }
  };

  return (
    <div className="bg-[#0c111d] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
      <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-white tracking-wide">🖥️ ศูนย์จำลองการแชร์หน้าจอ (Screen Share Auditor)</h2>
          <p className="text-[10px] text-gray-400">แชร์งาน พิมพ์โค้ด หรือส่งสเปก สั่งให้พนักงาน AI ในห้องโปรเจกต์ช่วยรีวิวให้คะแนนทันที</p>
        </div>
        
        <span className="text-[8px] tracking-widest font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
          Workspace feed connected
        </span>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
        {/* Left share submit controls Panel */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto pr-1">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Share type toggler */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShareType("code"); loadPreset("auth"); }}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  shareType === "code" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm" 
                    : "bg-transparent text-gray-400 border-gray-800 hover:border-gray-700"
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>แชร์หน้าจอเขียนโค้ด</span>
              </button>

              <button
                type="button"
                onClick={() => { setShareType("plan"); loadPreset("pantry"); }}
                className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  shareType === "plan" 
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                    : "bg-transparent text-gray-400 border-gray-800 hover:border-gray-700"
                }`}
              >
                <FileCode2 className="w-4 h-4" />
                <span>แชร์สเปกระบบ (System Plan)</span>
              </button>
            </div>

            {/* Presets helpers list */}
            <div className="flex items-center gap-2 bg-[#070b13] p-1.5 rounded-lg border border-gray-900">
              <span className="text-[9px] text-gray-500 font-bold uppercase pl-1.5">โหลดตัวอย่างทดสอบ:</span>
              <button 
                type="button" 
                onClick={() => loadPreset("auth")}
                className="text-[9px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-medium"
              >
                API Auth Check
              </button>
              <button 
                type="button" 
                onClick={() => loadPreset("hook")}
                className="text-[9px] px-2 py-0.5 rounded bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 font-medium"
              >
                React 19 Hook
              </button>
            </div>

            {/* Content area */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">เนื้อหาหน้าจอที่แชร์ (Pasted Workspace View)</label>
              <textarea
                id="share-input-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-44 bg-[#070b13] border border-gray-800 hover:border-gray-750 focus:border-emerald-500 text-xs text-emerald-400 font-mono rounded-xl p-3 outline-none resize-none leading-relaxed transition-colors"
                required
              />
            </div>

            {/* Reviewer select options */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">ส่งคำเชิญพนักงานเพื่อตรวจทาน (Assigned Presenter Feedback)</label>
              <div className="grid grid-cols-2 gap-2">
                {characters.filter(c => c.id !== "user").map(char => {
                  const isCur = char.id === reviewerId;
                  return (
                    <button
                      key={char.id}
                      id={`share-reviewer-btn-${char.id}`}
                      type="button"
                      onClick={() => setReviewerId(char.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isCur 
                          ? char.id === "code-reviewer"
                            ? "border-indigo-400 bg-indigo-505/10 text-indigo-400"
                            : "border-cyan-400 bg-cyan-505/10 text-cyan-400"
                          : "border-gray-800 text-gray-400 hover:border-gray-750 hover:text-white"
                      }`}
                    >
                      <img src={char.avatarUrl} alt={char.name} className="w-7 h-7 rounded-full bg-gray-800 object-cover rendering-pixelated" referrerPolicy="no-referrer" />
                      <div>
                        <h4 className="text-[11px] font-bold">{char.name}</h4>
                        <p className="text-[9px] text-gray-400">{char.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              id="share-submit-btn"
              type="submit"
              disabled={isGenerating || !content.trim()}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md active:scale-95"
            >
              <Tv className="w-4 h-4" />
              <span>{isGenerating ? "กำลังประมวลผลการวิเคราะห์..." : "เริ่มทำการแชร์และให้พนักงานรีวิว"}</span>
            </button>
          </form>
        </div>

        {/* Right workspace monitor displaying Gemini Auditor feedback */}
        <div className="flex-1 bg-slate-950 rounded-xl border border-gray-800 p-4 flex flex-col h-[400px] lg:h-auto overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-gray-900 pb-2 mb-2 text-[10px] font-mono text-gray-500">
            <span>🔴 LIVE AUDIT MONITOR</span>
            <span className="text-gray-600">Review Output</span>
          </div>

          <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-gray-300 leading-relaxed pr-1 scrollbar-thin">
            {isGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                <span className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></span>
                <p className="text-[10px] text-gray-400">
                  กำลังประมวลผลข้อคิดเห็นจาก {selectedReviewer?.name}... <br/>
                  (ใช้ Gemini ตริตรองโค้ดและดีไซน์บอสอยู่ครับ)
                </p>
              </div>
            ) : auditReport ? (
              <div className="space-y-4 font-sans text-xs">
                {/* Custom feedback banner */}
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-3">
                  <span className="text-xl">{selectedReviewer?.avatar}</span>
                  <div>
                    <h4 className="font-bold text-white">รายงานสรุปข้อคิดเห็นจาก {selectedReviewer?.name}</h4>
                    <p className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      COMPLETED • PUSHED TO CORPORATE FEED CHANNELS
                    </p>
                  </div>
                </div>

                <div 
                  className="prose-sm bg-[#090d16] p-4 rounded-xl border border-gray-900 max-h-full leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: auditReport
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
                      .replace(/```([\s\S]*?)```/g, '<pre class="bg-black/80 my-2 p-2.5 rounded border border-gray-800 text-[10px] text-emerald-400 overflow-x-auto whitespace-pre-wrap">$1</pre>')
                      .replace(/`(.*?)`/g, '<code class="bg-gray-800 px-1 rounded text-rose-400 text-[11px]">$1</code>')
                      .replace(/^\*\s(.*)$/gm, '<li class="list-disc ml-4 my-1 text-gray-300">$1</li>')
                      .replace(/\n\n+/g, '</div><div class="mb-3">')
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500 font-sans">
                <div className="w-12 h-12 bg-gray-900 rounded-full border border-gray-800/80 flex items-center justify-center text-xl mb-3">
                  🖥️
                </div>
                <h4 className="text-xs font-bold text-gray-400">หน้าจอพักสายตา (Inactive Monitor)</h4>
                <p className="text-[10px] text-gray-500 max-w-xs mt-1 leading-normal">
                  วางโค้ดหรือคีย์บอร์ดแล้วกด "แชร์หน้าจอ" จากแผนกด้านซ้าย คลื่นความคิดวิเคราะห์จะสว่างขึ้นบนมอนิเตอร์นี้ทันที
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
