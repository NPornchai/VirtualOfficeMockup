import React, { useState, useEffect } from "react";
import { COFFEE_RECIPES, DEV_TRIVIA_QUESTIONS } from "../data";
import { 
  Coffee, 
  Flame, 
  Sparkles, 
  Award, 
  VolumeX, 
  RotateCcw,
  Zap,
  HelpCircle,
  Clock,
  Play,
  SquareCheck
} from "lucide-react";

export default function PantryMinigame() {
  const [activeTab, setActiveTab] = useState<"drip" | "quiz">("drip");

  // Game 1: Drip Espresso Timing Game
  const [targetRecipe, setTargetRecipe] = useState(COFFEE_RECIPES[0]);
  const [isPlayingRatio, setIsPlayingRatio] = useState(false);
  const [ratioTime, setRatioTime] = useState(0);
  const [bestRatioScore, setBestRatioScore] = useState<number | null>(null);
  const [dripMessage, setDripMessage] = useState<string>("เลือกเมล็ดกาแฟด้านบนแล้วเริ่มดริปสตรีม!");
  const [pourRatio, setPourRatio] = useState<string>("0.0");

  // Game 2: Dev Trivia Quiz Game
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);

  // Drip pouring gameplay loop
  useEffect(() => {
    let intervalId: any;
    if (isPlayingRatio) {
      setDripMessage("กำลังปล่อยน้ำร้อนร้อนเดือด ดริปช้าๆ... พิกเซลกาแฟเริ่มใหล!");
      const targetWaterAmount = parseFloat(targetRecipe.ratio.split(":")[1]); // e.g. 15 or 16
      
      intervalId = setInterval(() => {
        setRatioTime((prev) => {
          const nextTime = prev + 0.12;
          // Calculate active animated poured ratio
          const currentWaterPour = (nextTime * 3).toFixed(1);
          setPourRatio(`1:${currentWaterPour}`);
          return nextTime;
        });
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [isPlayingRatio, targetRecipe]);

  const handleStartPour = () => {
    setRatioTime(0);
    setPourRatio("1:0.0");
    setIsPlayingRatio(true);
  };

  const handleStopPour = () => {
    setIsPlayingRatio(false);
    
    // Evaluate the score based on proximity to target ratio
    const pouredWater = ratioTime * 3;
    const targetWater = parseFloat(targetRecipe.ratio.split(":")[1]);
    const difference = Math.abs(pouredWater - targetWater);

    let score = Math.max(0, 100 - Math.round(difference * 45));

    if (score >= 95) {
      setDripMessage(`🏆 ระดับกูรูบาริสต้า! สกัดสารสกัดได้สมบูรณ์แบบที่อัตราส่วน ${pourRatio} (ตรงเป้าหมาย: ${targetRecipe.ratio})! พี่วิชัยขอยอมแพ้รสชาตินี้!`);
    } else if (score >= 80) {
      setDripMessage(`☕ รสชาติดีกลมกล่อม! สกัดได้ที่อัตราส่วน ${pourRatio} ถ้อยคนหอมฉุย เสิร์ฟให้พี่สมชายดื่มแก้ง่วงได้ยอดเยี่ยมครับ!`);
    } else {
      setDripMessage(`⚠️ สกัดเพี้ยนไปนิด! ได้อัตราส่วน ${pourRatio} (ห่างจากเป้าหมาย ${targetRecipe.ratio}). รสชาติขมหรือเจือจางเกินไป ลองบดเมล็ดแล้วเริ่มใหม่เถอะนะน้อง!`);
    }

    if (!bestRatioScore || score > bestRatioScore) {
      setBestRatioScore(score);
    }
  };

  const currentQuiz = DEV_TRIVIA_QUESTIONS[quizIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
    setIsAnswered(true);
    
    if (idx === currentQuiz.answerIndex) {
      setQuizScore(prev => prev + 10);
    }
  };

  const handleNextQuiz = () => {
    setSelectedOpt(null);
    setIsAnswered(false);
    if (quizIdx + 1 < DEV_TRIVIA_QUESTIONS.length) {
      setQuizIdx(quizIdx + 1);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    setQuizIdx(0);
    setSelectedOpt(null);
    setQuizScore(0);
    setIsAnswered(false);
    setQuizComplete(false);
  };

  return (
    <div className="bg-[#0c111d] border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col h-[520px]">
      {/* Tab Selectors */}
      <div className="flex justify-between items-center mb-5 border-b border-gray-800 pb-3">
        <div>
          <h2 className="text-sm font-extrabold text-white tracking-wide">☕ มินิเกมพักยกคาเฟ่ (Pantry Chill Arcade)</h2>
          <p className="text-[10px] text-gray-400">มาฟื้นฟูค่าสมรรถนะนักพัฒนาด้วยการเติมพลังคาเฟอีนและแก้รหัสลับสนุกๆ</p>
        </div>

        <div className="flex bg-[#111827] border border-gray-800 p-1 rounded-xl">
          <button
            id="tab-select-drip"
            onClick={() => setActiveTab("drip")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "drip" ? "bg-orange-500/10 text-orange-400" : "text-gray-400 hover:text-white"
            }`}
          >
            บาริสต้าดริปกาแฟ
          </button>
          <button
            id="tab-select-quiz"
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === "quiz" ? "bg-cyan-500/10 text-cyan-400" : "text-gray-400 hover:text-white"
            }`}
          >
            ข้อสอบปริศนา Dev Trivia
          </button>
        </div>
      </div>

      {activeTab === "drip" ? (
        <div className="flex-1 flex flex-col md:flex-row gap-5">
          {/* Left panel recipes selection */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-200 mb-2">เลือกสูตรดริปจากโรงคั่ว:</h3>
              <div className="space-y-2">
                {COFFEE_RECIPES.map((recipe) => (
                  <button
                    key={recipe.name}
                    id={`recipe-btn-${recipe.name.replace(/\s+/g, '-')}`}
                    onClick={() => {
                      setTargetRecipe(recipe);
                      setDripMessage(`เตรียมเมล็ด ${recipe.name}เรียบร้อย อัตราส่วนที่ดีที่สุดคือ ${recipe.ratio}!`);
                      setPourRatio("1:0.0");
                    }}
                    className={`w-full p-2.5 rounded-xl text-left border transition-all flex justify-between items-center bg-[#070b13] ${
                      targetRecipe.name === recipe.name 
                        ? "border-orange-500/40 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]" 
                        : "border-gray-800 text-gray-400 hover:border-gray-700"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-extrabold">{recipe.name}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5">โปรไฟล์: {recipe.profile}</p>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-[#111827] px-2 py-0.5 rounded border border-gray-800">
                      อัตราส่วน {recipe.ratio}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Brew Info Profile board */}
            <div className="bg-[#0e1420]/80 border border-gray-800 p-3 rounded-xl mt-4">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-[#ffd5dc]">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Brew Standards : {targetRecipe.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-[9px] text-gray-400">
                <div className="bg-gray-950 p-1.5 rounded border border-gray-950">
                  <span className="block text-[8px] text-gray-500 uppercase font-bold">Grind Size</span>
                  <span className="text-white font-bold">{targetRecipe.grind}</span>
                </div>
                <div className="bg-gray-950 p-1.5 rounded border border-gray-950">
                  <span className="block text-[8px] text-gray-500 uppercase font-bold">Target Ratio</span>
                  <span className="text-orange-400 font-bold">{targetRecipe.ratio}</span>
                </div>
                <div className="bg-gray-950 p-1.5 rounded border border-gray-950">
                  <span className="block text-[8px] text-gray-500 uppercase font-bold">Hot Temp</span>
                  <span className="text-white font-bold">{targetRecipe.temp}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel interactive physics pour container */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-gray-800 p-5 flex flex-col justify-between items-center text-center relative shadow-inner">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-[9px] font-mono text-gray-500">OPTIMIZES GAMEPLAY</span>
              <span className="text-[10px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Best: {bestRatioScore ? `${bestRatioScore}% Match` : "No Record"}
              </span>
            </div>

            {/* Physical Dripping Glassware Visualization */}
            <div className="relative w-28 h-36 border-2 border-gray-700/60 rounded-b-3xl border-t-0 p-1.5 flex flex-col justify-end overflow-hidden my-2">
              {/* Coffee Stream pouring down */}
              {isPlayingRatio && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-full bg-amber-800/80 rounded-full animate-pulse shadow"></div>
              )}

              {/* Water filling up animation */}
              <div 
                className="w-full bg-[#5c4033] rounded-b-2xl border-t border-amber-600/30 transition-all max-h-full flex items-center justify-center text-[10px] font-mono font-bold text-amber-100"
                style={{ height: `${Math.min(ratioTime * 8, 90)}%` }}
              >
                {ratioTime > 0.5 && `${pourRatio}`}
              </div>
            </div>

            <div className="w-full">
              <div className="font-mono text-2xl font-bold tracking-widest text-orange-400 my-2">
                {pourRatio}
              </div>

              <p className="text-[10px] text-gray-400 px-3 min-h-[32px] line-clamp-2 leading-relaxed">
                {dripMessage}
              </p>
            </div>

            <div className="w-full flex gap-2 mt-3">
              {isPlayingRatio ? (
                <button
                  id="btn-stop-drip"
                  onClick={handleStopPour}
                  className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <SquareCheck className="w-4 h-4" />
                  <span>หยุดการตักน้ำร้อน ณ บัดนี้!</span>
                </button>
              ) : (
                <button
                  id="btn-start-drip"
                  onClick={handleStartPour}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>เริ่มดริปปล่อยน้ำร้อนสัญจร</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Trivia Game mode panel representation */
        <div className="flex-1 flex flex-col justify-between">
          {quizComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950 rounded-xl border border-gray-800/80">
              <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center text-3xl mb-4 animate-pulse">
                🎓
              </div>
              <h3 className="text-sm font-extrabold text-white">ทดสอบเสร็จเรียบร้อยแล้วบอส!</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                คุณทำคะแนนคำถามได้สะสมไป <strong className="text-cyan-400">{quizScore} / 30 คะแนน</strong>
              </p>
              <p className="text-[11px] text-gray-500 italic mt-3 max-w-xs">
                {quizScore >= 20 
                  ? "สมชายและวิชัย ประทับใจในความรู้ด้านโค้ดดิงระดับปรมาจารย์ของคุณอย่างลึกซึ้ง!"
                  : "สู้ๆ นะบอส ความรู้ติดตัวเราเพิ่มศักยภาพการจัดสรรสปีดในสปริ้นท์ได้เสมอครับ!"}
              </p>

              <button
                id="btn-quiz-restart"
                onClick={resetQuiz}
                className="mt-5 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow"
              >
                <RotateCcw className="w-4 h-4" />
                <span>จำสอบใหม่อีกซักครั้ง</span>
              </button>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between">
              {/* Quiz content detail */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-gray-800 flex flex-col gap-2 relative">
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                  <span className="uppercase text-cyan-400 font-extrabold flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Quiz {quizIdx + 1} of 3
                  </span>
                  <span>คะแนนปัจจุบัน: {quizScore}</span>
                </div>
                
                <h3 className="text-xs md:text-sm font-bold text-gray-100 mt-1 leading-normal">
                  {currentQuiz.question}
                </h3>
              </div>

              {/* Multiple Options list layout */}
              <div className="space-y-2 my-3">
                {currentQuiz.options.map((option, idx) => {
                  const isCurSelected = selectedOpt === idx;
                  const isCorrect = idx === currentQuiz.answerIndex;

                  let optionStyle = "border-gray-800 text-gray-300 hover:border-gray-700 bg-gray-900/40";
                  if (isAnswered) {
                    if (isCorrect) {
                      optionStyle = "border-emerald-500/40 text-emerald-400 bg-emerald-500/10";
                    } else if (isCurSelected) {
                      optionStyle = "border-rose-500/40 text-rose-400 bg-rose-500/10";
                    } else {
                      optionStyle = "border-gray-900 text-gray-600 bg-gray-950/20";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      onClick={() => handleSelectOption(idx)}
                      disabled={isAnswered}
                      className={`w-full p-2.5 rounded-xl text-left text-xs border transition-all flex items-center gap-3 ${optionStyle}`}
                    >
                      <span className={`w-5 h-5 rounded-full border text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
                        isCurSelected ? "bg-cyan-500/20 border-cyan-400" : "bg-gray-850 border-gray-800"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation section if answered */}
              {isAnswered && (
                <div className="bg-[#0f1524] border border-cyan-900/30 p-2.5 rounded-lg text-[10px] text-cyan-300/90 flex gap-1.5 leading-relaxed my-2">
                  <Zap className="w-4 h-4 text-cyan-400 flex-shrink-0 self-start" />
                  <div>
                    <strong className="font-bold text-white block mb-0.5">💡 เฉลยอธิบาย:</strong>
                    {currentQuiz.explanation}
                  </div>
                </div>
              )}

              {isAnswered && (
                <button
                  id="btn-quiz-next"
                  onClick={handleNextQuiz}
                  className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  {quizIdx + 1 === 3 ? "ตรวจสอบสรุปผลสรุป" : "ถัดไปสลักโจทย์ถัดไป"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
