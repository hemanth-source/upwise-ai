"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeResume = async () => {
    if (!file) return;
    setAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume-analysis", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to analyze resume");

      const data = await res.json();
      setResults(data);
      toast.success("Resume analyzed successfully!");
    } catch (error) {
      toast.error(error.message || "An error occurred");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Resume Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Upload your PDF resume to get an AI-powered ATS score and improvement suggestions.
        </p>
      </div>

      {!results ? (
        <Card className="border-dashed border-2 bg-slate-900/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-800 p-4 rounded-full mb-4">
              <UploadCloud className="h-8 w-8 text-violet-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload your resume (PDF)</h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              We'll extract your skills and experience to generate a comprehensive ATS compatibility score.
            </p>
            
            <div className="flex items-center gap-4">
              <label htmlFor="resume-upload" className="cursor-pointer">
                <div className="bg-slate-800 hover:bg-slate-700 text-sm font-medium py-2 px-4 rounded-md transition-colors border border-slate-700">
                  {file ? file.name : "Select PDF File"}
                </div>
                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              
              <Button 
                onClick={analyzeResume} 
                disabled={!file || analyzing}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {analyzing ? "Analyzing..." : "Analyze Resume"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Score Card */}
          <Card className="md:col-span-1 bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle>Evaluation Scores</CardTitle>
              <CardDescription>AI-powered resume analysis metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {/* ATS Score Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-violet-500 transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={376.99}
                      strokeDashoffset={376.99 * (1 - results.atsScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{results.atsScore}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-200">ATS Match Score</span>
                <span className="text-xs text-slate-400">Keyword & format compatibility</span>
              </div>

              <div className="w-full border-t border-slate-800 my-1" />

              {/* Quality Score Ring */}
              <div className="flex flex-col items-center">
                <div className="relative w-36 h-36 flex items-center justify-center mb-2">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-slate-800"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-teal-500 transition-all duration-1000 ease-out"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={376.99}
                      strokeDashoffset={376.99 * (1 - results.resumeQualityScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">{results.resumeQualityScore}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-200">Content Quality Score</span>
                <span className="text-xs text-slate-400">Impact, metrics & clarity analysis</span>
              </div>
              
              <Button variant="outline" className="w-full mt-4" onClick={() => setResults(null)}>
                Upload New Resume
              </Button>
            </CardContent>
          </Card>

          {/* Details Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-400" />
                  AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {results.feedback}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    Missing Keywords
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.missingKeywords?.map((kw, i) => (
                      <Badge key={i} variant="destructive" className="bg-red-900/50 text-red-300 hover:bg-red-900/50">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    Improvement Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {results.checklist?.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <div className={`mt-0.5 h-4 w-4 rounded-full flex-shrink-0 border ${item.completed ? 'bg-green-500 border-green-500' : 'border-slate-600'}`}></div>
                        <span>{item.item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
