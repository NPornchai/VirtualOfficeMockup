import { Room, RoomId, Character, OfficeTask, CalendarEvent } from "./types";
// @ts-ignore
import ceoSpriteImg from "./assets/images/ceo_sprite_1780479445026.png";

export const OFFICE_ROOMS: Room[] = [
  {
    id: RoomId.FOCUS,
    nameEn: "CEO Room",
    nameTh: "ห้อง CEO",
    descriptionEn: "Private executive suite of CEO Pliew.",
    descriptionTh: "ห้องทำงานของพี่ปลิว (CEO) เจาะลึกกลยุทธ์ คุมทิศทางพอร์ต และตรวจสอบมาตรฐาน",
    color: "bg-blue-500/10 border-blue-500/40 text-blue-400",
    bgGradient: "from-blue-950/20 to-indigo-950/20",
    coordinates: { x: 12.5, y: 1.5, width: 25.5, height: 35.5 }
  },
  {
    id: RoomId.MEETING,
    nameEn: "SA Room",
    nameTh: "ห้อง SA (System Analyst)",
    descriptionEn: "System Architecture, technical analysis and live charts.",
    descriptionTh: "ห้องพิกัดวิเคราะห์สัญญาณเทรดประมวลกราฟ ซิงก์ข้อมูลแท่งเทียนสด",
    color: "bg-purple-500/10 border-purple-500/40 text-purple-400",
    bgGradient: "from-purple-950/20 to-fuchsia-950/20",
    coordinates: { x: 50.5, y: 1.5, width: 27.5, height: 35.5 }
  },
  {
    id: RoomId.PROJECT,
    nameEn: "QA Room",
    nameTh: "ห้อง QA (Quality Assurance)",
    descriptionEn: "Compile scans, backtests and code review checkpoints.",
    descriptionTh: "ตรวจสอบลอจิกคุมกำไร เช็คแบ็คเทสติ้งความเสถียรกระดาน Kanban",
    color: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400",
    bgGradient: "from-cyan-950/20 to-sky-950/20",
    coordinates: { x: 4.5, y: 35, width: 26.5, height: 37.5 }
  },
  {
    id: RoomId.LOBBY,
    nameEn: "Lobby",
    nameTh: "ล็อบบี้ศูนย์กลาง",
    descriptionEn: "Sleek central lounge with active user traffic terminals.",
    descriptionTh: "พื้นที่สัญจรส่วนกลาง หารือสภาวะตลาด ดับนิวส์ฉุกเฉินและประสานงานด่วน",
    color: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
    bgGradient: "from-emerald-950/20 to-teal-950/20",
    coordinates: { x: 29.5, y: 19.5, width: 30, height: 36.5 }
  },
  {
    id: RoomId.PANTRY,
    nameEn: "Pantry",
    nameTh: "ห้องกาแฟแพนทรี",
    descriptionEn: "Modern breakout zone, kitchen snacks and coffee driptrays.",
    descriptionTh: "มุมผ่อนคลายความเครียดกระดานเทรด ชงกาแฟ ดริปเมล็ดพิเศษ แกลลอนสนทนาสลัดลอจิกพัง",
    color: "bg-orange-500/10 border-orange-500/40 text-orange-400",
    bgGradient: "from-amber-950/15 to-orange-950/15",
    coordinates: { x: 58.5, y: 35, width: 27.5, height: 37.5 }
  },
  {
    id: RoomId.HELPDESK,
    nameEn: "Helper-Bot Room",
    nameTh: "ห้องผู้ช่วยเฮลเปอร์บอท",
    descriptionEn: "Core operations server mainframe and hologram center.",
    descriptionTh: "ฐานประมวลผลด่วนระบบอัติโนมัติ กล่องไอเดียสร้างสรรค์ และจุด sync ข้อมูลเบื้องหลัง",
    color: "bg-rose-500/10 border-rose-500/40 text-rose-400",
    bgGradient: "from-rose-950/20 to-pink-950/20",
    coordinates: { x: 31.5, y: 56, width: 28.5, height: 34.5 }
  }
];

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "user",
    name: "Pliew",
    nameTh: "ปลิว",
    role: "CEO",
    roleTh: "ประธานเจ้าหน้าที่บริหาร (CEO)",
    avatar: "👑",
    currentRoom: RoomId.FOCUS,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: false,
    avatarUrl: ceoSpriteImg,
    greetingTh: "สวัสดีทุกคน ยินดีต้อนรับสู่ออฟฟิศพิกเซลเทรดดิ้งมิติใหม่! วันนี้บอทและทีมเอไอทุกส่วน ประจำหน้าที่พร้อมประมวลกลยุทธ์แล้วครับ!",
    greetingEn: "Hello everyone, welcome back to the AI Trading Virtual Office. The agents and modules are fully online and synced!"
  },
  {
    id: "senior-dev",
    name: "Chart AI",
    nameTh: "ชาร์ต เอไอ",
    role: "Chart Analyst",
    roleTh: "นักวิเคราะห์แนวโน้มกราฟเทคนิค",
    avatar: "📈",
    currentRoom: RoomId.MEETING,
    status: "Coding",
    statusColor: "bg-cyan-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=chart&backgroundColor=c0aede",
    greetingTh: "กำลังวิเคราะห์โครงสร้างแนวรับแนวต้านและรอบเทรนดิ่งใหญ่ให้นะครับพี่ปลิว มีเหรียญไหนอยากเจาะ ถามชาร์ตได้เลยครับ!",
    greetingEn: "Scanning market structures, support/resistance zones, and breakout volumes. Just drop a query!"
  },
  {
    id: "code-reviewer",
    name: "Report AI",
    nameTh: "รีพอร์ต เอไอ",
    role: "Data Reporter",
    roleTh: "ผู้สร้างรายงานผลสรุปกำไรขาดทุน",
    avatar: "📊",
    currentRoom: RoomId.PROJECT,
    status: "Coding",
    statusColor: "bg-indigo-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=report&backgroundColor=ffd5dc",
    greetingTh: "ดึงสถิติรอบกำไรและคำนวณสรุปภาษีกองทุนวันนี้เสร็จเรียบร้อยแล้วค่ะ สั่งคอมไพล์สเปรดเชตแจ้งเตือนได้เลยค่า",
    greetingEn: "Aggregating performance matrices, drawing trade report sheets, and executing final backtests."
  },
  {
    id: "helper-bot",
    name: "EA Bot",
    nameTh: "อีเอ บอท (Trade Bot)",
    role: "Trading Robot",
    roleTh: "บอทส่งคำสั่งซื้อขายอัตโนมัติ",
    avatar: "🤖",
    currentRoom: RoomId.LOBBY,
    status: "Online",
    statusColor: "bg-sky-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=robot&backgroundColor=cbd5e1",
    greetingTh: "ปิ๊บๆ! อีเอบอทคีย์ออเดอร์พร้อมสอดส่องความอิ่มค่าน้ำพร้อมทำงานแล้วค๊าบ รันบอทรอทำกำไรแสนชิวได้เลย!",
    greetingEn: "Beep beep! Connection stabilized. Auto-execution engine is armed. Ready to fire order signals!"
  },
  {
    id: "audit-ai",
    name: "Audit AI",
    nameTh: "ออดิท เอไอ",
    role: "Compliance Inspector",
    roleTh: "ผู้ตรวจสอบกฎระเบียบและความปลอดภัย",
    avatar: "🔍",
    currentRoom: RoomId.FOCUS,
    status: "Online",
    statusColor: "bg-green-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=audit&backgroundColor=c0f7db",
    greetingTh: "ระบบลูปเงื่อนไข และโค้ดคุมเทิร์นโอเวอร์ปลอดภัยดีครับพี่ปลิว คลีนโค้ดและระบายสิทธิ์สมบูรณ์แบบ!",
    greetingEn: "Strictly scanning compliance, code reviews, and risk criteria. Safety levels: 100% stable."
  },
  {
    id: "strategy-ai",
    name: "Strategy AI",
    nameTh: "สแตรทิจี เอไอ",
    role: "Strategic Commander",
    roleTh: "ผู้ออกแบบกลยุทธ์ทราฟฟิกพอร์ต",
    avatar: "💼",
    currentRoom: RoomId.HELPDESK,
    status: "Online",
    statusColor: "bg-amber-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=strategy&backgroundColor=fed7aa",
    greetingTh: "ปรับเปลี่ยนทิศทางสากลคุมกองทัพบอทเพื่อความเสี่ยงต่ำที่สุดวันนี้แล้วครับ มีกลยุทธ์ไหนอยากให้รันพร้อมบวกบอกมาได้เลย",
    greetingEn: "Refining port hedging ratios, macro factors alignment, and asset swap models. At your service."
  },
  {
    id: "finance-ai",
    name: "Finance AI",
    nameTh: "ไฟแนนซ์ เอไอ",
    role: "Tokenomics Advisor",
    roleTh: "นักคำนวณการเงินและค่าน้ำธุรกรรม",
    avatar: "💰",
    currentRoom: RoomId.LOBBY,
    status: "Online",
    statusColor: "bg-emerald-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=finance&backgroundColor=fffbeb",
    greetingTh: "สวัสดีค่ะพี่ปลิว คืนนี้ประเมินค่าน้ำและตรวจสอบสเปรดสวอปให้ได้สลิปค่าน้ำที่คุ้มที่สุดแล้วนะคะ",
    greetingEn: "Calculating transaction spreads, trade costs, and liquidity depth. Optimal capital utilization ready."
  },
  {
    id: "alert-ai",
    name: "Alert AI",
    nameTh: "อเลิร์ต เอไอ",
    role: "Signal Dispatcher",
    roleTh: "บอทแจ้งเตือนสไปก์ราคาและวอลุ่มผิดปกติ",
    avatar: "⚡",
    currentRoom: RoomId.PANTRY,
    status: "Online",
    statusColor: "bg-rose-450",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alert&backgroundColor=ffe4e6",
    greetingTh: "ปิ๊บๆ! ตรวจพบสไปก์ราคาพุ่งทะลุแนวบวกสิบล้านโวลลุ่มผิดปกติแจ้งเตือนด่วนพี่ปลิว! สัญญาณชัดเจนมากค่ะ",
    greetingEn: "Alert! Rapid volume spike and price breakouts detected! Standard alert thresholds triggered successfully."
  },
  {
    id: "risk-ai",
    name: "Risk AI",
    nameTh: "ริสก์ เอไอ",
    role: "Risk Shield Engine",
    roleTh: "ระบบเตือนสต็อปลอสและคำนวณความเสี่ยงพอร์ต",
    avatar: "🛡️",
    currentRoom: RoomId.PANTRY,
    status: "Online",
    statusColor: "bg-red-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=risk&backgroundColor=020617",
    greetingTh: "พร้อมยันโล่คำนวณสเกลมาจิ้นคุมกองทัพบอทเพื่อสกัดดาวรุ่งล้างพอร์ตแล้วค่ะ ควบคุมเลเวอเรจได้ปลอดภัยสูงสุดเสมอ!",
    greetingEn: "Enforcing stop-loss protections, monitoring drawdown levels, and managing margin limits. Secure mode active."
  }
];

