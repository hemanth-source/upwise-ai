"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BriefcaseIcon,
  LineChart,
  TrendingUp,
  TrendingDown,
  Brain,
  Map,
  Target,
  Zap
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const DashboardView = ({ insights }) => {
  // Transform salary data for the chart
  const salaryData = insights.salaryRanges.map((range) => ({
    name: range.role,
    min: range.min / 1000,
    max: range.max / 1000,
    median: range.median / 1000,
  }));

  const getDemandLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMarketOutlookInfo = (outlook) => {
    switch (outlook.toLowerCase()) {
      case "positive":
        return { icon: TrendingUp, color: "text-green-500" };
      case "neutral":
        return { icon: LineChart, color: "text-yellow-500" };
      case "negative":
        return { icon: TrendingDown, color: "text-red-500" };
      default:
        return { icon: LineChart, color: "text-gray-500" };
    }
  };

  const OutlookIcon = getMarketOutlookInfo(insights.marketOutlook).icon;
  const outlookColor = getMarketOutlookInfo(insights.marketOutlook).color;

  const lastUpdatedDate = format(new Date(insights.lastUpdated), "dd/MM/yyyy");

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Career Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Track your progress, explore insights, and manage your AI-guided career journey.
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          Market Data Updated: {lastUpdatedDate}
        </Badge>
      </div>

      {/* Upwise AI Features Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Readiness Score (Placeholder for Phase 3) */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-20">
            <Target className="h-16 w-16 text-violet-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Target className="h-4 w-4 text-violet-400" />
              Job Readiness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">0</span>
              <span className="text-sm text-slate-400">/ 100</span>
            </div>
            <Progress value={0} className="h-2 mt-4 bg-slate-800 [&>div]:bg-violet-500" />
            <p className="text-xs text-slate-400 mt-3 flex justify-between">
              <span>Resume: 0%</span>
              <span>Skills: 0%</span>
            </p>
            <Link href="/job-readiness" className="mt-4 block text-xs text-violet-400 hover:text-violet-300">
              Take Assessment →
            </Link>
          </CardContent>
        </Card>

        {/* Skill Gap (Placeholder for Phase 3) */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-3 opacity-20">
            <Brain className="h-16 w-16 text-teal-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Brain className="h-4 w-4 text-teal-400" />
              Skill Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between text-xs mb-1 text-slate-300">
                  <span>Current Match</span>
                  <span>0%</span>
                </div>
                <Progress value={0} className="h-1.5 bg-slate-800 [&>div]:bg-teal-500" />
              </div>
              <div className="text-sm">
                <span className="text-slate-400">Priority: </span>
                <span className="text-slate-500 font-medium italic">Not assessed yet</span>
              </div>
              <Link href="/skill-gap" className="mt-2 block text-xs text-teal-400 hover:text-teal-300">
                Start Analysis →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Current Roadmap (Placeholder for Phase 3) */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative">
           <div className="absolute top-0 right-0 p-3 opacity-20">
            <Map className="h-16 w-16 text-blue-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Map className="h-4 w-4 text-blue-400" />
              Active Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mt-1">
              <p className="text-sm font-medium text-white mb-2">Phase 2: Backend Architecture</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                  <span>Master Advanced Node.js</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-slate-600 border border-slate-500"></div>
                  <span>Learn GraphQL</span>
                </div>
              </div>
              <Link href="/roadmap" className="mt-4 block text-xs text-blue-400 hover:text-blue-300">
                Continue Journey →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Engine (Placeholder for Phase 3) */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden relative" style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(20,184,166,0.1))" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-slate-100 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              Upwise AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-3">
              Your resume ATS score is holding back your readiness. Focus on adding keywords: <span className="text-white font-medium">Microservices, AWS</span>.
            </p>
            <Link href="/resume-analysis">
              <Button size="sm" className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700">
                Analyze Resume Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 mb-4">
         <h3 className="text-xl font-semibold tracking-tight">Market Insights</h3>
         <p className="text-sm text-muted-foreground">Live data for your industry.</p>
      </div>

      {/* Existing Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Market Outlook
            </CardTitle>
            <OutlookIcon className={`h-4 w-4 ${outlookColor}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.marketOutlook}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Industry Growth
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.growthRate.toFixed(1)}%
            </div>
            <Progress value={insights.growthRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Demand Level</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.demandLevel}</div>
            <div
              className={`h-2 w-full rounded-full mt-2 ${getDemandLevelColor(
                insights.demandLevel
              )}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Skills</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {insights.topSkills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Existing Salary Ranges Chart */}
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Salary Ranges by Role</CardTitle>
          <CardDescription>
            Displaying minimum, median, and maximum salaries (in thousands)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border rounded-lg p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          {payload.map((item) => (
                           <p key={item.name} className="text-sm">
                              {item.name}: ${item.value}K
                            </p>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="min" fill="#94a3b8" name="Min Salary (K)" />
                <Bar dataKey="median" fill="#64748b" name="Median Salary (K)" />
                <Bar dataKey="max" fill="#475569" name="Max Salary (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
