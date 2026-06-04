import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  const modelInfo = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("hello");
  console.log("gemini-1.5-flash success");
}
listModels().catch(console.error);
