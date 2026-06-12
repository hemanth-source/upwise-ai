import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { headline, about, experience } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are an expert LinkedIn profile reviewer and career coach.
Review the following LinkedIn profile sections and provide actionable feedback to improve recruiter visibility and impact.

Headline:
${headline}

About Section:
${about}

Experience:
${experience || "Not provided"}

Format your response in Markdown. Include:
1. **Headline Optimization**: A critique of the current headline and 3 improved, highly searchable alternatives.
2. **About Section Feedback**: How to make it more engaging and keyword-rich. Provide a slightly rewritten version if applicable.
3. **Experience Suggestions**: Tips on making bullet points more impactful (using action verbs and metrics).
4. **General Keywords**: Missing keywords they should consider adding based on their inferred industry.
`;

    const result = await model.generateContent(prompt);
    const analysisContent = result.response.text();

    return NextResponse.json({ analysis: analysisContent });

  } catch (error) {
    console.error("LinkedIn Optimizer Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
