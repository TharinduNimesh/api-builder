import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Database,
  Code,
  Table,
  Zap,
  Map,
  BarChart3,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "SQL Editor", url: "/sql", icon: Code },
  { title: "Tables", url: "/tables", icon: Table },
  { title: "Functions", url: "/functions", icon: Zap },
  { title: "API Designer", url: "/api", icon: Map },
  { title: "Metrics", url: "/metrics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavClasses = (path: string) =>
    isActive(path)
      ? "bg-orange-500/10 text-orange-600 font-medium border-r-2 border-orange-500"
      : "text-sidebar-foreground hover:bg-orange-500/5 hover:text-orange-600";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                <Database className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-sidebar-foreground">API Builder</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="text-sidebar-foreground hover:bg-orange-500/10 hover:text-orange-600 h-8 w-8 p-0"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-4 p-3 bg-orange-50/50 dark:bg-orange-950/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">My API Project</h3>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Globe className="h-3 w-3" />
                <span className="truncate">api-project.supabase.co</span>
              </div>
            </div>
            <Button 
              size="sm" 
              className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Mapping
            </Button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}