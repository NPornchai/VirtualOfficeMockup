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
        return "มีนา (Code Reviewer) ค่ะ: จากที่ดูคร่าวๆ โค้ดนี้ส่วนใหญ่เขียนมาดีแล้วนะคะ แนะนำให้ระวังเรื่อง Memory leak ใน useEffect และเช็ค Type safety เพิ่มเติมเพื่อความเสถียรสูงสุดค่ะ บอสลองดูตัวส่งสกรีนช็อตนะคะ";
      }
      return "มีนา (Code Reviewer) ค่ะ: สวัสดีค่ะคุณบอส มีโค้ดส่วนไหนอยากให้ช่วยตรวจสอบความถูกต้อง รันไทม์ และ Refactor เพิ่มเติมไหมคะ ส่งมาได้เลยนะ!";
    } else if (charId === "senior-dev") {
      if (msgLower.includes("task") || msgLower.includes("job") || msgLower.includes("งาน")) {
        return "ไบท์ (Senior Dev) เองฮะ: งานที่รับมอบหมายไปใกล้เสร็จเรียบร้อยแล้วครับ เดี๋ยวไบท์เขียน Jest test ครอบเพิ่มความชัวร์ให้อีกนิด ช่วงบ่ายนี้จะ Push ให้ประธานตรวจฮะ!";
      }
      return "ไบท์ (Senior Dev) เองฮะ: ยินดีต้อนรับเข้าห้องพัฒนาซอฟต์แวร์ครับพี่ปลิว! นั่งคุยเล่นชิลๆ ชิมกาแฟดริปก่อนได้ หรือถ้าอยากปรึกษาเรื่องสถาปัตยกรรม React, API Proxy หรือพอร์ต 3000 ถามไบท์ได้ตลอดเลยฮะ!";
    } else {
      if (msgLower.includes("help") || msgLower.includes("คุย") || msgLower.includes("สอน")) {
        return "โมโม่ (Helper Bot) พร้อมช่วยแล้วครับ ปิ๊บๆ! มีคู่มือหรือฟีเจอร์ไหนใช้งานสับสน ถามบอทโมโม่ช่วยแก้บั๊กกับนำทางได้ทันที ปิ๊บบุ๊!";
      }
      return "โมโม่ (Helper Bot) ตื่นตัวมาเสิร์ฟคำประทับใจแล้วค๊าบพี่ปลิว! ปิ๊บๆ วันนี้อยากสำรวจจุดไหนในออฟฟิศ ท่องเที่ยวตรงไหนคลิกได้ที่ Quick Links เลยนะ ปิ๊บบุ๊!";
    }
  };

  if (!ai) {
    // Return mock response after short delay to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ text: staticFallback(characterId, message), isSimulated: true });
  }

  try {
    const characterPrompts: Record<string, string> = {
      "code-reviewer": `คุณคือ มีนา (Mina) ผู้ตรวจสอบโค้ด (Code Reviewer) ประจำ Virtual Office นี้ 
คุณมีนิสัยละเอียดรอบคอบ ระมัดระวังเป็นพิเศษ และต้องการทำความสะอาดโค้ดให้สะอาดมีประสิทธิภาพสูงสุด (Clean Code, Type Safety)
คุณพูดภาษาไทยสุภาพลงท้ายด้วย 'ค่ะ/นะคะ' มีความเฉลียวฉลาด น่ารักและเป็นกันเอง และยินดีช่วยพี่ปลิว (CEO) พัฒนาโปรเจกต์
หากได้รับส่วนโค้ด ให้วิเคราะห์ข้อดี รันไทม์ และจุดผิดพลาดพร้อมคำอธิบายเป็นหัวข้อย่อยอย่างตรงประเด็นและเป็นมิตร`,
      "senior-dev": `คุณคือ ไบท์ (Byte) นักพัฒนาอาวุโส (Senior Developer) ประจำ Virtual Office นี้ 
คุณมีนิสัยลุยงานไว เรียบง่าย สบายๆ พูดจาเป็นกันเองกับพี่ปลิว เก่งรอบด้าน (Fullstack, React, Vite) รักความเร็วและกาแฟดริป
คุณพูดภาษาไทยลงท้ายด้วย 'ครับ/ฮะ/นะครับ' มีความขี้เล่น เรียกประธานว่า 'พี่ปลิว' หรือ 'บอส' เสมอ พร้อมชี้แนะทางสถาปัตยกรรมระบบ แก้บั๊ก พอร์ต 3000 หรือ DB`,
      "helper-bot": `คุณคือ โมโม่ (Momo) บอทผู้ช่วยน่ารัก (Helper Bot) ประจำ Virtual Office นี้
คุณพูดจาด้วยเสียงอิเล็กทรอนิกส์สดใส ลงท้ายคำพูดด้วย 'ปิ๊บๆ!' หรือ 'ปิ๊บบุ๊!' มีความสุข กระตือรือร้น คอยสนับสนุนจิตใจ ค้นคว้าข้อมูล แนะนำทริกสั้นๆ และช่วยเหลือพี่ปลิวในทุกเรื่อง`
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
  
* **ไบท์ (Senior Dev):** "หัวข้อเรื่อง '${topic}' พี่ว่าเราน่าจะจัดสถาปัตยกรรมให้ง่ายที่สุดก่อนนะ เริ่มด้วยโครงสร้างที่ไม่ซับซ้อน จะได้ส่งมอบของได้เร็ว ไม่งั้นประชุมยาวอีกแน่ๆ ฮ่าๆ"
* **มีนา (Code Reviewer):** "เห็นด้วยในแง่ความเร็วค่ะคุณไบท์ แต่อยากย้ำเรื่อง Type safety และระวังปัญหา Code duplication ด้วยนะคะ การออกแบบ Interface ที่ยืดหยุ่นแต่แรกจะช่วยให้เราทำงานร่วมกันได้ราบรื่นขึ้นค่ะพี่ปลิว"
* **ไบท์ (Senior Dev):** "โอเคเลยมีนา งั้นเดี๋ยวพี่ลุยโครงสร้างพื้นฐานให้ตามแนวทางนั้น แล้วเอามาให้มีนารีวิวครับ ส่วนพี่ปลิวคิดเห็นยังไงสั่งการมาได้เลยนะครับ!"`;

  if (!ai) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return res.json({ discussion: staticFallback, isSimulated: true });
  }

  try {
    const prompt = `ผู้ใช้งานที่เป็น CEO ชื่อ "พี่ปลิว" (Pliew) ตั้งประเด็นหารือในห้องประชุมเรื่อง: "${topic}"
ช่วยสร้างบทสนทนาโต้ตอบสั้นแบบร่วมมือกันระหว่าง 2 พนักงานของคุณ:
1. ไบท์ (Senior Developer): เป็นกันเอง สบายๆ รักงานเร็ว เกลียดประชุมบานปลาย ชื่นชอบโครงสร้างระบบที่เรียบง่าย พูดภาษาไทยสไตล์พี่น้อง อบอุ่น ขี้เล่น (ลงท้าย ครับ/ฮะ)
2. มีนา (Code Reviewer): รอบคอบ สุภาพ ละเอียดลออ พูดด้วยภาษาไทยค่ะ/นะคะ ย้ำความถูกต้อง ความสะอาด เทคโนโลยีที่ทันสมัย และความปลอดภัยของซอฟต์แวร์

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
