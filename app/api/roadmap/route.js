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
      include: { 
        skillAnalysis: { orderBy: { createdAt: 'desc' }, take: 1 } 
      }
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
        include: {
          skillAnalysis: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });
    }

    const currentSkills = dbUser.skillAnalysis?.[0]?.currentSkills?.join(", ") || "Beginner";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Create a professional career roadmap to become a "${targetRole}". 
    The user's current skills are: ${currentSkills}.
    
    Return a strict JSON object:
    {
      "phases": [
        {
          "title": "Phase 1: Foundation",
          "description": "Building the core concepts.",
          "order": 1,
          "tasks": [
            { "title": "Learn Python", "description": "Variables, loops, functions", "estimatedTime": "2 weeks" },
            { "title": "Version Control", "description": "Git and GitHub basics", "estimatedTime": "1 week" }
          ]
        },
        {
          "title": "Phase 2: Advanced",
          "description": "Deep dive into specific tools.",
          "order": 2,
          "tasks": [
            { "title": "Machine Learning", "description": "Scikit-learn, Pandas", "estimatedTime": "4 weeks" }
          ]
        }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let roadmapData;
    try {
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      roadmapData = JSON.parse(cleanJson);
    } catch (e) {
      const match = responseText.match(/({[\s\S]*})/);
      if (match) {
        roadmapData = JSON.parse(match[1]);
      } else {
        console.error("Failed to parse AI response:", responseText);
        throw e;
      }
    }

    // Save Roadmap to Database
    const savedRoadmap = await db.roadmap.create({
      data: {
        userId: dbUser.id,
        targetRole,
        phases: {
          create: roadmapData.phases.map(phase => ({
            title: phase.title,
            description: phase.description,
            order: phase.order,
            tasks: {
              create: phase.tasks.map(task => ({
                title: task.title,
                description: task.description,
                estimatedTime: task.estimatedTime
              }))
            }
          }))
        }
      },
      include: {
        phases: {
          include: { tasks: true }
        }
      }
    });

    return NextResponse.json(savedRoadmap);

  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(null);
    }

    const roadmap = await db.roadmap.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      }
    });

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error("Fetch Roadmap Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
