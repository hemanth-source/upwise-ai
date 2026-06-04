"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function AvatarCoachPage() {
  const { user } = useUser();
  const [isSessionActive, setIsSessionActive] = useState(false);

  const startSession = () => {
    setIsSessionActive(true);
    toast.success("Connecting to TruGen AI Avatar...");
  };

  const endSession = () => {
    setIsSessionActive(false);
    toast.info("Session ended.");
  };

  const agentId = process.env.NEXT_PUBLIC_TRUGEN_AGENT_ID;
  const username = user?.fullName ? encodeURIComponent(user.fullName) : "Guest";
  const userId = user?.id || "guest-id";
  const context = encodeURIComponent("User is looking for career coaching and guidance.");

  // Use the public agent link provided by TruGen instead of embed to bypass login
  const trugenIframeUrl = `https://app.trugen.ai/agent/${agentId}?username=${username}&id=${userId}&context=${context}`;

  return (
    <div className="container mx-auto py-6 px-4 h-[calc(100vh-4rem)]">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Video className="h-8 w-8 text-indigo-500" />
            AI Avatar Career Coach
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time interactive career mentoring powered by TruGen AI.
          </p>
        </div>
        <div>
          {!isSessionActive ? (
            <Button onClick={startSession} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Play className="h-4 w-4" /> Start Coaching Session
            </Button>
          ) : (
            <Button onClick={endSession} variant="destructive" className="gap-2">
              <Square className="h-4 w-4" /> End Session
            </Button>
          )}
        </div>
      </div>

      <div className="h-[calc(100%-100px)]">
        <Card className="h-full bg-slate-900 border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <CardContent className="p-0 flex-1 relative bg-black flex items-center justify-center">
            {!isSessionActive ? (
              <div className="text-center p-10">
                <div className="w-32 h-32 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-slate-700">
                  <Video className="h-12 w-12 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300">Avatar Offline</h3>
                <p className="text-sm text-slate-500 mt-2">Click "Start Coaching Session" to connect to TruGen AI.</p>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-[500px]">
                {agentId ? (
                  <iframe
                    src={trugenIframeUrl}
                    allow="camera; microphone; fullscreen; display-capture"
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="TruGen AI Coach"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-red-400">Error: TruGen Agent ID not found in environment variables.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
