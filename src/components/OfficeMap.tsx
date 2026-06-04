import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Room, RoomId, Character } from "../types";
import { OFFICE_ROOMS } from "../data";
// @ts-ignore
import officeMapImg from "../assets/images/office_map_v3.png";
// @ts-ignore
import charCeo  from "../assets/images/char_ceo.png";
// @ts-ignore
import charByte from "../assets/images/char_byte.png";
// @ts-ignore
import charMina from "../assets/images/char_mina.png";
// @ts-ignore
import charMomo from "../assets/images/char_momo.png";

const CHARACTER_MODELS: Record<string, string> = {
  "user":           charCeo,
  "senior-dev":     charByte,
  "code-reviewer":  charMina,
  "helper-bot":     charMomo,
};
import { 
  Coffee, 
  Terminal, 
  Users, 
  ShieldAlert, 
  UserPlus, 
  BookOpen, 
  ClipboardList, 
  Tv,
  Navigation,
  Sparkles,
  Layers,
  MapPin
} from "lucide-react";

interface OfficeMapProps {
  characters: Character[];
  userCharacter: Character;
  activeRoomId: RoomId;
  onRoomSelect: (roomId: RoomId) => void;
  recentDialogs: Record<string, string>;
}

// Helpers for Character name tags styling to match the screenshot EXACTLY
const getCharacterTagColor = (id: string, defaultColor: string) => {
  switch (id) {
    case "user":
      return "bg-[#1d6b2c] border-[#3b8a3e] text-white shadow-green-950/40"; // Green name tag for Pliew (CEO)
    case "senior-dev":
      return "bg-[#581c87] border-[#7e22ce] text-[#f3e8ff] shadow-purple-950/40"; // Purple name tag for Byte (Senior Developer)
    case "code-reviewer":
      return "bg-[#c25100] border-[#f97316] text-[#ffedd5] shadow-orange-950/40"; // Orange/coral status name tag for Mina (Code Reviewer)
    case "helper-bot":
      return "bg-[#0c4a6e] border-[#0284c7] text-[#e0f2fe] shadow-sky-950/40"; // Slate/Sky blue name tag for Momo (Helper Bot)
    default:
      return defaultColor;
  }
};

// Glow color per character
const CHAR_GLOW: Record<string, string> = {
  "user":          "rgba(16,185,129,0.5)",
  "senior-dev":    "rgba(139,92,246,0.5)",
  "code-reviewer": "rgba(59,130,246,0.5)",
  "helper-bot":    "rgba(14,165,233,0.5)",
};

// Character sprite using actual PNG model images
const PixelSprite = ({ id }: { id: string }) => {
  const modelImg = CHARACTER_MODELS[id];
  const glow = CHAR_GLOW[id] ?? "rgba(255,255,255,0.2)";

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 88, height: 88 }}>
      {/* Ground oval shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-3 bg-black/60 rounded-full blur-sm pointer-events-none z-0" />
      {/* Model image */}
      <img
        src={modelImg}
        alt={id}
        className="w-[88px] h-[88px] object-contain z-10 animate-sprite-bob rounded-2xl"
        style={{
          imageRendering: "pixelated",
          filter: `drop-shadow(0 6px 14px ${glow}) drop-shadow(0 0 8px ${glow})`,
        }}
      />
    </div>
  );
};

// Repeating isometric-feeling tile textures definition for rooms
const getRoomFloorStyle = (id: RoomId, isImgBg: boolean = false): React.CSSProperties => {
  if (isImgBg) {
    return {
      background: "transparent",
    };
  }
  switch (id) {
    case RoomId.LOBBY:
      return {
        backgroundImage: "repeating-conic-gradient(#eae4d9 0% 25%, #dfd7c5 0% 50%)",
        backgroundSize: "14px 14px"
      };
    case RoomId.MEETING:
      return {
        backgroundImage: "repeating-conic-gradient(#2d2925 0% 25%, #201d1a 0% 50%)",
        backgroundSize: "16px 16px"
      };
    case RoomId.FOCUS:
      return {
        backgroundImage: "repeating-conic-gradient(#15351c 0% 25%, #0d2413 0% 50%)",
        backgroundSize: "14px 14px"
      };
    case RoomId.HELPDESK:
      return {
        backgroundImage: "repeating-conic-gradient(#3c271a 0% 25%, #2a1b12 0% 50%)",
        backgroundSize: "16px 16px"
      };
    case RoomId.PANTRY:
      return {
        backgroundImage: "repeating-conic-gradient(#ea580c 0% 25%, #c2410c 0% 50%)",
        backgroundSize: "12px 12px"
      };
    case RoomId.PROJECT:
      return {
        backgroundImage: "repeating-conic-gradient(#0c2a38 0% 25%, #071a24 0% 50%)",
        backgroundSize: "16px 16px"
      };
    case RoomId.HR:
      return {
        backgroundImage: "repeating-conic-gradient(#3d1e63 0% 25%, #2a1347 0% 50%)",
        backgroundSize: "14px 14px"
      };
    case RoomId.DEVAREA:
      return {
        backgroundImage: "repeating-conic-gradient(#132238 0% 25%, #0b1524 0% 50%)",
        backgroundSize: "18px 18px"
      };
    default:
      return {};
  }
};

