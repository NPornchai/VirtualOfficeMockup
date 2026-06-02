import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found. Running in simulation fallback mode.");
}

// 1. Direct Message Endpoint
app.post("/api/chat", async (req, res) => {
  const { characterId, message, chatHistory } = req.body;

  if (!characterId || !message) {
    return res.status(400).json({ error: "Missing required fields: characterId or message" });
  }

  // Fallback responses if Gemini is not configured
  const staticFallback = (charId: string, msg: string): string => {
    const msgLower = msg.toLowerCase();
    if (charId === "code-reviewer") {
      if (msgLower.includes("code") || msgLower.includes("review") || msgLower.includes("โค้ด")) {
        return "สมชาย (Code Reviewer) ครับ: จากที่ดูคร่าวๆ โค้ดนี้ส่วนใหญ่เขียนมาดีแล้วครับ แนะนำให้ระวังเรื่อง Memory leak ใน `useEffect` และเช็ค Type safety เพิ่มเติมอีกนิดนะครับ โดยรวมทำได้ดีมากครับ!";
      }
      return "สมชาย (Code Reviewer) ครับ: สวัสดีครับคุณ CEO มีโค้ดส่วนไหนอยากให้ช่วยตรวจสอบความถูกต้องหรือ Refactor เพิ่มเติมไหมส่งมาได้เลยนะครับ!";
    } else {
      if (msgLower.includes("task") || msgLower.includes("job") || msgLower.includes("งาน")) {
        return "พี่วิชัย (Senior Dev) เอง: งานที่รับมอบหมายไปใกล้เสร็จแล้วนะ เดี๋ยวพี่เพิ่ม Test cases ให้อีกนิดเผื่อความชัวร์ ช่วงบ่ายนี้จะ Push ขึ้นไปให้รีวิวครับ";
      }
      return "พี่วิชัย (Senior Dev) เอง: ฮ่าๆ ยินดีต้อนรับเข้าแผนกครับน้อง นั่งชิลคุยกันก่อนได้ หรือถ้าอยากได้คำแนะนำเรื่อง Database, Stack ใหม่ๆ ถามพี่ได้เลย เดี๋ยวชงกาแฟดริปให้แก้วนึง!";
    }
  };

  if (!ai) {
    // Return mock response after short delay to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ text: staticFallback(characterId, message), isSimulated: true });
  }

  try {
    const characterPrompts: Record<string, string> = {
      "code-reviewer": `คุณคือ สมชาย (Somchai) ผู้ตรวจสอบโค้ด (Code Reviewer) ประจำ Virtual Office นี้ 
คุณมีนิสัยระเอียดรอบคอบ ละเอียดลออ และต้องการทำความสะอาดโค้ดให้สะอาดมีประสิทธิภาพสูงสุด (Clean Code) 
คุณพูดภาษาไทยสุภาพลงท้ายด้วย 'ครับ' เสมอ มีความเฉลียวฉลาด ชื่นชอบความเรียบร้อยของโค้ด แต่เป็นกันเองและยินดีช่วยคุณ CEO พัฒนาโปรเจกต์ 
หากได้รับโค้ด ให้วิเคราะห์ข้อดี ข้อดีไซน์ผิดพลาด ข้อบกพร่องเรื่องประสิทธิภาพ ความปลอดภัย และแนวทางการเขียนที่ดีขึ้น โดยเขียนอธิบายอย่างกระชับในหัวข้อที่น่าสนใจ`,
      "senior-dev": `คุณคือ พี่วิชัย (Wichai) นักพัฒนาอาวุโส (Senior Developer) ประจำ Virtual Office นี้ 
คุณมีนิสัยเรียบง่าย สบายๆ พูดจาเป็นกันเอง นึกถึงคนอื่น ลุยงานไว รักกาแฟดริป และไม่ค่อยชอบการประชุมที่นานเกินไป มักแอบบ่นเรื่อง Standup meeting สั้นๆ แบบติดตลก 
คุณพูดภาษาไทยแบบรุ่นพี่คุยกับรุ่นน้องอย่างอบอุ่น ขี้เล่น (ใช้คำแทนตัวเองว่า พี่, พี่วิชัย ลงท้ายด้วย นะครับ, นะน้อง, ฮ่าๆ) มีความรู้งานสูง เก่งเรื่อง Database, Devops, สถาปัตยกรรมระบบ 
พร้อมให้คำปรึกษา แนะนำโค้ด แก้ไขบั๊ก และช่วย CEO คิดฟีเจอร์ใหม่ๆ เสมอ`
    };

    const systemInstruction = characterPrompts[characterId] || "You are a helpful office colleague.";

    // Build chat history context
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      // Map history to Gemini format: model or user
      const formattedHistory = chatHistory.slice(-10).map((h: any) => ({
        role: h.senderId === "user" ? "user" : "model",
        parts: [{ text: h.text }]
      }));
      contents.push(...formattedHistory);
    }
    contents.push({ role: "user", parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.8,
      }
    });

    return res.json({ text: response.text || "ไม่พบคำตอบจากบอทครับ", isSimulated: false });
  } catch (error: any) {
    console.error("Gemini API Direct Chat Error:", error);
    return res.json({ 
      text: `เกิดข้อผิดพลาดในการเรียกใช้ Gemini API: ${error.message || error}. ระบบจึงขอจำลองคำตอบของพนักงานให้คุณดังนี้:\n\n${staticFallback(characterId, message)}`,
      isSimulated: true 
    });
  }
});

