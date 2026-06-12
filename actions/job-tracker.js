"use server";

import { db } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getJobApplications() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) throw new Error("User not found");

  const applications = await db.jobApplication.findMany({
    where: { userId: dbUser.id },
    orderBy: { updatedAt: 'desc' }
  });

  return applications;
}

export async function createJobApplication(data) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  const app = await db.jobApplication.create({
    data: {
      userId: dbUser.id,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      status: data.status || "Applied",
      url: data.url,
      notes: data.notes
    }
  });

  revalidatePath("/job-tracker");
  return app;
}

export async function updateJobApplicationStatus(id, newStatus) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const app = await db.jobApplication.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath("/job-tracker");
  return app;
}

export async function deleteJobApplication(id) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await db.jobApplication.delete({
    where: { id }
  });

  revalidatePath("/job-tracker");
}
