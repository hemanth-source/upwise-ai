import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";

config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("hello");
    console.log("gemini-1.5-flash success:", result.response.text());
  } catch (error) {
    console.error("gemini-1.5-flash failed:", error.message);
  }
}
listModels();