// 2. Room Standup Joint Conversation Endpoint
app.post("/api/meeting", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Missing required field: topic" });
  }

  const staticFallback = `**[สรุปบทสนทนาจำลองในห้องประชุม]**
  
* **พี่วิชัย (Senior Dev):** "หัวข้อเรื่อง '${topic}' พี่ว่าเราน่าจะจัดสถาปัตยกรรมให้ง่ายที่สุดก่อนนะ เริ่มด้วยโครงสร้างที่ไม่ซับซ้อน จะได้ส่งมอบของได้เร็ว ไม่งั้นประชุมยาวอีกแน่ๆ ฮ่าๆ"
* **สมชาย (Code Reviewer):** "เห็นด้วยในแง่ความเร็วครับพี่วิชัย แต่อยากย้ำเรื่อง Type safety และระวังปัญหา Code duplication ด้วยนะครับ การออกแบบ Interface ที่ยืดหยุ่นแต่แรกจะช่วยให้เราทำงานร่วมกันได้ราบรื่นขึ้นครับคุณ CEO"
* **พี่วิชัย (Senior Dev):** "โอเคเลยสมชาย งั้นเดี๋ยวพี่ลุยโครงสร้างพื้นฐานให้ตามแนวทางนั้น แล้วเอามาให้สมชายรีวิวครับ ส่วนคุณ CEO คิดเห็นยังไงสั่งการมาได้เลยนะครับ!"`;

  if (!ai) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return res.json({ discussion: staticFallback, isSimulated: true });
  }

  try {
    const prompt = `ผู้ใช้งานที่เป็น CEO ตั้งประเด็นหารือในห้องประชุมเรื่อง: "${topic}"
ช่วยสร้างบทสนทนาโต้ตอบสั้นแบบร่วมมือกันระหว่าง 2 พนักงานของคุณ:
1. พี่วิชัย (Senior Developer): เป็นกันเอง สบายๆ รักงานเร็ว เกลียดประชุมบานปลาย ชื่นชอบโครงสร้างระบบที่เรียบง่าย พูดภาษาไทยสไตล์พี่น้อง อบอุ่น ขี้เล่น
2. สมชาย (Code Reviewer): รอบคอบ สุภาพ ละเอียดลออ พูดด้วยภาษาไทยครับ ย้ำความถูกต้อง ความสะอาด เทคโนโลยีที่ทันสมัย และความปลอดภัยของซอฟต์แวร์

เขียนบทสนทนาสลับกันคุย โดยแสดงจุดยืนที่ต่างกันแต่ร่วมสมองกันแก้ปัญหาได้อย่างลงตัวและเห็นพ้องต้องกันในทางปฏิบัติ ให้มีชีวิตชีวาและมีความตลกเบาๆ เกี่ยวกับชีวิตคนทำงาน สรุปออกมาในรูปแบบ Markdown บทพูด มีการสลับคู่สนทนาประมาณคนละ 2 รอบ`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an immersive Virtual Office meeting simulator generator.",
        temperature: 0.9,
      }
    });

    return res.json({ discussion: response.text || "ไม่พบบทสนทนาตอบกลับครับ", isSimulated: false });
  } catch (error: any) {
    console.error("Gemini API Meeting Error:", error);
    return res.json({ 
      discussion: `**[มีข้อผิดพลาดกับการเรียกใช้ Gemini]:** ${error.message || error}\n\nนี่คือการประชุมจำลอง:\n\n${staticFallback}`,
      isSimulated: true 
    });
  }
});

// Configure Vite and Asset Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
