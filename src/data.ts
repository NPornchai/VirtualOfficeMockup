import { Room, RoomId, Character, OfficeTask, CalendarEvent } from "./types";

export const OFFICE_ROOMS: Room[] = [
  {
    id: RoomId.LOBBY,
    nameEn: "Lobby",
    nameTh: "ล็อบบี้",
    descriptionEn: "Main entrance. Grab directory updates here.",
    descriptionTh: "ส่วนต้อนรับหลัก มีรายงานสรุปความเคลื่อนไหวล่าสุดของบริษัท",
    color: "bg-blue-500/10 border-blue-500/40 text-blue-400",
    bgGradient: "from-blue-950/20 to-indigo-950/20",
    coordinates: { x: 2, y: 12, width: 26, height: 24 }
  },
  {
    id: RoomId.MEETING,
    nameEn: "Meeting Room",
    nameTh: "ห้องประชุม",
    descriptionEn: "Standup, sprint planning, and group alignment.",
    descriptionTh: "ห้องประชุมกลุ่ม ชวนพนักงานทั้ง 2 คนมาเปิดบอร์ดถกงานร่วมกัน",
    color: "bg-amber-500/10 border-amber-500/40 text-amber-400",
    bgGradient: "from-amber-950/20 to-orange-950/20",
    coordinates: { x: 31, y: 2, width: 34, height: 24 }
  },
  {
    id: RoomId.FOCUS,
    nameEn: "Focus Room",
    nameTh: "ห้องสมาธิ",
    descriptionEn: "Quiet zone for deep thinking and strict code analysis.",
    descriptionTh: "พื้นที่ส่วนตัวสำหรับทำงานสมาธิและตรวจสอบโค้ดจาก Somchai",
    color: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
    bgGradient: "from-emerald-950/20 to-teal-950/20",
    coordinates: { x: 68, y: 12, width: 28, height: 24 }
  },
  {
    id: RoomId.HELPDESK,
    nameEn: "Help Desk",
    nameTh: "จุดฝากถามบอทช่วยเหลือ",
    descriptionEn: "Report bugs or ask general operation questions.",
    descriptionTh: "โต๊ะตอบคำถาม ให้บริการตอบคำปรึกษา แนะนำพนักงานใหม่",
    color: "bg-rose-500/10 border-rose-500/40 text-rose-400",
    bgGradient: "from-rose-950/20 to-pink-950/20",
    coordinates: { x: 2, y: 39, width: 26, height: 24 }
  },
  {
    id: RoomId.PROJECT,
    nameEn: "Project Room",
    nameTh: "ห้องคุมโปรเจกต์",
    descriptionEn: "Kanban board. Track active development pipelines.",
    descriptionTh: "กระดานคุมงานและสรุปความก้าวหน้าโครงการของบริษัท",
    color: "bg-purple-500/10 border-purple-500/40 text-purple-400",
    bgGradient: "from-purple-950/20 to-fuchsia-950/20",
    coordinates: { x: 31, y: 73, width: 34, height: 24 }
  },
  {
    id: RoomId.HR,
    nameEn: "HR Office",
    nameTh: "ห้องงานบุคคล",
    descriptionEn: "Employee welfare, company policy updates.",
    descriptionTh: "งานจัดแจงวันลา ค่าตอบแทน สวัสดิการพนักงาน และกิจกรรม",
    color: "bg-violet-500/10 border-violet-500/40 text-violet-400",
    bgGradient: "from-violet-950/20 to-indigo-950/20",
    coordinates: { x: 68, y: 39, width: 28, height: 24 }
  },
  {
    id: RoomId.PANTRY,
    nameEn: "Pantry",
    nameTh: "ห้องกาแฟแพนทรี",
    descriptionEn: "Interactive coffee machine and dev jokes.",
    descriptionTh: "มุมพักผ่อน ชงกาแฟดริปจำลอง คุยเรื่องตลก และเล่นมินิเกม",
    color: "bg-orange-500/10 border-orange-500/40 text-orange-400",
    bgGradient: "from-amber-950/15 to-orange-950/15",
    coordinates: { x: 2, y: 66, width: 26, height: 24 }
  },
  {
    id: RoomId.DEVAREA,
    nameEn: "Dev Area",
    nameTh: "โซนเซิร์ฟเวอร์ & นักพัฒนา",
    descriptionEn: "Where Wichai builds systems & tracks servers.",
    descriptionTh: "พื้นที่โต๊ะทำงานของพี่ Wichai เซิร์ฟเวอร์แร็ค และศูนย์กลางทางเทคนิค",
    color: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400",
    bgGradient: "from-cyan-950/20 to-sky-950/20",
    coordinates: { x: 68, y: 66, width: 28, height: 24 }
  }
];

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: "user",
    name: "You",
    nameTh: "คุณ (CEO)",
    role: "Product Designer",
    roleTh: "ดีไซน์เนอร์ผลิตภัณฑ์",
    avatar: "👑",
    currentRoom: RoomId.LOBBY,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: false,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ceo&backgroundColor=b6e3f4",
    greetingTh: "สวัสดีทุกคน วันนี้ออฟฟิศพร้อมเดินหน้าลุยงานพิกเซลเสรีแล้วครับ!",
    greetingEn: "Hi team, let's build the ultimate pixel workspace today!"
  },
  {
    id: "alice",
    name: "Alice",
    nameTh: "อลิส",
    role: "Marketing",
    roleTh: "การตลาด",
    avatar: "👩‍💼",
    currentRoom: RoomId.MEETING,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=alice&backgroundColor=ffd5dc",
    greetingTh: "สวัสดีค่ะคุณบอส แผนการตลาดฟีดโซเชียลพร้อมปล่อยแล้ว!",
    greetingEn: "Hi boss! Our social media campaign is fully prepared to launch!"
  },
  {
    id: "senior-dev",
    name: "Bob",
    nameTh: "บ็อบ",
    role: "Developer",
    roleTh: "โปรแกรมเมอร์อาวุโส",
    avatar: "💻",
    currentRoom: RoomId.DEVAREA,
    status: "Coding",
    statusColor: "bg-cyan-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=bob&backgroundColor=c0aede",
    greetingTh: "กำลังจูนเนอร์ตัว React 19 และเซ็ตรันไทม์ใหม่อยู่ครับบอส แชทมาสั่งแก้บั๊กได้เลยนะ!",
    greetingEn: "Optimizing Vite and fine-tuning React 19 states. Chat me anytime for API fixes, boss!"
  },
  {
    id: "cathy",
    name: "Cathy",
    nameTh: "เคที่",
    role: "HR Manager",
    roleTh: "ผู้จัดการฝ่ายบุคคล",
    avatar: "👩‍⚕️",
    currentRoom: RoomId.HR,
    status: "Online",
    statusColor: "bg-[#d946ef]",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=cathy&backgroundColor=b6e3f4",
    greetingTh: "ยินดีต้อนรับกลับเข้ามาค่ะ ความสุขและพลังทีมงานพร้อมเต็มเปี่ยม 100% ค่ะ",
    greetingEn: "Welcome back, boss! Team satisfaction is solid at 100%!"
  },
  {
    id: "david",
    name: "David",
    nameTh: "เดวิด",
    role: "Project Manager",
    roleTh: "ผู้จัดการโครงการ",
    avatar: "👨‍🏫",
    currentRoom: RoomId.PROJECT,
    status: "Busy",
    statusColor: "bg-amber-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=david&backgroundColor=ffd5dc",
    greetingTh: "กำลังไล่จี้งานในบอร์ดคัมบังตัวล่าเลยบอส สเปคไม่มีหลุดแน่นอน",
    greetingEn: "Tracking all Kanban boards and ensuring no timeline slip, boss!"
  },
  {
    id: "eve",
    name: "Eve",
    nameTh: "อีฟ",
    role: "UI/UX Designer",
    roleTh: "นักออกแบบเว็บ",
    avatar: "🎨",
    currentRoom: RoomId.HELPDESK,
    status: "Away",
    statusColor: "bg-gray-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=eve&backgroundColor=ffd5dc",
    greetingTh: "กำลังร่างต้นแบบหน้าสกรีนเชดดิ้งใหม่ใน Figma ให้สะดุดตาค่ะ",
    greetingEn: "Drafting the isometric pixel designs in Figma right now!"
  },
  {
    id: "code-reviewer",
    name: "Frank",
    nameTh: "แฟร็งค์",
    role: "DevOps",
    roleTh: "ผู้ดูแลระบบสกรีนเชอร์",
    avatar: "🔧",
    currentRoom: RoomId.FOCUS,
    status: "Coding",
    statusColor: "bg-indigo-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=frank&backgroundColor=c0aede",
    greetingTh: "กำลังตรวจสอบ Security-Rules และ JWT tokens ฝากตรวจโค้ดเสร็จแล้วผ่านพอร์ต 3000 ได้เลยบอส!",
    greetingEn: "Scanning security policies and ensuring clean deployment builds on port 3000!"
  },
  {
    id: "somchai",
    name: "Somchai",
    nameTh: "สมชาย",
    role: "Code Architect",
    roleTh: "สถาปนิกโค้ด",
    avatar: "👨‍💻",
    currentRoom: RoomId.FOCUS,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=somchai",
    greetingTh: "เช็ค Type Safety เสมอนะครับบอส ป้องกัน Runtime crashing",
    greetingEn: "Always keep strict type checking to ensure robust runtimes, boss!"
  },
  {
    id: "wichai",
    name: "Wichai",
    nameTh: "วิชัย",
    role: "Database Lead",
    roleTh: "หัวหน้าฐานข้อมูล",
    avatar: "📁",
    currentRoom: RoomId.DEVAREA,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=wichai",
    greetingTh: "เพิ่งปรับสปินจูน Postgres ช็อตคัทให้เสร็จไป ตื่นตัวพร้อมใช้งานแล้วฮะ",
    greetingEn: "Warmed up postgreSQL and ready to write advanced DB triggers, boss!"
  },
  {
    id: "ladda",
    name: "Ladda",
    nameTh: "ลัดดา",
    role: "System Admin",
    roleTh: "แอดมินระบบ",
    avatar: "👩‍💻",
    currentRoom: RoomId.LOBBY,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=ladda",
    greetingTh: "ยินดีต้อนรับกลับสู่ออฟฟิศพิกเซลค่ะ แผนฟีดสำรองปกติสุขดีค่ะ",
    greetingEn: "Containers are completely healthy on Cloud Run!"
  },
  {
    id: "somsak",
    name: "Somsak",
    nameTh: "สมศักดิ์",
    role: "Backend Engineer",
    roleTh: "วิศวกรหลังบ้าน",
    avatar: "👨‍🔧",
    currentRoom: RoomId.DEVAREA,
    status: "Busy",
    statusColor: "bg-amber-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=somsak",
    greetingTh: "กำลังลุยจูน API Proxy และเกทเวย์ให้เร็วสมใจคุณประธานครับ",
    greetingEn: "Squeezing microsecond latencies from our inner REST API gateway!"
  },
  {
    id: "nipa",
    name: "Nipa",
    nameTh: "นิภา",
    role: "QA Engineer",
    roleTh: "วิศวกรทดสอบคุณภาพ",
    avatar: "🧪",
    currentRoom: RoomId.PROJECT,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=nipa",
    greetingTh: "ทีมทดสอบรันสเปคและเขียน e2e tests คลุมไว้ครบหมดห่วงบั๊กเล็ดลอดค่ะ",
    greetingEn: "E2E testing is fully integrated into the CI/CD pipeline!"
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
    attendees: ["You", "Wichai", "Somchai"],
    description: "โชว์งานสัปดาห์ล่าสุด และรับฟังว่าทำไมวิชัยถึงอยากย่อเวลาประชุม"
  },
  {
    id: "evt-2",
    title: "2:00 PM - Deep Refactor Workshop",
    time: "14:00 - 15:00 น.",
    room: "ห้องสมาธิ (Focus Room)",
    attendees: ["Somchai", "You"],
    description: "เปิดโค้ดอ่านกันสดๆ ไล่สางจุดที่เกะกะและเพิ่ม Type definitions"
  },
  {
    id: "evt-3",
    title: "4:30 PM - Coffee Brewing Contest",
    time: "16:30 - 17:00 น.",
    room: "ห้องครัว (Pantry)",
    attendees: ["You", "Wichai", "Somchai"],
    description: "ดริปกาแฟชิงเจ้าแห่งบาริสต้าประจำสำนักงานพร้อมรับรีวิวสายพันธุ์เมล็ด"
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
