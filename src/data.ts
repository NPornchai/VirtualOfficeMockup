import { Room, RoomId, Character, OfficeTask, CalendarEvent } from "./types";
// @ts-ignore
import ceoSpriteImg from "./assets/images/ceo_sprite_1780479445026.png";

export const OFFICE_ROOMS: Room[] = [
  {
    id: RoomId.LOBBY,
    nameEn: "CEO Room",
    nameTh: "ห้อง CEO",
    descriptionEn: "Private working space of CEO Pliew.",
    descriptionTh: "ห้องทำงานของพี่ปลิว (CEO) ผู้คุมฟังก์ชันและยุทธศาสตร์หลักเชิงลึก",
    color: "bg-blue-500/10 border-blue-500/40 text-blue-400",
    bgGradient: "from-blue-950/20 to-indigo-950/20",
    coordinates: { x: 5, y: 5, width: 42, height: 40 }
  },
  {
    id: RoomId.MEETING,
    nameEn: "SA Room",
    nameTh: "ห้อง SA (System Analyst)",
    descriptionEn: "System Architecture, design and joint sync standups with developers.",
    descriptionTh: "ห้องวิเคราะห์และออกแบบระบบ ดำเนินวาระพัฒนาและประชุมสิงสถิตของทีมงานพัฒนา",
    color: "bg-purple-500/10 border-purple-500/40 text-purple-400",
    bgGradient: "from-purple-950/20 to-fuchsia-950/20",
    coordinates: { x: 53, y: 5, width: 42, height: 40 }
  },
  {
    id: RoomId.PROJECT,
    nameEn: "QA Room",
    nameTh: "ห้อง QA (Quality Assurance)",
    descriptionEn: "Sprint project tracking Kanban boards and code review checkpoints.",
    descriptionTh: "ห้องจัดการตารางบอร์ด Kanban คุมโปรเจกต์ และตรวจสอบคุณภาพความปลอดภัยแอปพลิเคชัน",
    color: "bg-cyan-500/10 border-cyan-500/40 text-cyan-400",
    bgGradient: "from-cyan-950/20 to-sky-950/20",
    coordinates: { x: 5, y: 52, width: 28, height: 43 }
  },
  {
    id: RoomId.HELPDESK,
    nameEn: "Helper Bot Desk",
    nameTh: "จุดฝากคำถามบอทช่วยเหลือ",
    descriptionEn: "Help desk station populated by Momo context bot.",
    descriptionTh: "โต๊ะช่วยเหลือหลัก ให้คำปรึกษาไขข้อสงสัยด่วนและสแตนด์บายตรวจบั๊กจากบอทโมโม่",
    color: "bg-rose-500/10 border-rose-500/40 text-rose-400",
    bgGradient: "from-rose-950/20 to-pink-950/20",
    coordinates: { x: 36, y: 52, width: 28, height: 43 }
  },
  {
    id: RoomId.PANTRY,
    nameEn: "Pantry",
    nameTh: "ห้องกาแฟแพนทรี",
    descriptionEn: "Modern pantry zone, drip assembly, and interactive developer trivia game.",
    descriptionTh: "มุมพักผ่อน ชงกาแฟแก้วโปรดจำลอง คุยเรื่องตลกของโปรแกรมเมอร์ และตอบคำถามเกร็ดความรู้",
    color: "bg-orange-500/10 border-orange-500/40 text-orange-400",
    bgGradient: "from-amber-950/15 to-orange-950/15",
    coordinates: { x: 67, y: 52, width: 28, height: 43 }
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
    currentRoom: RoomId.LOBBY,
    status: "Online",
    statusColor: "bg-green-500",
    isAi: false,
    avatarUrl: ceoSpriteImg,
    greetingTh: "สวัสดีทุกคน ยินดีต้อนรับสู่ออฟฟิศพิกเซล วันนี้โมโม่ ไบท์ และมีนา สแตนด์บายพร้อมร่วมงานกับพี่ปลิวแล้วครับ!",
    greetingEn: "Hello everyone, welcome back to the pixel office. Momo, Byte, and Mina are ready to build together today!"
  },
  {
    id: "senior-dev",
    name: "Byte",
    nameTh: "ไบท์",
    role: "Senior Developer",
    roleTh: "โปรแกรมเมอร์อาวุโส",
    avatar: "💻",
    currentRoom: RoomId.MEETING,
    status: "Coding",
    statusColor: "bg-cyan-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=byte&backgroundColor=c0aede",
    greetingTh: "กำลังเซ็ตรันไทม์และพัฒนาตัวระบบอยู่ครับพี่ปลิว มีฟีเจอร์ไหนอยากให้ไบท์ลุยสั่งแชทมาได้เลยฮะ!",
    greetingEn: "Optimizing Vite client-side and working on core backend routes. Ask me anything, boss!"
  },
  {
    id: "code-reviewer",
    name: "Mina",
    nameTh: "มีนา",
    role: "Code Reviewer",
    roleTh: "ผู้ตรวจสอบโค้ด",
    avatar: "📝",
    currentRoom: RoomId.PROJECT,
    status: "Coding",
    statusColor: "bg-indigo-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=mina&backgroundColor=ffd5dc",
    greetingTh: "มีนาสแตนบายค่ะ มั่นใจในคุณภาพโค้ดและความปลอดภัยได้เลยนะคะ มีโค้ดเซกเมนต์ไหนอยากให้ช่วยดีเทลรีวิว ส่งแชทมาสกรีนเจอร์ได้เลยค่ะ",
    greetingEn: "Ready to scan security aspects and double-check refactors. Share code on screenshare or chat anytime, boss!"
  },
  {
    id: "helper-bot",
    name: "Momo",
    nameTh: "โมโม่",
    role: "Helper Bot",
    roleTh: "บอทผู้ช่วย",
    avatar: "🤖",
    currentRoom: RoomId.HELPDESK,
    status: "Online",
    statusColor: "bg-sky-400",
    isAi: true,
    avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=momo&backgroundColor=cbd5e1",
    greetingTh: "ปิ๊บๆ! โมโม่พร้อมช่วยงานแล้วค๊าบพี่ปลิว! อยากคิวรี่หรือสแกนบั๊ก มีโมโม่ข้างๆ อุ่นใจแน่นอน ปิ๊บบุ๊!",
    greetingEn: "Beep beep! Momo is active at the helpdesk, ready to provide tips, shortcuts, and moral support, boss!"
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
