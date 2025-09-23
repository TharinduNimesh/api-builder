import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import SetupProject from "./pages/SetupProject";
import Dashboard from "./pages/Dashboard";
import SQLEditor from "./pages/SQLEditor";
import Tables from "./pages/Tables";
import Functions from "./pages/Functions";
import APIDesigner from "./pages/APIDesigner";
import Metrics from "./pages/Metrics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/setup" element={<SetupProject />} />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <Dashboard />
              </div>
            </SidebarProvider>
          } />
          <Route path="/sql" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <SQLEditor />
              </div>
            </SidebarProvider>
          } />
          <Route path="/tables" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <Tables />
              </div>
            </SidebarProvider>
          } />
          <Route path="/functions" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <Functions />
              </div>
            </SidebarProvider>
          } />
          <Route path="/api" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <APIDesigner />
              </div>
            </SidebarProvider>
          } />
          <Route path="/metrics" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <Metrics />
              </div>
            </SidebarProvider>
          } />
          <Route path="/settings" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full">
                <AppSidebar />
                <Settings />
              </div>
            </SidebarProvider>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