export const INITIAL_TASKS: OfficeTask[] = [
  {
    id: "task-1",
    title: "Implement database migrations for user schema",
    description: "Write Sequelize migrations and handle column constraints correctly.",
    assignee: "senior-dev",
    status: "done",
    priority: "high"
  },
  {
    id: "task-2",
    title: "Review routing auth middleware",
    description: "Verify TypeScript guards and JWT expired-token edge-cases.",
    assignee: "code-reviewer",
    status: "review",
    priority: "high"
  },
  {
    id: "task-3",
    title: "Refactor React state logic from App.tsx into context hooks",
    description: "We need cleaner separation of concerns in global layouts.",
    assignee: "senior-dev",
    status: "in_progress",
    priority: "medium"
  },
  {
    id: "task-4",
    title: "Benchmark API route load speed under stress test",
    description: "Verify if the model-inference endpoints throttle correctly.",
    assignee: "code-reviewer",
    status: "todo",
    priority: "low"
  }
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: "evt-1",
    title: "10:00 AM - Sprint Sync & Jokes",
    time: "10:00 - 10:30 น.",
    room: "ห้องประชุม (Meeting Room)",
    attendees: ["Pliew", "Byte", "Mina"],
    description: "เช็คอินความคืบหน้าประจำวัน และแผนสตรีคฟาสต์เดลิเวอรี่โดยไบท์และมีนา"
  },
  {
    id: "evt-2",
    title: "2:00 PM - Deep Refactor Workshop",
    time: "14:00 - 15:00 น.",
    room: "ห้องสมาธิ (Focus Room)",
    attendees: ["Mina", "Pliew"],
    description: "ตรวจสอบความสะอาดของโค้ดสากล และป้องกัน Memory Leak ร่วมกับมีนา"
  },
  {
    id: "evt-3",
    title: "4:30 PM - Coffee Brewing Contest",
    time: "16:30 - 17:00 น.",
    room: "ห้องครัว (Pantry)",
    attendees: ["Pliew", "Byte", "Momo"],
    description: "พักผ่อนดริปเมล็ดกาแฟสูตรพิเศษชิงรางวัลแกลลอนน้ำดื่มกับไบท์และโมโม่"
  }
];

