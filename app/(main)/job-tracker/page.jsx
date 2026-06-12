"use client";

import React, { useState, useEffect } from "react";
import { getJobApplications, createJobApplication, updateJobApplicationStatus, deleteJobApplication } from "@/actions/job-tracker";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, ExternalLink, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COLUMNS = ["Applied", "Interviewing", "Offer", "Rejected"];

export default function JobTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    url: "",
    status: "Applied"
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await getJobApplications();
      setApplications(data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createJobApplication(formData);
      toast.success("Application added");
      setIsDialogOpen(false);
      setFormData({ companyName: "", jobTitle: "", url: "", status: "Applied" });
      fetchApplications();
    } catch (error) {
      toast.error("Failed to add application");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateJobApplicationStatus(id, newStatus);
      toast.success("Status updated");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteJobApplication(id);
      toast.success("Deleted application");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application");
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-indigo-500" />
            Job Tracker
          </h1>
          <p className="text-muted-foreground mt-2">Manage your job applications and track your progress.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Job</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input required value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Job URL (Optional)</Label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    {COLUMNS.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">Save Application</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map((column) => (
          <div key={column} className="bg-muted/30 p-4 rounded-xl border">
            <h2 className="font-semibold text-lg mb-4 flex justify-between items-center">
              {column}
              <span className="bg-muted text-xs py-1 px-2 rounded-full">
                {applications.filter(a => a.status === column).length}
              </span>
            </h2>
            <div className="space-y-3">
              {applications.filter(a => a.status === column).map(app => (
                <Card key={app.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm line-clamp-1">{app.jobTitle}</h3>
                      <p className="text-muted-foreground text-xs">{app.companyName}</p>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v)}>
                        <SelectTrigger className="h-7 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {COLUMNS.map(col => <SelectItem key={col} value={col} className="text-xs">{col}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        {app.url && (
                          <a href={app.url} target="_blank" rel="noreferrer" className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(app.id)} className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {applications.filter(a => a.status === column).length === 0 && (
                <div className="text-center p-4 border-2 border-dashed rounded-lg text-muted-foreground text-xs">
                  No applications
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
