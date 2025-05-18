import React, { lazy, Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ProjectView from "@/pages/project-view";
import { ProjectProvider } from "@/context/project-context";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects/:id">
        {params => <ProjectView id={parseInt(params.id)} />}
      </Route>
      <Route path="/enhanced/projects/:projectId">
        {params => {
          // Use dynamic import for the enhanced project view
          const EnhancedProjectView = lazy(() => import("@/pages/enhanced-project-view"));
          return (
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading enhanced view...</div>}>
              <EnhancedProjectView />
            </Suspense>
          );
        }}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