export const COFFEE_RECIPES = [
  { name: "Ethiopia Yirgacheffe", grind: "Medium-Fine", ratio: "1:15", temp: "92°C", profile: "Floral, Citrus, Fruity" },
  { name: "Colombia Supremo", grind: "Medium", ratio: "1:16", temp: "94°C", profile: "Caramel, Chocolate, Nutty" },
  { name: "Kenya AA", grind: "Medium-Coarse", ratio: "1:14", temp: "90°C", profile: "Winey, Berry, Rich Body" }
];

export const DEV_TRIVIA_QUESTIONS = [
  {
    question: "อะไรคือพฤติกรรมหลักของการใช้ === ใน JavaScript?",
    options: [
      "เปรียบเทียบทั้งค่าและชนิดข้อมูลโดยไม่มีการแปลงประเภท (Strict Equality)",
      "เปรียบเทียบเฉพาะค่าโดยจะพยายามแปลงประเภทข้อมูลให้ตรงกันก่อน (Loose Equality)",
      "จองพื้นที่หน่วยความจำสำหรับวัตถุสองชิ้นมาแมทช์กัน",
      "ใช้สำหรับคัดลอกค่าอ็อบเจกต์แบบ Deep Clone"
    ],
    answerIndex: 0,
    explanation: "=== (Strict Equality) จะทำงานโดยเปรียบเทียบทั้งค่าและประเภทข้อมูล โดยไม่แปลงประเภทข้อมูลอัตโนมัติ"
  },
  {
    question: "ใน React 19, Hooks ที่เปลี่ยนวิธีสาง Async actions ได้ง่ายขึ้นคือตัวใด?",
    options: [
      "useActionState และ useFormStatus",
      "useMemoCache และ useDeferredValue",
      "useLayoutEffect ลบออกทั้งหมด",
      "useSyncExternalStore"
    ],
    answerIndex: 0,
    explanation: "React 19 แนะนำ useActionState และ useFormStatus เพื่อจัดการกับฟอร์มและ Async actions อย่างยืดหยุ่นและเป็นระบบ"
  },
  {
    question: "คำว่า 'Idempotent' ในความหมายของ HTTP Methods หมายความว่าอย่างไร?",
    options: [
      "การยิงร้องขอซ้ำๆ หลายครั้ง ได้ผลลัพธ์บนเซิร์ฟเวอร์เหมือนกับการร้องขอเพียงครั้งเดียว",
      "ส่งต่อข้อมูลแบบเข้ารหัสคลื่นแม่เหล็กไฟฟ้าเสมอ",
      "การส่งคำร้องขอจะลบข้อมูลอื่นๆ ในแคชของเบราว์เซอร์อัตโนมัติ",
      "รองรับการอัพโหลดรูปแบบสเตจบอร์ดเดี่ยวเท่านั้น"
    ],
    answerIndex: 0,
    explanation: "HTTP Method ที่เป็น Idempotent (เช่น GET, PUT, DELETE) คือถ้าดำเนินการยิงคำสั่งซ้ำๆ จะไม่เปลี่ยนสถานะของเซิร์ฟเวอร์ต่างไปจากการส่งไปเพียงครั้งเดียว"
  }
];