// Custom Room Theme Palette to match the screenshot look and feel
const getRoomTheme = (id: RoomId) => {
  switch (id) {
    case RoomId.LOBBY:
      return {
        bg: "from-[#f4eedf] to-[#e7decb]",
        border: "border-[#4a3525]",
        textColor: "text-slate-800",
        decor: "🍂 Lobby & Reception Area"
      };
    case RoomId.MEETING:
      return {
        bg: "from-[#35312d] to-[#25221f]",
        border: "border-[#554c41]",
        textColor: "text-white",
        decor: "📊 Boardroom Standup"
      };
    case RoomId.FOCUS:
      return {
        bg: "from-[#1d4529] to-[#0f2818]",
        border: "border-[#2d6e3f]",
        textColor: "text-white",
        decor: "📚 Silent Zone / Audits"
      };
    case RoomId.HELPDESK:
      return {
        bg: "from-[#4a3225] to-[#2d1e16]",
        border: "border-[#6b4731]",
        textColor: "text-white",
        decor: "💁‍♀️ Assistance Desk"
      };
    case RoomId.PANTRY:
      return {
        bg: "from-[#ea580c] to-[#9a3412]",
        border: "border-[#ea580c]",
        textColor: "text-white",
        decor: "☕ Kitchen & Breakroom"
      };
    case RoomId.PROJECT:
      return {
        bg: "from-[#143e4f] to-[#0c242e]",
        border: "border-[#1e5c75]",
        textColor: "text-white",
        decor: "📋 Kanban Agile Suite"
      };
    case RoomId.HR:
      return {
        bg: "from-[#4c2480] to-[#2f1452]",
        border: "border-[#733cb0]",
        textColor: "text-white",
        decor: "💼 Welfare Station"
      };
    case RoomId.DEVAREA:
      return {
        bg: "from-[#1d385f] to-[#101e33]",
        border: "border-[#2b558f]",
        textColor: "text-white",
        decor: "⚙️ Dev & Rack Mainframe"
      };
  }
};

// Visual floor center for each room as % of its bounding box — tuned per hex shape
// All boxes are centered at the floor — use 50/50 for all
const ROOM_FLOOR_CENTER: Partial<Record<RoomId, { x: number; y: number }>> = {
  [RoomId.LOBBY]:    { x: 50, y: 50 },
  [RoomId.MEETING]:  { x: 50, y: 50 },
  [RoomId.PROJECT]:  { x: 50, y: 50 },
  [RoomId.HELPDESK]: { x: 50, y: 50 },
  [RoomId.PANTRY]:   { x: 50, y: 50 },
  [RoomId.FOCUS]:    { x: 50, y: 50 },
};

const getRoomCoordinates = (id: RoomId, isImgBg: boolean) => {
  if (!isImgBg) {
    const original = OFFICE_ROOMS.find(r => r.id === id);
    return original ? original.coordinates : { x: 0, y: 0, width: 0, height: 0 };
  }

  // Hotspot boxes matched to red rectangles in reference image
  switch (id) {
    case RoomId.LOBBY:    // CEO room floor
      return { x: 14, y: 10, width: 28, height: 26 };
    case RoomId.HR:
      return { x: 6,  y: 8,  width: 14, height: 14 };
    case RoomId.MEETING:  // SA room floor
      return { x: 63, y: 10, width: 36, height: 26 };
    case RoomId.PROJECT:  // QA room floor
      return { x: 8,  y: 46, width: 26, height: 30 };
    case RoomId.HELPDESK: // Helper-Bot holographic area
      return { x: 38, y: 64, width: 30, height: 29 };
    case RoomId.DEVAREA:
      return { x: 33, y: 58, width: 14, height: 14 };
    case RoomId.PANTRY:   // Pantry floor
      return { x: 73, y: 46, width: 19, height: 30 };
    case RoomId.FOCUS:    // Lobby center
      return { x: 34, y: 33, width: 27, height: 27 };
    default:
      return { x: 0, y: 0, width: 0, height: 0 };
  }
};

