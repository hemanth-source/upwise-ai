"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function NetworkingEmailGenerator() {
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    targetRole: "",
    targetCompany: "",
    recipientName: "",
    goal: "",
    yourBackground: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneratedEmail("");
    try {
      const response = await fetch("/api/networking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error("Failed to generate email");
      
      const data = await response.json();
      setGeneratedEmail(data.email);
      toast.success("Email generated successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
          <Mail className="h-10 w-10 text-primary" />
          Cold Networking Email Generator
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate professional, high-converting cold emails to reach out to recruiters, alumni, or industry peers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Email Details</CardTitle>
            <CardDescription>Provide context for the AI to generate a tailored message.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name (Optional)</Label>
                <Input id="recipientName" name="recipientName" placeholder="e.g. John Doe" value={formData.recipientName} onChange={handleChange} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetCompany">Target Company</Label>
                <Input id="targetCompany" name="targetCompany" placeholder="e.g. Google, Acme Corp" required value={formData.targetCompany} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole">Target Role (or area of interest)</Label>
                <Input id="targetRole" name="targetRole" placeholder="e.g. Software Engineer, Product Manager" required value={formData.targetRole} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Primary Goal</Label>
                <Input id="goal" name="goal" placeholder="e.g. Informational Interview, Referral, General Advice" required value={formData.goal} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yourBackground">Your Background (Briefly)</Label>
                <Textarea 
                  id="yourBackground" 
                  name="yourBackground" 
                  placeholder="e.g. Recent CS grad looking to break into frontend development..." 
                  className="h-24" 
                  required 
                  value={formData.yourBackground} 
                  onChange={handleChange} 
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Email"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Result</CardTitle>
            <CardDescription>Your tailored email will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedEmail ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap text-sm border border-border min-h-[300px]">
                  {generatedEmail}
                </div>
                <Button variant="outline" onClick={copyToClipboard} className="w-full">
                  {copied ? <><CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Copied!</> : <><Copy className="mr-2 h-4 w-4" /> Copy to Clipboard</>}
                </Button>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground text-sm">
                Fill out the form and generate an email to see the result.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
