"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Map, MapPin, CheckCircle, Circle, Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function RoadmapPage() {
  const [targetRole, setTargetRole] = useState("");
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/roadmap/history");
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

    const fetchRoadmap = async () => {
      try {
        const res = await fetch("/api/roadmap");
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setRoadmap(data);
            setTargetRole(data.targetRole || "");
          }
        }
      } catch (err) {
        console.error("Error fetching roadmap:", err);
      }
    };
    fetchRoadmap();
  }, []);

  const generateRoadmap = async () => {
    if (!targetRole.trim()) return toast.error("Please enter a target role");
    setGenerating(true);
    
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });

      if (!res.ok) throw new Error("Failed to generate roadmap");

      const data = await res.json();
      setRoadmap(data);
      
      // Refresh history from DB
      await fetchHistory();
      
      toast.success("Career roadmap generated!");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setGenerating(false);
    }
  };

  const toggleTask = async (phaseIndex, taskIndex) => {
    const task = roadmap.phases[phaseIndex].tasks[taskIndex];
    const newStatus = !task.isCompleted;

    // Optimistic UI update
    const updated = { ...roadmap };
    updated.phases[phaseIndex].tasks[taskIndex].isCompleted = newStatus;
    setRoadmap(updated);

    try {
      const res = await fetch("/api/roadmap/task", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, isCompleted: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      console.error("Error updating task status:", err);
      // Rollback on error
      const rollback = { ...roadmap };
      rollback.phases[phaseIndex].tasks[taskIndex].isCompleted = !newStatus;
      setRoadmap(rollback);
      toast.error("Failed to update task status");
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center relative">
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
                <DialogTitle>Roadmap History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {historyList.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No history yet.</p>
                ) : (
                  historyList.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                      setTargetRole(item.targetRole);
                      setRoadmap(item);
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
                          Phases: {item.phases?.length || 0}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="bg-blue-900/30 p-4 rounded-full inline-block mb-4 border border-blue-500/30">
          <Map className="h-10 w-10 text-blue-400" />
        </div>
        <h1 className="text-4xl font-bold">Visual Career Roadmap</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
          Generate a step-by-step interactive timeline to achieve your dream role.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8 max-w-md mx-auto">
          <Input 
            placeholder="e.g. Machine Learning Engineer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="bg-slate-900 border-slate-700"
          />
          <Button onClick={generateRoadmap} disabled={generating || !targetRole} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
            {generating ? "Generating..." : "Generate Map"}
          </Button>
        </div>
      </div>

      {roadmap && (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
          
          <div className="text-center mb-12">
            <Badge className="bg-blue-600 text-white px-4 py-1 text-sm border-none shadow-lg">
              Destination: {roadmap.targetRole}
            </Badge>
          </div>

          {roadmap.phases.sort((a,b) => a.order - b.order).map((phase, phaseIdx) => (
            <div key={phaseIdx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-blue-500 text-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-900/80 border-slate-700 backdrop-blur-sm shadow-xl">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-slate-100">{phase.title}</CardTitle>
                    <Badge variant="outline" className="text-slate-400 border-slate-700">Phase {phase.order}</Badge>
                  </div>
                  {phase.description && <p className="text-sm text-slate-400 mt-1">{phase.description}</p>}
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-4">
                    {phase.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="group/task flex items-start gap-3">
                        <button 
                          onClick={() => toggleTask(phaseIdx, taskIdx)}
                          className="mt-0.5 shrink-0 transition-colors"
                        >
                          {task.isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-500 hover:text-blue-400" />
                          )}
                        </button>
                        <div className={`flex-1 ${task.isCompleted ? 'opacity-50' : ''}`}>
                          <h4 className={`text-sm font-medium ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-slate-400 mt-0.5">{task.description}</p>
                          )}
                          {task.estimatedTime && (
                            <div className="flex items-center gap-1 mt-2 text-xs font-medium text-slate-500 bg-slate-800/50 w-fit px-2 py-0.5 rounded border border-slate-700">
                              <Clock className="h-3 w-3" />
                              {task.estimatedTime}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}

          <div className="text-center mt-12 relative z-10 pt-4">
            <div className="bg-slate-900 inline-block p-2 rounded-full border border-slate-700 shadow-xl">
              <div className="bg-blue-500/20 p-2 rounded-full">
                <MapPin className="h-6 w-6 text-blue-400 animate-bounce" />
              </div>
            </div>
            <p className="text-sm font-semibold mt-2 text-slate-300">You arrive at {roadmap.targetRole}!</p>
          </div>

        </div>
      )}
    </div>
  );
}
