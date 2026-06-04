import React from "react";
import SidebarLayoutWrapper from "@/components/sidebar-layout-wrapper";

const MainLayout = async ({ children }) => {
  return <SidebarLayoutWrapper>{children}</SidebarLayoutWrapper>;
};

export default MainLayout;
