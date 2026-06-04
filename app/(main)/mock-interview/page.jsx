"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, PlayCircle, BarChart3, CheckCircle2, MessageSquare, Video, Square } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function MockInterviewPage() {
  const { user } = useUser();
  const [category, setCategory] = useState("Technical"); // Technical, Behavioral, HR
  const [mode, setMode] = useState("avatar"); // avatar, standard
  const [sessionActive, setSessionActive] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [results, setResults] = useState(null);
  
  // Dummy questions for standard mode UI purposes.
  const questions = [
    "Tell me about a time you had to overcome a significant technical challenge.",
    "How do you handle disagreements with team members?"
  ];
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [allAnswers, setAllAnswers] = useState([]);
  const [capturedTranscript, setCapturedTranscript] = useState("");
  
  const recognitionRef = React.useRef(null);
  const sessionActiveRef = React.useRef(false);
  const finalTranscriptRef = React.useRef("");

  const startSession = () => {
    setSessionActive(true);
    sessionActiveRef.current = true;
    setCurrentQIndex(0);
    setAllAnswers([]);
    setResults(null);
    setCapturedTranscript("");
    finalTranscriptRef.current = "";
    
    if (mode === "avatar") {
      toast.success(`Connecting to TruGen AI ${category} Avatar...`);
      // Start Background Speech Recognition to capture what the user says
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;
          
          recognitionRef.current.onresult = (event) => {
            let currentFinal = "";
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                currentFinal += event.results[i][0].transcript + " ";
              }
            }
            if (currentFinal) {
              finalTranscriptRef.current += currentFinal;
              setCapturedTranscript(finalTranscriptRef.current);
            }
          };

          recognitionRef.current.onend = () => {
            if (sessionActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error("Failed to restart speech recognition:", e);
              }
            }
          };

          recognitionRef.current.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
          };
          
          recognitionRef.current.start();
        } else {
          console.warn("Speech Recognition not supported in this browser.");
        }
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    } else {
      toast.success(`Starting standard ${category} interview session.`);
    }
  };

  const nextQuestion = () => {
    setAllAnswers([...allAnswers, { question: questions[currentQIndex], answer: currentAnswer }]);
    setCurrentAnswer("");
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishInterview([...allAnswers, { question: questions[currentQIndex], answer: currentAnswer }]);
    }
  };

  const finishInterview = async (finalAnswers) => {
    setSessionActive(false);
    sessionActiveRef.current = false;
    setEvaluating(true);
    
    // Stop background recognition if active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch(e) {}
    }

    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, answers: finalAnswers }),
      });

      if (!res.ok) throw new Error("Failed to evaluate interview");

      const data = await res.json();
      setResults(data);
      toast.success("Interview evaluated successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setEvaluating(false);
    }
  };

  // Resolve Agent ID based on selection
  const getAgentId = () => {
    if (category === "Technical") return process.env.NEXT_PUBLIC_TRUGEN_TECHNICAL_AGENT_ID;
    if (category === "Behavioral") return process.env.NEXT_PUBLIC_TRUGEN_BEHAVIORAL_AGENT_ID;
    if (category === "HR") return process.env.NEXT_PUBLIC_TRUGEN_HR_AGENT_ID;
    return process.env.NEXT_PUBLIC_TRUGEN_AGENT_ID;
  };

  const agentId = getAgentId();
  const username = user?.fullName ? encodeURIComponent(user.fullName) : "Candidate";
  const userId = user?.id || "candidate-id";
  const context = encodeURIComponent(`Candidate is taking a live ${category} mock interview.`);
  const trugenIframeUrl = `https://app.trugen.ai/agent/${agentId}?username=${username}&id=${userId}&context=${context}`;

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <MessageSquare className="h-10 w-10 text-indigo-500" />
          AI Mock Interview
        </h1>
        <p className="text-muted-foreground mt-2">
          Practice your interview skills with live AI avatars or standard text modes and receive feedback.
        </p>
      </div>

      {!sessionActive && !results && (
        <Card className="bg-slate-900 border-slate-800 shadow-xl max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <CardTitle>Select Interview Options</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            
            {/* Mode selection tab */}
            <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800 mb-6 w-full max-w-md">
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  mode === "avatar"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setMode("avatar")}
              >
                <Video className="h-3.5 w-3.5" /> Interactive AI Avatar
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-2 ${
                  mode === "standard"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setMode("standard")}
              >
                <Mic className="h-3.5 w-3.5" /> Text-Based Form
              </button>
            </div>

            <div className="flex gap-4 mb-8 mt-2">
              {["Technical", "Behavioral", "HR"].map(cat => (
                <Button 
                  key={cat} 
                  variant={category === cat ? "default" : "outline"}
                  className={category === cat ? "bg-indigo-600 hover:bg-indigo-700" : "border-slate-700 hover:bg-slate-800"}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <Button size="lg" onClick={startSession} className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-64 gap-2">
              <PlayCircle className="h-5 w-5" /> Start Interview
            </Button>
          </CardContent>
        </Card>
      )}

      {sessionActive && mode === "avatar" && (
        <Card className="bg-slate-900 border-slate-800 shadow-2xl max-w-4xl mx-auto overflow-hidden flex flex-col h-[650px]">
          <div className="bg-indigo-900/40 p-4 border-b border-indigo-500/20 flex justify-between items-center">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
              {category} Interview (Live TruGen Avatar)
            </Badge>
            <Button 
              onClick={() => {
                const finalTranscript = capturedTranscript.trim() || "User did not speak clearly or transcript was not captured.";
                finishInterview([
                  { question: "Mock Interview Conversation", answer: finalTranscript }
                ]);
              }} 
              variant="destructive" 
              size="sm" 
              className="gap-2"
            >
              <Square className="h-4 w-4" /> End Interview Session
            </Button>
          </div>
          <CardContent className="p-0 flex-1 relative bg-black flex flex-col items-center justify-center h-full">
            {agentId ? (
              <>
                <iframe
                  src={trugenIframeUrl}
                  allow="camera; microphone; fullscreen; display-capture"
                  style={{ width: "100%", height: "100%", border: "none" }}
                  title="TruGen AI Interviewer"
                />
              </>
            ) : (
              <div className="text-center p-10">
                <p className="text-red-400 font-semibold mb-2">TruGen Agent ID missing</p>
                <p className="text-sm text-slate-500">
                  Please define NEXT_PUBLIC_TRUGEN_{category.toUpperCase()}_AGENT_ID in your .env file.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {sessionActive && mode === "standard" && (
        <Card className="bg-slate-900 border-slate-800 shadow-2xl max-w-3xl mx-auto overflow-hidden">
          <div className="bg-indigo-900/40 p-4 border-b border-indigo-500/20 flex justify-between items-center">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30">
              {category} Interview (Standard)
            </Badge>
            <span className="text-sm text-slate-400">Question {currentQIndex + 1} of {questions.length}</span>
          </div>
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-8 text-center text-slate-100">
              "{questions[currentQIndex]}"
            </h2>
            
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 mb-6">
              <textarea 
                className="w-full h-32 bg-transparent border-none focus:ring-0 text-slate-200 resize-none placeholder-slate-500"
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <Button variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                <Mic className="h-4 w-4" /> Start Recording
              </Button>
              
              <Button 
                onClick={nextQuestion} 
                disabled={!currentAnswer.trim()}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {currentQIndex + 1 === questions.length ? "Finish & Evaluate" : "Next Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {evaluating && (
        <div className="text-center py-20">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-slate-200">AI is analyzing your performance...</h3>
          <p className="text-slate-400">Calculating granular metrics and generating feedback.</p>
        </div>
      )}

      {results && !evaluating && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Overall Score</p>
                <div className="text-4xl font-bold text-white">{results.quizScore}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Communication</p>
                <div className="text-4xl font-bold text-indigo-400">{results.communicationScore}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Technical Match</p>
                <div className="text-4xl font-bold text-teal-400">{results.technicalScore}</div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-slate-400 mb-2">Confidence</p>
                <div className="text-4xl font-bold text-pink-400">{results.confidenceScore}</div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                Comprehensive Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6">{results.improvementTip}</p>
              
              <div className="space-y-4">
                {results.questions.map((q, i) => (
                  <div key={i} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-medium text-slate-200 mb-2 flex items-start gap-2">
                      <CheckCircle2 className={`h-5 w-5 mt-0.5 shrink-0 ${q.isCorrect ? 'text-green-500' : 'text-yellow-500'}`} />
                      {q.question}
                    </h4>
                    <div className="ml-7 space-y-2">
                      <p className="text-sm text-slate-400 italic">" {q.userAnswer} "</p>
                      <p className="text-sm text-indigo-300 font-medium pt-2 border-t border-slate-700">{q.feedback}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button onClick={() => setResults(null)} variant="outline" className="border-slate-700 hover:bg-slate-800">
                  Take Another Interview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
