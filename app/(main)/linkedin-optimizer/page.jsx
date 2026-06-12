"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Linkedin, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export default function LinkedinOptimizer() {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [formData, setFormData] = useState({
    headline: "",
    about: "",
    experience: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch("/api/linkedin-optimizer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error("Failed to analyze profile");
      
      const data = await response.json();
      setAnalysis(data.analysis);
      toast.success("Profile analyzed successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3 text-blue-500">
          <Linkedin className="h-10 w-10" />
          LinkedIn Profile Optimizer
        </h1>
        <p className="text-muted-foreground mt-2">
          Paste your LinkedIn sections below and get AI-driven suggestions to boost your recruiter visibility.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile Content</CardTitle>
            <CardDescription>Copy and paste sections directly from your LinkedIn profile.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input 
                  id="headline" 
                  name="headline" 
                  placeholder="e.g. Software Engineer at Google | React | Node.js" 
                  value={formData.headline} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About Section</Label>
                <Textarea 
                  id="about" 
                  name="about" 
                  placeholder="Paste your 'About' section here..." 
                  className="h-32" 
                  value={formData.about} 
                  onChange={handleChange} 
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Recent Experience (Optional)</Label>
                <Textarea 
                  id="experience" 
                  name="experience" 
                  placeholder="Paste 1-2 recent roles and bullet points..." 
                  className="h-32" 
                  value={formData.experience} 
                  onChange={handleChange} 
                />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Optimize Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Feedback & Suggestions</CardTitle>
            <CardDescription>Actionable tips to improve your profile.</CardDescription>
          </CardHeader>
          <CardContent className="h-full">
            {analysis ? (
              <div className="prose prose-invert max-w-none text-sm space-y-4">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground text-sm flex-col gap-2">
                <Linkedin className="h-8 w-8 text-muted-foreground opacity-50" />
                <span>Fill out the form and analyze to see suggestions.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
