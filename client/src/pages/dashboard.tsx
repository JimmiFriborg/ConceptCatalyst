import { useState } from "react";
import { useLocation } from "wouter";
import { useProjects } from "@/context/project-context";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { ProjectWizard } from "@/components/project-wizard";
import { PlusCircle, FolderOpen, Folder, Clock, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { deleteProject } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [_, navigate] = useLocation();
  const { data: projects, isLoading, isError } = useProjects();
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const { toast } = useToast();

  const handleOpenProject = (id: number) => {
    navigate(`/projects/${id}`);
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await deleteProject(id);
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              <span className="text-primary">Feature</span>Priority AI
            </h1>
            <Button onClick={() => setIsAddProjectOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Projects</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="p-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <p className="text-red-600 dark:text-red-400">
                Error loading projects. Please try again later.
              </p>
            </Card>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </Badge>
                    </div>
                    <CardDescription>
                      {project.description || "No description provided"}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between pt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button 
                      onClick={() => handleOpenProject(project.id)}
                      size="sm"
                    >
                      <FolderOpen className="mr-2 h-4 w-4" />
                      Open
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Folder className="h-16 w-16 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">No projects yet</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Create your first project to start prioritizing features and planning your product roadmap.
                  </p>
                </div>
                <Button onClick={() => setIsAddProjectOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Project
                </Button>
              </div>
            </Card>
          )}
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">About FeaturePriority AI</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                FeaturePriority AI is an intelligent tool for product planning and feature prioritization.
                It helps product teams decide what to build next by categorizing features into development phases.
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-2">
                <li>Create and manage multiple product projects</li>
                <li>Get AI-powered feature suggestions and enhancements</li>
                <li>Categorize features using a simple drag-and-drop interface</li>
                <li>Analyze features from different perspectives: Technical, Business, UI/UX, and Security</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Getting Started</h3>
              <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-3">
                <li>
                  <span className="font-medium">Create a project</span> - Start by creating a new project for your product
                </li>
                <li>
                  <span className="font-medium">Add features</span> - Input features with descriptions or get AI suggestions
                </li>
                <li>
                  <span className="font-medium">Prioritize</span> - Drag and drop features into different development phases
                </li>
                <li>
                  <span className="font-medium">Analyze</span> - Get insights from different perspectives on your feature set
                </li>
              </ol>
            </div>
          </div>
        </div>
      </main>

      <ProjectWizard
        open={isAddProjectOpen}
        onOpenChange={setIsAddProjectOpen}
      />
    </div>
  );
}
