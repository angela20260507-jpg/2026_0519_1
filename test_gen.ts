import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

async function testGenerate() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hello, this is a test.",
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

testGenerate();
