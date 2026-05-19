import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for generating meeting minutes
  app.post("/api/generate", async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: "請提供逐字稿內容" });
      }

      const systemInstruction = `
        你是一位專業的會議記錄助理。請根據使用者提供的會議逐字稿，整理出結構化的會議紀錄。
        請務必遵守以下輸出格式要求：

        1. **會議主題與時間**：擷取會議的主題與時間。
        2. **與會者**：列出參與會議的人員。
        3. **會議重點總結**：用 3 到 5 個重點總結會議內容。
        4. **Action Items (待辦事項)**：明確列出接下來的待辦事項與負責人。
        5. **英文翻譯版**：將上述 1~4 點的內容完整翻譯成專業的英文。

        請以 Markdown 格式輸出，所有繁體中文部分必須使用繁體中文回覆，不要包含任何額外的問候語或結語。
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: transcript,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const text = response.text;
      res.json({ result: text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "生成失敗，請稍後再試。" });
    }
  });

  // Vite middleware for development
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
