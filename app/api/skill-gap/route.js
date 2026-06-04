import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { targetRole } = await req.json();
    if (!targetRole) return new NextResponse("Target role required", { status: 400 });

    let dbUser = await db.user.findUnique({ 
      where: { clerkUserId: user.id },
      include: { resume: true }
    });

    if (!dbUser) {
      const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
      dbUser = await db.user.create({
        data: {
          clerkUserId: user.id,
          name,
          imageUrl: user.imageUrl,
          email: user.emailAddresses[0]?.emailAddress || "",
        },
        include: { resume: true }
      });
    }

    // Extract skills from resume or user profile
    const currentSkills = dbUser.skills?.length > 0 
      ? dbUser.skills 
      : (dbUser.resume?.parsedText ? "Extracted from resume: " + dbUser.resume.parsedText.substring(0, 1000) : "No skills defined.");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Perform a skill gap analysis for a user aiming to become a "${targetRole}".
    User's current skills/background: ${currentSkills}
    
    Return a strict JSON object:
    {
      "currentSkills": ["identified skill 1", "identified skill 2"],
      "missingSkills": ["missing skill 1", "missing skill 2"],
      "prioritySkills": ["top priority 1", "top priority 2"],
      "learningPlan": [
        {"skill": "Skill Name", "resource": "Recommended Course/Project", "estimatedTime": "2 weeks"}
      ]
    }`;

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

    const savedAnalysis = await db.skillAnalysis.create({
      data: {
        userId: dbUser.id,
        targetRole,
        currentSkills: analysis.currentSkills,
        missingSkills: analysis.missingSkills,
        prioritySkills: analysis.prioritySkills,
        learningPlan: analysis.learningPlan,
      }
    });

    // Update user's target role
    await db.user.update({
      where: { id: dbUser.id },
      data: { targetRole }
    });

    return NextResponse.json(savedAnalysis);

  } catch (error) {
    console.error("Skill Gap Analysis Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
