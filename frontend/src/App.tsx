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
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from "./pages/Dashboard";
import SQLEditor from "./pages/SQLEditor";
import SQLHistory from "./pages/SQLHistory";
import SQLSnippets from "./pages/SQLSnippets";
import Tables from "./pages/Tables";
import Functions from "./pages/Functions";
import APIDesigner from "./pages/APIDesigner";
import Users from "./pages/Users";
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
          <Route path="/setup" element={<ProtectedRoute><SetupProject /></ProtectedRoute>} />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Dashboard />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/sql" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <SQLEditor />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/sql/history" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <SQLHistory />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/sql/snippets" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <SQLSnippets />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/tables" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Tables />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/functions" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Functions />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/api" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <APIDesigner />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Users />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/metrics" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Metrics />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SidebarProvider>
                <div className="min-h-screen flex w-full">
                  <AppSidebar />
                  <Settings />
                </div>
              </SidebarProvider>
            </ProtectedRoute>
          } />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
