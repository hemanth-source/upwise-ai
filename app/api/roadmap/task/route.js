import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function PATCH(req) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { taskId, isCompleted } = await req.json();
    if (!taskId) return new NextResponse("Task ID required", { status: 400 });

    const updatedTask = await db.roadmapTask.update({
      where: { id: taskId },
      data: { isCompleted }
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Task Update Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
