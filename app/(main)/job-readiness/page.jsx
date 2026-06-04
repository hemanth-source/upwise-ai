import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Target, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default async function JobReadinessPage() {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
    include: {
      resume: true,
      assessments: { orderBy: { createdAt: 'desc' }, take: 1 },
      skillAnalysis: { orderBy: { createdAt: 'desc' }, take: 1 },
    }
  });

  const resumeScore = dbUser?.resume?.atsScore || 0;
  const interviewScore = dbUser?.assessments?.[0]?.quizScore || 0;
  
  // Calculate a mock skill match score
  const skillAnalysis = dbUser?.skillAnalysis?.[0];
  let skillMatchScore = 0;
  if (skillAnalysis) {
    const totalSkills = (skillAnalysis.currentSkills?.length || 0) + (skillAnalysis.missingSkills?.length || 0) + (skillAnalysis.prioritySkills?.length || 0);
    skillMatchScore = totalSkills > 0 ? Math.round(((skillAnalysis.currentSkills?.length || 0) / totalSkills) * 100) : 0;
  }

  // Final Readiness Score (weighted)
  const finalScore = Math.round((resumeScore * 0.4) + (skillMatchScore * 0.3) + (interviewScore * 0.3));

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Target className="h-10 w-10 text-violet-500" />
          Job Readiness Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Your comprehensive score based on your Resume, Skills, and Mock Interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Main Score Gauge */}
        <Card className="md:col-span-3 bg-slate-900 border-slate-800 shadow-2xl flex flex-col md:flex-row items-center p-8 gap-8">
          <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-slate-800 shadow-[0_0_30px_rgba(124,58,237,0.2)] shrink-0">
             <div className="absolute inset-0 rounded-full border-8 border-violet-500" style={{ clipPath: `polygon(0 0, 100% 0, 100% ${100 - finalScore}%, 0 ${100 - finalScore}%)`, transform: "rotate(180deg)" }}></div>
             <div className="text-center">
               <span className="text-6xl font-bold text-white block">{finalScore}</span>
               <span className="text-sm text-slate-400">/ 100</span>
             </div>
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div>
              <h2 className="text-2xl font-semibold text-slate-100">You are {finalScore >= 80 ? 'Highly Ready' : finalScore >= 60 ? 'Moderately Ready' : 'Getting Started'}</h2>
              <p className="text-slate-400 mt-1">
                Target Role: <span className="text-violet-400 font-medium">{dbUser?.targetRole || "Not specified"}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Resume Strength</span>
                  <span className="font-medium text-slate-200">{resumeScore}%</span>
                </div>
                <Progress value={resumeScore} className="h-2 bg-slate-800 [&>div]:bg-teal-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Skill Match</span>
                  <span className="font-medium text-slate-200">{skillMatchScore}%</span>
                </div>
                <Progress value={skillMatchScore} className="h-2 bg-slate-800 [&>div]:bg-blue-500" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 text-slate-300">
                  <span>Interview Performance</span>
                  <span className="font-medium text-slate-200">{interviewScore}%</span>
                </div>
                <Progress value={interviewScore} className="h-2 bg-slate-800 [&>div]:bg-pink-500" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Strong Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {resumeScore >= 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  Your resume is highly optimized for ATS systems.
                </li>
              )}
              {skillMatchScore >= 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  You possess the majority of core skills required for your target role.
                </li>
              )}
              {interviewScore >= 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  Strong communication and technical articulation in interviews.
                </li>
              )}
              {resumeScore < 70 && skillMatchScore < 70 && interviewScore < 70 && (
                <p className="text-sm text-slate-500">Complete more assessments to generate strengths.</p>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-400" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {resumeScore < 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500 shrink-0" />
                  Update your resume to include missing industry keywords.
                </li>
              )}
              {skillMatchScore < 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500 shrink-0" />
                  Focus on the priority skills identified in your Skill Gap Analysis.
                </li>
              )}
              {interviewScore < 70 && (
                <li className="flex items-start gap-2 text-slate-300">
                  <div className="h-2 w-2 mt-2 rounded-full bg-yellow-500 shrink-0" />
                  Take more mock interviews to boost your confidence and technical delivery.
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
