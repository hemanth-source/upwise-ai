import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { db } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req) {
  const user = await currentUser();
  const { messages } = await req.json();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Get user profile for context
  let dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

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

  const systemMessage = `You are "Ask Upwise", an intelligent AI career coach and guidance chatbot for the Upwise platform.
You should maintain a professional, encouraging, and highly knowledgeable persona. 
You help users with career questions, explaining skills, generating roadmaps, suggesting projects, recommending certifications, and learning paths.

User Context:
- Name: ${dbUser?.name || 'Unknown'}
- Industry: ${dbUser?.industry || 'Unknown'}
- Target Role: ${dbUser?.targetRole || 'Not specified'}
- Experience: ${dbUser?.experience ? dbUser.experience + ' years' : 'Not specified'}

Use markdown to format your responses, including bold text, lists, code blocks, and headers where appropriate to make information easy to read.`;

  const result = streamText({
    model: google('gemini-2.5-flash'),
    system: systemMessage,
    messages,
    async onFinish({ text, toolCalls, toolResults, finishReason, usage }) {
      // Save chat history to database
      if (text) {
        // Save the user's last message
        const lastUserMessage = messages[messages.length - 1];
        await db.chatHistory.create({
          data: {
            userId: dbUser.id,
            role: 'user',
            content: lastUserMessage.content,
          }
        });
        
        // Save the AI's response
        await db.chatHistory.create({
          data: {
            userId: dbUser.id,
            role: 'assistant',
            content: text,
          }
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
