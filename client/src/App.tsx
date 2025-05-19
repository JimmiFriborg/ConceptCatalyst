import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import ProjectView from "@/pages/project-view";
import ProjectViewTabs from "@/pages/project-view-tabs";
import FeatureBank from "@/pages/feature-bank";
import CreationPage from "@/pages/creation-page";
import { ProjectProvider } from "@/context/project-context";
import { MainLayout } from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects/:id">
        {params => <ProjectViewTabs id={parseInt(params.id)} />}
      </Route>
      <Route path="/concepts/:id">
        {params => <ProjectViewTabs id={parseInt(params.id)} />}
      </Route>
      <Route path="/concepts" component={Dashboard} />
      <Route path="/projects" component={Dashboard} />
      <Route path="/feature-bank" component={FeatureBank} />
      <Route path="/settings" component={NotFound} />
      <Route path="/new" component={CreationPage} />
      <Route path="/new/:type" component={CreationPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <TooltipProvider>
          <MainLayout>
            <Router />
          </MainLayout>
          <Toaster />
        </TooltipProvider>
      </ProjectProvider>
    </QueryClientProvider>
  );
}

export default App;
