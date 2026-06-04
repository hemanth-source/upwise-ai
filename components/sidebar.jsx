"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  GraduationCap,
  StarsIcon,
  Target,
  Brain,
  Map,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  Menu,
  PenBox,
} from "lucide-react";
import { Button } from "./ui/button";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();

  const tools = [
    {
      name: "AI Avatar Coach",
      path: "/coach",
      icon: <StarsIcon className="h-5 w-5" />,
    },
    {
      name: "Topic Explainer Avatar",
      path: "/topic-explainer",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      name: "Job Readiness Score",
      path: "/job-readiness",
      icon: <Target className="h-5 w-5" />,
    },
    {
      name: "Resume Analyzer",
      path: "/resume-analysis",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: "ATS Resume Generator",
      path: "/resume",
      icon: <PenBox className="h-5 w-5" />,
    },
    {
      name: "Skill Gap Analysis",
      path: "/skill-gap",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      name: "Career Roadmap",
      path: "/roadmap",
      icon: <Map className="h-5 w-5" />,
    },
    {
      name: "AI Mock Interview",
      path: "/mock-interview",
      icon: <GraduationCap className="h-5 w-5" />,
    },
  ];

  return (
    <aside className="h-full w-full flex flex-col relative">
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isOpen && (
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <StarsIcon className="h-4 w-4 text-primary" />
            Growth Tools
          </h3>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={`h-8 w-8 ml-auto ${!isOpen ? "mx-auto" : ""}`}
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="flex-1 px-3 py-6 overflow-y-auto">
        <nav className="space-y-1 text-center">
          {tools.map((tool) => {
            const isActive = pathname === tool.path;
            return (
              <Link
                key={tool.name}
                href={tool.path}
                title={!isOpen ? tool.name : undefined}
                className={`flex items-center gap-3 rounded-lg transition-colors text-sm font-medium ${
                  isOpen ? "px-4 py-3" : "px-0 py-3 justify-center"
                } ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                {tool.icon}
                {isOpen && <span>{tool.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
