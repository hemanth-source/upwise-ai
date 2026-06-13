import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const dbUser = await db.user.findUnique({
      where: { clerkUserId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json([]);
    }

    const history = await db.roadmap.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
      include: {
        phases: {
          include: {
            tasks: true
          }
        }
      },
      take: 20
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Fetch Roadmap History Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
