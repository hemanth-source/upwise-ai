"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Brain, Target, BookOpen, AlertCircle, History, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function SkillGapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/skill-gap");
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchHistory();
  }, []);

  const analyzeSkills = async () => {
    if (!targetRole.trim()) return toast.error("Please enter a target role");
    setAnalyzing(true);
    
    try {
      const res = await fetch("/api/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });

      if (!res.ok) throw new Error("Failed to analyze skills");

      const data = await res.json();
      setResults(data);
      
      // Refresh history from DB
      await fetchHistory();
      
      toast.success("Skill gap analysis complete!");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 relative">
        <div className="absolute right-0 top-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Skill Gap History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {historyList.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No history yet.</p>
                ) : (
                  historyList.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                      setTargetRole(item.targetRole);
                      setResults({
                        currentSkills: item.currentSkills,
                        missingSkills: item.missingSkills,
                        prioritySkills: item.prioritySkills,
                        learningPlan: item.learningPlan,
                        targetRole: item.targetRole
                      });
                      toast.success("Loaded from history!");
                    }}>
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm line-clamp-1">{item.targetRole}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" /> {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          Missing: {item.missingSkills?.length || 0} skills
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mb-8 flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-teal-500" />
            Skill Gap Analysis
          </h1>
          <p className="text-muted-foreground mt-2">
            Compare your current skills against your dream role and get a personalized learning plan.
          </p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="e.g. AI Engineer, Product Manager"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full md:w-64 bg-slate-900 border-slate-700"
          />
          <Button onClick={analyzeSkills} disabled={analyzing || !targetRole} className="bg-teal-600 hover:bg-teal-700">
            {analyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </div>

      {!results ? (
        <Card className="bg-slate-900/50 border-dashed border-2 border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="h-16 w-16 text-slate-700 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-slate-300">What's your next career move?</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Enter your target role above. We'll analyze your current profile (or uploaded resume) to find out exactly what skills you need to learn to get hired.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200">Current Skills</CardTitle>
              <CardDescription>What you already know</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {results.currentSkills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="bg-slate-800 hover:bg-slate-700">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Missing & Priority Skills
              </CardTitle>
              <CardDescription>Critical skills you need for {results.targetRole}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-400 mb-2">High Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {results.prioritySkills.map((skill, i) => (
                    <Badge key={i} variant="destructive" className="bg-red-900/50 text-red-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-2">Other Missing Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {results.missingSkills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="border-slate-700 text-slate-300">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 bg-slate-900 border-slate-800 mt-4">
            <CardHeader>
              <CardTitle className="text-slate-200 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                Personalized Learning Plan
              </CardTitle>
              <CardDescription>Your roadmap to acquiring these skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.learningPlan?.map((item, i) => (
                  <div key={i} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-lg bg-slate-800/50 border border-slate-800">
                    <div>
                      <h4 className="font-semibold text-teal-400">{item.skill}</h4>
                      <p className="text-sm text-slate-400 mt-1">{item.resource}</p>
                    </div>
                    <Badge variant="secondary" className="mt-2 md:mt-0 whitespace-nowrap bg-slate-800">
                      ⏱ {item.estimatedTime}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
