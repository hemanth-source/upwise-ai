import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
/* removed static import */
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) return new NextResponse("No file provided", { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF – lazy import to avoid bundling issues
    let parsedText = "";
    try {
      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(buffer);
      parsedText = data.text;
    } catch (e) {
      console.error("PDF parse error:", e);
      return new NextResponse("Failed to parse PDF", { status: 400 });
    }

    // Call Gemini to analyze the resume text
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Analyze this resume and provide a detailed review. 
    Extract the following into a valid JSON object:
    {
      "skills": ["skill1", "skill2"],
      "atsScore": 85,
      "resumeQualityScore": 75,
      "missingKeywords": ["keyword1", "keyword2"],
      "feedback": "Detailed paragraph of overall feedback.",
      "checklist": [
        {"item": "Add measurable achievements", "completed": false},
        {"item": "Include link to portfolio", "completed": false}
      ]
    }
    
    Resume Text:
    ${parsedText.substring(0, 5000)} // Limiting to avoid massive tokens
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let analysis;
    try {
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      analysis = JSON.parse(cleanJson);
    } catch (e) {
      const match = responseText.match(/({[\s\S]*})/);
      if (match) {
        analysis = JSON.parse(match[1]);
      } else {
        console.error("Failed to parse AI response:", responseText);
        throw e;
      }
    }

    let dbUser = await db.user.findUnique({ where: { clerkUserId: user.id } });

    if (!dbUser) {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
      dbUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress || "",
        }
      });
    }

    // Save to database
    const savedAnalysis = await db.resume.upsert({
      where: { userId: dbUser.id },
      update: {
        parsedText: parsedText,
        atsScore: analysis.atsScore,
        resumeQualityScore: analysis.resumeQualityScore,
        missingKeywords: analysis.missingKeywords,
        feedback: analysis.feedback,
        checklist: analysis.checklist,
      },
      create: {
        userId: dbUser.id,
        content: "PDF Uploaded",
        parsedText: parsedText,
        atsScore: analysis.atsScore,
        resumeQualityScore: analysis.resumeQualityScore,
        missingKeywords: analysis.missingKeywords,
        feedback: analysis.feedback,
        checklist: analysis.checklist,
      }
    });

    return NextResponse.json(savedAnalysis);

  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
