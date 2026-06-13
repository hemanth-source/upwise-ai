"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Copy, CheckCircle, History, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
  const [isMounted, setIsMounted] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/networking");
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
      
      // Refresh history from DB
      await fetchHistory();
      
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
                <DialogTitle>Email Generation History</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                {historyList.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">No history yet.</p>
                ) : (
                  historyList.map((item) => (
                    <Card key={item.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => {
                      setFormData({
                        targetRole: item.targetRole || "",
                        targetCompany: item.targetCompany || "",
                        recipientName: item.recipientName || "",
                        goal: item.goal || "",
                        yourBackground: item.yourBackground || ""
                      });
                      setGeneratedEmail(item.generatedEmail);
                      toast.success("Loaded from history!");
                    }}>
                      <CardContent className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm line-clamp-1">{item.targetRole} @ {item.targetCompany}</h4>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" /> {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.generatedEmail}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
