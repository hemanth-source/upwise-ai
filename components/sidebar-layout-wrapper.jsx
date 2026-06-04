"use client";

import React, { useState } from "react";
import Sidebar from "@/components/sidebar";
import { cn } from "@/lib/utils";

export default function SidebarLayoutWrapper({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - fixed on the left */}
      <div 
        className={cn(
          "hidden md:block border-r bg-background fixed top-16 bottom-0 left-0 transition-all duration-300 z-40",
          isOpen ? "w-64" : "w-20"
        )}
      >
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      </div>
      
      {/* Main content - pushed to the right by the sidebar width */}
      <div 
        className={cn(
          "flex-1 w-full overflow-hidden pt-16 transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-20"
        )}
      >
        <div className="container mx-auto p-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
