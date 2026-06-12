import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { targetRole, targetCompany, recipientName, goal, yourBackground } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are an expert career coach helping a user write a cold networking email or LinkedIn message.
    
User Details:
- Name: ${user.firstName || "User"} ${user.lastName || ""}
- Background: ${yourBackground}

Target Details:
- Recipient Name: ${recipientName || "[Name]"}
- Company: ${targetCompany}
- Role/Area of Interest: ${targetRole}
- Goal of message: ${goal}

Please generate a professional, concise, and highly effective cold outreach message. 
The tone should be polite, not overly aggressive, and respectful of the recipient's time.
Include a subject line at the top. 
Do not include placeholders for the user's name, use their actual name (${user.firstName}).
Format the output as plain text suitable for copying into an email client.`;

    const result = await model.generateContent(prompt);
    const emailContent = result.response.text();

    return NextResponse.json({ email: emailContent });

  } catch (error) {
    console.error("Networking Email Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