export default function OfficeMap({
  characters,
  userCharacter,
  activeRoomId,
  onRoomSelect,
  recentDialogs
}: OfficeMapProps) {
  const [isIsometric, setIsIsometric] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Helper code to fetch sign layout colors
  const getRoomSignColor = (id: RoomId) => {
    switch (id) {
      case RoomId.LOBBY:
        return "bg-[#2b6fc2] text-white border border-[#3c82db] shadow-md";
      case RoomId.MEETING:
        return "bg-[#555a64] text-white border border-[#6b7280] shadow-md";
      case RoomId.FOCUS:
        return "bg-[#3f7a45] text-white border border-[#4ade80] shadow-md";
      case RoomId.HELPDESK:
        return "bg-[#9c4c23] text-white border border-[#ea580c] shadow-md";
      case RoomId.PANTRY:
        return "bg-[#cc971c] text-slate-950 border border-slate-950 shadow-md";
      case RoomId.PROJECT:
        return "bg-[#1f726a] text-white border border-[#2dd4bf] shadow-md";
      case RoomId.HR:
        return "bg-[#6c39a8] text-white border border-[#a855f7] shadow-md";
      case RoomId.DEVAREA:
        return "bg-[#18669c] text-white border border-[#38bdf8] shadow-md";
    }
  };

  // Emojis mapping for office quick buttons
  const getRoomIcon = (id: RoomId) => {
    switch (id) {
      case RoomId.LOBBY:
        return <Users className="w-4 h-4 text-sky-400" />;
      case RoomId.MEETING:
        return <Tv className="w-4 h-4 text-[#9ca3af]" />;
      case RoomId.FOCUS:
        return <BookOpen className="w-4 h-4 text-emerald-400" />;
      case RoomId.PANTRY:
        return <Coffee className="w-4 h-4 text-yellow-400" />;
      case RoomId.HELPDESK:
        return <ShieldAlert className="w-4 h-4 text-orange-500" />;
      case RoomId.PROJECT:
        return <ClipboardList className="w-4 h-4 text-teal-400" />;
      case RoomId.DEVAREA:
        return <Terminal className="w-4 h-4 text-sky-400" />;
      case RoomId.HR:
        return <UserPlus className="w-4 h-4 text-purple-400" />;
    }
  };

  // Standard static speech bubbles as seen in the physical screenshot layout
  const getMockSpeechBubble = (id: RoomId): string | null => {
    switch (id) {
      case RoomId.MEETING:
        return "Standup at 10AM!";
      case RoomId.FOCUS:
        return "...";
      case RoomId.HELPDESK:
        return "Need help?";
      case RoomId.PANTRY:
        return "Coffee time! ☕";
      case RoomId.HR:
        return "Let's talk!";
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full bg-[#070a13] overflow-hidden flex flex-col select-none">
      
      {/* Top Map Action Bar Overlay */}
      <div className="absolute top-4 left-4 z-20 flex gap-2">
        <button
          id="toggle-isometric-btn"
          onClick={() => setIsIsometric(!isIsometric)}
          className="px-3 py-1.5 bg-[#0e1424]/90 hover:bg-[#1a253e] text-[11px] font-bold text-sky-350 border border-[#202e4d] rounded-xl flex items-center gap-1.5 transition-all shadow-lg active:scale-95 cursor-pointer text-sky-300"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          {isIsometric ? "Standard 2D flat" : "Isometric 3D View"}
        </button>

        <span className="px-2.5 py-1.5 bg-[#070a12]/90 border border-[#17223b] text-[9px] uppercase tracking-wider font-mono text-gray-400 rounded-xl flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-emerald-400 animate-pulse" />
          {isIsometric ? "3D ISOMETRIC DEV SUITE" : "2D CONTAINER BLUEPRINT"}
        </span>
      </div>

      {/* Main Office Stage Area */}
      <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden relative bg-[#060a14]">

        {/* Subtle dot grid ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(#1a2a4a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>

        {/* Isometric map container — height-first scaling */}
        <div
          className="relative transition-all duration-700"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "center center",
            transformStyle: "preserve-3d",
            height: "100%",
            width: "auto",
            maxWidth: "100%",
            aspectRatio: "1536 / 1024",
          }}
        >
          {/* Base Floor Foundation Plate with outer walls shadow */}
          <div className="absolute inset-0 bg-[#060a14] rounded-[32px] border-2 border-[#1a2540]/60 shadow-[0_40px_100px_rgba(0,0,0,0.95)] overflow-hidden"
               style={{ transform: "translateZ(-2px)", transformStyle: "preserve-3d" }}>

            {isIsometric ? (
              <img
                src={officeMapImg}
                className="absolute inset-0 w-full h-full object-cover rounded-[30px]"
                alt="Office Map Floor"
                referrerPolicy="no-referrer"
              />
            ) : (
              <>
                {/* Soft grid matrix texture */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                {/* Geometric pathways connector decals */}
                <div className="absolute inset-[10%] border-[10px] border-dashed border-[#1e273e]/40 rounded-[36px] pointer-events-none"></div>
              </>
            )}
          </div>

          {/* CENTRAL COURTYARD / GARDEN (Plaza) - Hide in Isometric mode with image background */}
          {!isIsometric && (
            <div 
              className="absolute left-[33%] top-[30%] text-center pointer-events-none flex flex-col items-center justify-center z-15"
              style={{
                width: "34%",
                height: "40%",
                transformStyle: "preserve-3d",
                transform: "translateZ(1px)",
              }}
            >
              {/* Elegant Garden Area */}
              <div className="flex flex-col items-center transition-transform duration-300">
                {/* Grassy floor bed under the tree */}
                <div className="w-24 h-11 bg-gradient-to-br from-[#1b253b] to-[#121927] rounded-full border-2 border-slate-700/60 shadow-[0_6px_15px_rgba(0,0,0,0.7)] flex items-center justify-center p-1">
                  <div className="w-full h-full bg-[#1b3f27] rounded-full border border-[#2e5d3c] flex items-center justify-center text-[10px] text-emerald-450 font-black text-emerald-300">
                    ⛲
                  </div>
                </div>

                {/* Stone well name layout tag */}
                <span className="text-[9px] text-[#22d3ee] font-mono tracking-wider bg-slate-950/90 font-bold px-2 py-0.5 rounded-md border border-[#1e293b] -mt-1 shadow-lg">
                  🌲 COU_GARDEN
                </span>

                {/* Magnificent Fluffy 2.5D Tree */}
                <div className="text-[52px] filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.7)] select-none -mt-4 animate-[bounce_4.5s_infinite] pointer-events-none">
                  🌳
                </div>

                {/* Small floral details */}
                <div className="absolute -bottom-2 -right-4 text-xs">🌻</div>
                <div className="absolute -bottom-2 -left-4 text-[10px]">🌷</div>
              </div>
            </div>
          )}

          {/* Render Rooms and Office Sections Hotspots */}
          {OFFICE_ROOMS.map((room: Room) => {
            const isTargeted = activeRoomId === room.id;
            const theme = getRoomTheme(room.id) || getRoomTheme(RoomId.LOBBY)!;
            
            // Filter current occupants
            const charactersHere = characters.filter(c => c.currentRoom === room.id);
            const mockSpeech = getMockSpeechBubble(room.id);
            const coords = getRoomCoordinates(room.id, isIsometric);

            return (
              <button
                key={room.id}
                id={`room-tile-${room.id}`}
                onClick={() => onRoomSelect(room.id)}
                className={`absolute cursor-pointer transition-all duration-300 flex flex-col justify-between p-3 overflow-hidden text-left ${
                  isIsometric
                    ? isTargeted
                      ? "z-10 bg-cyan-400/[0.06]"
                      : "z-0 bg-transparent hover:bg-white/[0.025]"
                    : theme.textColor + " " + theme.border + " " + (
                      isTargeted
                        ? "z-10 border-emerald-400 ring-4 ring-emerald-500/25 shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.03]"
                        : "z-0 shadow-[inset_2px_2px_0px_rgba(255,255,255,0.08),_inset_-2px_-2px_0px_rgba(0,0,0,0.5),_4px_4px_0px_rgba(0,0,0,0.4)] hover:scale-[1.01]"
                    )
                }`}
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  width: `${coords.width}%`,
                  height: `${coords.height}%`,
                  border: isIsometric ? "none" : undefined,
                  outline: "none",
                  borderRadius: isIsometric ? 0 : undefined,
                  zIndex: isTargeted ? 20 : room.id === RoomId.FOCUS ? 8 : 0,
                  transform: `translateZ(${isTargeted ? "16px" : "3px"})`,
                  transformStyle: "preserve-3d",
                  ...getRoomFloorStyle(room.id, isIsometric)
                }}
              >
                {/* Visual grid tile feeling inside each room - Hide in Isometric background image mode */}
                {!isIsometric && (
                  <>
                    <div className="absolute inset-0 bg-[#ffffff01] bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-0 h-[3px] bg-slate-900/40 border-b border-white/5 pointer-events-none"></div>
                    <div className="absolute inset-y-0 left-0 w-[3px] bg-slate-900/40 border-r border-white/5 pointer-events-none"></div>
                  </>
                )}

                {/* Room signboard (centered plaque on room wall matching screenshot banners) - Hide in Isometric background image mode since labels are built-in */}
                {!isIsometric && (
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none">
                    <span className={`px-2.5 py-0.5 text-[9px] font-black tracking-wider uppercase shadow-[2px_2px_0px_rgba(0,0,0,0.8)] font-mono rounded border border-slate-950/60 ${getRoomSignColor(room.id)}`}>
                      {room.nameEn}
                    </span>
                  </div>
                )}

                {/* Lobby always-visible click hint in isometric mode */}
                {isIsometric && room.id === RoomId.FOCUS && !isTargeted && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-[8px] font-bold font-mono px-2 py-0.5 rounded-full backdrop-blur-sm">
                      🏢 LOBBY
                    </span>
                  </div>
                )}

                {/* Subtle targeted Indicator Tag for active room in Isometric mode */}
                {isIsometric && isTargeted && (
                  <div className="absolute top-2 left-2 bg-[#090f1d]/90 border border-cyan-400 px-2 py-0.5 rounded text-[8px] font-bold font-mono text-cyan-400 shadow-md animate-pulse">
                    {room.nameEn}
                  </div>
                )}

                {/* Styled 2.5D visual floor furniture & interior details - Hide in Isometric background image mode */}
                {!isIsometric && (
                  <div className="absolute bottom-2.5 right-2 text-2xl pointer-events-none select-none opacity-50 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {room.id === RoomId.LOBBY && (
                      <div className="flex gap-1 items-center">
                        <span title="Sofa">🛋️</span>
                        <span className="text-[10px]" title="Plant">🪴</span>
                      </div>
                    )}
                    {room.id === RoomId.MEETING && (
                      <div className="flex gap-1 items-center">
                        <span title="TV Monitor Chart">📊</span>
                        <span title="Conference Table">🪑</span>
                      </div>
                    )}
                    {room.id === RoomId.FOCUS && (
                      <div className="flex gap-1 items-center">
                        <span title="Desks">💻</span>
                        <span title="Bookshelves">📚</span>
                      </div>
                    )}
                    {room.id === RoomId.HELPDESK && (
                      <div className="flex gap-1 items-center">
                        <span title="Desk Counter">💁‍♀️</span>
                        <span className="text-[10px]" title="Lamp">💡</span>
                      </div>
                    )}
                    {room.id === RoomId.PANTRY && (
                      <div className="flex gap-1 items-center">
                        <span title="Refrigerator">🧊</span>
                        <span title="Microwave Table">🍽️</span>
                      </div>
                    )}
                    {room.id === RoomId.PROJECT && (
                      <div className="flex gap-1 items-center">
                        <span title="Kanban cork board">📋</span>
                        <span title="Screen workspace">🖥️</span>
                      </div>
                    )}
                    {room.id === RoomId.HR && (
                      <div className="flex gap-1 items-center">
                        <span title="Cupboards">📁</span>
                        <span title="Workstation">💼</span>
                      </div>
                    )}
                    {room.id === RoomId.DEVAREA && (
                      <div className="flex gap-1 items-center">
                        <span className="animate-pulse" title="Servers Mainframe">🎛️</span>
                        <span title="Code console">⚙️</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Symmetrical Comic speech bubbles (white, black borders, custom tail - matches screenshot perfectly) */}
                {mockSpeech && !isTargeted && (
                  <div className={`absolute top-8 left-3 bg-white text-slate-900 border-2 border-slate-950 px-2.5 py-1 rounded-xl text-[9px] font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center gap-1 z-35 pointer-events-none transition-all duration-300`}>
                    <span>{mockSpeech}</span>
                    <div className="absolute top-[96%] left-4 w-1.5 h-1.5 bg-white border-r-2 border-b-2 border-slate-950 rotate-45"></div>
                  </div>
                )}

                {/* Room Title & description box - Hide in Isometric background image mode to avoid text clashing */}
                {!isIsometric && (
                  <div className="flex items-start gap-1.5 mt-5">
                    <div className="p-1 rounded-md bg-slate-950/50 border border-slate-800/30">
                      {getRoomIcon(room.id)}
                    </div>
                    <div className="leading-tight">
                      <h3 className="text-[11px] font-black text-[#e2e8f0] tracking-wide font-display">{room.nameEn}</h3>
                      <p className="text-[8.5px] text-[#475569] font-mono leading-none">{room.nameTh}</p>
                    </div>
                  </div>
                )}

                {/* Active user footprint indicators - Render simple heads in Isometric mode */}
                {charactersHere.length > 0 && (
                  <div className="mt-auto flex gap-1.5 items-center z-10">
                    <div className="flex -space-x-1.5 items-center">
                      {charactersHere.map(c => (
                        <div key={c.id} className="w-5 h-5 rounded-full bg-[#0a0f19] flex items-center justify-center text-[10px] border border-slate-700 shadow-lg">
                          {c.avatar}
                        </div>
                      ))}
                    </div>
                    {!isIsometric && (
                      <span className="text-[7.5px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 uppercase tracking-widest">({charactersHere.length} active)</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* Render Characters inside current rooms */}
          <AnimatePresence>
            {characters.map((char: Character) => {
              const targetRoom = OFFICE_ROOMS.find(r => r.id === char.currentRoom);
              if (!targetRoom) return null;

              // Grid mates offset calculation to prevent overlap
              const roommatesList = characters.filter(c => c.currentRoom === char.currentRoom);
              const charIndex = roommatesList.findIndex(c => c.id === char.id);
              
              const totalMates = roommatesList.length;
              const center = ROOM_FLOOR_CENTER[char.currentRoom] ?? { x: 50, y: 45 };
              let xOffset = center.x;
              let yOffset = center.y;

              if (totalMates > 1) {
                const angle = (charIndex / totalMates) * Math.PI * 2 - Math.PI / 2;
                xOffset = center.x + Math.cos(angle) * 13;
                yOffset = center.y + Math.sin(angle) * 9;
              }

              const coords = getRoomCoordinates(char.currentRoom, isIsometric);
              const leftPercent = coords.x + (coords.width * (xOffset / 100));
              const topPercent = coords.y + (coords.height * (yOffset / 100));

              const hasMessage = !!recentDialogs[char.id];
              const charZ = activeRoomId === targetRoom.id ? "45px" : "30px";

              return (
                <motion.div
                  key={char.id}
                  id={`avatar-node-${char.id}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 100, damping: 15 }}
                  className="absolute z-[100] pointer-events-none"
                  style={{
                    transform: `translate(-50%, -50%) translateZ(${charZ})`, // No counter-rotation needed because container is flat
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Speech bubbles dialogue popover */}
                  {hasMessage && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, y: 15 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute bottom-[72px] left-1/2 -translate-x-1/2 min-w-[140px] max-w-[180px] bg-white text-slate-900 border-2 border-slate-950 p-2 rounded-xl shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col gap-1 z-45 text-left pointer-events-auto"
                      style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}
                    >
                      <div className="flex justify-between items-center bg-slate-100 px-1 py-0.5 rounded border border-slate-200 text-[8px] font-bold text-slate-800 uppercase tracking-widest leading-none">
                        <span>{char.name}</span>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                      </div>
                      <p className="text-[9px] font-bold leading-normal text-slate-950 break-words font-mono">
                        {recentDialogs[char.id]}
                      </p>
                      {/* Tail point pointing at character */}
                      <div className="absolute top-[98%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r-2 border-b-2 border-slate-950 rotate-45 transform -translate-y-[4px]"></div>
                    </motion.div>
                  )}

                  {/* Character Node wrapper */}
                  <div className="flex flex-col items-center justify-center filter drop-shadow-[2px_4px_6px_rgba(0,0,0,0.6)]">
                    
                    {/* Character Name badge (green, pink, blue... solid color cards matching picture) */}
                    <div className={`mb-1.5 py-0.5 px-2 rounded-md border text-[9px] font-bold tracking-wide shadow-md flex items-center leading-tight transition-all select-none ${getCharacterTagColor(char.id, "bg-slate-850 border-slate-700 text-white")}`}>
                      <span>{char.id === "user" ? "You" : char.name}</span>
                    </div>

                    {/* Active Ping pulse ring for user ("You") */}
                    {char.id === "user" && (
                      <span className="absolute inset-x-0 -bottom-1 h-2 bg-emerald-400/25 blur-[1px] rounded-full animate-ping pointer-events-none"></span>
                    )}

                    {/* Beautiful custom pixel art sprite */}
                    <PixelSprite id={char.id} />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* FOOTER CONTROLS & DOCKS / WIDGET DETAILS (Status line & interactive Minimap) */}
      <div className="p-3.5 bg-[#090d16]/98 border-t border-[#151f38] flex justify-between items-center text-xs text-gray-400 gap-3 z-20 relative">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 pl-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 border border-emerald-400"></span>
            <span className="text-[10.5px] text-gray-300 font-mono font-bold uppercase tracking-wider">You: Online</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[10.5px] text-gray-400 font-mono">Devs Active</span>
          </div>
        </div>

        {/* 🗺️ IMMERSIVE WIDGET - MINIMAP (Matches bottom-right corner of picture) */}
        <div className="flex items-center gap-3 bg-[#0d1324] border border-[#1e2a44] rounded-2xl p-2 shadow-xl relative z-25">
          {/* Mini 2D room layouts representation */}
          <div className="w-14 h-12 bg-slate-950/80 rounded-lg border border-slate-900 overflow-hidden relative grid grid-cols-3 grid-rows-3 p-0.5 gap-0.5">
            {OFFICE_ROOMS.map((rm) => (
              <div 
                key={rm.id} 
                className={`rounded-sm transition-all ${
                  activeRoomId === rm.id 
                    ? "bg-emerald-400 border border-emerald-300 shadow-[0_0_4px_rgba(52,211,153,0.5)] scale-105 z-10" 
                    : rm.id === RoomId.DEVAREA 
                    ? "bg-blue-600/60" 
                    : rm.id === RoomId.PANTRY 
                    ? "bg-amber-650 bg-amber-500/50" 
                    : "bg-slate-800/40"
                }`}
                title={rm.nameEn}
              />
            ))}
            {/* Center Plaza visual dot */}
            <div className="bg-[#1b4f2c] rounded-full w-2 h-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-[#2e7d3c]" />
          </div>

          <div className="leading-tight text-left min-w-[70px]">
            <span className="text-[8px] font-black text-[#94a3b8] uppercase font-mono tracking-widest block leading-none">Map View</span>
            <span className="text-[9.5px] font-bold font-mono text-[#22d3ee] block mt-0.5 uppercase">
              {Math.round(zoomLevel * 100)}% ZOOM
            </span>
          </div>

          {/* Symmetrical zoom buttons as present on screenshot */}
          <div className="w-px h-6 bg-[#162138]"></div>
          <div className="flex flex-col gap-1">
            <button
              id="btn-zoom-in"
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.15, 1.4))}
              className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-sky-400 hover:text-sky-300 font-extrabold border border-[#1e2a44] rounded-md transition-all text-[11px] leading-none cursor-pointer"
              title="Zoom In"
            >
              +
            </button>
            <button
              id="btn-zoom-out"
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.15, 0.7))}
              className="w-5 h-5 flex items-center justify-center bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-sky-400 hover:text-sky-300 font-extrabold border border-[#1e2a44] rounded-md transition-all text-[11px] leading-none cursor-pointer"
              title="Zoom Out"
            >
              -
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
