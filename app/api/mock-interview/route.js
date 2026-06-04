import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { category, answers } = await req.json(); // answers: [{question: "", answer: ""}]
    if (!category || !answers || answers.length === 0) {
      return new NextResponse("Invalid payload", { status: 400 });
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

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Evaluate the following mock interview answers for a "${category}" interview.
    
    Interview Data:
    ${JSON.stringify(answers, null, 2)}
    
    Provide an evaluation as a strict JSON object:
    {
      "communicationScore": 85,
      "technicalScore": 70, 
      "confidenceScore": 80,
      "overallScore": 78,
      "feedback": "Overall detailed feedback.",
      "questionsEvaluation": [
        { "question": "...", "feedback": "...", "isGood": true }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let evaluation;
    try {
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      evaluation = JSON.parse(cleanJson);
    } catch (e) {
      const match = responseText.match(/({[\s\S]*})/);
      if (match) {
        evaluation = JSON.parse(match[1]);
      } else {
        console.error("Failed to parse AI response:", responseText);
        throw e;
      }
    }

    // Save to Database
    const assessment = await db.assessment.create({
      data: {
        userId: dbUser.id,
        category,
        quizScore: evaluation.overallScore,
        communicationScore: evaluation.communicationScore,
        technicalScore: evaluation.technicalScore,
        confidenceScore: evaluation.confidenceScore,
        improvementTip: evaluation.feedback,
        questions: answers.map((ans, i) => ({
          question: ans.question,
          userAnswer: ans.answer,
          feedback: evaluation.questionsEvaluation[i]?.feedback,
          isCorrect: evaluation.questionsEvaluation[i]?.isGood
        }))
      }
    });

    return NextResponse.json(assessment);

  } catch (error) {
    console.error("Mock Interview Evaluation Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
